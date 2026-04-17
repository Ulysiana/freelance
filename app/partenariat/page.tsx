"use client";
import { useState } from "react";
import Background from "@/components/Background";
import FadeIn from "@/components/FadeIn";

const steps = [
  {
    number: "01",
    title: "Vous recommandez Creahub",
    desc: "Partagez mon contact à vos clients, partenaires, adhérents ou réseau professionnel — dans n'importe quel secteur.",
  },
  {
    number: "02",
    title: "Je gère tout",
    desc: "Technique, commercial, livraison : je prends en charge la relation avec le contact recommandé de A à Z.",
  },
  {
    number: "03",
    title: "Vous touchez une commission",
    desc: "Pour chaque mission signée via votre recommandation, vous recevez une commission. Les conditions sont définies ensemble, selon votre contexte.",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#f0ebe4",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s",
  marginBottom: 14,
};

export default function Partenariat() {
  const [focused, setFocused] = useState<string | null>(null);

  const focusStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === field ? "rgba(232,148,106,0.4)" : "rgba(255,255,255,0.08)",
  });

  return (
    <>
      <Background />

      <main style={{ position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <section style={{ padding: "80px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div className="amber-line" style={{ marginBottom: 24 }} />
            <h1
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 20,
                maxWidth: 700,
              }}
            >
              Vous avez un réseau,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #e8946a 0%, #f4b896 50%, #c27b5b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                j&apos;ai l&apos;expertise.
              </span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(240,235,228,0.55)", maxWidth: 580, lineHeight: 1.7 }}>
              Recommandez Creahub à vos contacts et touchez une commission sur chaque mission signée.
            </p>
          </FadeIn>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 1, background: "linear-gradient(90deg, transparent, rgba(232,148,106,0.15), transparent)" }} />

        {/* Concept 3 étapes */}
        <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div className="amber-line" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
              Comment ça marche
            </h2>
            <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 48 }}>
              Simple, sans friction, adapté à votre contexte.
            </p>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="steps-list">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.12}>
                <div
                  className="glass"
                  style={{
                    padding: "28px 32px",
                    display: "flex",
                    gap: 32,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(2rem, 3vw, 2.8rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      color: "rgba(232,148,106,0.2)",
                      lineHeight: 1,
                      flexShrink: 0,
                      minWidth: 56,
                    }}
                  >
                    {step.number}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>{step.title}</div>
                    <div style={{ fontSize: 14, color: "rgba(240,235,228,0.55)", lineHeight: 1.7 }}>{step.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }} />

        {/* Formulaire */}
        <section style={{ padding: "80px 24px 100px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div className="amber-line" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
              On en parle ?
            </h2>
            <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 40 }}>
              Présentez-vous en quelques mots. Je réponds sous 24 h pour qu&apos;on explore ensemble.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="glass" style={{ padding: "36px 32px", maxWidth: 560 }}>
              <form>
                <label style={{ display: "block", fontSize: 12, color: "rgba(240,235,228,0.5)", marginBottom: 6, letterSpacing: "0.05em" }}>
                  PRÉNOM &amp; NOM
                </label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  style={focusStyle("name")}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                />

                <label style={{ display: "block", fontSize: 12, color: "rgba(240,235,228,0.5)", marginBottom: 6, letterSpacing: "0.05em" }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  style={focusStyle("email")}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                />

                <label style={{ display: "block", fontSize: 12, color: "rgba(240,235,228,0.5)", marginBottom: 6, letterSpacing: "0.05em" }}>
                  VOTRE RÉSEAU OU ACTIVITÉ
                </label>
                <textarea
                  placeholder="Décrivez votre réseau, votre secteur, le type de contacts que vous pouvez apporter…"
                  style={{
                    ...focusStyle("message"),
                    minHeight: 120,
                    resize: "vertical",
                    marginBottom: 20,
                  }}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                />

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #e8946a, #c27b5b)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    boxShadow: "0 0 30px rgba(232,148,106,0.2)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 50px rgba(232,148,106,0.35)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(232,148,106,0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Envoyer →
                </button>
              </form>
            </div>
          </FadeIn>
        </section>

      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          fontSize: 12,
          color: "rgba(240,235,228,0.2)",
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span>© {new Date().getFullYear()} Creahub Solutions — Développeuse Freelance · Python · React · WordPress · Cloud</span>
        <a
          href="/cgv"
          style={{ color: "rgba(240,235,228,0.25)", textDecoration: "none", fontSize: 11, transition: "color 0.2s" }}
        >
          Conditions Générales de Vente
        </a>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .steps-list > div > div { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>
    </>
  );
}
