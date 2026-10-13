export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  let prev = '';
  let curr = str;
  let iterations = 0;

  while (curr !== prev && iterations < 3) {
    prev = curr;
    curr = curr
      .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&ldquo;/gi, '"')
      .replace(/&rdquo;/gi, '"')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&ndash;/gi, '–')
      .replace(/&mdash;/gi, '—')
      .replace(/&hellip;/gi, '…');
    iterations++;
  }
  return curr;
}

export function cleanText(htmlStr: string): string {
  if (!htmlStr) return '';
  const stripped = htmlStr.replace(/<[^>]*>?/gm, '');
  const decoded = decodeHtmlEntities(stripped);
  return decoded.replace(/\s+/g, ' ').trim();
}
