"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "120px 24px 80px",
        maxWidth: 1100,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 999,
          border: "1px solid rgba(232,148,106,0.25)",
          background: "rgba(232,148,106,0.08)",
          fontSize: 12,
          color: "#e8946a",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 32,
          width: "fit-content",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#e8946a",
            boxShadow: "0 0 8px #e8946a",
            display: "inline-block",
          }}
        />
        Creahub Solutions · 100 % remote · 590 €/j
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          marginBottom: 28,
          maxWidth: 820,
        }}
      >
        Je{" "}
        <span className="text-gradient">construis, migre</span>
        <br />
        et optimise vos
        <br />
        projets web &amp; app.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{
          fontSize: "clamp(15px, 2vw, 18px)",
          color: "rgba(240,235,228,0.55)",
          maxWidth: 540,
          lineHeight: 1.7,
          marginBottom: 40,
        }}
      >
        Python · React · Node · Rust · WordPress · Shopify · GCP · AWS · Azure · Neon.
        <br />
        Autodidacte depuis les années 2000. Passionnée. Soirs &amp; week-ends.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}
      >
        <a
          href="#contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 28px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #e8946a, #c27b5b)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "-0.01em",
            boxShadow: "0 0 40px rgba(232,148,106,0.25)",
            transition: "all 0.3s ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 60px rgba(232,148,106,0.4)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 40px rgba(232,148,106,0.25)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Parler de votre projet →
        </a>

        <a
          href="#offers"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 24px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(240,235,228,0.7)",
            fontSize: 14,
            transition: "all 0.2s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.color = "#f0ebe4";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(240,235,228,0.7)";
          }}
        >
          Voir mes offres
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "absolute",
          bottom: 40,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "rgba(240,235,228,0.25)",
          fontSize: 12,
          letterSpacing: "0.1em",
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{
            width: 1,
            height: 32,
            background:
              "linear-gradient(180deg, rgba(232,148,106,0.6), transparent)",
          }}
        />
        SCROLL
      </motion.div>
    </section>
  );
}
