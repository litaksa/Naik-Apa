export default function MapView({ asal, tujuan }: { asal: string; tujuan: string }) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=106.6%2C-6.4%2C107.0%2C-6.0&layer=mapnik&marker=-6.2088%2C106.8456`;
  return (
    <iframe
      src={src}
      style={{ width: "100%", height: "100%", border: "none" }}
      title={`Peta ${asal} ke ${tujuan}`}
    />
  );
}
