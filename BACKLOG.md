# Backlog — Creahub back-office

> Priorités à traiter session par session.  
> Format : `[ ]` à faire · `[x]` fait · `[~]` en cours

---

## Bugs

- [x] **PDF viewer : télécharge au lieu d'afficher**  
  Fix : `getSignedViewUrl` avec `ResponseContentDisposition: inline` + `ResponseContentType: mimeType`.

- [x] **Breadcrumb projet vide** — fallback `'…'` déjà en place sur toutes les sous-pages.

---

## Fonctionnalités

- [ ] **Documents projet : upload de fichiers (tous types)**  
  La section Documents d'un projet doit avoir deux modes :
  1. Éditeur texte riche TipTap (déjà en place)
  2. Upload fichiers (PDF, Word, Excel, images, ZIP…) stockés sur R2, téléchargeables  
  Nouveau modèle Prisma `ProjectFile` à créer. Ajouter onglet ou section "Fichiers" dans `/bureau/projets/[id]/documents`.

- [ ] **Feed d'activité dans le dashboard** (visuel, temps réel ou polling)  
  Afficher un flux des derniers événements : nouveau message, nouvelle demande, tâche complétée, nouveau client…  
  Style : timeline verticale ou liste de cards avec avatar/icône, date relative ("il y a 5 min").  
  Emplacement : colonne droite ou section dédiée dans `app/bureau/page.tsx`.

- [ ] **PWA (Progressive Web App)**  
  - `manifest.json` : nom, icônes (192×192 et 512×512), couleur thème `#1a1714`, display `standalone`  
  - Service worker (via `next-pwa` ou manuel) : cache offline des assets statiques  
  - Meta tags dans `app/layout.tsx` : `theme-color`, `apple-mobile-web-app-capable`  
  - Icônes à générer depuis le logo Creahub  
  - Tester "Ajouter à l'écran d'accueil" sur mobile et bureau

- [ ] **RESEND_API_KEY** — activer l'envoi email des invitations  
  Ajouter la clé dans Secret Manager : `echo -n "re_xxx" | gcloud secrets create RESEND_API_KEY --data-file=-` puis `./deploy.sh`.

- [ ] **SMTP invitation emails (alternative Resend)**  
  Remplacer Resend par Nodemailer si SMTP O2Switch préféré.  
  Besoin : host SMTP, port, adresse expéditeur, mot de passe.  
  Fichier concerné : `app/api/admin/invitations/route.ts`.

---

## Optimisations

- [ ] **Vitesse générale** ⚡ (priorité haute)  
  - Auditer avec Lighthouse (First Contentful Paint, LCP, CLS, TTFB)  
  - Passer les `<img>` en composant Next.js `<Image>` (lazy-load + format WebP auto)  
  - Lazy-loading des sections lourdes du dashboard  
  - Limiter les fetch en waterfall (passer en `Promise.all` partout)  
  - Activer la compression Brotli/gzip sur Cloud Run ou via Cloudflare  
  - Envisager Cloudflare Worker en frontal pour le cache edge (voir section Infra)

---

## Infra / Déploiement

- [ ] **Custom domain `creahub-solutions.fr`** → Cloud Run  
  Cloud Run Console → Domaines personnalisés → ajouter `creahub-solutions.fr` → entrées DNS chez O2switch → redéployer avec `NEXT_PUBLIC_APP_URL=https://creahub-solutions.fr`.

- [ ] **Chronomètre — précision à la seconde**  
  Actuellement `durationMinutes`. Ajouter `durationSeconds` sur `TimeSession`, recalculer coût (tjm/28800), afficher mm:ss.

- [ ] **Cloudflare Worker — à évaluer**  
  Option : faire passer certaines routes via un Cloudflare Worker plutôt que Cloud Run.  
  Cas d'usage pertinents :
  - **Proxy R2 PDF** : Worker intercept les requêtes R2 et ajoute `Content-Disposition: inline` + `Content-Type: application/pdf` → résout le bug PDF viewer sans toucher au code Next.js
  - **Edge cache** : mettre en cache les assets statiques et réponses API publiques au plus proche de l'utilisateur
  - **PWA service worker-like** : logique offline à la périphérie  
  À peser : Cloudflare Workers est gratuit jusqu'à 100k req/jour, déjà dans l'écosystème R2 — cohérent. Complexité infra supplémentaire à justifier.

---

## Fait

- [x] Messagerie bureau/client (Bloc 7)
- [x] Dashboard stats + vue par clients (Bloc 8)
- [x] Renommage `/admin` → `/bureau`
- [x] 2FA TOTP (setup, login OTP, page sécurité)
- [x] Force 2FA clients (redirect layout)
- [x] Liens d'invitation (token + page /rejoindre)
- [x] Cookie banner
- [x] Déploiement Cloud Run + Secret Manager
- [x] Images portfolio sur R2 (photo, hygge, difyzi)
