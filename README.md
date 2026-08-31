This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Config
Configuration is via environment variables either as present in the environment or via dotenv style config files as
[described here](https://nextjs.org/docs/app/guides/environment-variables).

To configure the PostreSQL database connection either use:
```dotenv
PG_URL="postgres://<user>:<password>@<host>:<port>/<database>"
```
or
```dotenv
PG_user=<user>
PG_password=<password>
PG_host=<host>
PG_port=<port>
PG_database=<database>
```
or the libpq configuration as [described here](https://www.postgresql.org/docs/14/libpq-envars.html) which is the default
for [node-postgres](https://node-postgres.com/features/connecting).

## Persistent deployment (pm2)

The dashboard runs on a remote machine under [pm2](https://pm2.keymetrics.io/), which keeps the Next.js server alive across SSH disconnects and (once configured) reboots. Config lives in `ecosystem.config.js` at the repo root.

Postgres credentials (`PG_user`, `PG_host`, `PG_database`, `PG_password`, `PG_port`) are read from `.env.local` by `next start` itself — pm2 doesn't need them duplicated in its own env block. `.env.local` is gitignored, so copy it to the remote machine out-of-band (not via git).

### One-time setup on the remote machine

```bash
npm install -g pm2
```

### First deploy

```bash
cd /path/to/dpinterview-web
npm install
npm run build
pm2 start ecosystem.config.js
```

### Survive reboots

```bash
pm2 save       # snapshot the currently running process list
pm2 startup    # prints an OS-specific command — copy/paste and run it (needs sudo once)
```

Without `pm2 startup`, pm2 keeps the app alive across SSH disconnects but not across a machine reboot.

### Everyday commands

| Task | Command |
|---|---|
| List running apps | `pm2 list` |
| Tail logs | `pm2 logs dpinterview-web` |
| Restart (e.g. after deploy) | `pm2 restart dpinterview-web` |
| Stop | `pm2 stop dpinterview-web` |
| Remove from pm2 | `pm2 delete dpinterview-web` |
| Live CPU/mem monitor | `pm2 monit` |

### Redeploying a new version

```bash
git pull
npm install
npm run build
pm2 restart dpinterview-web
```
