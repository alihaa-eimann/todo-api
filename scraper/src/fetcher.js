import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CACHE_DIR = path.join(__dirname, '..', 'cache');

const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/alihaa-eimann/todo-api)';
const TIMEOUT_MS = 10_000;
const DELAY_MS = 500;

fs.mkdirSync(CACHE_DIR, { recursive: true });

function urlToFilename(url) {
  return url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_').slice(0, 120) + '.html';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function fetchWithCache(url) {
  const cachePath = path.join(CACHE_DIR, urlToFilename(url));

  if (fs.existsSync(cachePath)) {
    console.log(`CACHE HIT  ${url}`);
    return { html: fs.readFileSync(cachePath, 'utf-8'), fromCache: true };
  }

  console.log(`FETCH      ${url}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    fs.writeFileSync(cachePath, html, 'utf-8');
    console.log(`           saved ${html.length} bytes`);

    await sleep(DELAY_MS);
    return { html, fromCache: false };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function fetchWithRetry(url, maxRetries = 1) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithCache(url);
    } catch (err) {
      const code = parseInt(err.message?.replace('HTTP ', ''));
      if (code === 404 || code === 403 || attempt >= maxRetries) throw err;
      console.log(`  Retry ${attempt + 1} → ${url}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}