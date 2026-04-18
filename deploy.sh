#!/bin/bash
set -e

IMAGE="europe-west1-docker.pkg.dev/creahub-solutions/creahub/site:latest"

echo "🔨 Build + push via Cloud Build..."
gcloud builds submit --tag "$IMAGE" .

echo "🚀 Déploiement sur Cloud Run..."
gcloud run deploy creahub-site \
  --image "$IMAGE" \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,R2_ENDPOINT=R2_ENDPOINT:latest,R2_ACCESS_KEY_ID=R2_ACCESS_KEY_ID:latest,R2_SECRET_ACCESS_KEY=R2_SECRET_ACCESS_KEY:latest,R2_BUCKET_NAME=R2_BUCKET_NAME:latest,SECRET_KEY=SECRET_KEY:latest" \
  --set-env-vars="NEXT_PUBLIC_APP_URL=https://creahub-solutions.fr"

echo "✅ Déployé !"
gcloud run services describe creahub-site --region europe-west1 --format="value(status.url)"
