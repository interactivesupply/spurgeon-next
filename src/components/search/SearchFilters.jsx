import React from "react";
import { Badge } from "@/components/ui/badge";
import MultiSelect from "./MultiSelect";

const allTypes = [
  { value: "sermon", label: "Sermons" },
  { value: "article", label: "Articles" },
  { value: "blog", label: "Blog" },
  { value: "lecture", label: "Lectures" },
  { value: "book", label: "Books" },
  { value: "conference_media", label: "Conference Media" },
];

const spurgeonTypes = [
  { value: "sermon", label: "Sermons" },
  { value: "book", label: "Books" },
];

const centerTypes = [
  { value: "article", label: "Articles" },
  { value: "blog", label: "Blog" },
  { value: "lecture", label: "Lectures" },
  { value: "conference_media", label: "Conference Media" },
];

const collections = [
  { value: "new_park_street_pulpit", label: "New Park Street Pulpit" },
  { value: "metropolitan_tabernacle_pulpit", label: "Metropolitan Tabernacle Pulpit" },
  { value: "other", label: "Other" },
];

const topics = [
  "Prayer", "Grace", "Faith", "Salvation", "Sovereignty", "Suffering",
  "Holiness", "Evangelism", "Heaven", "Love", "Repentance", "Scripture",
].map((t) => ({ value: t, label: t }));

const books = [
  "Genesis", "Psalms", "Isaiah", "Matthew", "John", "Romans",
  "Ephesians", "Philippians", "Hebrews", "Revelation",
].map((b) => ({ value: b, label: b }));

const years = Array.from({ length: 1892 - 1854 + 1 }, (_, i) => String(1854 + i))
  .reverse()
  .map((y) => ({ value: y, label: y }));

export default function SearchFilters({ filters, onFilterChange, resultCount, meta = "all" }) {
  const types = meta === "spurgeon" ? spurgeonTypes : meta === "center" ? centerTypes : allTypes;

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-border">
      <div className="flex items-center gap-2 flex-wrap">
        <MultiSelect
          options={types}
          value={filters.types || []}
          onChange={(val) => onFilterChange({ ...filters, types: val })}
          placeholder="All Types"
        />
        <MultiSelect
          options={collections}
          value={filters.collections || []}
          onChange={(val) => onFilterChange({ ...filters, collections: val })}
          placeholder="All Collections"
        />
        <MultiSelect
          options={books}
          value={filters.scriptures || []}
          onChange={(val) => onFilterChange({ ...filters, scriptures: val })}
          placeholder="Scripture"
        />
        <MultiSelect
          options={topics}
          value={filters.topics || []}
          onChange={(val) => onFilterChange({ ...filters, topics: val })}
          placeholder="Topic"
        />
        <MultiSelect
          options={years}
          value={filters.years || []}
          onChange={(val) => onFilterChange({ ...filters, years: val })}
          placeholder="Year"
        />
      </div>

      {resultCount !== null && (
        <Badge variant="secondary" className="font-sans text-xs self-start">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  );
}