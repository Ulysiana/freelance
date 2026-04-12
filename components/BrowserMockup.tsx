interface BrowserMockupProps {
  src: string;
  alt: string;
  url: string;
}

export default function BrowserMockup({ src, alt, url }: BrowserMockupProps) {
  return (
    <div
      style={{
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#1a1410",
        marginBottom: 16,
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 5,
            padding: "3px 10px",
            fontSize: 11,
            color: "rgba(240,235,228,0.35)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {url}
        </div>
      </div>

      {/* Screenshot */}
      <div style={{ overflow: "hidden", maxHeight: 200, position: "relative" }}>
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
        {/* Fade bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: "linear-gradient(transparent, rgba(10,8,6,0.8))",
          }}
        />
      </div>
    </div>
  );
}
