"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MapView from "../components/MapView";

const SPOTS = [
  "Lebak Bulus","Bundaran HI","Sudirman","Kuningan","Blok M","Tanah Abang",
  "Kota Tua","Kemayoran","Senen","Manggarai","Bekasi","Depok","Bogor",
  "Tangerang","Serpong","Fatmawati","Cipete","Kebayoran","Pondok Indah","SCBD",
  "Kemang","Menteng","Cawang","Cibubur","Kalideres","Daan Mogot","Grogol",
  "Harmoni","Monas","Gambir","Pasar Minggu","Ragunan","Ancol","Kelapa Gading",
  "Sunter","Tanjung Priok","Pluit","Penjaringan","Cengkareng","Bintaro",
  "Ciputat","Pamulang","Ciledug","Pasar Rebo","Kramat Jati","Jatinegara",
  "Pulogadung","Cakung","Duri Kosambi","Mampang","Pancoran","Tebet",
];

const STRESS_COLORS = ["","#4ade80","#a3e635","#facc15","#fb923c","#f87171"];
const STRESS_LABELS = ["","Santai","Oke","Lumayan","Capek","Stress Bgt"];

type WeatherData = {
  icon: string; label: string; temp: number;
  humidity: number; ojolRisk: boolean; raw: string;
};

type Rekomendasi = {
  moda: string; icon: string; estimasi_waktu: string;
  estimasi_biaya: string; stress_level: number;
  alasan: string; tips: string; warning: string | null;
};

type ChatMsg = { role: "user" | "assistant"; content: string };

