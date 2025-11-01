import OpenAI from "openai";
export const runtime = "edge";

type Msg = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY тохируулагдаагүй." }), { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const messages: Msg[] = Array.isArray(body?.messages)
      ? body.messages
      : [{ role: "user", content: String(body?.prompt ?? "Сайн байна уу!") }];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chat = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const content = chat.choices?.[0]?.message?.content ?? "";

    return new Response(
      JSON.stringify({
        reply: content,
        message: { role: "assistant", content },
        response: content,
        choices: [{ message: { content }, text: content }],
        text: content,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Алдаа" }), { status: 500 });
  }
}
