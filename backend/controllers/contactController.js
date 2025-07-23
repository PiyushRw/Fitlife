import ContactMessage from '../models/ContactMessage.js';

// @desc    Save contact message
// @route   POST /api/v1/contact
// @access  Public
export const saveContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, email, subject, message'
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Contact message saved successfully',
      data: contactMessage
    });
  } catch (error) {
    next(error);
  }
};
