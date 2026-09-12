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

// Stages 3 + 4: extract, normalize, validate, store
const validRecords = [];
const errorRecords = [];
const seenUrls     = new Set();

for (const [url, sourcePage] of bookMap) {
  const { html } = await fetchWithRetry(url);
  const raw        = extractBookRecord(html, url, sourcePage);
  const normalized = normalize(raw);
  const result     = BookSchema.safeParse(normalized);

  if (!result.success) {
    errorRecords.push({ url, reason: result.error.message });
    continue;
  }

  if (!seenUrls.has(url)) {
    seenUrls.add(url);
    validRecords.push(result.data);
  }
}

fs.writeFileSync(path.join(OUTPUT_DIR, 'books.json'),  JSON.stringify(validRecords,  null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'errors.json'), JSON.stringify(errorRecords,  null, 2));

console.log(`\nbooks.json: ${validRecords.length} records | errors.json: ${errorRecords.length}`);