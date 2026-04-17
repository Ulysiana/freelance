"use client";
import { useState } from "react";
import Background from "@/components/Background";
import FadeIn from "@/components/FadeIn";
import Nav from "@/components/Nav";

const offers = [
  {
    tag: "Vitrine simple",
    price: "À partir de 800 €",
    items: [
      "Site WordPress vitrine",
      "Présentation de vos hébergements",
      "Sans moteur de réservation",
      "Mise en ligne incluse",
    ],
  },
  {
    tag: "Vitrine complexe",
    price: "À partir de 1 500 €",
    items: [
      "WordPress + blog & galerie",
      "Gestion multilingue",
      "Formulaire de contact avancé",
      "Optimisation SEO de base",
    ],
  },
  {
    tag: "PMS simple WP",
    price: "À partir de 1 800 €",
    items: [
      "WordPress + synchronisation iCal",
      "Intégration PMS basique",
      "Disponibilités en temps réel",
      "Formulaire de demande de réservation",
    ],
  },
  {
    tag: "PMS complexe WP",
    price: "À partir de 2 500 €",
    items: [
      "WordPress + moteur de réservation",
      "API PMS (Superhôte, Smoobu…)",
      "Paiement en ligne intégré",
      "Gestion multi-hébergements",
    ],
  },
  {
    tag: "PMS simple sur-mesure",
    price: "À partir de 3 000 €",
    items: [
      "React / Next.js",
      "Intégration PMS & iCal",
      "Interface propriétaire moderne",
      "Performances & SEO optimaux",
    ],
  },
  {
    tag: "PMS complexe sur-mesure",
    price: "À partir de 4 500 €",
    items: [
      "React / Next.js + moteur résa custom",
      "API PMS complète + blog",
      "Gestion multilingue avancée",
      "Déploiement cloud (Cloud Run + Neon)",
    ],
  },
];

const strengths = [
  {
    icon: "◈",
    title: "Expérience réelle PMS",
    desc: "Intégrations concrètes avec Superhôte, Smoobu, iCal et autres API de synchronisation.",
  },
  {
    icon: "◎",
    title: "Réservation directe, zéro commission OTA",
    desc: "Des sites conçus pour capter les réservations sans passer par Airbnb ou Booking.",
  },
  {
    icon: "◇",
    title: "Déploiement cloud professionnel",
    desc: "Cloud Run, Cloudflare et Neon — infrastructure fiable, scalable et sécurisée.",
  },
  {
    icon: "◉",
    title: "Support et évolution inclus",
    desc: "Accompagnement après livraison : corrections, ajouts de contenu, montées en charge.",
  },
];

const btnStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: 13,
  padding: "9px 20px",
  borderRadius: 999,
  border: "1px solid rgba(232,148,106,0.25)",
  color: "#e8946a",
  background: "rgba(232,148,106,0.06)",
  transition: "all 0.2s",
  textDecoration: "none",
  fontWeight: 500,
  cursor: "pointer",
};

