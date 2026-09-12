# Apply Desk

Personal job desk for **Collins Kipkorir** — IT Assistant at Barsiele Sunrise Academy.

Scans openings that fit the CV and leaves them with an apply link. You apply yourself, then tap **I applied**. Gmail follow-up is wired later, when you grant access — the desk does not send applications.

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

That only refreshes the list. It does not apply.

## Gmail

Inbox is empty until you grant Gmail access for follow-up. Applications you mark stay in the Applied log either way.
