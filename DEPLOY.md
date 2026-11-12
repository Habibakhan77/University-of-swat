# Deploying the University of Swat website

This guide sets up the site on an Ubuntu VPS: Docker Compose runs four containers behind Cloudflare.

> **Status:** the images are built and the Nginx config is tested (`nginx -t`) in GitHub Actions on every
> push. The full guide has not yet been run on a real server; treat the first deploy as a rehearsal.

```
                         ┌──────────────────────────── Ubuntu VPS (Docker Compose) ───────────────────────────┐
 Visitor ──HTTPS──► Cloudflare ──HTTPS (Origin cert)──► nginx :443 ──► frontend :3000  (Next.js, standalone)    │
 (DNS, CDN, WAF,        "Full (strict)"                    │                │ http://cms:1337 (internal)          │
  edge SSL)                                                └─ cms.<domain> ─►  cms :1337  (Strapi admin + API)    │
                                                                                  │  "db" network, no internet    │
                                                                               postgres :5432 (volume: pgdata)    │
                                                           volumes: cms_uploads (media), nginx_cache              │
                         └─────────────────────────────────────────────────────────────────────────────────────┘
```

| Address | Served by |
|---|---|
| `https://uswat.edu.pk` (and `/ur`) | Next.js website |
| `https://www.uswat.edu.pk` | 301 redirect to the address above |
| `https://cms.uswat.edu.pk/admin` | Strapi admin panel (staff) |
| `https://cms.uswat.edu.pk/uploads/…` | Media Library files (photos, PDFs) |

The Nginx config has no domain written into it, so a staging domain works the same way. The domain is set
once in `.env`.

---

## 1. Server

**Minimum:** 2 vCPU, 4 GB RAM, 40 GB SSD, Ubuntu 24.04 LTS. Building the Strapi admin panel needs about
2–3 GB of memory, so add swap on a 4 GB server (step 1.3).

### 1.1 First login, admin user, SSH keys

```bash
ssh root@SERVER_IP
adduser deploy && usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh && cp ~/.ssh/authorized_keys /home/deploy/.ssh/ && chown -R deploy:deploy /home/deploy/.ssh
# Key-only SSH, no root login
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/; s/^#\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh
```

Log in again as `deploy` before going on.

### 1.2 Updates, time zone, firewall

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install unattended-upgrades git curl ca-certificates
sudo dpkg-reconfigure -plow unattended-upgrades      # automatic security updates
sudo timedatectl set-timezone Asia/Karachi

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> **Docker and UFW:** ports published by Docker (80/443 here) bypass UFW rules. To allow web traffic **only
> from Cloudflare** (so nobody can get around the WAF by calling the server IP), use your VPS provider's
> firewall, which sits outside the server: allow 22 from your own IPs, and 80/443 only from the ranges at
> <https://www.cloudflare.com/ips/>. Without a provider firewall, see [Appendix A](#appendix-a-cloudflare-only-origin-without-a-provider-firewall).

### 1.3 Swap (4 GB servers)

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 1.4 Docker Engine + Compose plugin

Official Docker repository (not the older `docker.io` Ubuntu package):

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker deploy     # log out and back in for this to apply
docker compose version
```

---

## 2. Code and settings

```bash
sudo mkdir -p /opt/uswat && sudo chown deploy:deploy /opt/uswat
git clone https://github.com/<org>/uswat-website.git /opt/uswat     # private repo: use a read-only deploy key
cd /opt/uswat
cp .env.example .env
chmod 600 .env
```

Generate every secret at once and paste the output into `.env`, replacing the empty lines:

```bash
docker run --rm node:22-alpine node -e "const r=()=>require('crypto').randomBytes(32).toString('base64url');console.log(['APP_KEYS='+[r(),r(),r(),r()].join(','),...['API_TOKEN_SALT','ADMIN_JWT_SECRET','TRANSFER_TOKEN_SALT','JWT_SECRET','ENCRYPTION_KEY','POSTGRES_PASSWORD','REVALIDATE_SECRET','CONTACT_FORM_SECRET'].map(k=>k+'='+r())].join('\n'))"
```

Then check in `.env`:

- `COMPOSE_FILE=docker-compose.yml` is present. It keeps `docker-compose.override.yml` (laptop-only) out.
- `SITE_URL` and `CMS_URL` are the real addresses, e.g. `https://uswat.edu.pk` and `https://cms.uswat.edu.pk`.
- **Keep a copy of `.env` in the university's password manager.** A database backup cannot be used without
  the same `ENCRYPTION_KEY`, `ADMIN_JWT_SECRET` and `APP_KEYS`.

