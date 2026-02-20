import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Clock, 
  RefreshCw,
  Archive,
  RotateCcw,
  Loader2,
  AlertCircle,
  Sparkles,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfidenceSlider from '@/components/beliefs/ConfidenceSlider';
import TraceReflection from '@/components/beliefs/TraceReflection';
import RevisitPrompt from '@/components/beliefs/RevisitPrompt';
import { cn } from "@/lib/utils";

const motivationalMessages = [
  "This idea has been waiting for your attention. Sometimes the best insights come when you return with fresh eyes.",
  "You've postponed this idea several times. What small step could you take today to move it forward?",
  "Every great idea needs time to marinate. Perhaps now is the moment to revisit what inspired you initially.",
  "This idea keeps showing up for a reason. What would make it feel exciting to work on again?",
  "You've put this on pause multiple times. What would make this the time you actually move forward?",
  "Ideas that survive postponement often have real potential. What's one thing you could try differently?",
  "This idea has been patient with you. Maybe it's time to give it some focused attention.",
  "You've reflected on this idea many times without acting. What would make this reflection the one that leads to action?",
  "Some ideas need to wait for the right moment. Could this be that moment?",
  "This idea has been gathering dust. What would it take to polish it up and see where it leads?",
  "The fact that this idea keeps returning suggests it has something valuable to teach you.",
  "You've given this idea multiple chances to breathe. What if today you gave it a chance to grow?",
  "This idea has survived your procrastination. That might mean it's worth the effort.",
  "Sometimes the hardest ideas are the ones most worth pursuing. What if this is one of those?",
  "You've been circling this idea for a while. What would happen if you finally committed to it?",
  "This idea has been waiting patiently. What would it look like to give it your full attention?",
  "The pattern of postponement might be telling you something important about this idea.",
  "You've been thoughtful about when to work on this. Maybe now is that thoughtful moment.",
  "This idea has outlasted many of your other priorities. What does that tell you about its importance?",
  "Every time you postpone, this idea proves its resilience. What would it look like to honor that persistence?"
];

function getRandomMotivationalMessage() {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[randomIndex];
}

const consistentWorkMessages = [
  "TRACE notices your dedication to this idea. Your consistent effort is building something meaningful.",
  "You've shown up for this idea repeatedly. That kind of persistence creates real progress.",
  "The way you keep returning to this idea shows it truly matters to you.",
  "Your commitment to developing this idea is impressive. Each reflection adds another layer of understanding.",
  "TRACE sees how you've nurtured this idea over time. That's what turns thoughts into reality.",
  "You've been faithful to this idea's growth. That kind of attention is rare and valuable.",
  "The pattern of your engagement with this idea reveals deep commitment. Keep building on this momentum.",
  "TRACE recognizes the care you've given this idea. Your consistent work is paying off.",
  "You've treated this idea like a garden, tending to it regularly. The growth is showing.",
  "Your dedication to this idea through multiple reflections shows real character. That's how breakthroughs happen.",
  "The way you keep showing up for this idea proves its importance. Don't underestimate what you're building.",
  "TRACE has watched you invest in this idea consistently. That investment is creating compound returns.",
  "Your repeated engagement with this idea demonstrates true ownership. That's the foundation of mastery.",
  "You've been a good steward of this idea's development. Your patience and persistence are admirable.",
  "The consistency of your work on this idea is remarkable. You're turning inspiration into substance.",
  "TRACE sees how you've honored this idea with your attention. That respect is creating real value.",
  "You've been building this idea brick by brick. Each reflection adds another layer to the foundation.",
  "Your sustained effort on this idea shows you understand that great things take time.",
  "The way you keep returning to this idea with fresh insights shows real wisdom. Keep that rhythm going.",
  "TRACE has observed your consistent growth with this idea. You're developing both the idea and yourself."
];

function getConsistentWorkMessage() {
  const randomIndex = Math.floor(Math.random() * consistentWorkMessages.length);
  return consistentWorkMessages[randomIndex];
}

