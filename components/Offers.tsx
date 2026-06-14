"use client";
import { useState } from "react";
import FadeIn from "./FadeIn";

const offers = [
  {
    tag: "Projet sur mesure",
    title: "Projet sur mesure",
    price: "À partir de 1 500 € · puis 75 €/h HT",
    desc: "Du site vitrine au projet complexe. Site simple à partir de 1 500 €, le reste au temps passé selon le périmètre. Je prends en charge votre projet de bout en bout.",
    items: [
      "Site vitrine & landing page — à partir de 1 500 €",
      "Applications web & SaaS (React, Python, Node)",
      "Apps desktop (Tauri) & mobile",
      "Déploiement cloud (GCP, AWS, Azure) & Linux",
      "Intégrations API & migrations de bases de données",
    ],
    cta: "Discuter de votre projet",
    highlight: true,
    example: {
      title: "Exemple — Site vitrine à 1 500 € HT",
      intro: "Un site simple, sans techno lourde, livré clé en main :",
      items: [
        "4 à 5 pages (accueil, services, à propos, contact…)",
        "Design responsive sur mesure, adapté mobile & desktop",
        "Formulaire de contact connecté à votre boîte mail",
        "Optimisation SEO de base & performances",
        "Nom de domaine, hébergement & mise en ligne",
        "Une session de prise en main pour gérer votre contenu",
      ],
      footer: "≈ 20 h de travail · à partir de 1 500 € HT",
    },
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
    example: null,
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
    example: null,
  },
];

export default function Offers() {
  const [openExample, setOpenExample] = useState<string | null>(null);

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

              {offer.example && (
                <div>
                  <button
                    onClick={() =>
                      setOpenExample(
                        openExample === offer.tag ? null : offer.tag
                      )
                    }
                    aria-expanded={openExample === offer.tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#e8946a",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "1px solid rgba(232,148,106,0.4)",
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      {openExample === offer.tag ? "−" : "+"}
                    </span>
                    {openExample === offer.tag
                      ? "Masquer l'exemple"
                      : "Voir un exemple détaillé"}
                  </button>

                  {openExample === offer.tag && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: "16px 18px",
                        borderRadius: 12,
                        border: "1px solid rgba(232,148,106,0.18)",
                        background: "rgba(232,148,106,0.05)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#f0ebe4",
                          marginBottom: 6,
                        }}
                      >
                        {offer.example.title}
                      </div>
                      <p
                        style={{
                          fontSize: 12.5,
                          color: "rgba(240,235,228,0.55)",
                          lineHeight: 1.5,
                          marginBottom: 12,
                        }}
                      >
                        {offer.example.intro}
                      </p>
                      <ul
                        style={{
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 7,
                          marginBottom: 12,
                        }}
                      >
                        {offer.example.items.map((item) => (
                          <li
                            key={item}
                            style={{
                              fontSize: 12.5,
                              color: "rgba(240,235,228,0.75)",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                color: "#e8946a",
                                marginTop: 1,
                                flexShrink: 0,
                              }}
                            >
                              ✓
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#e8946a",
                          paddingTop: 10,
                          borderTop: "1px solid rgba(232,148,106,0.15)",
                        }}
                      >
                        {offer.example.footer}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
