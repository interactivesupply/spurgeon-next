import React from "react";
import { useRouter } from "next/router";
import { Eye, X } from "lucide-react";

/**
 * Shown at the top of any page rendered in preview mode. Provides a clear
 * visual indicator that the editor is looking at a draft, plus an exit link
 * that clears the preview cookie.
 */
export default function PreviewBanner() {
  const router = useRouter();
  if (!router.isPreview) return null;

  const back = encodeURIComponent(router.asPath || "/");
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-3 font-sans text-sm">
        <Eye className="w-4 h-4 shrink-0" />
        <span className="flex-1 font-medium">
          You&apos;re viewing a draft preview.
        </span>
        <a
          href={`/api/exit-preview?back=${back}`}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950/10 hover:bg-amber-950/20 text-amber-950 text-xs font-medium transition-colors">
          <X className="w-3 h-3" />
          Exit preview
        </a>
      </div>
    </div>
  );
}