Every variable is documented in [`.env.example`](.env.example).

---

## 3. Cloudflare

### 3.1 DNS

If `uswat.edu.pk` already has DNS records elsewhere, add the domain to Cloudflare and let it **import the
existing records first**. Check the import against the current DNS before changing nameservers.
**Mail records (MX, SPF/DKIM/DMARC TXT, `autodiscover`, Office 365 CNAMEs) must stay exactly as they are and
must be "DNS only" (grey cloud)**, or university email stops working.

Add or change only these:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | SERVER_IP | Proxied (orange) |
| A | `www` | SERVER_IP | Proxied |
| A | `cms` | SERVER_IP | Proxied |
| AAAA | `@`, `www`, `cms` | server IPv6 (only if the VPS has one) | Proxied |

Subdomains still on other systems (CMS portal, exam portal, journal…) keep their own records. Note that
Cloudflare's free certificate covers `uswat.edu.pk` and `*.uswat.edu.pk` only. On a staging domain one
level deeper (e.g. `cms.uswat.example.org`), use an Advanced Certificate or put the CMS on `uswat-cms.example.org`.

### 3.2 SSL/TLS: Full (strict) with an Origin Certificate

1. **SSL/TLS → Overview:** set the mode to **Full (strict)**. Cloudflare then talks to the server over HTTPS
   and checks its certificate. (*Flexible* would send traffic unencrypted to the server.)
2. **SSL/TLS → Origin Server → Create Certificate:** RSA 2048, hostnames `uswat.edu.pk` and `*.uswat.edu.pk`,
   validity 15 years. Save both parts on the server:

   ```bash
   cd /opt/uswat/nginx/certs
   nano origin.pem    # paste "Origin Certificate"
   nano origin.key    # paste "Private Key" (shown only once)
   chmod 600 origin.key
   ```

   These files are git-ignored. The certificate is trusted only by Cloudflare, which is why every record
   must be proxied.
3. **SSL/TLS → Edge Certificates:** Always Use HTTPS **on**, Minimum TLS Version **1.2**, TLS 1.3 **on**,
   Automatic HTTPS Rewrites **on**. Leave Cloudflare's own HSTS setting **off**: Nginx already sends
   `Strict-Transport-Security`.
4. *(Optional, stronger)* **SSL/TLS → Origin Server → Authenticated Origin Pulls:** the server then accepts
   TLS only from Cloudflare. That needs `ssl_client_certificate` + `ssl_verify_client on` in
   `nginx/nginx.conf` with Cloudflare's origin-pull CA. Not enabled by default.

### 3.3 Caching rules

Cloudflare does not cache HTML by default, and it shouldn't here: pages are cached inside Next.js and refreshed
the moment an editor publishes (on-demand revalidation). Cache only the files that never change under their URL.

**Caching → Cache Rules → Create rule** (order matters, first match wins for "Bypass"):

| # | Rule name | When incoming requests match (Edit expression) | Then |
|---|---|---|---|
| 1 | Bypass Strapi admin and API | `(http.host eq "cms.uswat.edu.pk" and not starts_with(http.request.uri.path, "/uploads/"))` | **Bypass cache** |
| 2 | Cache Strapi media | `(http.host eq "cms.uswat.edu.pk" and starts_with(http.request.uri.path, "/uploads/"))` | Eligible for cache; Edge TTL: use cache-control header (30 days); Browser TTL: respect origin |
| 3 | Cache Next.js build files | `(http.host eq "uswat.edu.pk" and starts_with(http.request.uri.path, "/_next/static/"))` | Eligible for cache; Edge TTL: use cache-control header (1 year, immutable); Browser TTL: respect origin |

Leave `/_next/image` alone. Its response depends on the browser's `Accept` header (AVIF or WebP), which
Cloudflare's free plan does not vary on. Nginx already caches each format at the origin.

**Other settings:**

- **Speed → Optimization:** Rocket Loader **off** (it rewrites scripts and breaks React hydration).
  Brotli stays on (default).
- **Scrape Shield:** Email Address Obfuscation **off**. It rewrites e-mail addresses in the HTML, which
  breaks React hydration on the Contact and Administration pages.
- **Security → WAF:** the free managed ruleset is fine. Optionally add a rate-limiting rule for
  `cms.uswat.edu.pk/admin/login`. Nginx limits it too (5 POSTs per minute per IP).
