# Review Miner — The Purest Co

Internal tool for mining Judge.me customer reviews for landing page copywriting.

## What it does

- Fetches all reviews from `thepurest.myshopify.com` via Judge.me API (paginated)
- Keyword search with inline highlight
- Filter by sentiment, rating, product, and AI theme tag
- AI theme tagging via Claude (batches 15 reviews at a time) — labels topics like eczema, dryness, scent, texture, fast results, etc.
- Save/star reviews to localStorage
- Copy as plain text or formatted testimonial: `"[quote]" — Name, verified buyer`
- Stats bar: total, avg rating, positive, negative, filtered, saved

---

## Repo structure

```
/
├── index.html        # Full frontend (vanilla JS, no build step)
├── api/
│   └── reviews.js    # Vercel serverless proxy for Judge.me
├── vercel.json       # Vercel config
└── README.md
```

---

## Setup

### 1. Create `vercel.json`

Add this file to the project root:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

### 2. Deploy to Vercel

```bash
# If you don't have the Vercel CLI
npm i -g vercel

# From the project root
vercel
```

Follow the prompts. Vercel will detect `index.html` as a static site and `api/reviews.js` as a serverless function automatically.

### 3. Set your Judge.me API token

1. Go to [Judge.me → Settings → API](https://judge.me/shop/settings)
2. Copy your **private API token**
3. Open the deployed app — you'll be prompted to paste it on first load
4. The token is saved to `localStorage` in your browser. One-time setup per browser.

---

## Local development

```bash
vercel dev
```

This spins up the serverless function locally alongside the static frontend. Open `http://localhost:3000`.

---

## AI tagging

The "Tag Reviews" button calls the Anthropic API directly from the browser using the Claude.ai Team plan's built-in API access — no separate API key needed when running inside claude.ai artifacts. When deployed standalone, you'll need to add your own Anthropic API key to the fetch headers in `index.html` (search for `api.anthropic.com`).

Themes tagged: eczema, dryness, acne, oily skin, texture, scent, fast results, sensitive skin, packaging, value for money, gift, anti-ageing, brightening, hydration, redness, pores, dark spots, rash, itching, soothing.

Tags are persisted to `localStorage` so you only need to run tagging once per browser session.

---

## Notes

- Shop domain is hardcoded to `thepurest.myshopify.com` in `api/reviews.js`
- The proxy passes `api_token` via query params — fine for an internal tool; be aware it appears in Vercel function logs
- Max fetch: 5,000 reviews (safety cap); adjust in `index.html` if needed
- Displays 50 reviews at a time with "Load more" pagination for performance

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Blank page after deploy | Check Vercel build logs; ensure `index.html` is at project root |
| `HTTP 401` from proxy | Wrong or expired Judge.me token — reset via the token badge in the app header |
| `HTTP 404` on `/api/reviews` | Ensure `vercel.json` is present and you've run `vercel` not just opened `index.html` directly |
| AI tagging fails | Only works inside claude.ai artifacts (Team plan) or when a valid Anthropic API key is provided |
