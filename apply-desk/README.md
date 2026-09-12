# Apply Desk

Personal job desk for **Collins Kipkorir** — IT Assistant at Barsiele Sunrise Academy.

Scans **Kenya jobs from the last 7 days** across BrighterMonday, MyJobMag, Fuzu, LinkedIn, company career pages, and web search.

## Run

```bash
cd apply-desk
npm install
npm run dev
```

Open http://127.0.0.1:43124

Demo login: `kipkorirc583@gmail.com` / `sunrise-desk`

## Deploy on Netlify

The live GitHub repo is [kipkorir73/ckjobboard](https://github.com/kipkorir73/ckjobboard).

1. Open [https://app.netlify.com](https://app.netlify.com) and log in.
2. **Add new site** → **Import an existing project** → **GitHub**.
3. Authorize Netlify, then choose **kipkorir73/ckjobboard**.
4. Netlify should detect Next.js. Confirm:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Deploy site**.

Optional env vars (Site settings → Environment variables):

- `DESK_PASSWORD` — login password (defaults to `sunrise-desk`)
- `CRON_SECRET` — if you later schedule `/api/cron/daily`
- `GOOGLE_CLIENT_ID` — Google OAuth client ID (Gmail connect)
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `GOOGLE_REDIRECT_URI` — optional. Defaults to `https://YOUR_SITE/api/gmail/callback`

After deploy, open the Netlify URL, log in, and run **Scan openings**. Scan is capped at about 6 seconds so Netlify does not time out. Buttons use a small JSON API. Jobs, applications, and inbox are saved in the browser and on Netlify Blobs, including when you log out.

If a deploy is already live, push this repo and use **Trigger deploy** (Deploys → Trigger deploy) so Netlify rebuilds.

## Daily scan

From Today or Openings, **Scan openings**. Or:

`GET /api/cron/daily?secret=YOUR_CRON_SECRET`

That only refreshes Kenya listings. It does not apply.

## Gmail

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an OAuth client (Web application).
2. Enable the Gmail API.
3. Add authorized redirect URI: `https://YOUR_NETLIFY_SITE/api/gmail/callback` (and `http://127.0.0.1:43124/api/gmail/callback` for local).
4. If the app is in Testing, add `kipkorirc583@gmail.com` as a test user.
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on Netlify, then redeploy.
6. Open Inbox → **Connect Gmail** → **Sync inbox**.

The desk requests read-only Gmail access. It does not send mail or apply for jobs.

## Data

Log out saves the desk first. The same copy is kept in this browser (`localStorage`) and on the server (Netlify Blobs, with a `/tmp` fallback).
