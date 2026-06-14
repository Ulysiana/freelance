"use client";
import FadeIn from "./FadeIn";

const offers = [
  {
    tag: "Projet sur mesure",
    title: "Projet sur mesure",
    price: "75 €/h HT",
    desc: "Développement web, back-end, intégrations API et architecture cloud. Je prends en charge votre projet de bout en bout.",
    items: [
      "Sites web & landing pages (Next.js, WordPress, Shopify)",
      "Applications web & SaaS (React, Python, Node)",
      "Apps desktop (Tauri) & mobile",
      "Déploiement cloud (GCP, AWS, Azure) & Linux",
      "Intégrations API & migrations de bases de données",
    ],
    cta: "Discuter de votre projet",
    highlight: true,
  },
  {
    tag: "Audit & Diagnostic",
    title: "Forfait Audit",
    price: "À partir de 490 €",
    desc: "Un état des lieux complet de votre site ou application, avec un rapport priorisé et des recommandations actionnables.",
    items: [
      "Audit SEO technique & sémantique",
      "Performance & Core Web Vitals",
      "Revue de code & architecture",
      "UX & parcours utilisateur",
      "Rapport livré + restitution incluse",
    ],
    cta: "Demander un audit",
    highlight: false,
  },
  {
    tag: "Migration & Transfert",
    title: "Migration & Transfert",
    price: "À partir de 790 €",
    desc: "Migration sécurisée de votre site, base de données ou boutique — sans perte de données ni downtime.",
    items: [
      "Migration WordPress (hébergeur, thème, plugins)",
      "Migration & refonte Shopify",
      "Migration de base de données",
      "Audit des risques avant migration",
      "Tests de non-régression & validation",
    ],
    cta: "Parler de ma migration",
    highlight: false,
  },
];

export default function Offers() {
  return (
    <section
      id="offers"
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
          Mes offres
        </h2>
        <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 40 }}>
          Trois services, un seul objectif : livrer quelque chose qui marche vraiment.
        </p>
      </FadeIn>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {offers.map((offer, i) => (
          <FadeIn key={offer.tag} delay={i * 0.1}>
            <div
              className="glass"
              style={{
                padding: "28px 24px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                position: "relative",
                overflow: "hidden",
                ...(offer.highlight
                  ? {
                      border: "1px solid rgba(232,148,106,0.25)",
                      background: "rgba(232,148,106,0.04)",
                    }
                  : {}),
              }}
            >
              {offer.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      "linear-gradient(90deg, #e8946a, #f4b896, transparent)",
                  }}
                />
              )}

              <div>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#e8946a",
                    fontWeight: 600,
                  }}
                >
                  {offer.tag}
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginBottom: 6,
                  }}
                >
                  {offer.title}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e8946a",
                  }}
                >
                  {offer.price}
                </div>
              </div>

              <p style={{ fontSize: 13, color: "rgba(240,235,228,0.5)", lineHeight: 1.6 }}>
                {offer.desc}
              </p>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                {offer.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 13,
                      color: "rgba(240,235,228,0.75)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: "#e8946a", marginTop: 1, flexShrink: 0 }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                <a
                  href="#contact"
                  style={{
                    display: "inline-block",
                    fontSize: 13,
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(232,148,106,0.25)",
                    color: "#e8946a",
                    background: "rgba(232,148,106,0.06)",
                    transition: "all 0.2s",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(232,148,106,0.14)";
                    e.currentTarget.style.borderColor = "rgba(232,148,106,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(232,148,106,0.06)";
                    e.currentTarget.style.borderColor = "rgba(232,148,106,0.25)";
                  }}
                >
                  {offer.cta} →
                </a>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
