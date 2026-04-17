"use client";
import FadeIn from "./FadeIn";

const skills = [
  "Python", "React", "Node.js", "Rust", "Tauri",
  "Apps mobiles", "Next.js", "Linux & serveur",
  "Cloud (GCP · AWS · Azure)", "Neon (PostgreSQL)", "WordPress",
  "Shopify", "SEO technique", "Migrations BDD",
  "Intégrations API", "SQL & entrepôts de données",
  "Dev avec IA",
];

export default function Story() {
  return (
    <section
      id="story"
      style={{
        padding: "80px 24px",
        maxWidth: 1100,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "start",
        }}
        className="story-grid"
      >
        {/* Left: texte */}
        <div>
          <FadeIn>
            <div className="amber-line" style={{ marginBottom: 16 }} />
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: 32,
              }}
            >
              Mon histoire
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "rgba(240,235,228,0.75)",
                marginBottom: 20,
              }}
            >
              J'ai commencé à coder au début des années 2000 — dans{" "}
              <strong style={{ color: "#f0ebe4" }}>Notepad</strong>, comme on
              faisait souvent à l'époque. Pas de framework, pas de tutoriel YouTube. Juste de la
              curiosité, un fichier HTML et beaucoup de{" "}
              <em style={{ color: "rgba(240,235,228,0.6)" }}>
                «&nbsp;pourquoi ça marche pas&nbsp;»
              </em>
              . Ce rapport direct avec le code, je l'ai gardé intact.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "rgba(240,235,228,0.75)",
                marginBottom: 20,
              }}
            >
              En parallèle, mon parcours professionnel m'a amenée à travailler
              sur des systèmes bien réels :{" "}
              <strong style={{ color: "#f0ebe4" }}>
                gestion de bases de données
              </strong>
              , requêtes SQL sur des entrepôts de données, administration de{" "}
              <strong style={{ color: "#f0ebe4" }}>
                serveurs Linux en environnement industriel
              </strong>
              . Pas du dev en chambre — de l'infrastructure en conditions
              réelles, où les erreurs ont des conséquences.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "rgba(240,235,228,0.75)",
                marginBottom: 20,
              }}
            >
              Ce que j'aime par-dessus tout :{" "}
              <strong style={{ color: "#f0ebe4" }}>résoudre des problèmes</strong>.
              Les sujets complexes, les architectures à démêler, les migrations
              à risques, les performances à remonter — c'est exactement là que
              je suis dans mon élément.{" "}
              <strong style={{ color: "#f0ebe4" }}>
                Plus c'est compliqué, plus c'est intéressant.
              </strong>
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "rgba(240,235,228,0.75)",
              }}
            >
              Je développe aussi avec l'
              <strong style={{ color: "#f0ebe4" }}>IA</strong> — pas pour
              remplacer la réflexion, mais pour aller plus vite et mieux.
              Python, Rust, React, apps mobiles, cloud — j'apprends en continu
              parce que c'est ce qui me fait vibrer.{" "}
              <span className="text-gradient" style={{ fontWeight: 700 }}>
                Sky is the limit.
              </span>
            </p>
          </FadeIn>
        </div>

        {/* Right: stack */}
        <div>
          <FadeIn delay={0.1} direction="left">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative" }}>

              {/* Glow amber derrière */}
              <div style={{
                position: "absolute",
                width: 260,
                height: 320,
                background: "radial-gradient(ellipse, rgba(232,148,106,0.2) 0%, transparent 70%)",
                filter: "blur(30px)",
                pointerEvents: "none",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }} />

              {/* Cadre décalé derrière */}
              <div style={{
                position: "absolute",
                width: 210,
                height: 270,
                top: 12,
                left: "calc(50% + 12px)",
                transform: "translateX(-50%)",
                borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
                border: "1px solid rgba(232,148,106,0.2)",
                background: "rgba(232,148,106,0.04)",
              }} />

              {/* Photo blob */}
              <div style={{ position: "relative" }}>
                <img
                  src="https://pub-8f5fcb136dea4b40a0ab2b4891e0d4ac.r2.dev/site/photo.png"
                  alt="Corinne – Creahub Solutions"
                  style={{
                    width: 210,
                    height: 270,
                    objectFit: "cover",
                    objectPosition: "center top",
                    clipPath: "path('M105,0 C155,0 210,35 210,95 C210,145 190,175 175,210 C160,245 155,270 105,270 C55,270 48,245 35,210 C20,175 0,145 0,95 C0,35 55,0 105,0 Z')",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                    display: "block",
                  }}
                />

              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15} direction="left">
            <div
              className="glass"
              style={{ padding: "28px 24px" }}
            >
              <p
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#e8946a",
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                Stack & compétences
              </p>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {skills.map((s) => (
                  <span key={s} className="skill-pill">
                    {s}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#e8946a",
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  Façon de travailler
                </p>
                {[
                  "100 % remote — pas de déplacement",
                  "Soirs & week-ends disponibles",
                  "Communication asynchrone",
                  "Livraisons documentées & maintenables",
                  "Passion des défis complexes",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      fontSize: 13,
                      color: "rgba(240,235,228,0.65)",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#e8946a",
                        flexShrink: 0,
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .story-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
