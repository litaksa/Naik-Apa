import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah asisten transportasi Jakarta yang sangat expert. Kamu hafal semua seluk-beluk transportasi umum dan online Jakarta.

Pengetahuanmu:
- KRL Commuter Line: rute Bogor, Bekasi, Cikarang, Tangerang, Rangkasbitung — tarif zona Rp3.000-8.000
- MRT Jakarta: Lebak Bulus — Bundaran HI (16 stasiun), tarif Rp4.000-14.000
- LRT Jakarta: Kelapa Gading — Velodrome, tarif flat Rp5.000
- TransJakarta: 14 koridor + BRT, tarif Rp3.500 (free transfer 3 jam)
- Ojol (Gojek/Grab): ~Rp2.500-4.000/km, surge 1.5-2x saat rush hour dan hujan
- Taksi online: ~Rp5.000-7.000/km, lebih stabil harga
- Rush hour Jakarta: 07.00-09.30 dan 17.00-20.00 sangat parah terutama Sudirman-Thamrin-Gatot Subroto

Berikan response HANYA dalam format JSON valid berikut (tanpa markdown, tanpa teks diluar JSON):
{
  "rekomendasi": [
    {
      "moda": "nama moda",
      "icon": "emoji",
      "estimasi_waktu": "X menit",
      "estimasi_biaya": "Rp X.XXX",
      "stress_level": 1,
      "alasan": "penjelasan 2-3 kalimat kenapa ini recommended",
      "tips": "tips praktis singkat",
      "warning": "peringatan jika ada atau null"
    }
  ],
  "ringkasan": "satu kalimat ringkasan situasi hari ini untuk rute ini"
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { asal, tujuan, budget, prioritas, jam, hari, isRush, cuaca } = body;

    if (!asal || !tujuan) {
      return NextResponse.json({ error: "Asal dan tujuan harus diisi" }, { status: 400 });
    }

    const userMsg = `Saya mau dari ${asal} ke ${tujuan}.
Kondisi sekarang: Jam ${jam}, Hari ${hari}, ${isRush ? "RUSH HOUR AKTIF - macet parah!" : "Lalu lintas normal"}.
Cuaca: ${cuaca.label} ${cuaca.icon}, suhu ${cuaca.temp}°C${cuaca.ojolRisk ? ", HUJAN - ojol berisiko!" : ""}.
Budget: ${budget}
Prioritas: ${prioritas}
Rekomendasikan 3 moda transportasi terbaik untuk kondisi sekarang.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Groq API error");
    }

    const data = await res.json();
    let raw = data.choices[0].message.content.trim();
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
