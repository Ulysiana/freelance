"use client";
import { useState } from "react";
import FadeIn from "./FadeIn";
import BrowserMockup from "./BrowserMockup";

const projects = [
  {
    name: "locationshygge.com",
    url: "https://locationshygge.com",
    type: "Moteur de réservation · Locations Hygge",
    categories: ["Sur-mesure"],
    stack: ["Python", "React", "Neon", "Cloud Run"],
    desc: "Site de réservation conçu de zéro pour 3 gîtes en montagne. Réservations 100 % en direct, sans commission Booking ni Airbnb. Calendriers synchronisés, logique de prix dynamique, déployé sur Cloud Run.",
    preview: "https://pub-8f5fcb136dea4b40a0ab2b4891e0d4ac.r2.dev/site/preview-hygge.png",
  },
  {
    name: "difyzi.com",
    url: "https://difyzi.com",
    type: "SaaS PDF · Difyzi",
    categories: ["SaaS"],
    stack: ["React", "Python", "Rust"],
    desc: "Application web de manipulation de PDF développée de A à Z et mise en production. Fusion, compression, conversion — traitements Python et Rust pour les opérations performantes.",
    preview: "https://pub-8f5fcb136dea4b40a0ab2b4891e0d4ac.r2.dev/site/preview-difyzi.png",
  },
  {
    name: "mine4fun.win",
    url: "https://mine4fun.win",
    type: "SaaS · Serveurs Minecraft moddés",
    categories: ["Sur-mesure"],
    stack: ["Node.js", "Express", "SQLite", "Forge", "Linux"],
    desc: "Plateforme qui déploie des serveurs Minecraft moddés en quelques clics : choix des mods (Forge), provisioning automatique des instances et gestion en self-service. De l'interface web jusqu'à l'infrastructure d'hébergement.",
    preview: "/images/preview-mine4fun.webp",
  },
  {
    name: "mymhypnose.fr",
    url: "https://mymhypnose.fr/",
    type: "Migration VPS · mymhypnose.fr",
    categories: ["WordPress"],
    stack: ["WordPress", "Linux VPS", "Cloudflare DNS"],
    desc: "Formation WordPress pour rendre le client totalement autonome sur son site. Migration cPanel → VPS Linux : base de données, fichiers, bascule DNS Cloudflare — zéro downtime, zéro perte.",
    preview: "/images/preview-mymhypnose.webp",
  },
];

const filters = ["Tous", ...Array.from(new Set(projects.flatMap((p) => p.categories)))];

export default function Projects() {
  const [active, setActive] = useState("Tous");
  const visible =
    active === "Tous" ? projects : projects.filter((p) => p.categories.includes(active));

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
        <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 28 }}>
          Projets livrés de bout en bout — conception, développement, mise en production.
        </p>
      </FadeIn>

      {/* Filtres */}
      <FadeIn delay={0.05}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
          {filters.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "7px 16px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  border: isActive
                    ? "1px solid rgba(232,148,106,0.45)"
                    : "1px solid rgba(255,255,255,0.1)",
                  background: isActive ? "rgba(232,148,106,0.14)" : "transparent",
                  color: isActive ? "#e8946a" : "rgba(240,235,228,0.5)",
                }}
                onMouseEnter={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                  e.currentTarget.style.color = "#f0ebe4";
                }}
                onMouseLeave={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(240,235,228,0.5)";
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </FadeIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="projects-grid">
        {visible.map((p, i) => (
          <FadeIn key={p.name} delay={i * 0.1}>
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
