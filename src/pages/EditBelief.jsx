import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import BeliefForm from '@/components/beliefs/BeliefForm';

function Button({ variant = 'default', size = 'default', className = '', onClick, children, ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default function EditBelief() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const beliefId = searchParams.get('id');

  const { data: belief, isLoading } = useQuery({
    queryKey: ['belief', beliefId],
    queryFn: () => base44.entities.Belief.findMany().then(beliefs => 
      beliefs.find(b => b.id === beliefId)
    ),
    enabled: !!beliefId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Belief.update({ where: { id: beliefId }, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['belief', beliefId] });
      queryClient.invalidateQueries({ queryKey: ['beliefs'] });
      navigate(`/BeliefDetails?id=${beliefId}`);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#5C6B5E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Edit Idea</h1>
              <p className="text-sm text-slate-500">Update your thinking</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-12">
        {belief && (
          <BeliefForm
            initialData={belief}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => navigate(-1)}
            isLoading={updateMutation.isPending}
          />
        )}
      </main>
    </div>
  );
}
