# 🚦 Naik Apa? — Transportasi Jakarta

Rekomendasi transportasi Jakarta berbasis AI. Cepet, murah, ga ribet.

## Stack
- **Next.js 14** (App Router)
- **Groq API** (llama-3.3-70b) — AI rekomendasi
- **OpenWeatherMap** — cuaca Jakarta real-time
- **Leaflet + OpenStreetMap** — peta gratis

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Isi API keys
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
GROQ_API_KEY=gsk_xxxxxx        # dari console.groq.com
OPENWEATHER_API_KEY=xxxxxx     # dari openweathermap.org/api
```

### 3. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di vercel.com
3. Tambah environment variables di Vercel dashboard:
   - `GROQ_API_KEY`
   - `OPENWEATHER_API_KEY`
4. Deploy! ✅

> **Keamanan**: API keys CUMA ada di server (Next.js API routes).
> Frontend sama sekali tidak menyentuh key.
