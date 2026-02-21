import React, { useState, useRef, Fragment } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Download, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import Courier Prime font
const COURIER_PRIME_FONT = 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap';

export default function TraceReflection({ belief, onSave }) {
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState(null);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reflectionRef = useRef(null);

  // Check if user can generate a new reflection (24-hour cooldown)
  const canGenerateReflection = () => {
    // Allow generation if no current reflection exists (initial state)
    if (!reflection && belief?.ai_reflections?.length > 0) {
      const lastReflection = belief.ai_reflections[0];
      const lastTime = new Date(lastReflection.date).getTime();
      const now = Date.now();
      const hoursSince = (now - lastTime) / (1000 * 60 * 60);
      
      console.log('Using backend data:');
      console.log('- Last reflection date:', lastReflection.date);
      console.log('- Hours since:', hoursSince);
      console.log('- Can generate:', hoursSince >= 24);
      
      return hoursSince >= 24;
    }
    
    // Allow generation if no saved reflections exist
    if (!belief?.ai_reflections?.length) {
      console.log('No saved reflections, allowing new one');
      return true;
    }
    
    // Fallback to localStorage with mobile browser compatibility checks
    try {
      const storedTime = localStorage.getItem('trace_last_reflection_time');
      console.log('localStorage stored time:', storedTime);
      
      if (storedTime) {
        const lastTime = parseInt(storedTime);
        const now = Date.now();
        const hoursSince = (now - lastTime) / (1000 * 60 * 60);
        
        console.log('Using localStorage:');
        console.log('- Stored time (ms):', lastTime);
        console.log('- Hours since:', hoursSince);
        console.log('- Can generate:', hoursSince >= 24);
        
        return hoursSince >= 24;
      }
    } catch (error) {
      console.log('localStorage error:', error);
      console.log('Allowing reflection due to localStorage failure');
      return true; // Fallback: allow if localStorage fails
    }
    
    // No previous reflection found
    console.log('No previous reflection, allowing new one');
    return true;
  };

  const saveReflectionTime = () => {
    const now = Date.now();
    localStorage.setItem('trace_last_reflection_time', now.toString());
    console.log('Saved reflection time to localStorage:', new Date(now).toLocaleString());
  };

  const getTimeUntilNextReflection = () => {
    if (!belief?.ai_reflections?.length) return null;
    
    const lastReflection = belief.ai_reflections[0];
    const lastReflectionTime = new Date(lastReflection.date);
    const now = new Date();
    
    // Calculate hours difference more reliably
    const hoursSinceLastReflection = (now.getTime() - lastReflectionTime.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 24 - hoursSinceLastReflection);
    
    if (hoursRemaining >= 1) {
      return `${Math.floor(hoursRemaining)} hours`;
    } else {
      const minutesRemaining = Math.floor(hoursRemaining * 60);
      return `${minutesRemaining} minutes`;
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('Trace Reflection', pageWidth / 2, 30, { align: 'center' });
      
      // Add date
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      const savedReflection = belief?.ai_reflections?.[0];
      if (savedReflection) {
        pdf.text(new Date(savedReflection.date).toLocaleDateString(), pageWidth / 2, 45, { align: 'center' });
      }
      
      // Add reflection content
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(11);
      const content = savedReflection?.content || reflection || 'No reflection content';
      const lines = pdf.splitTextToSize(content, pageWidth - 40);
      let yPosition = 70;
      
      lines.forEach(line => {
        if (yPosition > pageHeight - 30) { // Leave space for footer
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, 20, yPosition);
        yPosition += 7;
      });
      
      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.text('TRACE — Your ideas, examined', pageWidth / 2, pageHeight - 15, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`trace-reflection-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateReflection = async () => {
    // Check 24-hour cooldown
    const canGenerate = canGenerateReflection();
    console.log('Attempting to generate reflection, canGenerate:', canGenerate);
    
    if (!canGenerate) {
      setError("A reflection is available only once a day");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReflection(null);

    const beliefContent =
      belief?.statement ||
      belief?.content ||
      belief?.text ||
      belief?.thought ||
      belief?.message ||
      belief?.description;

    if (!beliefContent) {
      setError("No belief content found. Please make sure the belief has content.");
      setIsLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
          messages: [
            {
              role: 'system',
              content: `You are a clarity assistant for TRACE. Help the user strengthen and refine their thinking. Focus on precision, coherence, and structure.

=== IDEA PROFILE ===

IDEA:
"${beliefContent}"

REASONING:
"${belief.reasoning || 'Not specified'}"

EVIDENCE:
"${belief.evidence || 'Not specified'}"

CLARITY:
${belief.clarity || belief.confidence || 'Not specified'}/10

=== TASK ===

Provide a concise reflection with two sections:

**CLARIFYING QUESTIONS**

Ask 3 focused questions that sharpen the idea by clarifying definitions, assumptions, limits, or implications.

**INSIGHTS**

Offer 2–3 reflections that improve clarity. Identify assumptions, gaps, tradeoffs, or suggest a structural refinement.

Adjust depth based on clarity:
High: test robustness.  
Medium: clarify structure.  
Low: define the core claim.

STYLE  
Concise. Clear headings. Use proper spacing between sections. Number questions clearly. Use paragraph breaks for readability. Professional and accessible tone.`,
            },
          ],
        }),
        signal: controller.signal,
      }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const reflectionContent =
        data?.choices?.[0]?.message?.content || "Reflection unavailable";

      setReflection(reflectionContent);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else if (err.name === "TypeError" || err.message?.includes("Failed to fetch")) {
        // Mobile-specific error handling
        setError("Network error on mobile. Please check your connection and try again.");
      } else {
        console.error(err);
        setError("Something interrupted the reflection. Please try again in a moment.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Try to save current reflection first, then fall back to last saved
    let reflectionToSave = reflection;
    
    // If no current reflection, use last saved one
    if (!reflectionToSave && belief?.ai_reflections?.length > 0) {
      reflectionToSave = belief.ai_reflections[belief.ai_reflections.length - 1].content;
    }
    
    if (!reflectionToSave) return;
    
    // Save timestamp to localStorage for mobile compatibility
    saveReflectionTime();
    
    const newAiReflection = {
      date: new Date().toISOString(),
      content: reflectionToSave,
    };
    
    // Save to database
    await onSave({
      ai_reflections: [newAiReflection], // overwrite old
    });
    
    // Also save to localStorage as mobile backup
    try {
      localStorage.setItem(`trace_reflection_${belief.id}`, JSON.stringify(newAiReflection));
    } catch (err) {
      console.error('localStorage backup failed:', err);
    }
    
    // Clear current reflection to return AI box to initial state
    setReflection(null);
    setError(null);
  };

  /* ===========================
     LOADING STATE
  =========================== */

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#E8EDE9] to-[#f0f4f1] rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#5C6B5E]" />
          <span className="text-slate-600">Thinking gently...</span>
        </div>
      </div>
    );
  }

  /* ===========================
     ERROR STATE
  =========================== */

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6">
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <Button
          onClick={generateReflection}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  /* ===========================
     SAVED REFLECTION VIEW
  =========================== */

  // Only show if there are saved reflections
  if (belief?.ai_reflections?.length > 0) {
    const savedReflection = belief.ai_reflections[0]; // Get the last saved reflection
    return (
      <div className="bg-gradient-to-br from-[#E8EDE9] to-[#f0f4f1] rounded-2xl p-6 space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-slate-800 mb-1">
              <span className="text-sm font-medium text-[#5C6B5E]">Trace Reflection</span>
            </h3>
            <div className="prose prose-slate max-w-none">
              <p className="text-xs text-slate-400 mb-2">
                {new Date(savedReflection.date).toLocaleDateString()}
              </p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {savedReflection.content}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                size="sm"
                className="bg-[#5C6B5E] hover:bg-[#4a574c] text-white rounded-lg"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Download'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show current unsaved reflection with save option
  if (reflection) {
    return (
      <div className="bg-gradient-to-br from-[#E8EDE9] to-[#f0f4f1] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-slate-800 mb-1">
              <span className="text-sm font-medium text-[#5C6B5E]">Trace Reflection</span>
            </h3>
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {reflection}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-[#5C6B5E] hover:bg-[#4a574c] text-white rounded-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                size="sm"
                className="bg-[#5C6B5E] hover:bg-[#4a574c] text-white rounded-lg"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Download'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===========================
     INITIAL STATE (NO REFLECTION)
  =========================== */

  return (
    <div className="bg-gradient-to-br from-[#E8EDE9] to-[#f0f4f1] rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-slate-800 mb-1">
            Trace Reflection
          </h3>

          <p className="text-sm text-slate-600 mb-4">
            Get a gentle reflection to help explore your idea. Refine 
            it, and turn inspiration into clarity.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={generateReflection}
              disabled={isLoading || !canGenerateReflection()}
              className="bg-transparent hover:bg-[#E8EDE9]/50 text-[#5C6B5E] border border-[#5C6B5E]/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isLoading ? 'Generating...' : 'Reflect with Trace'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
