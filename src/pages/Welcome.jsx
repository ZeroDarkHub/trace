
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import traceLogo from '@/images/trace.png';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      
      {/* Header */}
      {/* <header className="sticky top-0 left-0 right-0 bg-[#FAFAF8]/95 backdrop-blur-sm z-50 px-6">
        <div className="flex items-center h-16">
          <img 
            src={traceLogo}
            alt="TRACE Logo" 
            className="w-12 h-12"
          />
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pt-36 text-center">
        
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-[#5C6B5E] mb-2">
          TRACE
        </h1>
        <p className="text-sm text-slate-600 mb-10">
          Your ideas, examined
        </p>

        {/* Description */}
        <p className="text-[#1E1E1E]/70 leading-relaxed mb-12 max-w-xs">
          Capture you're idea, why it matters, and how it evolves over time.
A private space to think bigger, refine concepts, and turn inspiration into clarity.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate(createPageUrl('NewThought'))}
          className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#1E1E1E] rounded-lg text-[#1E1E1E] text-sm tracking-wide hover:bg-[#1E1E1E] hover:text-[#FAFAF8] transition-colors"
        >
          <span className="text-lg font-light">+</span>
          <span>New Idea</span>
        </button>
      </main>

      <div className="h-20" />
    </div>
  );
}