'use client';

import React, { useState } from 'react';
import { X, FileText, ExternalLink, Droplets, Disc, Maximize2, Minimize2 } from 'lucide-react';
import { PMTask } from '@/types';

interface ManualModalProps {
  task: PMTask;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ task, onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const isOil = task.method === 'oil';
  
  const pdfPath = task.pdfRef?.file === 'lubrication' 
    ? `/files/AMF8270LubricationManual.pdf#page=${task.pdfRef.page}&navpanes=0&view=Fit`
    : `/files/8270-service-parts-manual.pdf#page=${task.pdfRef?.page || 1}&navpanes=0&view=Fit`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className={`bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
        isMaximized ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'
      }`}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isOil ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              {isOil ? <Droplets size={20} /> : <Disc size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{task.name}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {task.method === 'oil' ? 'Oil (Circle)' : 'Grease (Square)'} • Page {task.pdfRef?.page}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-gray-200 rounded-xl transition-all text-gray-400 hover:text-gray-900 hidden md:block"
            >
              {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-all text-gray-400 hover:text-gray-900">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Instructions Sidebar */}
          <div className="w-full md:w-80 p-6 bg-gray-50 border-r overflow-y-auto shrink-0">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Maintenance Instructions</h4>
            <div className="bg-white rounded-2xl p-4 border shadow-sm mb-6">
              <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                "Locate the component on page {task.pdfRef?.page}. Clean all old {task.method} from the surface before applying fresh lubricant. Ensure even coverage to prevent binding."
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-blue-600" size={20} />
                  <span className="text-xs font-black uppercase tracking-tight">Manual Source</span>
                </div>
                <p className="text-[10px] font-bold text-gray-500 leading-tight">
                  {task.pdfRef?.file === 'lubrication' ? 'AMF 82-70 Lubrication Manual' : 'AMF 82-70 Service & Parts Manual'}
                </p>
              </div>
              
              <a 
                href={pdfPath} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
              >
                Open in New Tab <ExternalLink size={14} />
              </a>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-[9px] font-bold text-blue-800 leading-relaxed uppercase">
                Safety Warning: Always disconnect main power and engage the safety interlock before reaching into the machine.
              </p>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-200 relative">
            <iframe 
              src={pdfPath}
              className="w-full h-full border-none"
              title="Manual PDF Viewer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
