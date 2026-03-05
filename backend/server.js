require('dotenv').config(); 
console.log("Is my API key loaded?", process.env.GEMINI_API_KEY ? "✅ YES!" : "❌ NO!");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai'); 
const User = require('./models/User'); 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

mongoose.connect('mongodb://127.0.0.1:27017/mototribe_rescue')
  .then(() => console.log('✅ Connected to MongoDB Database!'))
  .catch((err) => console.log('❌ Database connection error.', err));


app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, vehicle } = req.body;
    const newUser = new User({ name, email, password, vehicle });
    await newUser.save();
    res.json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user." });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "User not found. Please register." });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    res.json({ message: "Login successful!" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are the AI Mechanic for the MotoTribe Emergency Help. You must ONLY answer questions related to motorcycle/car breakdowns, engines, vehicle parts, and roadside assistance. Keep your answers brief, punchy, and helpful. If the user asks about anything else except greeting strictly refuse to answer and state that you are only an AI Mechanic for MotoTribe and cannot answer unrelated questions. Always maintain a friendly and helpful tone, and never provide information outside of your expertise as an AI Mechanic."
    });

    const result = await model.generateContent(userMessage);
    const aiResponse = result.response.text();

    res.json({ reply: aiResponse });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI System Offline. Check your API Key." });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 MotoTribe Backend is running on http://localhost:${PORT}`);
});