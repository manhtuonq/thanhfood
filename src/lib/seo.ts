export function setSEO(opts: {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}) {
  if (opts.title) document.title = opts.title.slice(0, 60);
  const set = (sel: string, attr: string, val: string) => {
    let el = document.head.querySelector(sel) as HTMLMetaElement | HTMLLinkElement | null;
    if (!el) {
      el = document.createElement(sel.startsWith('link') ? 'link' : 'meta') as any;
      const m = sel.match(/\[([^=]+)="([^"]+)"\]/);
      if (m && el) (el as any).setAttribute(m[1], m[2]);
      document.head.appendChild(el!);
    }
    (el as any).setAttribute(attr, val);
  };
  if (opts.description) set('meta[name="description"]', 'content', opts.description.slice(0, 160));
  if (opts.keywords) set('meta[name="keywords"]', 'content', opts.keywords);
  if (opts.title) set('meta[property="og:title"]', 'content', opts.title);
  if (opts.description) set('meta[property="og:description"]', 'content', opts.description);
  if (opts.ogImage) set('meta[property="og:image"]', 'content', opts.ogImage);
  if (opts.canonical) set('link[rel="canonical"]', 'href', opts.canonical);

  // JSON-LD
  let ld = document.getElementById('jsonld-product') as HTMLScriptElement | null;
  if (opts.jsonLd) {
    if (!ld) {
      ld = document.createElement('script');
      ld.id = 'jsonld-product';
      ld.type = 'application/ld+json';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify(opts.jsonLd);
  } else if (ld) {
    ld.remove();
  }
}

export function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
