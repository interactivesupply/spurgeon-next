import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Clears the Next.js preview cookie. Editors hit this URL (or click the
 * "Exit Preview" link in the in-page banner) to return to the live, cached
 * version of the site.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.clearPreviewData();
  const back = (req.query.back as string) || '/';
  return res.redirect(307, back);
}
