@AGENTS.md

## Deploiement Cloud Run

Pour ce projet, le deploy doit se faire a distance via Google Cloud, pas via un build local.

Sequence attendue :

1. lancer `./deploy.sh`
2. `gcloud builds submit` envoie le projet a Cloud Build
3. Cloud Build construit l'image Docker et la pousse dans Artifact Registry
4. `gcloud run deploy` redeploie `creahub-site` avec cette image

## Regle principale

- Commande standard de deploy : `./deploy.sh`
- Ne pas lancer `npm run build` localement sauf necessite absolue
- Ne pas essayer de deployer une build locale Next.js

Cette machine est limitee en disque et en RAM. Le build de production doit etre laisse a Cloud Build.

## Parametres actuels

- Region Cloud Build : `europe-west1`
- Region Cloud Run : `europe-west1`
- Service : `creahub-site`
- Image : `europe-west1-docker.pkg.dev/creahub-solutions/creahub/site:latest`

## Ce que fait `deploy.sh`

1. Build + push :
   `gcloud builds submit --region europe-west1 --tag europe-west1-docker.pkg.dev/creahub-solutions/creahub/site:latest .`
2. Deploy Cloud Run :
   `gcloud run deploy creahub-site ...`

Le deploy applique aussi :

- les secrets via `--set-secrets`
- `NEXT_PUBLIC_APP_URL=https://creahub-solutions.fr`
- le port `3000`
- `512Mi` de RAM, `1` CPU, `min-instances=0`, `max-instances=3`

## Si Claude doit deployer

Quand on lui demande de deployer, publier ou redeployer, il doit :

1. verifier rapidement que `package.json` et `package-lock.json` sont synchronises
2. verifier que Prisma est coherent
3. lancer `./deploy.sh`
4. lire l'erreur Cloud Build ou Cloud Run si le script echoue
5. corriger puis relancer `./deploy.sh`

## Points de controle en cas d'echec

1. `package.json` et `package-lock.json` sont synchronises
2. `prisma`, `@prisma/client` et `@prisma/adapter-pg` ont des versions alignees
3. avec Prisma 7, `prisma/schema.prisma` ne doit pas contenir `url = env("DATABASE_URL")` ; l'URL est definie dans `prisma.config.ts`
4. `deploy.sh` utilise toujours `europe-west1` pour Cloud Build et Cloud Run
5. les secrets requis existent bien dans Secret Manager / Cloud Run

## Resume court

Ne fais pas de build local.
Lance `./deploy.sh`.
Le script construit l'image dans Cloud Build, la pousse dans Artifact Registry, puis redeploie `creahub-site` sur Cloud Run.
