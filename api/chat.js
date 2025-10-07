// api/chat.js  (Vercel Functions: Node.js Runtime, Express 불필요)
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 공통 CORS 헤더
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 사전요청(OPTIONS) 허용
export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

// 채팅 POST
export async function POST(request) {
  try {
    const { message } = await request.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "너는 '검알'이라는 감정 파트너야. 따뜻하고 짧게, 인간적으로 대답해." },
        { role: "user", content: message ?? "" },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }
}