export default function BeliefDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const beliefId = searchParams.get('id');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [showRevisit, setShowRevisit] = useState(false);

  const { data: belief, isLoading, error } = useQuery({
    queryKey: ['ideas', beliefId],
    queryFn: () => base44.entities.Thought.list().then(ideas => {
      console.log('All ideas:', ideas);
      const found = ideas.find(t => t.id === beliefId);
      console.log('Found idea:', found);
      console.log('AI reflections in found idea:', found?.ai_reflections);
      return found;
    }),
    enabled: !!beliefId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      console.log('Trace Reflection save called with:', { beliefId, data });
      const result = base44.entities.Thought.update({ where: { id: beliefId }, data });
      console.log('Trace Reflection save result:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Trace Reflection save successful');
      // Invalidate and refetch to ensure data persistence
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.refetchQueries({ queryKey: ['ideas', beliefId] });
      setShowRevisit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Thought.delete({ where: { id: beliefId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      setIsDeleteDialogOpen(false);
      navigate('/Home');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#5C6B5E]" />
      </div>
    );
  }

  if (error || !belief) {
    console.log('Error or no belief:', { error, belief });
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-600 mb-4">Couldn't find this belief</p>
        <Button onClick={() => navigate('/Home')} variant="outline">
          Go back
        </Button>
      </div>
    );
  }

  console.log('Rendering belief:', belief);

  const getConfidenceColor = (val) => {
    if (val <= 3) return "text-amber-600 bg-amber-50";
    if (val <= 5) return "text-slate-600 bg-slate-50";
    if (val <= 7) return "text-emerald-600 bg-emerald-50";
    return "text-emerald-700 bg-emerald-100";
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/Home')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/EditBelief?id=${beliefId}`)}
                className="rounded-full"
                title="Edit Idea"
              >
                <Pencil className="w-4 h-4 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsDeleteDialogOpen(false)}
          />
          <div className="relative bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete this idea?</h2>
            <p className="text-gray-600 mb-6">
              This will permanently remove this idea and all its reflections.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Status badge */}
        {belief.is_archived && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Archive className="w-3 h-3 mr-1" />
            No longer held
          </Badge>
        )}

        {/* Main belief */}
        <div>
          {/* Motivational message based on current status */}
          {belief.reflections?.length >= 3 && (
            (() => {
              const mostRecent = belief.reflections[belief.reflections.length - 1];
              const isCurrentlyPostponed = !mostRecent.still_working;
              const postponedCount = belief.reflections.filter(ref => !ref.still_working).length;
              const consistentCount = belief.reflections.filter(ref => ref.still_working).length;
              
              if (isCurrentlyPostponed && postponedCount >= 3) {
                return (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-200 p-4 mb-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 mt-1" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium leading-relaxed">
                          {getRandomMotivationalMessage()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } else if (!isCurrentlyPostponed && consistentCount >= 3) {
                return (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-200 p-4 mb-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600 mt-1" />
                      <div>
                        <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                          {getConsistentWorkMessage()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}
          
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(belief.created_date), 'MMMM d, yyyy')}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(belief.created_date), { addSuffix: true })}</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 leading-relaxed">
            {belief.statement}
          </h1>
        </div>

        {/* Confidence */}
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full",
          getConfidenceColor(belief.confidence)
        )}>
          <span className="text-lg font-semibold">{belief.confidence}/10</span>
          <span className="text-sm">confidence</span>
        </div>

        {/* Sections */}
        {belief.reasoning && (
          <Section title="Why does this idea matter to me">
            <p className="text-slate-700 leading-relaxed">{belief.reasoning}</p>
          </Section>
        )}

        {belief.evidence && (
          <Section title="What inspired this idea">
            <p className="text-slate-700 leading-relaxed">{belief.evidence}</p>
          </Section>
        )}

        {belief.what_would_change && (
          <Section title="What's next for this idea">
            <p className="text-slate-700 leading-relaxed">{belief.what_would_change}</p>
          </Section>
        )}

        {/* Trace Reflection */}
        {!belief.is_archived && (
          <TraceReflection
            belief={belief}
            onSave={(data) => updateMutation.mutate(data)}
          />
        )}

        {/* Reflections history */}
        {belief.reflections?.length > 0 && (
          <Section title="Reflection history">
            <div className="space-y-4">
              {belief.reflections.slice().reverse().map((ref, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">
                      {format(new Date(ref.date), 'MMM d, yyyy')}
                    </span>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      ref.still_working 
                        ? "border-emerald-200 text-emerald-600" 
                        : "border-amber-200 text-amber-600"
                    )}>
                      {ref.still_working ? "Working on it" : "Postpone"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Clarity: {ref.confidence_then}/10
                  </p>
                  {ref.note && (
                    <p className="text-slate-700 text-sm">{ref.note}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Revisit prompt */}
        {showRevisit ? (
          <RevisitPrompt
            belief={belief}
            onSave={(data) => updateMutation.mutate(data)}
            onCancel={() => setShowRevisit(false)}
          />
        ) : (
          <Button
            onClick={() => setShowRevisit(true)}
            variant="outline"
            className="w-full h-14 rounded-xl border-[#5C6B5E]/30 text-[#5C6B5E] hover:bg-[#E8EDE9]"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Revisit this idea
          </Button>
        )}

        {/* Restore button for archived */}
        {belief.is_archived && (
          <Button
            onClick={() => updateMutation.mutate({ is_archived: false })}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Last reflection
          </Button>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  );
}