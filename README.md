# Moonsy's Webbed Site

A collection of useful tools for various uses, also includes a PFQ playground. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Persistent Sidebar Navigation** - Easy access to all tools
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Support** - Beautiful dark and light themes
- **Smooth Animations** - Hardware-accelerated transitions
- **Modular Architecture** - Clean separation of concerns

## 🏗️ Architecture

This project follows a clean, modular architecture with clear separation of concerns:

### Folder Structure

```
/app
  /[tool-name]          # Tool-specific pages
    page.tsx            # Only layout and component usage
  layout.tsx            # Root layout with sidebar
  page.tsx              # Home dashboard

/components
  /ui                   # Shared UI components
  /[tool-name]          # Tool-specific components

/hooks                  # Custom React hooks

/lib                    # Utility functions

/services               # API and backend interaction

/styles                 # Global styles
  globals.css
```

### Architecture Principles

1. **Functional Separation**
   - No business logic in page files
   - All logic separated into hooks, utilities, and services
   - Pages only contain layout and component usage

2. **Component Organization**
   - Shared components in `/components/ui/`
   - Tool-specific components in `/components/[tool-name]/`
   - Clear naming conventions

3. **State Management**
   - Custom hooks for complex state logic
   - Lightweight and focused state management
   - No global state unless necessary

4. **Performance**
   - Hardware-accelerated animations
   - Optimized re-renders with useCallback
   - Responsive design with mobile-first approach

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Website
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

## 🧰 Production Deployment (Web + Realtime Server)

This monorepo contains two apps:
- `apps/web`: Next.js 15 app (SSR + API routes)
- `apps/server`: Socket.IO realtime server for multiplayer and realtime events

### 1) Prerequisites

- Node.js 18+ and pnpm 8+ (`npm i -g pnpm`)
- MySQL 8+
- A reverse proxy (Nginx, Caddy, or Traefik) with TLS certificates
- Two domains or subdomains recommended:
  - Web UI: e.g. `https://app.example.com`
  - Realtime WS: e.g. `https://ws.example.com`

### 2) Database Setup

Create a database and apply the SQL files from `database/`.

Recommended order (safe for FKs):
1. `users.sql`
2. `user_permissions.sql`
3. `user_sessions.sql`
4. `badges.sql`
5. `user_badges.sql`
6. `user_featured_badges.sql`
7. `support_requests.sql`
8. `user_friends.sql`
9. `user_game_uids.sql`
10. `magic_links.sql`
11. `gi_characters.sql`
12. `gi_bosses.sql`
13. `gi_character_profiles.sql`
14. `gi_boss_profiles.sql`
15. `gi_user_settings.sql`
16. `pfq_apikeys.sql`
17. `user_avatar_changes.sql`
18. `vip_donation_requests.sql`

Example (run per file):
```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < database/users.sql
```

### 3) Environment Configuration

Create environment files for both apps. You can keep them alongside each app or load them via your process manager/systemd.

Web (`apps/web`):
- Required
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
  - `MAILERSEND_API_KEY` (magic-link emails)
  - `ADMIN_EMAIL` (support routing)
  - `NEXT_PUBLIC_BASE_URL` (e.g. `https://app.example.com`)
  - `NEXT_PUBLIC_WS_URL` (browser connects here, e.g. `https://ws.example.com`)
  - `WS_URL` (server-to-server REST emit base URL, e.g. `https://ws.example.com`)
  - `WS_ADMIN_KEY` (shared secret used by web to call the realtime server REST endpoints)
  - `WS_JWT_SECRET` (shared secret with realtime server for issuing WS tokens)
- Optional
  - `DISCORD_USERINFO`, `DISCORD_DONATION` (webhook URLs)

Server (`apps/server`):
- Required
  - `WS_PORT` (default `4001`)
  - `WS_JWT_SECRET` (must match web)
  - `WS_ADMIN_KEY` (must match web)
  - `CORS_ORIGIN` (comma-separated list of allowed origins, e.g. `https://app.example.com`)

Example `.env` files:

`apps/web/.env.production`
```bash
NODE_ENV=production
DB_HOST=localhost
DB_USER=web
DB_PASSWORD=strongpassword
DB_NAME=mnsyprod
DB_PORT=3306
MAILERSEND_API_KEY=ms_live_xxx
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_BASE_URL=https://app.example.com
NEXT_PUBLIC_WS_URL=https://ws.example.com
WS_URL=https://ws.example.com
WS_ADMIN_KEY=super-secret-admin-key
WS_JWT_SECRET=super-secret-jwt
DISCORD_USERINFO=https://discord.com/api/webhooks/... (optional)
DISCORD_DONATION=https://discord.com/api/webhooks/... (optional)
```

`apps/server/.env`
```bash
WS_PORT=4001
WS_JWT_SECRET=super-secret-jwt
WS_ADMIN_KEY=super-secret-admin-key
CORS_ORIGIN=https://app.example.com
```

### 4) Build and Start (Production)

Install dependencies once at repo root:
```bash
pnpm install
```

Build and start Web:
```bash
pnpm web:build
pnpm web:start
```

Start Realtime Server:
```bash
pnpm server:start
```

### 5) Reverse Proxy (Nginx examples)

Web (Next.js on :3000):
```nginx
server {
  server_name app.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Realtime WS (Socket.IO on :4001):
```nginx
server {
  server_name ws.example.com;

  location / {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_pass http://127.0.0.1:4001;
  }
}
```

### 6) Systemd (optional)

Create environment files for each service and point systemd units to them.

`/etc/systemd/system/mnsydev-web.service`
```ini
[Unit]
Description=Moonsy Webbed Site (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/mnsydev
EnvironmentFile=/srv/mnsydev/apps/web/.env.production
ExecStart=/usr/bin/pnpm web:start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/mnsydev-ws.service`
```ini
[Unit]
Description=Moonsy Webbed Site Realtime (Socket.IO)
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/mnsydev/apps/server
EnvironmentFile=/srv/mnsydev/apps/server/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mnsydev-web mnsydev-ws
```

### 7) Post-Deployment Checklist

- Verify DB connectivity from web app
- Confirm magic-link emails deliver (MailerSend key)
- Check that `GET /api/ws/token` returns a token and web can connect to `NEXT_PUBLIC_WS_URL`
- Ensure admin REST emits work from web to WS (`WS_URL` + `WS_ADMIN_KEY`)

## 🎨 Styling

This project uses:

- **Tailwind CSS** for utility-first styling
- **Custom CSS** for global styles and animations
- **Hardware acceleration** for smooth transitions
- **Responsive design** with mobile-first approach

## 📱 Responsive Design

The sidebar and all tools are fully responsive:

- **Desktop**: Persistent sidebar with full navigation
- **Mobile**: Collapsible sidebar with overlay
- **Tablet**: Adaptive layout with optimized spacing

## 🔧 Development

### Adding New Tools

1. Create a new folder in `/app/[tool-name]/`
2. Add a `page.tsx` file with only layout and components
3. Create tool-specific components in `/components/[tool-name]/`
4. Add business logic to custom hooks in `/hooks/`
5. Add utility functions to `/lib/` if needed
6. Update the sidebar navigation in `/components/ui/Sidebar.tsx`

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use custom hooks for complex logic
- Keep components focused and single-purpose
- Use meaningful variable and function names

## 📄 License

This project is open source and available under the [GNU General Public License v3.0](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Inspired by modern web application design patterns
