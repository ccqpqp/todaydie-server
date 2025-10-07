import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// ✅ CORS 완전 허용 (이게 핵심)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "너는 '검알'이라는 감정 파트너야. 따뜻하고 짧게 대답해." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ 오류:", err);
    res.status(500).json({ error: err.message });
  }
}