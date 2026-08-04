import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Technical Interview Workspace',
    },
    creator: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
    participants: [
      {
        name: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
