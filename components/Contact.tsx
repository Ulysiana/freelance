"use client";
import { useState } from "react";
import FadeIn from "./FadeIn";

export default function Contact() {
  const [type, setType] = useState("");

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

  return (
    <section
      id="contact"
      style={{
        padding: "80px 24px 100px",
        maxWidth: 1100,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <FadeIn>
        <div className="amber-line" style={{ marginBottom: 16 }} />
        <h2
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Parlons de votre projet
        </h2>
        <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 40 }}>
          Décrivez-moi votre contexte. Je réponds sous 24 h avec une première piste.
        </p>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="contact-grid">
        {/* Form */}
        <FadeIn delay={0.1}>
          <div className="glass" style={{ padding: "32px 28px" }}>
            <form>
              <label style={{ display: "block", fontSize: 12, color: "rgba(240,235,228,0.5)", marginBottom: 6, letterSpacing: "0.05em" }}>
                NOM
              </label>
              <input
                type="text"
                placeholder="Votre nom"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(232,148,106,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />

              <label style={{ display: "block", fontSize: 12, color: "rgba(240,235,228,0.5)", marginBottom: 6, letterSpacing: "0.05em" }}>
                EMAIL
              </label>
              <input
                type="email"
                placeholder="vous@exemple.com"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(232,148,106,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />

              <label style={{ display: "block", fontSize: 12, color: "rgba(240,235,228,0.5)", marginBottom: 6, letterSpacing: "0.05em" }}>
                TYPE DE BESOIN
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(232,148,106,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                <option value="" style={{ background: "#1a1410" }}>— Choisir —</option>
                <option value="projet" style={{ background: "#1a1410" }}>Développement sur mesure</option>
                <option value="audit" style={{ background: "#1a1410" }}>Pack Audit</option>
                <option value="migration" style={{ background: "#1a1410" }}>Pack Migration</option>
                <option value="build" style={{ background: "#1a1410" }}>Pack Build</option>
                <option value="autre" style={{ background: "#1a1410" }}>Autre / Je ne sais pas encore</option>
              </select>

              <label style={{ display: "block", fontSize: 12, color: "rgba(240,235,228,0.5)", marginBottom: 6, letterSpacing: "0.05em" }}>
                VOTRE PROJET
              </label>
              <textarea
                placeholder="Quelques lignes sur votre projet, votre contexte, vos délais…"
                style={{
                  ...inputStyle,
                  minHeight: 110,
                  resize: "vertical",
                  marginBottom: 20,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(232,148,106,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
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

        {/* Right: infos */}
        <FadeIn delay={0.2} direction="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              {
                icon: "◎",
                title: "Réponse sous 24 h",
                desc: "Je lis tous les messages et je réponds avec une vraie proposition, pas un template.",
              },
              {
                icon: "◈",
                title: "100 % remote",
                desc: "Je travaille à distance exclusivement — soirs et week-ends inclus. Pas de déplacement.",
              },
              {
                icon: "◇",
                title: "Premier échange gratuit",
                desc: "Un appel de 30 min pour comprendre votre projet avant de parler budget ou délais.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(232,148,106,0.08)",
                    border: "1px solid rgba(232,148,106,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e8946a",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(240,235,228,0.5)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
