import React from "react";
import { Badge } from "@/components/ui/badge";
import MultiSelect from "./MultiSelect";

/**
 * All four dropdowns are now populated from Algolia disjunctive facets passed
 * in via the `facets` prop. Each entry is { value, count, label? }. The page
 * computes these by issuing N+1 search requests (one main + one per facet
 * with that facet's filter excluded), so a dropdown's value list reflects
 * "what's available given my OTHER selections".
 *
 * We still render the Scripture filter as a hardcoded Bible-book list for
 * now — it's a separate concern (no structured `scripture_book` field on
 * the Algolia records yet).
 */

// Scripture filter is hardcoded until we add a `scripture_book` field at
// index time. For now it falls through as a search-query enhancement (page-side).
const SCRIPTURE_BOOKS = [
  "Genesis", "Psalms", "Isaiah", "Matthew", "John", "Romans",
  "Ephesians", "Philippians", "Hebrews", "Revelation",
].map((b) => ({ value: b, label: b }));

function toOptions(facetValues = []) {
  return facetValues.map((v) => ({
    value: v.value,
    label: `${v.label || v.value} (${v.count})`,
  }));
}

export default function SearchFilters({ filters, onFilterChange, resultCount, loadedCount, facets = {} }) {
  const typeOptions = toOptions(facets.post_type);
  const collectionOptions = toOptions(facets.collection);
  const topicOptions = toOptions(facets.topic);
  // Year facet: present numerically, descending.
  const yearOptions = toOptions(
    [...(facets.year || [])].sort((a, b) => Number(b.value) - Number(a.value))
  );

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-border">
      <div className="flex items-center gap-2 flex-wrap">
        <MultiSelect
          options={typeOptions}
          value={filters.postTypes || []}
          onChange={(val) => onFilterChange({ ...filters, postTypes: val })}
          placeholder="All Types"
        />
        <MultiSelect
          options={collectionOptions}
          value={filters.collections || []}
          onChange={(val) => onFilterChange({ ...filters, collections: val })}
          placeholder="All Collections"
        />
        <MultiSelect
          options={SCRIPTURE_BOOKS}
          value={filters.scriptures || []}
          onChange={(val) => onFilterChange({ ...filters, scriptures: val })}
          placeholder="Scripture"
        />
        <MultiSelect
          options={topicOptions}
          value={filters.topics || []}
          onChange={(val) => onFilterChange({ ...filters, topics: val })}
          placeholder="Topic"
        />
        <MultiSelect
          options={yearOptions}
          value={filters.years || []}
          onChange={(val) => onFilterChange({ ...filters, years: val })}
          placeholder="Year"
        />
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
