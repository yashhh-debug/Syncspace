import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      default: 'main',
      index: true,
    },
    eventType: {
      type: String,
      enum: ['canvas_edit', 'code_change', 'cursor_move', 'chat_message', 'marker_added'],
      required: true,
    },
    actorId: String,
    actorName: String,
    timestamp: {
      type: Number, // Epoch milliseconds
      required: true,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for fast timeline range queries
eventSchema.index({ roomId: 1, branchId: 1, timestamp: 1 });

export default mongoose.model('Event', eventSchema);
