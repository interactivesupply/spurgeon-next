import React from "react";

/**
 * Renders the category filter tabs from a list of taxonomy terms passed in
 * by the page. Adds an "All Books" tab at the front. Order matches the
 * order WPGraphQL returns the terms (which is creation order, controlled
 * by the activation hook in spurgeon-cpts).
 */
export default function BookCategoryTabs({ active, onChange, terms = [] }) {
  const tabs = [{ value: "all", label: "All Books" }, ...terms.map(t => ({ value: t.slug, label: t.name }))];
  return (
    <div className="bg-foreground border-t border-primary-foreground/10 sticky top-[64px] md:top-[80px] z-40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onChange(cat.value)}
              className={`shrink-0 px-5 py-4 font-sans text-sm border-b-2 transition-colors whitespace-nowrap ${
                active === cat.value
                  ? "border-accent text-accent"
                  : "border-transparent text-primary-foreground/50 hover:text-primary-foreground"
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
