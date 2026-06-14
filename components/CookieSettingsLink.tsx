'use client'

export default function CookieSettingsLink() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: 'rgba(240,235,228,0.25)',
        fontSize: 11,
        transition: 'color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(240,235,228,0.5)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,235,228,0.25)')}
    >
      Gestion des cookies
    </button>
  )
}