- **Caching → Configuration → Purge Everything** after a deploy that changes `public/` files (logo, icons).
  `/_next/static` files have new names on every build, so they never need purging.

---

## 4. First start

```bash
cd /opt/uswat
docker compose build          # 5–15 minutes the first time (the Strapi admin panel is compiled)
docker compose up -d
docker compose ps             # all four should be "healthy" / "running" within ~2 minutes
docker compose logs -f cms    # Ctrl+C to stop following
```

### 4.1 Create the first administrator

Open `https://cms.uswat.edu.pk/admin` straight away and register the **Super Admin** account: the first
person to open a fresh admin panel creates it. Use a university e-mail address and a long password.

### 4.2 Content

Choose one:

- **Fresh content from the seed script** (University of Swat departments, offices, news, photos, documents):

  ```bash
  docker compose --profile seed build cms-seed
  docker compose --profile seed run --rm cms-seed          # only fills an empty database
  # docker compose --profile seed run --rm cms-seed --reset  # wipes website content and reseeds
  ```

- **Copy content from another Strapi** (e.g. a staging server): in that admin panel go to
  *Settings → Transfer Tokens* on the **new** server create a push token, then on the source machine run
  `npx strapi transfer --to https://cms.uswat.edu.pk/admin --to-token <token>` (copies content and media).

Then rebuild the website once, so the pages built during the first build (when Strapi was still empty) are
replaced straight away:

```bash
docker compose up -d --build frontend
```

### 4.3 Editors and roles

The roles **Media Cell Editor** and **Department Editor** are created automatically on boot (see
`cms/src/bootstrap/roles.ts`). In *Settings → Administration panel → Users*, invite each editor and give
them one role. For a Department Editor, also add their e-mail address to that department's
**Editor emails** field (Content Manager → Department). They can then edit only that department and its
programs, faculty members, downloads and research projects.

### 4.4 Checks

```bash
curl -sI https://uswat.edu.pk | head -20             # 200, strict-transport-security, content-security-policy
curl -sI https://www.uswat.edu.pk | grep -i location  # https://uswat.edu.pk/
curl -sI https://cms.uswat.edu.pk/_health             # 204
curl -s  https://uswat.edu.pk/sitemap.xml | head
```

- Publish a small change to a news item in Strapi. It should appear on the website within a few seconds
  (Strapi calls `http://frontend:3000/api/revalidate` over the internal network).
- Send a test message from the Contact page. It should appear under *Content Manager → Contact Message*.
- Run <https://pagespeed.web.dev> on the home page and an inner page, and
  <https://securityheaders.com> on the home page.

---

## 5. Updating the site

```bash
cd /opt/uswat
git pull
docker compose build
docker compose up -d          # recreates only containers whose image changed
docker image prune -f         # remove old images
```

Expect a few seconds of 502 while a container restarts. Strapi runs its own database migrations on start.
**Take a backup before updating Strapi to a new version** (step 6).

If `SITE_URL` or `CMS_URL` changes, rebuild the frontend: both are compiled into the website.

---

## 6. Backups

Two things hold the data: the **PostgreSQL database** (all content, users, roles) and the **`cms_uploads`
volume** (every photo and PDF in the Media Library). Back them up together. Keep `.env` and
`nginx/certs/` safe separately (password manager), as they hold the secrets.

### 6.1 Backup script

Save as `/opt/uswat/backup.sh` and run `chmod 700 /opt/uswat/backup.sh`:

```bash
#!/usr/bin/env bash
# Nightly backup of the University of Swat website: database + media. Keeps 14 days locally.
set -euo pipefail
cd /opt/uswat
DEST=/var/backups/uswat
STAMP=$(date +%F-%H%M)
mkdir -p "$DEST"

# 1. Database: custom format (compressed, restorable table by table)
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$DEST/db-$STAMP.dump"

# 2. Media Library files
docker run --rm -v uswat_cms_uploads:/data:ro -v "$DEST":/backup alpine:3.22 \
  tar czf "/backup/uploads-$STAMP.tar.gz" -C /data .

# 3. Keep two weeks
find "$DEST" -type f -mtime +14 -delete

# 4. Off-site copy (configure rclone once with `rclone config`, e.g. to the university's OneDrive or a bucket)
# rclone copy "$DEST" offsite:uswat-backups --max-age 25h

echo "Backup done: $DEST/*-$STAMP.*"
```

Run it once by hand and check that both files are not empty. Then schedule it with `crontab -e`:

```cron
30 2 * * * /opt/uswat/backup.sh >> /var/log/uswat-backup.log 2>&1
```

