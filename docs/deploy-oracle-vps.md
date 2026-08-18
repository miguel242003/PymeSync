# Despliegue en Oracle Cloud (VPS free tier)

Guía para crear y configurar la instancia gratuita de Oracle Cloud (OCI) que alojará el backend de PymeSync (Node.js + MySQL + nginx).

## 1. Crear la instancia (consola web de OCI)

1. Entra a [cloud.oracle.com](https://cloud.oracle.com) → **Compute → Instances → Create Instance**.
2. **Name**: `pymesync-vps`.
3. **Image**: Canonical Ubuntu **22.04** (o 24.04).
4. **Shape** (Always Free elegible): `VM.Standard.A1.Flex` (Ampere ARM) — asigna hasta 4 OCPU / 24GB RAM gratis. Si tu región no tiene capacidad Ampere disponible, usa `VM.Standard.E2.1.Micro` (AMD, 1 OCPU / 1GB) como alternativa.
5. **Networking**: crea una VCN nueva con "Create new virtual cloud network" (marca la opción de asignar IP pública automáticamente).
6. **SSH keys**: selecciona "Generate a key pair" y descarga la clave privada (`.pem` o `.key`) — la vas a necesitar para conectarte. Guárdala, no se puede volver a descargar.
7. Click **Create** y espera a que el estado pase a "Running". Anota la **Public IP**.

## 2. Abrir los puertos necesarios (Security List)

Por defecto OCI solo abre el puerto 22 (SSH). Hay que abrir 80 y 443 para el backend/nginx:

1. **Networking → Virtual Cloud Networks** → tu VCN → **Security Lists** → la lista default.
2. **Add Ingress Rules**:
   - Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination Port `80` (HTTP).
   - Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination Port `443` (HTTPS).
3. **No** abras el puerto 3306 (MySQL) a `0.0.0.0/0` — MySQL debe quedar accesible solo desde `localhost` dentro del propio VPS.

> Nota importante de OCI: además de la Security List, las imágenes Ubuntu de Oracle traen su propio firewall interno (`iptables`/`netfilter-persistent`). Si después de abrir el puerto en la consola igual no conecta, hay que abrirlo también dentro de la VM (paso 4).

## 3. Conectarte por SSH

Desde tu equipo (ajusta permisos de la key si es Linux/Mac: `chmod 400 key.pem`):

```bash
ssh -i ruta/a/tu-key.pem ubuntu@<IP_PUBLICA>
```

## 4. Preparar el sistema operativo

```bash
sudo apt update && sudo apt upgrade -y

# Abrir 80/443 en el firewall interno de la VM (además de la Security List de OCI)
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 5. Instalar Node.js (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

## 6. Instalar y configurar MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Crear la base de datos y el usuario de la app (dentro de `sudo mysql`):

```sql
CREATE DATABASE pymesync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pymesync_app'@'localhost' IDENTIFIED BY 'una_password_fuerte_aqui';
GRANT ALL PRIVILEGES ON pymesync.* TO 'pymesync_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Tu `DATABASE_URL` en el `.env` del backend quedaría:

```
DATABASE_URL="mysql://pymesync_app:una_password_fuerte_aqui@localhost:3306/pymesync"
```

## 7. Instalar nginx y certbot (HTTPS gratis)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Configurar el reverse proxy (`/etc/nginx/sites-available/pymesync`):

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pymesync /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tu-dominio.com
```

> Certbot requiere un dominio apuntando a la IP pública del VPS (registro DNS tipo A). Sin dominio no se puede emitir el certificado.

## 8. Subir el backend y mantenerlo corriendo con PM2

```bash
sudo npm install -g pm2
# (subir el código del backend al VPS, vía git clone o scp)
cd pymesync/src/backend
npm install
npx prisma migrate deploy
pm2 start src/server.js --name pymesync-backend
pm2 save
pm2 startup   # sigue las instrucciones que imprime para que arranque en el boot
```

## Checklist rápido

- [ ] Instancia creada y en estado "Running", IP pública anotada.
- [ ] Puertos 80/443 abiertos en la Security List de OCI.
- [ ] Puertos 80/443 abiertos también en iptables dentro de la VM.
- [ ] Node.js LTS instalado.
- [ ] MySQL instalado, `mysql_secure_installation` corrido, DB y usuario `pymesync_app` creados.
- [ ] nginx instalado y configurado como reverse proxy hacia el puerto 4000.
- [ ] (Opcional, requiere dominio) HTTPS con certbot.
- [ ] Backend corriendo con PM2 y configurado para arrancar en el boot.
