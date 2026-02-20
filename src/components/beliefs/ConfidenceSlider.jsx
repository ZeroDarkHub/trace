import React from 'react';
import { cn } from "@/lib/utils";

const clarityLabels = {
  1: "Very vague",
  2: "Quite vague",
  3: "Somewhat vague",
  4: "Slightly unclear",
  5: "Neutral",
  6: "Slightly clear",
  7: "Somewhat clear",
  8: "Quite clear",
  9: "Very clear",
  10: "Crystal clear"
};

export default function ConfidenceSlider({ value, onChange, compact = false }) {
  const getColor = (val) => {
    if (val <= 3) return "bg-amber-100 text-amber-700";
    if (val <= 5) return "bg-slate-100 text-slate-600";
    if (val <= 7) return "bg-emerald-50 text-emerald-600";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-medium text-slate-700",
          compact ? "text-sm" : "text-base"
        )}>
          Clarity
        </span>
        <span className={cn(
          "px-3 py-1 rounded-full text-sm font-medium transition-colors",
          getColor(value)
        )}>
          {value}/10 · {clarityLabels[value]}
        </span>
      </div>
      
      <div className="relative pt-1">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#5C6B5E]
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:active:scale-110
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[#5C6B5E]
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
        />
        
        {!compact && (
          <div className="flex justify-between mt-2 px-1">
            {[1, 5, 10].map((num) => (
              <span key={num} className="text-xs text-slate-400">{num}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}