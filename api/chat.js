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

    // ✅ [여기 추가 — 사용자별 요청 제한 코드]
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!globalThis.userUsage) globalThis.userUsage = {}; // 전역 카운터
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // 하루 기준 리셋
    if (!globalThis.userUsage[ip] || now - globalThis.userUsage[ip].resetTime > oneDay) {
      globalThis.userUsage[ip] = { count: 0, resetTime: now };
    }

    globalThis.userUsage[ip].count++;

    // ✅ 하루 50회 제한 (원하면 10회나 100회로 변경 가능)
    if (globalThis.userUsage[ip].count > 50) {
      return new Response(
        JSON.stringify({ reply: "⚠️ 오늘은 대화 한도를 초과했어. 내일 다시 와줘." }),
        { status: 429, headers: { "Content-Type": "application/json", ...cors } }
      );
    }

    // ✅ OpenAI API 호출
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      temperature: 0.8,
      top_p: 1,
      presence_penalty: 0.2,
      frequency_penalty: 0.5,
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
