# Apply Desk

Personal job desk for **Collins Kipkorir** — IT Assistant at Barsiele Sunrise Academy.

Scans **live Kenya jobs** from BrighterMonday, MyJobMag, and Fuzu. You apply yourself from the posting link, then tap **I applied**. Gmail follow-up is wired later.

## Run

```bash
cd apply-desk
npm install
npm run dev
```

Open http://127.0.0.1:43124

Demo login: `kipkorirc583@gmail.com` / `sunrise-desk`

## Daily scan

From Today or Openings, **Scan openings**. Or:

`GET /api/cron/daily?secret=YOUR_CRON_SECRET`

That only refreshes Kenya listings. It does not apply.

## Gmail

Inbox is empty until you grant Gmail access for follow-up. Applications you mark stay in the Applied log either way.
