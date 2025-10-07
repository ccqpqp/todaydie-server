export function GET() {
  return new Response("OK: server up", {
    status: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
