import Background from "@/components/Background";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Offers from "@/components/Offers";
import Story from "@/components/Story";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Background />
      <Nav />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(232,148,106,0.15), transparent)",
          }}
        />

        <Offers />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
          }}
        />

        <Story />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
          }}
        />

        <Projects />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(232,148,106,0.15), transparent)",
          }}
        />

        <Contact />
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
        <span>
          © {new Date().getFullYear()} Creahub Solutions — Développeuse Freelance ·{" "}
          Python · React · WordPress · Cloud · 100 % remote
        </span>
        <a
          href="/cgv"
          style={{
            color: "rgba(240,235,228,0.25)",
            textDecoration: "none",
            fontSize: 11,
            transition: "color 0.2s",
          }}
        >
          Conditions Générales de Vente
        </a>
      </footer>
    </>
  );
}
