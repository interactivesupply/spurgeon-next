import { useEffect } from "react";

/**
 * Loads the Userback feedback widget when NEXT_PUBLIC_USERBACK_TOKEN is set.
 * No-op (renders nothing) when the env var is missing — that lets us keep
 * the widget out of production by simply not setting the token in the
 * production environment.
 */
export default function UserbackLoader() {
  const token = process.env.NEXT_PUBLIC_USERBACK_TOKEN;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    import("@userback/widget")
      .then((mod) => {
        if (cancelled) return;
        mod.default(token);
      })
      .catch((err) => {
        console.error("[Userback] failed to load", err);
      });
    return () => { cancelled = true; };
  }, [token]);

  return null;
}
