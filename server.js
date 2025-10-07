import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ vercel 환경변수에 이 키를 넣어야 함
});

// ✅ 루트 경로 (접속 테스트용)
app.get("/", (req, res) => {
  res.send("✅ TodayDie 서버가 정상적으로 작동 중입니다!");
});

// ✅ 채팅 API
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 받은 메시지:", message);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 또는 gpt-5-mini 가능
      messages: [
        { role: "system", content: "너는 '검알'이라는 감정 파트너야. 따뜻하고 짧게, 인간적으로 대답해." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "";
    console.log("💬 GPT 응답:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("❌ 오류:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
