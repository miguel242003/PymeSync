#!/usr/bin/env bash
# Deploy del backend de PymeSync al VPS de Oracle Cloud.
# Uso: bash scripts/deploy.sh   (ejecutar desde src/backend)
set -euo pipefail

HOST="ubuntu@165.1.124.49"
KEY="../../key/LLave_Privada.key"
REMOTE_DIR="/home/ubuntu/pymesync-backend"
TARBALL="/tmp/pymesync-backend-deploy.tar.gz"

echo "==> Empaquetando backend..."
tar --exclude='node_modules' --exclude='.env' --exclude='scripts' -czf "$TARBALL" .

echo "==> Subiendo código..."
scp -i "$KEY" "$TARBALL" "$HOST:/home/ubuntu/backend-deploy.tar.gz"

echo "==> Desplegando en el servidor..."
ssh -i "$KEY" "$HOST" "
  set -e
  tar -xzf /home/ubuntu/backend-deploy.tar.gz -C '$REMOTE_DIR'
  rm /home/ubuntu/backend-deploy.tar.gz
  cd '$REMOTE_DIR'
  npm install
  npx prisma generate
  npx prisma db push
  pm2 restart pymesync-backend --update-env
  pm2 save
"

rm -f "$TARBALL"
echo "==> Deploy completo."
