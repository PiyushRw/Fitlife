// models/chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    question: { type: String, required: true },
    response: { type: String, required: true },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
