import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "linear-gradient(135deg, #05060a 0%, #0b0c18 50%, #05060a 100%)",
          color: "white",
          fontFamily: "Inter, Arial",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(236,72,153,0.25), transparent 55%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 70%, rgba(34,211,238,0.18), transparent 55%)" }} />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -1 }}>
            DonutSMP <span style={{ color: "#22d3ee" }}>Sell</span> Market
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.85)" }}>
            Sell your items — instant payment
          </div>
          <div style={{ marginTop: 18, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>
            www.donutsmpsellmarket.online
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
