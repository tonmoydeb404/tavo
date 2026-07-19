import { ImageResponse } from "next/og"

import { siteConfig } from "@/configs/site-config"

export const runtime = "edge"
export const alt = `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #fff5f5 0%, #ffffff 40%, #fff0f0 100%)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -50,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#dc2626",
            fontWeight: 600,
            letterSpacing: "2px",
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          {siteConfig.brand.name}
        </div>
        <div
          style={{
            fontSize: 72,
            color: "#0a0a0a",
            fontWeight: 800,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          Every tab&apos;s volume,
          <br />
          mic &amp; camera
        </div>
        <div style={{ fontSize: 28, color: "#666", marginTop: 24 }}>
          {siteConfig.brand.tagline}
        </div>
      </div>
    </div>,
    size
  )
}
