'use client'

export default function OfflineRetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      style={{
        borderRadius: 999,
        padding: '12px 18px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(240,235,228,0.82)',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      Réessayer
    </button>
  )
}
