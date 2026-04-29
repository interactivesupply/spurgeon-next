import React from "react";

const categories = [
  { value: "all", label: "All Books" },
  { value: "devotional", label: "Devotionals" },
  { value: "commentary", label: "Biblical Commentary" },
  { value: "theology", label: "Theology & Doctrine" },
  { value: "pastoral", label: "Pastoral & Practical" },
  { value: "autobiography", label: "Autobiographical" },
];

export default function BookCategoryTabs({ active, onChange }) {
  return (
    <div className="bg-foreground border-t border-primary-foreground/10 sticky top-[64px] md:top-[80px] z-40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
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