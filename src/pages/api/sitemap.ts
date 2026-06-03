import type { NextApiRequest, NextApiResponse } from 'next';

const WP_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://spurgeoncenter.wpengine.com';
// Domain that Yoast embeds in sitemap <loc> URLs (WP Engine's internal hostname)
const WP_SITEMAP_HOST = 'spurgeoncenter.wpenginepowered.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const file = req.query.file as string;
  if (!file) return res.status(400).end();

  const wpRes = await fetch(`${WP_BASE}/${file}`);
  if (!wpRes.ok) return res.status(404).end();

  let xml = await wpRes.text();

  // Rewrite all content URLs from the WP backend domain to this site's domain.
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host  = req.headers.host || '';
  xml = xml.replaceAll(`https://${WP_SITEMAP_HOST}`, `${proto}://${host}`);

  // Strip the WP-hosted XSL stylesheet reference — it would 404 on this domain.
  xml = xml.replace(/<\?xml-stylesheet[^?]*\?>\n?/, '');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).send(xml);
}
