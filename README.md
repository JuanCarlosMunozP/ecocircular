# EcoCircular: Misión Reciclaje

Aplicación educativa para el aprendizaje de separación, reutilización y
economía circular. El frontend React/TypeScript sirve la experiencia 3D y las
actividades locales; la API FastAPI administra las misiones existentes y el
progreso temporal del jugador.

## Despliegue Docker con HTTPS

El despliegue usa dos contenedores de aplicación: FastAPI y Nginx. Nginx sirve
el frontend, enruta `/admin/` al backend en la red privada de Docker y redirige
HTTP a HTTPS. Certbot obtiene y renueva certificados de Let's Encrypt.

El nombre elegido para el proyecto es `ecocircular-obonuco.edu.co`. Su
registro, control y configuración DNS todavía deben confirmarse; no se asume
que el dominio esté registrado ni que pertenezca a la institución. Si no está
disponible o no lo controla el responsable, reemplázalo en `.env` por un
subdominio bajo un dominio registrado que sí controle.

### Requisitos para el servidor público

- Servidor Linux con Docker Engine y el plugin Docker Compose.
- Un dominio registrado, con un registro DNS `A` (y `AAAA` si IPv6 está
  configurado) que apunte al servidor. El nombre indicado en `DOMAIN` debe
  coincidir exactamente con el registro.
- Puertos TCP 80 y 443 permitidos desde Internet. Let's Encrypt necesita HTTP
  para emitir y renovar el certificado.
- Un correo operativo para las notificaciones de Let's Encrypt.
- El nombre DNS debe resolver al servidor antes de ejecutar el despliegue. El
  script comprueba que resuelva, pero el responsable debe confirmar que apunta
  a la IP pública correcta.

### Primera instalación

En el servidor, clona/copia el proyecto y desde la raíz:

```sh
cp .env.example .env
```

Edita `.env` con el nombre DNS real y un correo válido. Después ejecuta:

```sh
sh deploy.sh
```

El script compila las imágenes, inicia temporalmente Nginx para el desafío
ACME, solicita el certificado, y luego activa Nginx con TLS y el backend. La
aplicación quedará en `https://<DOMAIN>`. No solicites repetidamente
certificados de prueba contra Let's Encrypt: sus límites de emisión pueden
bloquear temporalmente el dominio.

### Renovación

Certbot conserva el certificado en un volumen Docker. Programa
`sh renew-certs.sh` con una tarea cron periódica (por ejemplo, dos veces al
día); el script renueva cuando corresponde y recarga Nginx.

### Verificación y mantenimiento

```sh
docker compose ps
docker compose logs --tail=100 backend nginx
```

El backend solo está expuesto dentro de la red Docker. Nginx publica los
puertos 80/443. El progreso de jugadores continúa guardándose en memoria y se
pierde al reiniciar el backend; no se agregó una base de datos. Para detener:
`docker compose down`. Los volúmenes del certificado se conservan; no uses
`docker compose down -v` salvo que quieras borrarlos.

## Desarrollo local

Consulta [frontend/README.md](./frontend/README.md) y
[backend/README.md](./backend/README.md) para iniciar los servicios de
desarrollo y ejecutar pruebas.
