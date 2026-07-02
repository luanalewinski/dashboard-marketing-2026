// Supabase Edge Function — proxy seguro para a API do ClickUp
// A CLICKUP_API_KEY é lida dos Secrets do projeto (nunca exposta ao browser)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const apiKey = Deno.env.get("CLICKUP_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "CLICKUP_API_KEY não configurada nos Secrets do projeto" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  let payload: { path: string; method?: string; body?: unknown };
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Body inválido — esperado JSON com { path, method?, body? }" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const { path, method = "GET", body } = payload;

  if (!path || !path.startsWith("/")) {
    return new Response(
      JSON.stringify({ error: "path inválido — deve começar com /" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const cuRes = await fetch(`https://api.clickup.com/api/v2${path}`, {
    method,
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    ...(body && method !== "GET" ? { body: JSON.stringify(body) } : {}),
  });

  const data = await cuRes.json();

  return new Response(JSON.stringify(data), {
    status: cuRes.status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
