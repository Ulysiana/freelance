import Link from 'next/link'
import OfflineRetryButton from '@/components/OfflineRetryButton'

export const metadata = {
  title: 'Hors ligne',
}

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(45,32,24,0.95) 0%, rgba(18,13,10,1) 56%, rgba(10,8,6,1) 100%)',
        color: '#f0ebe4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <section
        style={{
          width: 'min(560px, 100%)',
          padding: '32px 28px',
          borderRadius: 24,
          border: '1px solid rgba(232,148,106,0.18)',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          boxShadow: '0 22px 70px rgba(0,0,0,0.28)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span
            style={{
              width: 'fit-content',
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid rgba(232,148,106,0.24)',
              background: 'rgba(232,148,106,0.08)',
              color: '#e8946a',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Mode hors ligne
          </span>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 48px)', lineHeight: 1.02, letterSpacing: '-0.03em' }}>
            Connexion perdue.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(240,235,228,0.72)' }}>
            La vitrine peut rester partiellement disponible, mais l&apos;espace client et le back-office ont besoin d&apos;une connexion pour charger les données en temps réel.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              borderRadius: 999,
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #e8946a, #c27b5b)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Revenir à l&apos;accueil
          </Link>
          <OfflineRetryButton />
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, color: 'rgba(240,235,228,0.58)', fontSize: 13 }}>
          <li>Les messages, tâches et documents privés ne sont pas mis en cache pour éviter les incohérences.</li>
          <li>Une fois reconnectée, recharge simplement la page pour reprendre là où tu en étais.</li>
        </ul>
      </section>
    </main>
  )
}
