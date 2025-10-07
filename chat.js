import OpenAI from "openai";

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
        { role: "system", content: "너는 '검알'이라는 감정 파트너야. 짧고 따뜻하게 대답해." },
        { role: "user", content: message },
      ],
    });
    const reply = completion.choices?.[0]?.message?.content || "";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
