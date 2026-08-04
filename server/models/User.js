import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // "2026-07-28"
  count: { type: Number, default: 1 },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    totalActiveDays: { type: Number, default: 0 },
    lastActive: Date,
    activity: [activitySchema], // for heatmap
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);