"use client";
import FadeIn from "./FadeIn";
import BrowserMockup from "./BrowserMockup";

const projects = [
  {
    name: "locationshygge.com",
    url: "https://locationshygge.com",
    type: "Moteur de réservation multi-gîtes",
    stack: ["Python", "React", "Neon", "Cloud Run"],
    desc: "Moteur de réservation complet conçu et développé de zéro : gestion multi-gîtes, calendriers synchronisés, logique de prix dynamique, déploiement Cloud Run, BDD serverless Neon. Architecture pensée pour évoluer sans réécriture.",
    preview: "/images/preview-hygge.png",
  },
  {
    name: "difyzi.com",
    url: "https://difyzi.com",
    type: "App web · Manipulation de PDF multi-outils",
    stack: ["React", "Python", "Rust"],
    desc: "Application web de manipulation de PDF développée de A à Z : fusion, compression, conversion et plus. Frontend React, traitements Python et Rust pour les opérations performantes sur les fichiers.",
    preview: "/images/preview-difyzi.png",
  },
  {
    name: "mymhynose.fr",
    url: "",
    type: "Création & Migration WordPress · Infrastructure serveur",
    stack: ["WordPress", "Linux VPS", "Cloudflare DNS", "cPanel"],
    desc: "Création du site WordPress et migration depuis un hébergement mutualisé cPanel vers un VPS Linux dédié : transfert des fichiers et de la base de données, configuration du serveur, bascule DNS via Cloudflare — zéro downtime, zéro perte de données.",
    preview: "",
  },
];

export default function Projects() {
  return (
    <section
      id="projects"
      style={{
        padding: "80px 24px",
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
          Réalisations
        </h2>
        <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 40 }}>
          Deux projets aboutis de bout en bout — conception, développement, mise en production.
        </p>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="projects-grid">
        {projects.map((p, i) => (
          <FadeIn key={p.name} delay={i * 0.15}>
            <a
              href={p.url || undefined}
              target={p.url ? "_blank" : undefined}
              rel={p.url ? "noopener noreferrer" : undefined}
              className="glass"
              style={{
                display: "block",
                padding: "28px 24px",
                textDecoration: "none",
                color: "inherit",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                position: "relative",
                overflow: "hidden",
                cursor: p.url ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (!p.url) return;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Subtle corner glow */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(232,148,106,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {p.preview && (
                <BrowserMockup src={p.preview} alt={p.name} url={p.url} />
              )}

              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#e8946a", fontWeight: 600, marginBottom: 10 }}>
                {p.type}
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {p.name}
                {p.url && <span style={{ fontSize: 16, color: "rgba(240,235,228,0.3)" }}>↗</span>}
              </div>

              <p style={{ fontSize: 14, color: "rgba(240,235,228,0.6)", lineHeight: 1.7, marginBottom: 18 }}>
                {p.desc}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.stack.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "rgba(232,148,106,0.08)",
                      border: "1px solid rgba(232,148,106,0.15)",
                      color: "rgba(232,148,106,0.8)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          </FadeIn>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .projects-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
