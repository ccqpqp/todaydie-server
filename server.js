import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 기본 루트 확인용
app.get("/", (req, res) => {
  res.send("✅ TodayDie 서버가 정상적으로 작동 중입니다!");
});

// ✅ OpenAI 클라이언트 설정
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ 채팅 엔드포인트
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 받은 메시지:", message);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "너는 '검알'이라는 감정 파트너야. 따뜻하고 짧게, 인간적으로 대답해.",
        },
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

// ✅ 포트 설정
const PORT = process.env.PORT || 3000;

// ✅ Vercel용 export (중요!)
export default app;

