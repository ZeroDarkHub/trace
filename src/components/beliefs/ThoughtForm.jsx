import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';
import ClaritySlider from './ClaritySlider';
import { cn } from "@/lib/utils";

export default function ThoughtForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    statement: initialData?.statement || '',
    reasoning: initialData?.reasoning || '',
    evidence: initialData?.evidence || '',
    clarity: initialData?.clarity || 5,
    what_would_change: initialData?.what_would_change || '',
  });

  const [activeField, setActiveField] = useState('statement');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Is valid:', isValid);
    if (!formData.statement.trim()) return;
    console.log('Calling onSubmit with data:', formData);
    onSubmit(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValid = formData.statement.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Statement */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          My idea is…
        </label>
        <Textarea
          value={formData.statement}
          onChange={(e) => updateField('statement', e.target.value)}
          onFocus={() => setActiveField('statement')}
          placeholder="Write your idea here"
          className={cn(
            "min-h-[100px] text-lg border-slate-200 rounded-xl resize-none",
            "focus:ring-2 focus:ring-[#5C6B5E]/20 focus:border-[#5C6B5E]",
            "placeholder:text-slate-300"
          )}
        />
      </div>

      {/* Clarity */}
      <div className="py-2">
        <ClaritySlider
          value={formData.clarity}
          onChange={(val) => updateField('clarity', val)}
        />
      </div>

      {/* Why I believe this */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Why does this idea matter to you?
        </label>
        <Textarea
          value={formData.reasoning}
          onChange={(e) => updateField('reasoning', e.target.value)}
          onFocus={() => setActiveField('reasoning')}
          placeholder="What makes this idea significant or important?"
          className={cn(
            "min-h-[80px] border-slate-200 rounded-xl resize-none",
            "focus:ring-2 focus:ring-[#5C6B5E]/20 focus:border-[#5C6B5E]",
            "placeholder:text-slate-300"
          )}
        />
      </div>

      {/* Evidence */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          What inspired this idea?
          <span className="text-slate-400 font-normal ml-1">(optional)</span>
        </label>
        <Textarea
          value={formData.evidence}
          onChange={(e) => updateField('evidence', e.target.value)}
          onFocus={() => setActiveField('evidence')}
          placeholder="What sparked or led to this idea?"
          className={cn(
            "min-h-[80px] border-slate-200 rounded-xl resize-none",
            "focus:ring-2 focus:ring-[#5C6B5E]/20 focus:border-[#5C6B5E]",
            "placeholder:text-slate-300"
          )}
        />
      </div>

      {/* What would change my mind */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          What's next for this idea?
          <span className="text-slate-400 font-normal ml-1">(optional)</span>
        </label>
        <Textarea
          value={formData.what_would_change}
          onChange={(e) => updateField('what_would_change', e.target.value)}
          onFocus={() => setActiveField('what_would_change')}
          placeholder="What steps or explorations would you take next?"
          className={cn(
            "min-h-[80px] border-slate-200 rounded-xl resize-none",
            "focus:ring-2 focus:ring-[#5C6B5E]/20 focus:border-[#5C6B5E]",
            "placeholder:text-slate-300"
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9] to-transparent pb-2 -mx-1 px-1">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className={cn(
            "flex-1 h-12 rounded-xl bg-[#5C6B5E] hover:bg-[#4a574c]",
            "text-white font-medium transition-all",
            !isValid && "opacity-50"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Save Idea"
          )}
        </Button>
      </div>
    </form>
  );
}