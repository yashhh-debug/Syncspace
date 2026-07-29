import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ... rest of your index.js code below
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as map from 'lib0/map';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import leaderboardRoutes from './routes/leaderboard.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/', (req, res) => res.send('SyncSpace Server Running'));

// ===== Yjs WebSocket (same as before) =====
const wss = new WebSocketServer({ server });
const docs = new Map();

const messageSync = 0;
const messageAwareness = 1;

const getYDoc = (docname, gc = true) =>
  map.setIfUndefined(docs, docname, () => {
    const doc = new Y.Doc({ gc });
    return doc;
  });

wss.on('connection', (conn, req) => {
  const docName = req.url.slice(1).split('?')[0] || 'default';
  const doc = getYDoc(docName);
  const awareness = new awarenessProtocol.Awareness(doc);

  conn.binaryType = 'arraybuffer';

  // send initial state
  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    conn.send(encoding.toUint8Array(encoder));
  }

  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys()))
    );
    conn.send(encoding.toUint8Array(encoder));
  }

  conn.on('message', (message) => {
    const decoder = decoding.createDecoder(new Uint8Array(message));
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, doc, null);
        if (encoding.length(encoder) > 1) {
          conn.send(encoding.toUint8Array(encoder));
        }
        break;
      }
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          awareness,
          decoding.readVarUint8Array(decoder),
          conn
        );
        break;
      }
    }
  });

  const updateHandler = (update, origin) => {
    if (origin !== conn) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const updateMsg = encoding.toUint8Array(encoder);
      wss.clients.forEach((client) => {
        if (client !== conn && client.readyState === 1) {
          client.send(updateMsg);
        }
      });
    }
  };
  doc.on('update', updateHandler);

  const awarenessChangeHandler = ({ added, updated, removed }) => {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const msg = encoding.toUint8Array(encoder);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(msg);
    });
  };
  awareness.on('update', awarenessChangeHandler);

  conn.on('close', () => {
    doc.off('update', updateHandler);
    awareness.off('update', awarenessChangeHandler);
    awarenessProtocol.removeAwarenessStates(awareness, [conn], 'disconnect');
  });
});

// Connect MongoDB + Start
const PORT = process.env.PORT || 1234;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 SyncSpace server running on http://localhost:${PORT}`);
      console.log(`📡 Yjs WebSocket on ws://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });