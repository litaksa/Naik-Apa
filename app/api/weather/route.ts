import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenWeather API key not configured" }, { status: 500 });
  }

  try {
    // Jakarta coordinates
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=-6.2088&lon=106.8456&appid=${apiKey}&units=metric&lang=id`,
      { next: { revalidate: 600 } } // cache 10 menit
    );

    if (!res.ok) throw new Error("OpenWeather API error");

    const data = await res.json();

    const condition = data.weather[0].main;
    const desc = data.weather[0].description;
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    // Map kondisi ke icon & label
    const weatherMap: Record<string, { icon: string; label: string; ojolRisk: boolean }> = {
      Rain: { icon: "🌧️", label: "Hujan", ojolRisk: true },
      Drizzle: { icon: "🌦️", label: "Gerimis", ojolRisk: true },
      Thunderstorm: { icon: "⛈️", label: "Badai Petir", ojolRisk: true },
      Clear: { icon: "☀️", label: "Cerah", ojolRisk: false },
      Clouds: { icon: "☁️", label: "Berawan", ojolRisk: false },
      Mist: { icon: "🌫️", label: "Berkabut", ojolRisk: false },
      Haze: { icon: "🌫️", label: "Kabut Asap", ojolRisk: false },
    };

    const weather = weatherMap[condition] ?? { icon: "🌤️", label: desc, ojolRisk: false };

    return NextResponse.json({
      icon: weather.icon,
      label: weather.label,
      description: desc,
      temp,
      humidity,
      windSpeed,
      ojolRisk: weather.ojolRisk,
      raw: condition,
    });
  } catch (e) {
    return NextResponse.json({ error: "Gagal ambil data cuaca" }, { status: 500 });
  }
}
