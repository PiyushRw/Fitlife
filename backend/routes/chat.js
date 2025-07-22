import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ['nutrition', 'workout', 'fitnessAdvice'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional if you add auth
  input: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);
