import type { NextApiRequest, NextApiResponse } from "next";

/**
 * On-demand ISR revalidation endpoint. Use when WordPress content changes
 * and you need a cached page to refresh before its `revalidate` window
 * expires.
 *
 * Usage:
 *   GET /api/revalidate?path=/books/autobiography&secret=<REVALIDATE_SECRET>
 *
 * Returns 200 with { revalidated: true, path } on success, 401 if the
 * secret is wrong, 400 if path is missing, 500 if the revalidate call
 * itself fails (usually means the path doesn't have a matching ISR page).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return res.status(500).json({ error: "REVALIDATE_SECRET not configured" });
  }

  // Accept secret from query string (GET) or request body (POST).
  const body = req.body || {};
  const secret = (req.query.secret as string) || body.secret;
  const path   = (typeof req.query.path === "string" ? req.query.path : "") || body.path || "";

  if (secret !== expected) {
    return res.status(401).json({ error: "invalid secret" });
  }
  if (!path || !path.startsWith("/")) {
    return res.status(400).json({ error: "missing or invalid path" });
  }
  try {
    await res.revalidate(path);
    return res.json({ revalidated: true, path });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "revalidate failed" });
  }
}
