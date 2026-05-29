import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import MultiSelect from "./MultiSelect";
import { bookRank } from "@/lib/bible";

/**
 * Filter bar for the search page. Type/Collection/Topic/Year use MultiSelect
 * (multi-value). Scripture uses a two-level single-select: choose a book,
 * then optionally drill down to a specific chapter. Single-book constraint
 * is intentional — chapter facets are only meaningful within one book.
 */

function toOptions(facetValues = []) {
  return facetValues.map((v) => ({
    value: v.value,
    label: `${v.label || v.value} (${v.count})`,
  }));
}

/** Native <select> styled to match the MultiSelect button. */
function FacetSelect({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-md border border-border bg-card font-sans text-sm text-foreground min-w-[130px] max-w-[220px] outline-none cursor-pointer appearance-none">
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
}

export default function SearchFilters({ filters, onFilterChange, resultCount, loadedCount, facets = {} }) {
  const typeOptions = toOptions(facets.post_type);
  const collectionOptions = toOptions(facets.collection);
  const topicOptions = toOptions(facets.topic);
  // Year facet: present numerically, descending. Drop "0" — it's the
  // ACF default-when-unset and surfaces in the index for posts (mostly
  // conference media) that don't have a real year.
  const yearOptions = toOptions(
    (facets.year || [])
      .filter((v) => Number(v.value) > 0)
      .sort((a, b) => Number(b.value) - Number(a.value))
  );
  // Scripture facet: re-sort by canonical Bible book order so Genesis comes
  // before Revelation (Algolia returns by count desc, which feels random).
  const scriptureOptions = toOptions(
    [...(facets.scripture || [])].sort((a, b) => {
      const ra = bookRank(a.value);
      const rb = bookRank(b.value);
      if (ra !== rb) return ra - rb;
      return a.value.localeCompare(b.value);
    })
  );
  // Chapter options: already sorted numerically by search.tsx; labels are
  // the stripped form ("Genesis 1"), values are the full lvl1 form used
  // to filter Algolia ("Genesis > Genesis 1").
  const chapterOptions = toOptions(facets.scriptureChapter || []);

  const selectedBook = (filters.scriptures || [])[0] || '';
  const selectedChapter = (filters.scriptureChapters || [])[0] || '';

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-border">
      <div className="flex items-center gap-2 flex-wrap">
        <MultiSelect
          options={typeOptions}
          value={filters.postTypes || []}
          onChange={(val) => onFilterChange({ ...filters, postTypes: val })}
          placeholder="All Types"
        />
        {(collectionOptions.length > 0 || (filters.collections || []).length > 0) && (
          <MultiSelect
            options={collectionOptions}
            value={filters.collections || []}
            onChange={(val) => onFilterChange({ ...filters, collections: val })}
            placeholder="All Collections"
          />
        )}
        {(scriptureOptions.length > 0 || selectedBook) && (
          <FacetSelect
            value={selectedBook}
            placeholder="Scripture"
            options={scriptureOptions}
            onChange={(val) => onFilterChange({
              ...filters,
              scriptures: val ? [val] : [],
              scriptureChapters: [],   // clear chapter when book changes
            })}
          />
        )}
        {selectedBook && (chapterOptions.length > 0 || selectedChapter) && (
          <FacetSelect
            value={selectedChapter}
            placeholder="All chapters"
            options={chapterOptions}
            onChange={(val) => onFilterChange({
              ...filters,
              scriptureChapters: val ? [val] : [],
            })}
          />
        )}
        {(topicOptions.length > 0 || (filters.topics || []).length > 0) && (
          <MultiSelect
            options={topicOptions}
            value={filters.topics || []}
            onChange={(val) => onFilterChange({ ...filters, topics: val })}
            placeholder="Topic"
          />
        )}
        {(yearOptions.length > 0 || (filters.years || []).length > 0) && (
          <MultiSelect
            options={yearOptions}
            value={filters.years || []}
            onChange={(val) => onFilterChange({ ...filters, years: val })}
            placeholder="Year"
          />
        )}
      </div>

      {resultCount !== null && (
        <Badge variant="secondary" className="font-sans text-xs self-start">
          {loadedCount != null && loadedCount < resultCount
            ? `Showing ${loadedCount} of ${resultCount} results`
            : `${resultCount} result${resultCount !== 1 ? "s" : ""}`}
        </Badge>
      )}
    </div>
  );
}
