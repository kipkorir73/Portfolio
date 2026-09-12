# Apply Desk

Personal job desk for **Collins Kipkorir** — IT Assistant at Barsiele Sunrise Academy.

It matches openings to the live CV, logs applications by channel (email, job board, company site, LinkedIn), and files recruiter replies when email is connected.

It does **not** log into LinkedIn, BrighterMonday, Workday, or Greenhouse and click Apply for you. Those sites forbid that, and there is no official API for it. Email-fit jobs can be auto-logged (mock send in this preview). LinkedIn / careers pages stay in **Need you**.

## Run

```bash
cd apply-desk
npm install
npm run dev
```

Open http://127.0.0.1:43124

Demo login:

- Email: `kipkorirc583@gmail.com`
- Password: `sunrise-desk`

## Daily scan

From the Today page, **Run today's scan & apply**. Or hit:

`GET /api/cron/daily?secret=YOUR_CRON_SECRET`

Set `CRON_SECRET` and `DESK_PASSWORD` in `.env.local` when you host it.

## Email

**Connect kipkorirc583@gmail.com** on the Inbox page uses a simulated mailbox in this preview so you can see replies next to applications. A real Gmail connection needs a Google Cloud OAuth client (or SMTP app password) — add those later; the desk already stores the log locally in `data/store.json`.
