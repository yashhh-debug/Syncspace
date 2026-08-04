import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Get users sorted by totalActiveDays descending
    const leaderboard = await User.find()
      .sort({ totalActiveDays: -1 })
      .select('name email totalActiveDays streak maxStreak')
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

export default router;
