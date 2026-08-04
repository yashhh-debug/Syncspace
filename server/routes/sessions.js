import express from 'express';
import Session from '../models/Session.js';
import Event from '../models/Event.js';

const router = express.Router();

// Get or initialize session metadata
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    let session = await Session.findOne({ roomId });
    if (!session) {
      session = await Session.create({ roomId, title: `Room ${roomId}` });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Batch record events for a room
router.post('/:roomId/events', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { events } = req.body; // Array of event objects

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: 'No events provided' });
    }

    const docs = events.map((evt) => ({
      roomId,
      branchId: evt.branchId || 'main',
      eventType: evt.eventType,
      actorId: evt.actorId,
      actorName: evt.actorName,
      timestamp: evt.timestamp || Date.now(),
      data: evt.data,
    }));

    await Event.insertMany(docs);
    res.json({ message: `${docs.length} events recorded`, count: docs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chronological events for timeline replay
router.get('/:roomId/events', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { branchId = 'main', since = 0 } = req.query;

    const events = await Event.find({
      roomId,
      branchId,
      timestamp: { $gte: Number(since) },
    })
      .sort({ timestamp: 1 })
      .lean();

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
