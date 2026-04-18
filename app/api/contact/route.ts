import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

const CONTACT_TO = process.env.CONTACT_EMAIL || 'contact@creahub-solutions.fr'

function createTransport() {
  const host = process.env.SMTP_HOST || 'mail.difyzi.com'
  const port = Number(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('Missing SMTP credentials')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

function sanitize(value: string) {
  return value.replace(/[<>&]/g, '').trim()
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { key: 'contact-form', windowMs: 60_000, max: 5 })
  if (limited) return limited

  try {
    const body = await request.json()
    const name = sanitize(body.name || '')
    const email = sanitize((body.email || '').toLowerCase())
    const projectType = sanitize(body.projectType || '')
    const message = sanitize(body.message || '')
    const company = sanitize(body.company || '')

    if (company) {
      return NextResponse.json({ ok: true })
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nom, email et message requis.' }, { status: 400 })
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const transport = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || CONTACT_TO

    await transport.sendMail({
      from,
      to: CONTACT_TO,
      replyTo: email,
      subject: `[Site] Nouveau message de ${name}`,
      text: [
        `Nom: ${name}`,
        `Email: ${email}`,
        `Type de besoin: ${projectType || 'Non renseigné'}`,
        '',
        message,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 16px;color:#c27b5b">Nouveau message via le site</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Type de besoin :</strong> ${projectType || 'Non renseigné'}</p>
          <div style="margin-top:24px;padding:16px;border-radius:12px;background:#f8f5f2;color:#1f1a17;white-space:pre-wrap">${message}</div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Impossible d’envoyer le message pour le moment.' }, { status: 500 })
  }
}
