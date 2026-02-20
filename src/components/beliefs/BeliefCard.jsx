import React from 'react';
import { format } from 'date-fns';
import { ChevronRight, Archive } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BeliefCard({ belief, onClick }) {
  const getClarityColor = (val) => {
    if (val <= 3) return "bg-amber-400";
    if (val <= 5) return "bg-slate-300";
    if (val <= 7) return "bg-emerald-300";
    return "bg-emerald-500";
  };

  const getClarityBg = (val) => {
    if (val <= 3) return "bg-amber-50";
    if (val <= 5) return "bg-slate-50";
    if (val <= 7) return "bg-emerald-50";
    return "bg-emerald-100";
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-2xl transition-all duration-200",
        "bg-white border border-slate-100 hover:border-slate-200",
        "hover:shadow-sm active:scale-[0.99]",
        belief.is_archived && "opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Clarity indicator */}
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
          getClarityBg(belief.clarity)
        )}>
          <span className="text-lg font-semibold text-slate-700">
            {belief.clarity}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {belief.is_archived && (
              <Archive className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-xs text-slate-400 font-medium">
              {format(new Date(belief.created_date), 'MMM d, yyyy')}
            </span>
          </div>
          
          <p className="text-slate-800 font-medium line-clamp-2 leading-relaxed">
            {belief.statement}
          </p>
          
          {belief.reflections?.length > 0 && (
            <p className="text-xs text-[#5C6B5E] mt-2 font-medium">
              {belief.reflections.length} reflection{belief.reflections.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ChevronRight className="flex-shrink-0 w-5 h-5 text-slate-300 mt-3" />
      </div>

      {/* Clarity bar */}
      <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", getClarityColor(belief.clarity))}
          style={{ width: `${belief.clarity * 10}%` }}
        />
      </div>
    </button>
  );
}