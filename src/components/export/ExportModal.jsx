import React, { useState } from 'react';
import { Download, X, FileText, CheckSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

// Import Courier Prime font
const COURIER_PRIME_FONT = 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap';

export default function ExportModal({ isOpen, onClose, beliefs }) {
  const [mode, setMode] = useState('selected');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const getFilteredBeliefs = () => {
    return beliefs.filter(b => selectedIds.includes(b.id));
  };

  const toggleBelief = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(beliefs.map(b => b.id));
  const selectNone = () => setSelectedIds([]);

  const handleExport = async () => {
    setIsExporting(true);
    const beliefsToExport = getFilteredBeliefs();
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 30;
      
      // Add title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('TRACE — Your ideas, examined', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 25;
      
      // Add each belief
      beliefsToExport.forEach((belief, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 70) { // Leave space for footer
          pdf.addPage();
          yPosition = 30;
        }
        
        // Add belief title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        const title = belief.statement || belief.title || 'Untitled Idea';
        const titleLines = pdf.splitTextToSize(title, pageWidth - 40);
        
        titleLines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
        
        yPosition += 5;
        
        // Add metadata
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const createdDate = new Date(belief.created_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        let metadata = `Created ${createdDate}`;
        if (belief.clarity || belief.confidence) metadata += ` • Clarity ${belief.clarity || belief.confidence}/10`;
        pdf.text(metadata, 20, yPosition);
        yPosition += 8;
        
        // Add reasoning if exists
        if (belief.reasoning) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text('Why does this idea matter to me', 20, yPosition);
          yPosition += 6;
          
          pdf.setFont('courier', 'normal');
          const reasoningLines = pdf.splitTextToSize(belief.reasoning, pageWidth - 40);
          reasoningLines.forEach(line => {
            if (yPosition > pageHeight - 30) { // Leave space for footer
              pdf.addPage();
              yPosition = 30;
            }
            pdf.text(line, 20, yPosition);
            yPosition += 5;
          });
          yPosition += 8;
        }
        
        // Add evidence if exists
        if (belief.evidence) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text('What inspired this idea', 20, yPosition);
          yPosition += 6;
          
          pdf.setFont('courier', 'normal');
          const evidenceLines = pdf.splitTextToSize(belief.evidence, pageWidth - 40);
          evidenceLines.forEach(line => {
            if (yPosition > pageHeight - 30) { // Leave space for footer
              pdf.addPage();
              yPosition = 30;
            }
            pdf.text(line, 20, yPosition);
            yPosition += 5;
          });
          yPosition += 8;
        }
        
        // Add reflections if exist
        if (belief.reflections && belief.reflections.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text('Reflection Over Time', 20, yPosition);
          yPosition += 6;
          
          belief.reflections.forEach(reflection => {
            pdf.setFont('helvetica', 'normal');
            const refDate = new Date(reflection.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            let refText = refDate;
            if (reflection.clarity_then || reflection.confidence_then) refText += ` • Clarity ${reflection.clarity_then || reflection.confidence_then}/10`;
            if (reflection.still_believe) refText += ` • Working on it`;
            else refText += ` • Postponed`;
            
            pdf.text(refText, 25, yPosition);
            yPosition += 5;
            
            if (reflection.note) {
              pdf.setFont('courier', 'italic');
              const noteLines = pdf.splitTextToSize(reflection.note, pageWidth - 50);
              noteLines.forEach(line => {
                if (yPosition > pageHeight - 30) { // Leave space for footer
                  pdf.addPage();
                  yPosition = 30;
                }
                pdf.text(line, 25, yPosition);
                yPosition += 5;
              });
              pdf.setFont('courier', 'normal');
            }
            yPosition += 3;
          });
        }
        
        // Add spacing between beliefs
        yPosition += 15;
        
        // Add separator line
        if (index < beliefsToExport.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, yPosition, pageWidth - 20, yPosition);
          yPosition += 15;
        }
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
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `trace-export-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const filteredCount = getFilteredBeliefs().length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#5C6B5E]" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Export Thinking Report</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Belief selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Select ideas</p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-[#5C6B5E] hover:underline px-1 py-0.5">
                  Select all
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={selectNone} className="text-xs text-slate-500 hover:underline px-1 py-0.5">
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-48 sm:max-h-40 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-2">
              {beliefs.map(belief => (
                <label
                  key={belief.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(belief.id)}
                    onChange={() => toggleBelief(belief.id)}
                    className="mt-0.5 w-5 h-5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 line-clamp-2">{belief.statement}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(belief.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview count */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{filteredCount}</span> idea{filteredCount !== 1 ? 's' : ''} will be exported
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t border-slate-100 mt-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 sm:h-11 rounded-xl text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={filteredCount === 0 || isExporting}
            className="flex-1 h-10 sm:h-11 rounded-xl bg-[#5C6B5E] hover:bg-[#4a574c] text-white text-sm"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}