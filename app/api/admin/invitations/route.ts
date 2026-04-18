import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAdmin() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const user = await validateSession(token)
  if (!user || user.role !== 'ADMIN') return null
  return user
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.difyzi.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { creator: { select: { name: true, pseudo: true } } },
  })
  return NextResponse.json({ invitations })
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { role, email, sendEmail } = await req.json()
  if (!role) return NextResponse.json({ error: 'Rôle requis' }, { status: 400 })

  const token = randomBytes(24).toString('base64url')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invitation = await prisma.invitation.create({
    data: { token, email: email || null, role, createdBy: user.id, expiresAt },
  })

  const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/rejoindre/${token}`

  if (sendEmail && email && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const roleLabel: Record<string, string> = { CLIENT: 'client', ADMIN: 'administrateur', COLLABORATEUR: 'collaborateur' }
    const transport = createTransport()
    await transport.sendMail({
      from: `Creahub Solutions <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Votre invitation Creahub Solutions',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#e8946a;margin-bottom:16px">Creahub Solutions</h2>
          <p>Vous avez été invité(e) à rejoindre l'espace ${roleLabel[role] || role}.</p>
          <p style="margin:24px 0">
            <a href="${link}" style="background:linear-gradient(135deg,#e8946a,#c27b5b);color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">
              Créer mon compte →
            </a>
          </p>
          <p style="color:#999;font-size:13px">Ce lien expire dans 7 jours.</p>
        </div>
      `,
    })
  }

  return NextResponse.json({ invitation, link })
}
