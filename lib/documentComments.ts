import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db/prisma'

type RawDocumentComment = {
  id: string
  content: string
  createdAt: Date
  authorId: string
  authorName: string | null
  authorPseudo: string | null
  authorRole: string
}

export type DocumentComment = {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string | null
    pseudo: string | null
    role: string
  }
}

let ensureTablePromise: Promise<void> | null = null

export function mapDocumentComment(row: RawDocumentComment): DocumentComment {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      name: row.authorName,
      pseudo: row.authorPseudo,
      role: row.authorRole,
    },
  }
}

export async function ensureDocumentCommentsTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS document_comments (
          id TEXT PRIMARY KEY,
          document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
          author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_document_comments_document_created_at
        ON document_comments(document_id, created_at)
      `)
    })().catch((error) => {
      ensureTablePromise = null
      throw error
    })
  }

  return ensureTablePromise
}

export async function listDocumentComments(documentId: string) {
  await ensureDocumentCommentsTable()

  const rows = await prisma.$queryRaw<RawDocumentComment[]>`
    SELECT
      dc.id,
      dc.content,
      dc.created_at AS "createdAt",
      u.id AS "authorId",
      u.name AS "authorName",
      u.pseudo AS "authorPseudo",
      u.role::text AS "authorRole"
    FROM document_comments dc
    JOIN users u ON u.id = dc.author_id
    WHERE dc.document_id = ${documentId}
    ORDER BY dc.created_at ASC
  `

  return rows.map(mapDocumentComment)
}

export async function createDocumentComment(documentId: string, authorId: string, content: string) {
  await ensureDocumentCommentsTable()

  const id = randomUUID()

  await prisma.$executeRaw`
    INSERT INTO document_comments (id, document_id, author_id, content)
    VALUES (${id}, ${documentId}, ${authorId}, ${content})
  `

  const rows = await prisma.$queryRaw<RawDocumentComment[]>`
    SELECT
      dc.id,
      dc.content,
      dc.created_at AS "createdAt",
      u.id AS "authorId",
      u.name AS "authorName",
      u.pseudo AS "authorPseudo",
      u.role::text AS "authorRole"
    FROM document_comments dc
    JOIN users u ON u.id = dc.author_id
    WHERE dc.id = ${id}
    LIMIT 1
  `

  return rows[0] ? mapDocumentComment(rows[0]) : null
}

export async function findDocumentComment(commentId: string) {
  await ensureDocumentCommentsTable()

  const rows = await prisma.$queryRaw<Array<{
    id: string
    documentId: string
    authorId: string
  }>>`
    SELECT
      dc.id,
      dc.document_id AS "documentId",
      dc.author_id AS "authorId"
    FROM document_comments dc
    WHERE dc.id = ${commentId}
    LIMIT 1
  `

  return rows[0] || null
}

export async function deleteDocumentComment(commentId: string) {
  await ensureDocumentCommentsTable()
  await prisma.$executeRaw`DELETE FROM document_comments WHERE id = ${commentId}`
}
