import Chat from '../models/chat.js';

fitnessAdviceRouter.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;

    const response = {
      answer: `Here's some fitness advice based on your question: ${question}`,
    };

    // Save to MongoDB
    await Chat.create({
      userId: context?.userId || 'anonymous',
      question,
      response: response.answer,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('AI Companion Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
