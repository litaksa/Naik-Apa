import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { messages, context } = body;

    const systemChat = `Kamu asisten transportasi Jakarta yang helpful dan casual. Context rute saat ini: ${context}. Jawab singkat, padat, dalam bahasa Indonesia gaul/santai. Max 3-4 kalimat.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemChat }, ...messages],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
