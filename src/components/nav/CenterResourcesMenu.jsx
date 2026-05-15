import React, { useState, useRef } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Video, ChevronRight, ArrowRight, Library } from "lucide-react";
import { iconFor } from "@/lib/icon-registry";

// Fallback content when the editor-managed nav field group is empty.
const FALLBACK_COLUMNS = [
  {
    id: "articles",
    label: "Articles",
    icon: FileText,
    description: "Essays and written scholarship from the Center",
    links: [
      { label: "All Articles", to: ROUTES.Search + "?type=article" },
      { label: "Blog Posts", to: ROUTES.Search + "?type=blog" },
      { label: "Spurgeon on Prayer", to: ROUTES.Search + "?q=prayer&type=article" },
      { label: "Spurgeon on Grace", to: ROUTES.Search + "?q=grace&type=article" },
    ],
    cta: { label: "Browse all articles", to: ROUTES.Search + "?type=article" },
  },
  {
    id: "videos",
    label: "Videos & Conference Media",
    icon: Video,
    description: "Lectures, recordings, and sessions from Center events",
    links: [
      { label: "All Lectures", to: ROUTES.Search + "?type=lecture" },
      { label: "Theology Lectures", to: ROUTES.Search + "?q=theology&type=lecture" },
      { label: "Ministry Lectures", to: ROUTES.Search + "?q=ministry&type=lecture" },
      { label: "All Conference Media", to: ROUTES.Search + "?type=conference_media" },
      { label: "Annual Conference", to: ROUTES.Search + "?q=conference" },
      { label: "Symposiums", to: ROUTES.Search + "?q=symposium" },
    ],
    cta: { label: "Browse all media", to: ROUTES.Search + "?q=conference" },
  },
];

function normalize(cols) {
  if (!Array.isArray(cols) || cols.length === 0) return null;
  return cols.map((c, i) => ({
    id: c.id || `col-${i}`,
    label: c.label || '',
    icon: iconFor(c.icon),
    description: c.description || '',
    links: (c.links || []).map((l) => ({ label: l.label || '', to: l.url || '' })),
    cta: c.ctaLabel ? { label: c.ctaLabel, to: c.ctaUrl || '' } : null,
  }));
}

export default function CenterResourcesMenu({ columns: editorColumns }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const columns = normalize(editorColumns) || FALLBACK_COLUMNS;

  const handleMouseEnter = () => { clearTimeout(timeoutRef.current); setOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 150); };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={`flex items-center gap-1 font-sans text-sm transition-colors ${
          open ? "text-accent" : "text-primary-foreground/60 hover:text-primary-foreground"
        }`}
      >
        <Library className="w-3.5 h-3.5" />
        Our Resources
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-6 py-4 border-b border-white/8">
              <p className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">
                The Spurgeon Library Resources
              </p>
            </div>
            <div className="grid divide-x divide-white/8" style={{gridTemplateColumns: '1fr 1.68fr'}}>
              {columns.map((col) => {
                const Icon = col.icon;
                return (
                  <div key={col.id} className="p-5 flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <div>
                        <div className="font-serif text-sm font-semibold text-primary-foreground">{col.label}</div>
                        <div className="font-sans text-[11px] text-primary-foreground/40 leading-tight mt-0.5">{col.description}</div>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.to}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-1.5 font-sans text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors py-0.5"
                          >
                            <ChevronRight className="w-2.5 h-2.5 text-accent/50 shrink-0" />
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {col.cta && col.cta.to && (
                      <Link
                        href={col.cta.to}
                        onClick={() => setOpen(false)}
                        className="mt-auto flex items-center gap-1 font-sans text-xs text-accent hover:text-accent/80 transition-colors pt-2 border-t border-white/8"
                      >
                        {col.cta.label}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