// ── Autocomplete ──────────────────────────────────────────────
function AutoInput({
  id, label, placeholder, value, onChange,
}: {
  id: string; label: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const matches = value.length > 0
    ? SPOTS.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--muted)", marginBottom: 6,
      }}>{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{
          width: "100%", background: "var(--surface2)",
          border: "1px solid var(--border)", borderRadius: 10,
          padding: "12px 14px", fontSize: 14, fontFamily: "inherit",
          color: "var(--text)", outline: "none",
        }}
        onFocus={(e: any) => (e.target.style.borderColor = "var(--accent)")}
      />
      {open && matches.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--surface2)", border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: 10, marginTop: 4, overflow: "hidden",
        }}>
          {matches.map(m => (
            <div
              key={m}
              onMouseDown={() => { onChange(m); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 13, cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(249,115,22,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Transport Card ─────────────────────────────────────────────
function TransportCard({ r, index }: { r: Rekomendasi; index: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80 + index * 130); return () => clearTimeout(t); }, [index]);

  const isBest = index === 0;
  const dots = [1,2,3,4,5].map(d => (
    <div key={d} style={{
      width: 8, height: 8, borderRadius: "50%",
      background: d <= r.stress_level ? STRESS_COLORS[r.stress_level] : "rgba(255,255,255,0.12)",
      transition: "background 0.3s",
    }} />
  ));

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
      background: isBest
        ? "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.05))"
        : "var(--surface)",
      border: `1px solid ${isBest ? "rgba(249,115,22,0.35)" : "var(--border)"}`,
      borderRadius: 16, padding: "18px 20px", position: "relative", overflow: "hidden",
    }}>
      {isBest && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "linear-gradient(135deg, var(--accent), #ef4444)",
          color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "3px 8px", borderRadius: 100, letterSpacing: "0.06em", textTransform: "uppercase",
        }}>⭐ Terbaik</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 28 }}>{r.icon}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{r.moda}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>#{index + 1} Pilihan</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>⏱ Waktu</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: isBest ? "var(--accent2)" : "var(--yellow)" }}>{r.estimasi_waktu}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>💰 Biaya</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>{r.estimasi_biaya}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Stress:</span>
        <div style={{ display: "flex", gap: 4 }}>{dots}</div>
        <span style={{ fontSize: 11, color: STRESS_COLORS[r.stress_level], fontWeight: 600, marginLeft: 4 }}>
          {STRESS_LABELS[r.stress_level]}
        </span>
      </div>
      <div style={{
        fontSize: 13, color: "rgba(241,240,238,0.65)", lineHeight: 1.5,
        borderTop: "1px solid var(--border)", paddingTop: 10,
      }}>
        {r.alasan}
        {r.tips && <><br /><span style={{ color: "var(--accent2)" }}>💡 {r.tips}</span></>}
      </div>
      {r.warning && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--yellow)", display: "flex", alignItems: "center", gap: 6 }}>
          ⚠️ {r.warning}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function Home() {
  const [asal, setAsal] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [budget, setBudget] = useState("bebas");
  const [prioritas, setPrioritas] = useState("seimbang");

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [timeInfo, setTimeInfo] = useState({ jam: "", menit: "", hari: "", isRush: false });

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [results, setResults] = useState<Rekomendasi[] | null>(null);
  const [ringkasan, setRingkasan] = useState("");
  const [routeLabel, setRouteLabel] = useState("");

  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [lastContext, setLastContext] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  // Time updater
  const updateTime = useCallback(() => {
    const now = new Date();
    const jam = now.getHours();
    const menit = String(now.getMinutes()).padStart(2, "0");
    const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][now.getDay()];
    const isRush = (jam >= 7 && jam < 9) || (jam >= 17 && jam < 20);
    setTimeInfo({ jam: String(jam), menit, hari, isRush });
  }, []);

  useEffect(() => {
    updateTime();
    const t = setInterval(updateTime, 60000);
    return () => clearInterval(t);
  }, [updateTime]);

  // Fetch weather on mount
  useEffect(() => {
    fetch("/api/weather")
      .then(r => r.json())
      .then(d => { if (!d.error) setWeather(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory]);

  async function cariTransport() {
    if (!asal || !tujuan) { alert("Isi dulu asal dan tujuan!"); return; }
    setLoading(true);
    setResults(null);
    setLoadingMsg("Ngecek cuaca Jakarta...");

    const cuaca = weather ?? { icon: "🌤️", label: "Berawan", temp: 30, humidity: 75, ojolRisk: false, raw: "Clouds" };

    setLoadingMsg("Nanya ke AI soal rute lo...");

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asal, tujuan, budget, prioritas, jam: `${timeInfo.jam}:${timeInfo.menit}`, hari: timeInfo.hari, isRush: timeInfo.isRush, cuaca }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const ctx = `Rute: ${asal} → ${tujuan}, Jam: ${timeInfo.jam}:${timeInfo.menit}, Hari: ${timeInfo.hari}, ${timeInfo.isRush ? "Rush hour" : "Normal"}, Cuaca: ${cuaca.label}. Top rekomendasi: ${data.rekomendasi.map((r: Rekomendasi) => r.moda).join(", ")}`;
      setLastContext(ctx);
      setResults(data.rekomendasi);
      setRingkasan(data.ringkasan);
      setRouteLabel(`${asal} → ${tujuan}`);
      setChatHistory([{ role: "assistant", content: `🗺️ ${data.ringkasan}\n\nLo bisa tanya gue lebih lanjut soal rute ini, alternatif, atau kondisi baliknya!` }]);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    const newHistory: ChatMsg[] = [...chatHistory, { role: "user", content: msg }];
    setChatHistory(newHistory);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, context: lastContext }),
      });
      const data = await res.json();
      setChatHistory(h => [...h, { role: "assistant", content: data.reply || "Waduh error, coba lagi ya!" }]);
    } catch {
      setChatHistory(h => [...h, { role: "assistant", content: "Waduh error nih, coba tanya lagi!" }]);
    }
    setChatLoading(false);
  }

  const { jam, menit, hari, isRush } = timeInfo;
  const cuacaEstimasi = parseInt(jam) < 12 ? "☀️ Cerah" : parseInt(jam) < 15 ? "🌤️ Berawan" : "🌧️ Mungkin Hujan";

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 20px 60px" }}>

      {/* HEADER */}
      <header style={{ padding: "40px 0 32px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
          borderRadius: 100, padding: "4px 12px", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.08em", color: "var(--accent2)", textTransform: "uppercase", width: "fit-content",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
          Jakarta Real-time
        </div>
        <h1 style={{
          fontFamily: "Syne, sans-serif", fontSize: "clamp(2.2rem,6vw,3.8rem)",
          fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em",
        }}>
          Naik <span style={{ color: "var(--accent)" }}>Apa</span>?
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15 }}>Rekomendasi transportasi terbaik dari titik lo — cepet, murah, ga ribet.</p>
      </header>

      {/* TIMEBAR */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { label: `🕐 ${jam}:${menit}` },
          { label: `📅 ${hari}` },
          { label: weather ? `${weather.icon} ${weather.label} ${weather.temp}°C` : cuacaEstimasi },
        ].map((c, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "var(--text)",
          }}>{c.label}</div>
        ))}
        {isRush && (
          <div style={{
            background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
            color: "var(--red)", borderRadius: 6, padding: "4px 10px",
            fontSize: 12, fontWeight: 600,
          }}>⚠️ Rush Hour!</div>
        )}
        {weather?.ojolRisk && (
          <div style={{
            background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.25)",
            color: "var(--yellow)", borderRadius: 6, padding: "4px 10px",
            fontSize: 12, fontWeight: 600,
          }}>🌧️ Ojol Berisiko</div>
        )}
      </div>

      {/* FORM */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 20, padding: 24, marginBottom: 24,
      }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <AutoInput id="asal" label="📍 Dari mana?" placeholder="cth: Lebak Bulus, Bekasi..." value={asal} onChange={setAsal} />
          <AutoInput id="tujuan" label="🎯 Mau ke mana?" placeholder="cth: Sudirman, SCBD..." value={tujuan} onChange={setTujuan} />
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            {
              label: "💰 Budget", value: budget, onChange: setBudget,
              opts: [["bebas","Bebas (terbaik dulu)"],["hemat","Hemat banget (< Rp 15k)"],["normal","Normal (Rp 15k–50k)"],["fleksibel","Fleksibel (asal cepet)"]],
            },
            {
              label: "🎒 Prioritas", value: prioritas, onChange: setPrioritas,
              opts: [["seimbang","Seimbang (waktu + biaya)"],["cepat","Secepat mungkin"],["murah","Semurah mungkin"],["santai","Santai, ga mau stress"]],
            },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{s.label}</label>
              <select
                value={s.value}
                onChange={e => s.onChange(e.target.value)}
                style={{
                  width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "12px 14px", fontSize: 14, fontFamily: "inherit",
                  color: "var(--text)", outline: "none",
                }}
              >
                {s.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button
          onClick={cariTransport}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "rgba(249,115,22,0.4)" : "linear-gradient(135deg, var(--accent), #ef4444)",
            border: "none", borderRadius: 12, padding: 14,
            fontSize: 15, fontWeight: 700, fontFamily: "inherit",
            color: "#fff", cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s", letterSpacing: "0.02em",
          }}
        >
          {loading ? "⏳ Lagi ngecek..." : "🔍 Cari Transportasi Terbaik"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{
            width: 40, height: 40, border: "3px solid rgba(249,115,22,0.2)",
            borderTopColor: "var(--accent)", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            Lagi ngecek kondisi Jakarta...<br />
            <strong style={{ color: "var(--accent2)" }}>{loadingMsg}</strong>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {results && !loading && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700 }}>🏆 Rekomendasi Buat Lo</div>
            <div style={{
              fontSize: 12, color: "var(--muted)", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px",
            }}>{routeLabel}</div>
          </div>

          <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
            {results.map((r, i) => <TransportCard key={i} r={r} index={i} />)}
          </div>

          {/* MAP */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>📍 Peta Area Jakarta</div>
            <div style={{ height: 280, borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
              <MapView asal={asal} tujuan={tujuan} />
            </div>
          </div>

          {/* CHAT */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #ef4444)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Tanya Lebih Lanjut</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Tanya soal rute, harga, atau alternatif</div>
              </div>
            </div>

            <div ref={chatRef} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 320, overflowY: "auto", minHeight: 80 }}>
              {chatHistory.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10 }}>
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px", borderRadius: 12,
                    fontSize: 13, lineHeight: 1.5,
                    background: m.role === "user"
                      ? "linear-gradient(135deg, var(--accent), #ef4444)"
                      : "var(--surface2)",
                    border: m.role === "user" ? "none" : "1px solid var(--border)",
                    color: m.role === "user" ? "#fff" : "var(--text)",
                    whiteSpace: "pre-wrap",
                  }}>{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    padding: "10px 14px", borderRadius: 12, fontSize: 13,
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    color: "var(--muted)", fontStyle: "italic",
                  }}>Lagi mikir...</div>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="cth: ada yang lebih murah? kalo balik jam 6 gimana?"
                style={{
                  flex: 1, background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "10px 14px", fontSize: 13,
                  fontFamily: "inherit", color: "var(--text)", outline: "none",
                }}
              />
              <button
                onClick={sendChat}
                disabled={chatLoading}
                style={{
                  background: "linear-gradient(135deg, var(--accent), #ef4444)",
                  border: "none", borderRadius: 10, width: 40, height: 40,
                  cursor: chatLoading ? "not-allowed" : "pointer", fontSize: 16,
                  opacity: chatLoading ? 0.4 : 1,
                }}
              >➤</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
