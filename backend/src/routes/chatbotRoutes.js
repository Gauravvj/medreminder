const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MedBot, a friendly and knowledgeable medical wellness advisor for the MedReminder app — a Smart Medicine Reminder system for Alzheimer's patients and their caregivers.

Your role:
- Help users understand their symptoms and suggest general wellness tips
- Recommend lifestyle changes (diet, exercise, sleep, stress management)
- Advise when they should consult a doctor
- Provide information about common conditions in simple language
- Be empathetic, warm, and supportive — the users may be elderly or cognitively impaired

Important rules:
- NEVER prescribe specific medications or dosages
- NEVER provide a definitive diagnosis
- ALWAYS recommend consulting a healthcare professional for serious symptoms
- Keep responses concise (2-4 paragraphs max)
- Use simple, easy-to-understand language
- Add relevant emojis to make responses friendly and approachable`;

/**
 * POST /api/chatbot
 * Protected route — requires JWT auth.
 * Accepts { message } and returns { reply } from Gemini AI.
 */
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `User question: ${message}` }
    ]);

    const response = result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({
      message: 'Sorry, MedBot is having trouble right now. Please try again later.',
      error: error.message
    });
  }
});

module.exports = router;
