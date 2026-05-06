import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Renders the magazine category filter tabs from a list of taxonomy terms
 * passed in by the page. Adds an "All" tab at the front. Order matches the
 * order WPGraphQL returns the terms (creation order from the activation hook).
 *
 * If the page provides Algolia disjunctive facet counts (`counts` keyed by
 * slug, plus `allCount`), the tab labels include the count — e.g. "Spurgeon
 * Articles (4)". When counts aren't supplied, tabs render plain names.
 */
export default function MagazineCategories({ activeCategory, onCategoryChange, terms = [], counts, allCount }) {
  const hasCounts = !!counts;
  const formatLabel = (slug, name) => {
    if (!hasCounts) return name;
    const n = slug === "all" ? (allCount ?? 0) : (counts[slug] ?? 0);
    return `${name} (${n})`;
  };
  const categories = [
    { value: "all", label: formatLabel("all", "All") },
    ...terms.map(t => ({ value: t.slug, label: formatLabel(t.slug, t.name) })),
  ];
  return (
    <div className="bg-card">
      <div className="max-w-6xl mx-auto px-6">
        {/* Mobile Dropdown */}
        <div className="flex md:hidden pb-4 pt-4">
          <Select value={activeCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Desktop Pills */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`flex-shrink-0 px-5 py-2 rounded-full font-sans text-sm font-medium transition-all ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
