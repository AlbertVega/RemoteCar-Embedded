#!/usr/bin/env bash
set -euo pipefail
APP=vehicle-server
DEST=/opt/$APP
SVC=/etc/systemd/system/$APP.service
DEFAULTS=/etc/default/$APP

echo "[+] Instalando $APP en $DEST"
sudo mkdir -p "$DEST"
sudo rsync -a --delete dist/ "$DEST/dist/"
sudo rsync -a package.json "$DEST/"
sudo rsync -a .env.example "$DEST/"

echo "[+] Creando defaults en $DEFAULTS si no existe"
if [[ ! -f "$DEFAULTS" ]]; then
  sudo tee "$DEFAULTS" >/dev/null <<'EOF'
NODE_ENV=production
PORT=8080
JWT_SECRET=cambia_esto
DB_PATH=/var/lib/vehicle/data/vehicle.db
GPIO_BACKEND=ffi
VIDEO_PROXY_URL=http://127.0.0.1:8081/?action=stream
ALLOWED_ORIGIN=http://vehiculo.local
EOF
fi

echo "[+] Registrando servicio systemd"
sudo install -m 0644 systemd/vehicle-server.service "$SVC"
sudo systemctl daemon-reload
sudo systemctl enable --now vehicle-server
echo "[✓] Servicio vehicle-server activo"
