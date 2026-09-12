# Apply Desk

Personal job desk for **Collins Kipkorir** — IT Assistant at Barsiele Sunrise Academy.

Scans **jobs from the last 7 days** across remote APIs plus Indeed, Careerjet, LinkedIn, Kenya boards, and web search. Pick the **country they are hiring in** (Africa and the rest of the world). LinkedIn uses LinkedIn’s own hiring location on each card — city/country, not a Kenya default.

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

After deploy, open the Netlify URL, log in, pick a **Country they are hiring in** on Today or Openings, then **Scan openings**. LinkedIn is queried with that country (and main cities) as the location filter. Worldwide covers many hiring markets plus remote.

If a deploy is already live, push this repo and use **Trigger deploy** (Deploys → Trigger deploy) so Netlify rebuilds.

## Daily scan

From Today or Openings, **Scan openings**. Or:

`GET /api/cron/daily?secret=YOUR_CRON_SECRET`

That only refreshes listings. It does not apply.

## Gmail

Do not create a Google Cloud website. Use a Gmail App Password:

1. Turn on [2-Step Verification](https://myaccount.google.com/signinoptions/two-step).
2. Open [App passwords](https://myaccount.google.com/apppasswords) and create one for Mail.
3. Inbox or Profile → paste Gmail + the 16-character password → **Connect Gmail**.
4. **Sync inbox**.

The desk only reads unread mail. It does not send applications.

## Profile / CV

Open **Profile** to upload another PDF/TXT CV. The next scan uses text from that file.

## Data

Log out saves the desk first. The same copy is kept in this browser (`localStorage`) and on the server (Netlify Blobs, with a `/tmp` fallback).
