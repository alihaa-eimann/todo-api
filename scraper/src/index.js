import { fetchWithCache, fetchWithRetry } from './fetcher.js';
import { extractCatalogueLinks, extractBookRecord } from './extractor.js';

const START_URL = 'https://books.toscrape.com/catalogue/page-1.html';
const MAX_PAGES = 3;

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

// Stage 3: extract
let count = 0;

for (const [url, sourcePage] of bookMap) {
  const { html } = await fetchWithRetry(url);
  const raw = extractBookRecord(html, url, sourcePage);
  count++;
  if (count === 1) console.log('\nSample record:\n', JSON.stringify(raw, null, 2));
}

console.log(`\ndetail_pages=${count}`);