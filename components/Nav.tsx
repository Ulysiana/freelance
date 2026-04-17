"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "#offers", label: "Offres" },
  { href: "#story", label: "Histoire" },
  { href: "#projects", label: "Réalisations" },
  { href: "/hebergeurs", label: "Gîtes & Locations" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const resolveHref = (href: string) =>
    href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBase: React.CSSProperties = {
    position: "fixed",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px",
    borderRadius: 999,
    border: scrolled
      ? "1px solid rgba(232,148,106,0.2)"
      : "1px solid rgba(255,255,255,0.07)",
    background: scrolled ? "rgba(10,8,6,0.9)" : "rgba(10,8,6,0.45)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    transition: "all 0.4s ease",
    width: "calc(100% - 32px)",
    maxWidth: 860,
  };

  return (
    <>
      <nav style={navBase}>
        {/* Brand */}
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#e8946a",
            letterSpacing: "-0.01em",
            flexShrink: 0,
          }}
        >
          Creahub
          <span style={{ color: "rgba(232,148,106,0.5)", fontWeight: 400 }}>
            {" "}Solutions
          </span>
        </span>

        {/* Desktop links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
          className="nav-desktop"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={resolveHref(l.href)}
              style={{
                fontSize: 13,
                color: "rgba(240,235,228,0.55)",
                padding: "5px 12px",
                borderRadius: 999,
                transition: "color 0.2s",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe4")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(240,235,228,0.55)")
              }
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#contact"
          style={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 600,
            padding: "7px 18px",
            borderRadius: 999,
            background: "rgba(232,148,106,0.12)",
            border: "1px solid rgba(232,148,106,0.28)",
            color: "#e8946a",
            transition: "all 0.2s",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,148,106,0.22)";
            e.currentTarget.style.borderColor = "rgba(232,148,106,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(232,148,106,0.12)";
            e.currentTarget.style.borderColor = "rgba(232,148,106,0.28)";
          }}
        >
          Me contacter
        </a>

        {/* Hamburger (mobile) */}
        <button
          className="nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            color: "rgba(240,235,228,0.7)",
            fontSize: 18,
            lineHeight: 1,
          }}
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: 16,
            right: 16,
            zIndex: 99,
            background: "rgba(10,8,6,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={resolveHref(l.href)}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: 15,
                color: "rgba(240,235,228,0.7)",
                padding: "10px 16px",
                borderRadius: 10,
                textDecoration: "none",
                display: "block",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: block !important; }
        }
      `}</style>
    </>
  );
}
