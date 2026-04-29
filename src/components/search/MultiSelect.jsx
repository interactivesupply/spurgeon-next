import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MultiSelect({ options, value = [], onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card font-sans text-sm text-foreground min-w-[130px] max-w-[220px] hover:bg-secondary/50 transition-colors"
      >
        <span className="flex-1 truncate text-left">
          {selectedLabels.length === 0
            ? <span className="text-muted-foreground">{placeholder}</span>
            : selectedLabels.length === 1
            ? selectedLabels[0]
            : `${selectedLabels.length} selected`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 min-w-[180px] bg-popover border border-border rounded-md shadow-lg py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 font-sans text-sm text-foreground hover:bg-secondary/50 transition-colors text-left"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-border"}`}>
                  {checked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}