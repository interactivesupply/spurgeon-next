import React from "react";
import { Slider } from "@/components/ui/slider";

const START_YEAR = 1865;
const END_YEAR = 1892;

export default function YearSlider({ activeYear, onYearChange }) {
  const sliderValue = activeYear ? [parseInt(activeYear, 10)] : [START_YEAR];

  return (
    <div className="bg-card border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
            Year
          </p>
          {activeYear && (
            <button
              type="button"
              onClick={() => onYearChange(null)}
              className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Show All
            </button>
          )}
        </div>

        <div className="text-center mb-5">
          <span className="font-serif text-2xl font-semibold text-foreground">
            {activeYear ?? "All Years"}
          </span>
        </div>

        <div className="px-2">
          <Slider
            min={START_YEAR}
            max={END_YEAR}
            step={1}
            value={sliderValue}
            onValueChange={([val]) => onYearChange(String(val))}
          />
          <div className="flex justify-between mt-2">
            <span className="font-sans text-xs text-muted-foreground">{START_YEAR}</span>
            <span className="font-sans text-xs text-muted-foreground">{END_YEAR}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
