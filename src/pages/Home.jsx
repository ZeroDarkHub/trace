import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/lib/utils';
import { Plus, BookOpen, Sparkles, ArrowRight, Loader2, Download, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BeliefCard from '@/components/beliefs/BeliefCard';
import ExportModal from '@/components/export/ExportModal.jsx';
import { cn } from "@/lib/utils";

export default function Home() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'archived'
  const [showExport, setShowExport] = useState(false);

  const { data: beliefs = [], isLoading } = useQuery({
    queryKey: ['beliefs'],
    queryFn: () => base44.entities.Thought.list('-created_date', 100),
  });

  // Check if user can add more beliefs (limit to 5)
  const canAddBelief = beliefs.length < 5;
  const activeBeliefs = beliefs.filter(b => !b.is_archived);
  const canAddActiveBelief = activeBeliefs.length < 5;

  const filteredBeliefs = beliefs.filter(b => {
    if (filter === 'active') {
      // Show ideas that are currently being worked on
      if (b.reflections && b.reflections.length > 0) {
        const mostRecent = b.reflections[b.reflections.length - 1];
        return mostRecent.still_working; // Currently working on it
      }
      return true; // No reflections means it's still active
    }
    if (filter === 'archived') {
      // Show ideas that are currently postponed
      if (b.reflections && b.reflections.length > 0) {
        const mostRecent = b.reflections[b.reflections.length - 1];
        return !mostRecent.still_working; // Postponed
      }
      return false; // No reflections means not postponed
    }
    return true; // 'all' shows everything
  });

  const activeCount = beliefs.filter(b => !b.is_archived).length;
  const archivedCount = beliefs.filter(b => b.is_archived).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#5C6B5E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/Welcome')}
                className="rounded-full"
                title="Go to Welcome Page"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </div>
            {beliefs.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExport(true)}
                className="rounded-full"
              >
                <Download className="w-5 h-5 text-slate-600" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        beliefs={beliefs}
      />

      <main className="max-w-lg mx-auto px-4 pb-32">
        {/* Empty state */}
        {beliefs.length === 0 && (
          <div className="pt-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#E8EDE9] to-[#d4ddd6] flex items-center justify-center">
              <img src="/images/trace.png" alt="TRACE" className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Start Your First Idea
            </h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              Record you're idea and why. Come back later to see how your thinking evolves.
            </p>
            <Button
              onClick={() => navigate('/NewThought')}
              className="h-12 px-6 bg-[#5C6B5E] hover:bg-[#4a574c] text-white rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Idea
            </Button>
          </div>
        )}

        {/* Ideas list */}
        {beliefs.length > 0 && (
          <>
            {/* Limit indicator */}
            <div className="py-4 text-center">
              <p className="text-sm text-slate-500">
                {activeBeliefs.length}/5
                {activeBeliefs.length >= 5 && (
                  <span className="ml-2 text-amber-600">• Limit Reached</span>
                )}
              </p>
            </div>

            {/* Stats */}
            <div className="py-6 flex items-center gap-4">
              <div className="flex-1 p-4 bg-white rounded-xl border border-slate-100">
                <p className="text-2xl font-semibold text-slate-800">{activeCount}</p>
                <p className="text-sm text-slate-500">Active ideas</p>
              </div>
              <div className="flex-1 p-4 bg-white rounded-xl border border-slate-100">
                <p className="text-2xl font-semibold text-slate-800">
                  {beliefs.reduce((sum, b) => sum + (b.reflections?.length || 0), 0)}
                </p>
                <p className="text-sm text-slate-500">Reflections</p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'archived', label: 'Postponed Ideas' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    filter === key
                      ? "bg-[#5C6B5E] text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Ideas */}
            <div className="space-y-3">
              {filteredBeliefs.map((belief) => (
                <BeliefCard
                  key={belief.id}
                  belief={belief}
                  onClick={() => navigate(`/BeliefDetails?id=${belief.id}`)}
                />
              ))}
            </div>

            {filteredBeliefs.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No ideas in this category Yet
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating action button */}
      {beliefs.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
          <Button
            onClick={() => {
              if (canAddActiveBelief) {
                navigate('/NewThought');
              }
            }}
            disabled={!canAddActiveBelief}
            className="h-14 px-6 bg-[#5C6B5E] hover:bg-[#4a574c] text-white rounded-full shadow-lg shadow-[#5C6B5E]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            {canAddActiveBelief ? 'New Idea' : 'Limit Reached (5)'}
          </Button>
        </div>
      )}
    </div>
  );
}