`/var/backups/uswat` must be writable by `deploy` (`sudo mkdir -p /var/backups/uswat && sudo chown deploy /var/backups/uswat`).
A backup that only lives on the same server is lost with the server: set up the off-site copy.

### 6.2 Restore

```bash
cd /opt/uswat
docker compose stop cms frontend

# Database (replaces the current content)
docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
  < /var/backups/uswat/db-YYYY-MM-DD-HHMM.dump

# Media
docker run --rm -v uswat_cms_uploads:/data -v /var/backups/uswat:/backup alpine:3.22 \
  sh -c 'rm -rf /data/* && tar xzf /backup/uploads-YYYY-MM-DD-HHMM.tar.gz -C /data && chown -R 1000:1000 /data'

docker compose up -d
```

Restore onto a new server: follow sections 1–3, copy the saved `.env` and certificates, run
`docker compose up -d postgres`, restore as above, then `docker compose up -d`.
**Test a restore every few months** (e.g. onto a staging VPS). An untested backup isn't a backup.

---

## 7. Operations

| Task | Command |
|---|---|
| Status and health | `docker compose ps` |
| Logs (last hour, follow) | `docker compose logs --since 1h -f nginx frontend cms` |
| Restart one service | `docker compose restart cms` |
| Database shell | `docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'` |
| Clear the Nginx image cache | `docker compose exec nginx sh -c 'rm -rf /var/cache/nginx/*/*'` then `docker compose restart nginx` |
| Reset the editor roles to defaults | set `SYNC_ADMIN_ROLES=true` in `.env`, `docker compose up -d cms`, then set it back to `false` |
| Disk usage | `docker system df` |

**Troubleshooting**

| Symptom | Likely cause |
|---|---|
| Cloudflare error **526** | SSL mode is Full (strict) but `nginx/certs/origin.pem`/`.key` are missing or not the Cloudflare Origin Certificate. |
| Cloudflare error **521 / 522** | Nginx is down (`docker compose ps`) or the provider firewall blocks Cloudflare. |
| **502** from Nginx | The website or Strapi is still starting or has crashed: `docker compose logs frontend cms`. |
| Admin login doesn't stick, or Strapi logs "Cannot send secure cookie over unencrypted connection" | `IS_PROXIED` must be `true` (it is, in `docker-compose.yml`). |
| Broken images on the website | `CMS_URL` doesn't match the real Strapi address. Fix `.env`, then `docker compose up -d --build frontend`. |
| Edits in Strapi don't show on the site | Check `docker compose logs cms \| grep revalidate`. `REVALIDATE_SECRET` must be identical for both services (it is, from one `.env`). Pages also refresh on their own within the hour. |
| Uploads over 50 MB fail | Limit set by `client_max_body_size` in the `cms.*` server block of `nginx/nginx.conf`. |

**Keep up to date:** Ubuntu security updates install on their own. About once a month, run
`git pull && docker compose build --pull && docker compose up -d` to get patched base images (Node, Alpine,
PostgreSQL minor versions). A few times a year, compare `nginx/snippets/cloudflare-real-ip.conf` with
<https://www.cloudflare.com/ips/>.

---

## Appendix A: Cloudflare-only origin without a provider firewall

Docker inserts its rules before UFW, so filter in Docker's own `DOCKER-USER` chain. This allows ports 80/443
only from Cloudflare (IPv4):

```bash
sudo apt -y install iptables-persistent
sudo iptables -I DOCKER-USER -p tcp -m multiport --dports 80,443 -j DROP
for net in $(curl -fsS https://www.cloudflare.com/ips-v4); do
  sudo iptables -I DOCKER-USER -p tcp -m multiport --dports 80,443 -s "$net" -j RETURN
done
sudo netfilter-persistent save
```

Check from a machine outside Cloudflare: `curl -kI https://SERVER_IP` should time out, while the site still
loads through its domain. Run it again when Cloudflare publishes new ranges.

## Appendix B: Local Docker stack (laptop)

`docker-compose.override.yml` adjusts the stack for a laptop: no Nginx/TLS, ports that don't clash with
`npm run dev`, and PostgreSQL on 5433.

```bash
cp .env.example .env
# In .env: delete the COMPOSE_FILE line, set SITE_URL=http://localhost:8080 and
# CMS_URL=http://cms.localhost:8081, and fill in the secrets (command in section 2).
docker compose up -d --build
docker compose --profile seed run --rm cms-seed
```

Website: <http://localhost:8080>. Strapi admin: <http://cms.localhost:8081/admin>.
