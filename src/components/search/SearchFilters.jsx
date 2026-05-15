import React from "react";
import { Badge } from "@/components/ui/badge";
import MultiSelect from "./MultiSelect";
import { bookRank } from "@/lib/bible";

/**
 * All five dropdowns are populated from Algolia disjunctive facets passed in
 * via the `facets` prop. Each entry is { value, count, label? }. The page
 * computes these by issuing N+1 search requests (one main + one per facet
 * with that facet's filter excluded), so a dropdown's value list reflects
 * "what's available given my OTHER selections".
 *
 * Scripture options come from the hierarchical scripture_chapter taxonomy
 * (lvl0 = book name); ordered by Bible book where the value matches a known
 * book, with anything unrecognized appended alphabetically.
 */


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
          options={scriptureOptions}
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
