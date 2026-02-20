import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button.jsx";
import ThoughtForm from '@/components/beliefs/ThoughtForm.jsx';
import traceLogo from '@/images/trace.png';

export default function NewThought() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('Mutation called with data:', data);
      const result = base44.entities.Thought.create(data);
      console.log('Create result:', result);
      return result;
    },
    onSuccess: (newBelief) => {
      console.log('Mutation successful, new thought:', newBelief);
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      navigate(`/BeliefDetails?id=${newBelief.id}`);
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
              title="Back to Home"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <div>
                <p className="text-sm text-slate-500">Your ideas, examined</p>
              </div>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-12">
        <ThoughtForm
          initialData={null}
          onSubmit={createMutation.mutate}
          onCancel={() => navigate(-1)}
          isLoading={createMutation.isPending}
        />
      </main>
    </div>
  );
}