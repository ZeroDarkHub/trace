import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2 } from 'lucide-react';
import ConfidenceSlider from './ConfidenceSlider';
import { cn } from "@/lib/utils";

export default function RevisitPrompt({ belief, onSave, onCancel }) {
  const [workingOnIt, setWorkingOnIt] = useState(null);
  const [newConfidence, setNewConfidence] = useState(belief.confidence);
  const [reflectionNote, setReflectionNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    const newReflection = {
      date: new Date().toISOString(),
      note: reflectionNote,
      confidence_then: newConfidence,
      still_working: workingOnIt
    };

    const existingReflections = belief.reflections || [];
    
    await onSave({
      confidence: newConfidence,
      is_archived: workingOnIt === false,
      reflections: [...existingReflections, newReflection]
    });
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-1">Time to Revisit</h3>
        <p className="text-sm text-slate-500">
          It's been a while since you recorded this idea. Let's check in.
        </p>
      </div>

      {/* Still believe? */}
      <div className="space-y-3">
        <p className="text-slate-700 font-medium">Have you worked on this idea?</p>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => setWorkingOnIt(true)}
            variant={workingOnIt === true ? "default" : "outline"}
            className={cn(
              "flex-1 h-12 rounded-xl",
              workingOnIt === true 
                ? "bg-[#5C6B5E] hover:bg-[#4a574c] text-white" 
                : "border-slate-200 text-slate-600"
            )}
          >
            <Check className="w-4 h-4 mr-2" />
            Yes, I have
          </Button>
          <Button
            type="button"
            onClick={() => setWorkingOnIt(false)}
            variant={workingOnIt === false ? "default" : "outline"}
            className={cn(
              "flex-1 h-12 rounded-xl",
              workingOnIt === false 
                ? "bg-amber-500 hover:bg-amber-600 text-white" 
                : "border-slate-200 text-slate-600"
            )}
          >
            <X className="w-4 h-4 mr-2" />
            No
          </Button>
        </div>
      </div>

      {/* Confidence update */}
      {workingOnIt !== null && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-slate-700 font-medium">
            {workingOnIt 
              ? "Has your clarity changed?" 
              : "How do you feel now?"
            }
          </p>
          <div className="p-4 bg-slate-50 rounded-xl">
            <ConfidenceSlider
              value={newConfidence}
              onChange={setNewConfidence}
              compact
            />
          </div>
        </div>
      )}

      {/* Reflection note */}
      {workingOnIt !== null && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
          <label className="text-sm font-medium text-slate-700">
            what have you done? / why haven't you done anything?
            <span className="text-slate-400 font-normal ml-1">(optional)</span>
          </label>
          <Textarea
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            placeholder={workingOnIt 
              ? "What's strengthened or challenged this belief?"
              : "Where are you now with your idea?"
            }
            className={cn(
              "min-h-[80px] border-slate-200 rounded-xl resize-none",
              "focus:ring-2 focus:ring-[#5C6B5E]/20 focus:border-[#5C6B5E]",
              "placeholder:text-slate-300"
            )}
          />
        </div>
      )}

      {/* Actions */}
      {workingOnIt !== null && (
        <div className="flex gap-3 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-[#5C6B5E] hover:bg-[#4a574c] text-white"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Reflection"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}