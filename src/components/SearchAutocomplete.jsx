import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import { algolia, ALGOLIA_INDEX, reshapeHit, urlForHit, POST_TYPE_LABELS } from "@/lib/algolia";
import { decodeEntities } from "@/lib/utils";

const SUGGESTION_LIMIT = 6;
const DEBOUNCE_MS = 140;

/**
 * Inline Algolia autocomplete that hangs off the header search input.
 *
 * Renders nothing while the query is shorter than 2 characters, otherwise
 * shows up to SUGGESTION_LIMIT result previews plus a "see all results"
 * footer link. Wires its own keyboard navigation (↑/↓ to move, Enter to
 * select, Escape to clear highlight) onto whichever `inputRef` it's given.
 *
 * The component is purely presentational state on top of the shared
 * Algolia client; it does not own the input itself. Layout.jsx still owns
 * the <input>, this component listens to it.
 */
export default function SearchAutocomplete({ query, inputRef, onSelect, onSubmitFallback }) {
  const router = useRouter();
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const fetchSeq = useRef(0);

  const trimmed = (query || "").trim();
  const active = trimmed.length >= 2;

  useEffect(() => {
    if (!active || !algolia) {
      setHits([]);
      setHighlight(-1);
      return;
    }
    const seq = ++fetchSeq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { results } = await algolia.search({
          requests: [
            {
              indexName: ALGOLIA_INDEX,
              query: trimmed,
              hitsPerPage: SUGGESTION_LIMIT,
              page: 0,
              attributesToSnippet: ["post_title:20", "content:24"],
              snippetEllipsisText: "…",
            },
          ],
        });
        // Drop stale responses if the query has changed since this fired.
        if (seq !== fetchSeq.current) return;
        const main = results[0];
        const seen = new Set();
        const reshaped = (main?.hits || [])
          .map(reshapeHit)
          .filter((h) => {
            if (seen.has(h.databaseId)) return false;
            seen.add(h.databaseId);
            return true;
          });
        setHits(reshaped);
        setHighlight(reshaped.length > 0 ? 0 : -1);
      } catch {
        if (seq === fetchSeq.current) setHits([]);
      } finally {
        if (seq === fetchSeq.current) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [trimmed, active]);

  // Keyboard navigation. Attached to the parent input so the user can
  // arrow through suggestions without taking their hands off the keys.
  const onKeyDown = useCallback(
    (e) => {
      if (!active) return;
      const totalRows = hits.length + (hits.length ? 1 : 0); // +1 for "see all"
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % Math.max(totalRows, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + totalRows) % Math.max(totalRows, 1));
      } else if (e.key === "Enter") {
        // Don't intercept; let the form submit unless a suggestion is
        // highlighted (in which case override and navigate to it).
        if (highlight >= 0 && highlight < hits.length) {
          e.preventDefault();
          handleSelect(hits[highlight]);
        } else if (highlight === hits.length && hits.length > 0) {
          e.preventDefault();
          submitFallback();
        }
      } else if (e.key === "Escape") {
        setHighlight(-1);
      }
    },
    [active, hits, highlight]
  );

  useEffect(() => {
    const el = inputRef?.current;
    if (!el) return;
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [inputRef, onKeyDown]);

  const handleSelect = (hit) => {
    const href = urlForHit(hit);
    if (onSelect) onSelect(href);
    router.push(href);
  };

  const submitFallback = () => {
    if (onSubmitFallback) onSubmitFallback();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  if (!active) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-1 mx-auto max-w-3xl px-6 pointer-events-none">
      <div className="pointer-events-auto bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {loading && hits.length === 0 ? (
          <div className="px-5 py-4 font-sans text-sm text-primary-foreground/40">
            Searching…
          </div>
        ) : hits.length === 0 ? (
          <div className="px-5 py-4 font-sans text-sm text-primary-foreground/40">
            No matches for <span className="text-primary-foreground/70">"{trimmed}"</span>. Press Enter to search anyway.
          </div>
        ) : (
          <>
            <ul role="listbox" className="py-2">
              {hits.map((hit, i) => {
                const typeLabel = POST_TYPE_LABELS[hit.postType] || hit.postType;
                const snippet = (hit.excerpt || "").replace(/<[^>]+>/g, "").trim();
                const isActive = i === highlight;
                return (
                  <li key={hit.id} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => handleSelect(hit)}
                      className={`w-full text-left px-5 py-2.5 flex items-start gap-3 transition-colors ${
                        isActive ? "bg-white/8" : "hover:bg-white/5"
                      }`}
                    >
                      <Search className="w-3.5 h-3.5 text-accent/70 mt-1 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm text-primary-foreground truncate">
                            {decodeEntities(hit.title)}
                          </span>
                          <span className="font-sans text-[10px] uppercase tracking-wider text-accent/80 shrink-0">
                            {typeLabel}
                          </span>
                        </div>
                        {snippet && (
                          <div className="font-sans text-xs text-primary-foreground/40 truncate mt-0.5">
                            {snippet}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-primary-foreground/30 mt-1 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <Link
              href={`/search?q=${encodeURIComponent(trimmed)}`}
              onMouseEnter={() => setHighlight(hits.length)}
              onClick={() => onSubmitFallback && onSubmitFallback()}
              className={`flex items-center justify-between gap-2 px-5 py-3 border-t border-white/8 font-sans text-xs transition-colors ${
                highlight === hits.length
                  ? "bg-white/8 text-accent"
                  : "text-primary-foreground/60 hover:bg-white/5 hover:text-accent"
              }`}
            >
              <span>
                See all results for <span className="text-primary-foreground/90">"{trimmed}"</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