export default function Hebergeurs() {
  const [hoveredOffer, setHoveredOffer] = useState<number | null>(null);

  return (
    <>
      <Background />
      <Nav />

      <main style={{ position: "relative", zIndex: 1, paddingTop: 80 }}>

        {/* Hero */}
        <section style={{ padding: "80px 24px 64px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                border: "1px solid rgba(232,148,106,0.3)",
                background: "rgba(232,148,106,0.07)",
                marginBottom: 24,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8946a", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#e8946a", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Spécialiste location courte durée
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 20,
                maxWidth: 780,
              }}
            >
              Solutions web pour les{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #e8946a 0%, #f4b896 50%, #c27b5b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                hébergeurs
              </span>{" "}
              en location courte durée
            </h1>

            <p style={{ fontSize: 17, color: "rgba(240,235,228,0.55)", maxWidth: 640, lineHeight: 1.7, marginBottom: 32 }}>
              Sites sur-mesure avec moteur de réservation, intégration PMS (Superhôte, Smoobu…)
              et gestion multilingue.
            </p>

            <a
              href="/#contact"
              style={{
                display: "inline-block",
                padding: "13px 28px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #e8946a, #c27b5b)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
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
              Demander un devis →
            </a>
          </FadeIn>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 1, background: "linear-gradient(90deg, transparent, rgba(232,148,106,0.15), transparent)" }} />

        {/* Offres */}
        <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div className="amber-line" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
              Nos offres
            </h2>
            <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 40 }}>
              Six formules adaptées à votre niveau de besoin, de la vitrine simple au moteur sur-mesure.
            </p>
          </FadeIn>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}
            className="offers-grid"
          >
            {offers.map((offer, i) => (
              <FadeIn key={offer.tag} delay={i * 0.08}>
                <div
                  className="glass"
                  style={{
                    padding: "28px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#e8946a", fontWeight: 600 }}>
                      {offer.tag}
                    </span>
                  </div>

                  <div style={{ fontSize: 18, fontWeight: 700, color: "#e8946a" }}>
                    {offer.price}
                  </div>

                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, flexGrow: 1 }}>
                    {offer.items.map((item) => (
                      <li
                        key={item}
                        style={{ fontSize: 13, color: "rgba(240,235,228,0.75)", display: "flex", alignItems: "flex-start", gap: 8 }}
                      >
                        <span style={{ color: "#e8946a", marginTop: 1, flexShrink: 0 }}>›</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: "auto", paddingTop: 8 }}>
                    <a
                      href="/#contact"
                      style={{
                        ...btnStyle,
                        ...(hoveredOffer === i ? { background: "rgba(232,148,106,0.14)", borderColor: "rgba(232,148,106,0.4)" } : {}),
                      }}
                      onMouseEnter={() => setHoveredOffer(i)}
                      onMouseLeave={() => setHoveredOffer(null)}
                    >
                      Demander un devis →
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }} />

        {/* Points forts */}
        <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div className="amber-line" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
              Pourquoi travailler ensemble
            </h2>
            <p style={{ fontSize: 14, color: "rgba(240,235,228,0.45)", marginBottom: 40 }}>
              Ce qui fait la différence sur chaque projet livré.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }} className="strengths-grid">
            {strengths.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.1}>
                <div className="glass" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(232,148,106,0.08)",
                      border: "1px solid rgba(232,148,106,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#e8946a",
                      fontSize: 18,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(240,235,228,0.5)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 1, background: "linear-gradient(90deg, transparent, rgba(232,148,106,0.15), transparent)" }} />

        {/* Bloc Happy House */}
        <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div
              style={{
                maxWidth: 640,
                margin: "0 auto",
                textAlign: "center",
                padding: "48px 40px",
                borderRadius: 20,
                border: "1px solid rgba(232,148,106,0.25)",
                background: "rgba(232,148,106,0.04)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top accent line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #e8946a, transparent)" }} />

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(232,148,106,0.3)",
                  background: "rgba(232,148,106,0.07)",
                  marginBottom: 20,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8946a", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#e8946a", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Réseau partenaires
                </span>
              </div>

              <h2 style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
                Tarifs partenaires disponibles
              </h2>

              <p style={{ fontSize: 14, color: "rgba(240,235,228,0.55)", lineHeight: 1.7, marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
                Je travaille avec un réseau de partenaires qui bénéficient de conditions tarifaires dédiées. Contactez-moi pour en savoir plus.
              </p>

              <a
                href="mailto:corinne.liot@gmail.com?subject=Tarifs partenaires"
                style={{
                  display: "inline-block",
                  padding: "13px 28px",
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg, #e8946a, #c27b5b)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
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
                Me contacter →
              </a>
            </div>
          </FadeIn>
        </section>

      </main>

      {/* Footer de page */}
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
          href="/#contact"
          style={{ color: "rgba(240,235,228,0.35)", textDecoration: "none", fontSize: 11, transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(232,148,106,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,228,0.35)")}
        >
          Une question ? Contactez-moi →
        </a>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .offers-grid { grid-template-columns: 1fr !important; }
          .strengths-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
