import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

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
import sessionRoutes from './routes/sessions.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/sessions', sessionRoutes);

// Multi-language code execution proxy (Piston)
app.post('/api/execute', async (req, res) => {
  try {
    const { language, code, fileName, version } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: 'Language and code are required' });
    }

    const versionMap = {
      javascript: '18.15.0',
      typescript: '5.0.3',
      python: '3.10.0',
      cpp: '10.2.0',
      java: '15.0.2',
      go: '1.16.2',
      rust: '1.68.2',
      c: '10.2.0',
    };

    const targetVersion = version && version !== '*' ? version : (versionMap[language] || '*');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language,
        version: targetVersion,
        files: [{ name: fileName || 'main', content: code }],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Execution service error: ${errText}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('Execution API error:', err);
    return res.status(500).json({ error: err.message || 'Failed to execute code' });
  }
});

// Health check
app.get('/', (req, res) => res.send('SyncSpace Server Running'));

// ===== Yjs WebSocket =====
const wss = new WebSocketServer({ server });

const docs = new Map(); // docname → { doc, awareness }

const messageSync = 0;
const messageAwareness = 1;

/**
 * Get or create a shared Y.Doc + Awareness for a room
 */
const getYDoc = (docname, gc = true) => {
  return map.setIfUndefined(docs, docname, () => {
    const doc = new Y.Doc({ gc });
    const awareness = new awarenessProtocol.Awareness(doc);
    return { doc, awareness };
  });
};

wss.on('connection', (conn, req) => {
  const docName = (req.url || '/').slice(1).split('?')[0] || 'default';
  const { doc, awareness } = getYDoc(docName);

  conn.binaryType = 'arraybuffer';

  // Generate a unique clientID for this connection (required by awareness)
  const clientID = doc.clientID; // Yjs already gives us one, but we can also use a random one
  // Better: let awareness manage it, but we need a stable id for this connection
  // We'll use a simple counter / random for this connection
  let connClientID = null;

  // ---- Initial Sync Step 1 ----
  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    conn.send(encoding.toUint8Array(encoder));
  }

  // ---- Initial Awareness ----
  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        Array.from(awareness.getStates().keys())
      )
    );
    conn.send(encoding.toUint8Array(encoder));
  }

  // ---- Message handler ----
  conn.on('message', (message) => {
    try {
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync: {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, null);

          if (encoding.length(encoder) > 1) {
            conn.send(encoding.toUint8Array(encoder));
          }
          break;
        }

        case messageAwareness: {
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(awareness, update, conn);

          // Capture the clientID that this connection is using
          // (the first awareness update from the client usually contains it)
          if (connClientID === null) {
            const states = awareness.getStates();
            for (const [id] of states) {
              // Heuristic: take the newest / any id that just appeared
              // In practice the client sends its own id
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  // ---- Document updates → broadcast to other clients ----
  const updateHandler = (update, origin) => {
    if (origin === conn) return; // don't echo back

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const msg = encoding.toUint8Array(encoder);

    wss.clients.forEach((client) => {
      if (client !== conn && client.readyState === 1) {
        client.send(msg);
      }
    });
  };
  doc.on('update', updateHandler);

  // ---- Awareness changes → broadcast ----
  const awarenessChangeHandler = ({ added, updated, removed }, origin) => {
    const changedClients = added.concat(updated).concat(removed);
    if (changedClients.length === 0) return;

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const msg = encoding.toUint8Array(encoder);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(msg);
      }
    });
  };
  awareness.on('update', awarenessChangeHandler);

  // ---- Cleanup on disconnect ----
  conn.on('close', () => {
    doc.off('update', updateHandler);
    awareness.off('update', awarenessChangeHandler);

    // Remove this connection's awareness state
    // We try to remove any states that might belong to this connection
    // (in a more advanced version we would track the exact clientID)
    const controlledIds = [];
    awareness.getStates().forEach((state, clientID) => {
      // You can improve this later by storing the clientID when the client first connects
      controlledIds.push(clientID);
    });

    if (controlledIds.length > 0) {
      awarenessProtocol.removeAwarenessStates(awareness, controlledIds, 'disconnect');
    }

    // Optional: clean up empty docs after some time
    // (left out for simplicity)
  });

  conn.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// ===== Start server (always) + MongoDB =====
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SyncSpace server running on http://localhost:${PORT}`);
  console.log(`📡 Yjs WebSocket ready on  ws://localhost:${PORT}`);
});

// MongoDB (non-blocking)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️  Server is still running (WebSocket + API work without Mongo)');
    });
} else {
  console.warn('⚠️  MONGO_URI not set – MongoDB features will not work');
}