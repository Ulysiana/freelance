import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Creahub Solutions',
    short_name: 'Creahub',
    description: 'Creahub Solutions — développeuse freelance full-stack. Python, React, Node, Rust, WordPress, Shopify, Cloud Run.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0806',
    theme_color: '#0a0806',
    lang: 'fr',
    categories: ['business', 'productivity', 'portfolio'],
    icons: [
      {
        src: '/api/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/api/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
