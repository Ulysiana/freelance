import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db/prisma'
import { createPasswordResetToken, PASSWORD_RESET_TOKEN_MAX_AGE_MS } from '@/lib/password-reset'
import { rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

const GENERIC_RESPONSE = {
  ok: true,
  message: 'Si un compte existe avec cet email, un lien de réinitialisation vient d’être envoyé.',
}

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

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { key: 'auth-password-reset-request', windowMs: 15 * 60_000, max: 5 })
  if (limited) return limited

  try {
    const { email } = await request.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, passwordHash: true },
    })

    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE)
    }

    const token = createPasswordResetToken(user.id, user.passwordHash)
    const resetUrl = new URL(`/mot-de-passe-oublie/${token}`, request.nextUrl.origin).toString()
    const transport = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'contact@creahub-solutions.fr'
    const hours = Math.round(PASSWORD_RESET_TOKEN_MAX_AGE_MS / 3_600_000)

    await transport.sendMail({
      from,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe Creahub Solutions',
      text: [
        `Bonjour ${user.name || ''}`.trim(),
        '',
        'Une demande de réinitialisation de mot de passe a été reçue pour votre compte Creahub Solutions.',
        `Utilisez ce lien dans l’heure qui vient : ${resetUrl}`,
        '',
        'Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer ce message.',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f1a17">
          <h2 style="margin:0 0 16px;color:#c27b5b">Réinitialisation du mot de passe</h2>
          <p>Bonjour ${user.name ? `<strong>${user.name}</strong>` : ''},</p>
          <p>Une demande de réinitialisation de mot de passe a été reçue pour votre compte Creahub Solutions.</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:linear-gradient(135deg,#e8946a,#c27b5b);color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;display:inline-block">
              Choisir un nouveau mot de passe
            </a>
          </p>
          <p style="color:#5f5146">Ce lien expire dans ${hours} heure${hours > 1 ? 's' : ''} et devient automatiquement invalide après changement de mot de passe.</p>
          <p style="color:#5f5146">Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email.</p>
        </div>
      `,
    })

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Impossible d’envoyer l’email pour le moment.' }, { status: 500 })
  }
}
