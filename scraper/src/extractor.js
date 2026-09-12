import * as cheerio from 'cheerio';

export function extractCatalogueLinks(html, pageUrl) {
  const $ = cheerio.load(html);
  const bookUrls = [];

  $('article.product_pod h3 a').each((_, el) => {
    const href = $(el).attr('href');
    bookUrls.push(new URL(href, pageUrl).href);
  });

  const nextHref = $('li.next a').attr('href');
  const nextUrl  = nextHref ? new URL(nextHref, pageUrl).href : null;

  return { bookUrls, nextUrl };
}