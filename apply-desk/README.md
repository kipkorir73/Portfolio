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

After deploy, open the Netlify URL, log in, and run **Scan openings**. Scan is capped at about 6 seconds so Netlify does not time out. Buttons (I applied, status, save) use a small JSON API instead of a full page reload. Scan results live in `/tmp` and can reset when the function goes cold.

If a deploy is already live, push this repo and use **Trigger deploy** (Deploys → Trigger deploy) so Netlify rebuilds.

## Daily scan

From Today or Openings, **Scan openings**. Or:

`GET /api/cron/daily?secret=YOUR_CRON_SECRET`

That only refreshes Kenya listings. It does not apply.

## Gmail

Inbox is empty until you grant Gmail access for follow-up. Applications you mark stay in the Applied log either way.
