'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isIosSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua)
  const isWebkit = /WebKit/.test(ua)
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS/.test(ua)
  return isIos && isWebkit && !isOtherBrowser
}

export default function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isInstalled, setIsInstalled] = useState(true)
  const [showIosHint, setShowIosHint] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const dismissedAt = window.localStorage.getItem('pwa-install-dismissed')
      const installed = isStandaloneMode()

      setDismissed(dismissedAt === '1')
      setIsInstalled(installed)
      setShowIosHint(!installed && isIosSafari())
      setReady(true)
    })

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
      setIsInstalled(false)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setPromptEvent(null)
      setShowIosHint(false)
      window.localStorage.removeItem('pwa-install-dismissed')
      setDismissed(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  function hidePrompt() {
    window.localStorage.setItem('pwa-install-dismissed', '1')
    setDismissed(true)
  }

  async function installApp() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome === 'accepted') {
      setPromptEvent(null)
    }
  }

  if (!ready || isInstalled || dismissed) return null

  if (!promptEvent && !showIosHint) return null

  return (
    <aside
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 10001,
        width: 'min(360px, calc(100vw - 32px))',
        borderRadius: 18,
        border: '1px solid rgba(232,148,106,0.22)',
        background: 'rgba(16,12,9,0.92)',
        color: '#f0ebe4',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong style={{ fontSize: 14, color: '#e8946a' }}>Installer Creahub</strong>
          <p style={{ fontSize: 12, lineHeight: 1.45, color: 'rgba(240,235,228,0.68)' }}>
            {promptEvent
              ? "Ajoute l'app pour l'ouvrir comme une app et garder un accès plus fiable sur mobile."
              : "Sur iPhone, utilise Partager puis 'Sur l'écran d'accueil' pour installer l'app."}
          </p>
        </div>
        <button
          type="button"
          onClick={hidePrompt}
          aria-label="Masquer"
          style={{
            border: 'none',
            background: 'transparent',
            color: 'rgba(240,235,228,0.42)',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      {promptEvent ? (
        <button
          type="button"
          onClick={installApp}
          style={{
            border: '1px solid rgba(232,148,106,0.28)',
            background: 'linear-gradient(135deg, rgba(232,148,106,0.22), rgba(194,123,91,0.2))',
            color: '#f0ebe4',
            borderRadius: 999,
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Installer l&apos;app
        </button>
      ) : null}
    </aside>
  )
}
