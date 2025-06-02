import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { OpenAI } from "openai";
import cors from "cors";

dotenv.config(); // Load the .env file

const app = express();
const port = 5000;

app.use(cors());
// use middleware to parse json request bodies
app.use(bodyParser.json());


app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

let conversationHistory = [];

app.post("/chat", async (req, res) => {
    const message = req.body.message;
    if (!message){
        return res.status(400).json({ error: "Message required." });
    }

    conversationHistory.push({ role: "user", content: message });

    try {
        const success = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: conversationHistory,
        });

        const botResponse = success.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: botResponse});
        res.json({ reply: botResponse });
    }
    catch(e){
        console.error("An error occurred while trying to retrieve response from chatbot: " + e);
        return res.status(500).json({ error: "Failed to retrieve response from chatbot."});
    };
});

app.get('/', (req, res) => {
    res.json({ message: "Server is running! Use POST /chat to send messages." });
});

app.get('/chat', (req, res) => {
    res.json({ error: "Please use POST method to send messages to /chat" });
});