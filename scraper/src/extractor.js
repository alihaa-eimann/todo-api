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
export function extractBookRecord(html, productUrl, sourcePage) {
  const $ = cheerio.load(html);

  const title             = $('h1').first().text().trim();
  const price_text        = $('p.price_color').first().text().trim();
  const availability_text = $('p.availability').first().text().trim().replace(/\s+/g, ' ');
  const ratingClass       = $('p.star-rating').first().attr('class') ?? '';
  const rating_text       = ratingClass.replace('star-rating', '').trim();
  const descEl            = $('#product_description').next('p');
  const description       = descEl.length ? descEl.text().trim() : null;

  return {
    title,
    product_url: productUrl,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString()
  };
}