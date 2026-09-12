import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithCache, fetchWithRetry } from './fetcher.js';
import { extractCatalogueLinks, extractBookRecord } from './extractor.js';
import { BookSchema, normalize } from './schema.js';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const START_URL  = 'https://books.toscrape.com/catalogue/page-1.html';
const MAX_PAGES  = 3;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const report = {
  start_time:      new Date().toISOString(),
  cache_hits:      0,
  valid_records:   0,
  invalid_records: 0,
  failed_pages:    0,
  duration_ms:     0
};
const startTime = Date.now();

// Stage 2: discover
const bookMap  = new Map();
let currentUrl = START_URL;
let pageCount  = 0;

while (currentUrl && pageCount < MAX_PAGES) {
  const { html } = await fetchWithCache(currentUrl);
  const { bookUrls, nextUrl } = extractCatalogueLinks(html, currentUrl);
  for (const url of bookUrls) {
    if (!bookMap.has(url)) bookMap.set(url, currentUrl);
  }
  pageCount++;
  currentUrl = pageCount < MAX_PAGES ? nextUrl : null;
}

console.log(`catalogue_pages=${pageCount}, discovered=${bookMap.size}, unique_urls=${bookMap.size}`);

// Stage 5 test: one fake URL to prove the run survives a failure
// bookMap.set('https://books.toscrape.com/catalogue/fake-book_999/index.html', START_URL);
//bookMap.set('https://books.toscrape.com/catalogue/fake-book_999/index.html', START_URL);

// Stages 3 + 4 + 5: extract, normalize, validate, store, survive
const validRecords = [];
const errorRecords = [];
const seenUrls     = new Set();

for (const [url, sourcePage] of bookMap) {
  try {
    const { html, fromCache } = await fetchWithRetry(url);
    if (fromCache) report.cache_hits++;

    const raw        = extractBookRecord(html, url, sourcePage);
    const normalized = normalize(raw);
    const result     = BookSchema.safeParse(normalized);

    if (!result.success) {
      errorRecords.push({ url, reason: result.error.message });
      report.invalid_records++;
      continue;
    }

    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      validRecords.push(result.data);
      report.valid_records++;
    }

  } catch (err) {
    console.error(`FAILED  ${url}  — ${err.message}`);
    errorRecords.push({ url, reason: err.message });
    report.failed_pages++;
  }
}

report.duration_ms = Date.now() - startTime;

fs.writeFileSync(path.join(OUTPUT_DIR, 'books.json'),      JSON.stringify(validRecords, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'errors.json'),     JSON.stringify(errorRecords, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'run-report.json'), JSON.stringify(report,       null, 2));

console.log('\n=== Run Report ===');
console.log(JSON.stringify(report, null, 2));