#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  echo "Falta .env; no se pueden renovar los certificados." >&2
  exit 1
fi

docker compose --profile certificates run --rm certbot renew --webroot --webroot-path /var/www/certbot
docker compose exec nginx nginx -s reload
