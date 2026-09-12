import { fetchWithCache } from './fetcher.js';

const { html, fromCache } = await fetchWithCache('https://books.toscrape.com/catalogue/page-1.html');
console.log(`fromCache=${fromCache}, size=${html.length}`);
