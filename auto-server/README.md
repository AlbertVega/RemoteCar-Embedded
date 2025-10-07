# Vehicle Server (Node.js + TS)

Backend para control remoto (GPIO + video) en RPi4/Yocto.

## Requisitos
- Node.js LTS (18.x recomendado) → usa **nvm**
- npm 9+
- (Producción) SQLite3 y mjpg-streamer/motion

## Instalar Node.js con NVM (Linux/macOS)
```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 18
nvm use 18
node -v
npm -v
```

## Configuración del proyecto
```bash
# Clona/copias el código y luego:
cp .env.example .env     # edita JWT_SECRET, DB_PATH, VIDEO_PROXY_URL, etc.
npm ci                   # instala dependencias exactas
npm run build            # transpila TypeScript → dist/
npm start                # inicia el servidor
```
Modo desarrollo con recarga:
```bash
npm run dev
```

## Endpoints
- `POST /api/auth/login` → `{ "username": "...", "password": "..." }`
- `POST /api/control/move` (JWT) → `{ "direction": "forward|backward|left|right|stop", "speed": 0..100 }`
- `POST /api/control/lights` (JWT) → `{ "front":bool, "rear":bool, "left":bool, "right":bool }`
- `GET  /api/video/stream` → proxy MJPEG
- `GET  /api/health`

## Despliegue (systemd)
```bash
npm run build
sudo bash scripts/install.sh
journalctl -u vehicle-server -f   # ver logs
```

## Seguridad
- Contraseñas con **scrypt**
- JWT HS256 con expiración 2h
- Cookie httpOnly + SameSite=Lax
- Rate limit básico

## GPIO
- Desarrollo: `GPIO_BACKEND=mock`
- Producción: `GPIO_BACKEND=ffi` (enlaza `libvehicle.so` y su binding Node)

## Video
- Ajusta `VIDEO_PROXY_URL` al stream MJPEG (mjpg-streamer o motion)
- El backend sólo proxyea (no transcodea)

## Registro de usuarios (solo admin)
1) Inicia sesión como admin (`/api/auth/login`).
2) Llama a:
```bash
curl -X POST http://localhost:8080/api/auth/register       -H "Content-Type: application/json"       -H "Authorization: Bearer <TOKEN_ADMIN>"       -d '{"username":"demo","password":"demo12345","role":"user"}'
```
- Listar usuarios (admin):
```bash
curl -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:8080/api/users
```
