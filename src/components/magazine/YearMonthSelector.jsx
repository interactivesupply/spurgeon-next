import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const START_YEAR = 1865;
const END_YEAR = 1892;
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export default function YearMonthSelector({ activeYear, activeMonth, onYearChange, onMonthChange }) {
  return (
    <div className="bg-card border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
            Year
          </label>
          <Select
            value={activeYear ?? "all"}
            onValueChange={(v) => {
              onYearChange(v === "all" ? null : v);
              onMonthChange(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
            Month
          </label>
          <Select
            value={activeMonth ?? "all"}
            onValueChange={(v) => onMonthChange(v === "all" ? null : v)}
            disabled={!activeYear}
          >
            <SelectTrigger>
              <SelectValue placeholder={activeYear ? "All Months" : "Select a year first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
