import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = [
  { value: "all", label: "All" },
  { value: "spurgeon_article", label: "Spurgeon Articles" },
  { value: "book_review", label: "Book Reviews" },
  { value: "chapter_preview", label: "Chapter Previews" },
  { value: "spurgeon_short", label: "Short Form" },
  { value: "news_reports", label: "News & Reports" },
];

export default function MagazineCategories({ activeCategory, onCategoryChange }) {
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