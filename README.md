# FlyRank A9 — The Polite Scraper

## Target Classification
- **Site:** Books to Scrape (https://books.toscrape.com)
- **Why it's safe:** The site states it is a sandbox built for scraping practice.
- **Scope:** First 3 catalogue pages only (60 books total).
- **Data collected:** Title, price, availability, rating, description, URL, source page, fetch time.
- **robots.txt result:** 404 — no robots.txt file found. Site confirms itself as a scraping sandbox on toscrape.com.

I will not reuse this code on another site without checking its rules and terms first.

## Run
```bash
npm install
node src/index.js
```
Produces `output/books.json`, `output/errors.json`, `output/run-report.json`.

## Lane
JavaScript — Node.js 20+, Cheerio, Zod.

## Record Schema
| Field | Type | Notes |
|---|---|---|
| title | string | required |
| product_url | string (URL) | canonical identity |
| price_text | string | raw e.g. "£51.77" |
| price_gbp | number | parsed float |
| availability_text | string | |
| rating_text | string | e.g. "Three" |
| description | string or null | null if absent |
| source_page | string (URL) | provenance |
| fetched_at | string (ISO) | provenance |

## Politeness Rules
- **User-Agent:** `FlyRankInternship-A9/1.0 (+https://github.com/alihaa-eimann/todo-api)`
- **Delay:** 500 ms between real requests
- **Timeout:** 10 seconds per request
- **Cache:** HTML saved to `cache/` — development reads local files, not the live site

## Sample Run Report
```json
{
  "start_time": "2026-09-12T15:52:05.243Z",
  "cache_hits": 60,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 1,
  "duration_ms": 1235
}
```
(`failed_pages: 1` is from the deliberate fake URL test in Stage 5.)

## Why No Browser Needed
The data is already in the HTML the server sends — no JavaScript renders it,
so a browser like Playwright would only add memory and startup cost for zero benefit here.

## Ethics Note
Use an official API when one exists. Never bypass logins, paywalls, or blocks.
Collect only what you need. This code targets only a public practice sandbox.

## Limitation
Does not handle catalogue structures beyond the first 3 pages or sites with JS-rendered content.