#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  echo "Falta .env. Copia .env.example a .env y configura dominio y correo." >&2
  exit 1
fi

set -a
. ./.env
set +a

if [ -z "${DOMAIN:-}" ]; then
  echo "Configura DOMAIN con el nombre DNS público antes de solicitar HTTPS." >&2
  exit 1
fi

if [ -z "${CERTBOT_EMAIL:-}" ] || [ "$CERTBOT_EMAIL" = "admin@example.org" ]; then
  echo "Configura CERTBOT_EMAIL con un correo válido para Let's Encrypt." >&2
  exit 1
fi

if ! docker compose --profile certificates run --rm --no-deps \
  --entrypoint python certbot -c \
  'import socket, sys; socket.getaddrinfo(sys.argv[1], 80)' "$DOMAIN" >/dev/null 2>&1; then
  echo "El dominio $DOMAIN todavía no resuelve en DNS. Configura sus registros y vuelve a intentar." >&2
  exit 1
fi

docker compose --profile bootstrap up -d --build backend nginx-bootstrap
docker compose --profile certificates run --rm certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email --non-interactive \
  -d "$DOMAIN"

docker compose --profile bootstrap stop nginx-bootstrap
docker compose --profile bootstrap rm -f nginx-bootstrap
docker compose up -d --build backend nginx

echo "Despliegue listo: https://${DOMAIN}"
