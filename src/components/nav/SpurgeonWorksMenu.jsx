import React, { useState, useRef } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, Newspaper, ChevronRight, Scroll, ArrowRight } from "lucide-react";
import { iconFor } from "@/lib/icon-registry";

// Fallback content used when the editor-managed Navigation field group is
// empty (fresh installs, or before someone seeds defaults). Mirrors the
// shape returned by getSharedPageData().nav.headerSpurgeonWorks but with
// Lucide components inlined directly (we keep this format for legacy reasons).
const FALLBACK_COLUMNS = [
  {
    id: "sermons",
    label: "Sermons",
    icon: Scroll,
    description: "3,500+ sermons across two collections",
    links: [
      { label: "All Sermons", to: ROUTES.Search + "?type=sermon" },
      { label: "New Park Street Pulpit", to: ROUTES.Search + "?collection=new-park-street-pulpit" },
      { label: "Metropolitan Tabernacle", to: ROUTES.Search + "?collection=metropolitan-tabernacle-pulpit" },
      { label: "Search by Scripture", to: ROUTES.Search + "?type=sermon" },
      { label: "Browse by Year", to: ROUTES.Search + "?type=sermon" },
    ],
    cta: { label: "Browse all sermons", to: ROUTES.Search + "?type=sermon" },
  },
  {
    id: "books",
    label: "Books",
    icon: BookMarked,
    description: "Volumes authored by Spurgeon",
    links: [
      { label: "All Books", to: ROUTES.Books },
      { label: "Morning & Evening", to: ROUTES.MorningAndEvening },
      { label: "Faith's Check Book", to: ROUTES.FaithsCheckBook },
      { label: "The Treasury of David", to: ROUTES.TreasuryOfDavid },
      { label: "All of Grace", to: ROUTES.BookReader("all-of-grace") },
    ],
    cta: { label: "Browse all books", to: ROUTES.Books },
  },
  {
    id: "magazine",
    label: "Sword & Trowel",
    icon: Newspaper,
    description: "Spurgeon's monthly magazine, 1865–1892",
    links: [
      { label: "Browse Issues", to: ROUTES.SwordAndTrowel },
      { label: "Spurgeon Articles", to: ROUTES.SwordAndTrowel + "?category=spurgeon_article" },
      { label: "Book Reviews", to: ROUTES.SwordAndTrowel + "?category=book_review" },
      { label: "News Reports", to: ROUTES.SwordAndTrowel + "?category=news_reports" },
    ],
    cta: { label: "Read the magazine", to: ROUTES.SwordAndTrowel },
  },
];

/**
 * Normalize the editor-managed mega-menu data into the shape this component
 * uses (icon mapped to a component, links → {label, to}, cta → {label, to}).
 * Returns null if there's nothing usable so the caller can fall back.
 */
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

export default function SpurgeonWorksMenu({ columns: editorColumns }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  // Prefer the editor-managed columns; fall back to the hardcoded defaults
  // when nothing has been seeded yet.
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
        <Scroll className="w-3.5 h-3.5" />
        Spurgeon's Works
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
                Spurgeon's Works
              </p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/8">
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
