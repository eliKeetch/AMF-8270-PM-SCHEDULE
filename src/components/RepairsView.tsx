'use client';

import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { User, RepairDefinition, InventoryItem } from '@/types';
import { REPAIR_DEFINITIONS } from '@/data/repairs';
import { 
  Search, 
  Wrench, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Image as ImageIcon,
  ChevronRight,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';
import { ManualModal } from './ManualModal';

export const RepairsView: React.FC = () => {
  const { items: inventoryItems, isLoaded: isInventoryLoaded } = useInventory();
  const [currentUser] = useLocalStorage<User | null>('pinsetter-session', null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRepair, setSelectedRepair] = useState<RepairDefinition | null>(null);
  
  // Manual Modal State
  const [showManual, setShowManual] = useState(false);
  const [manualConfig, setManualConfig] = useState<{
    file: 'service' | 'parts' | 'lubrication';
    page: number;
    title: string;
  } | null>(null);

  const categories = ['All', 'Distributor', 'Pin Elevator', 'Chassis', 'Drive', 'Other'];

  const filteredRepairs = REPAIR_DEFINITIONS.filter(repair => {
    const matchesSearch = repair.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          repair.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || repair.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const checkStock = (partNumber: string, needed: number) => {
    const item = inventoryItems.find(i => i.partNumber === partNumber);
    const available = item?.quantity || 0;
    return {
      available,
      inStock: available >= needed,
      missing: Math.max(0, needed - available)
    };
  };

  const openManual = (file: 'service' | 'parts' | 'lubrication', page: number, title: string) => {
    setManualConfig({ file, page, title });
    setShowManual(true);
  };

  if (!isInventoryLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Repair Intelligence</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Step-by-step guides and part requirements</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search repairs (e.g. motor)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 bg-gray-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-80 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Repair List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-white dark:bg-slate-900 text-gray-500 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRepairs.map(repair => (
              <button
                key={repair.id}
                onClick={() => setSelectedRepair(repair)}
                className={`text-left p-6 rounded-[2rem] border-2 transition-all group ${
                  selectedRepair?.id === repair.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-blue-500 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                    selectedRepair?.id === repair.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {repair.category}
                  </span>
                  <ChevronRight size={18} className={selectedRepair?.id === repair.id ? 'text-white' : 'text-gray-300 group-hover:text-blue-500'} />
                </div>
                <h3 className="text-lg font-black leading-tight mb-2">{repair.name}</h3>
                <p className={`text-xs font-medium line-clamp-2 ${
                  selectedRepair?.id === repair.id ? 'text-blue-50' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {repair.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Repair Details */}
        <div className="lg:col-span-7">
          {selectedRepair ? (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-8 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-900/20">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">{selectedRepair.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">{selectedRepair.category} System</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                  "{selectedRepair.description}"
                </p>
              </div>

              <div className="p-8 space-y-8">
                {/* Parts Requirement */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Package size={14} /> Required Parts
                    </h4>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedRepair.requiredParts.length} Components</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedRepair.requiredParts.map(part => {
                      const stock = checkStock(part.partNumber, part.quantity);
                      return (
                        <div key={part.partNumber} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${stock.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {stock.inStock ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            </div>
                            <div>
                              <div className="text-xs font-black text-gray-900 dark:text-white uppercase">{part.name}</div>
                              <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 font-mono tracking-tight">#{part.partNumber} • Need {part.quantity}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-black ${stock.inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {stock.available} Available
                            </div>
                            {!stock.inStock && (
                              <div className="text-[9px] font-black text-red-400 uppercase tracking-tighter">Missing {stock.missing}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Documentation */}
                <section>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <BookOpen size={14} /> Technical Documentation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRepair.instructionRef && (
                      <button 
                        onClick={() => openManual('service', selectedRepair.instructionRef!.page, selectedRepair.instructionRef!.title || 'Service Instructions')}
                        className="group flex flex-col p-6 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-3xl hover:border-blue-500 transition-all text-left"
                      >
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                          <BookOpen size={20} />
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Manual</div>
                        <div className="text-sm font-black text-gray-900 dark:text-white mb-4">{selectedRepair.instructionRef.title}</div>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600">Page {selectedRepair.instructionRef.page}</span>
                          <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => openManual('parts', selectedRepair.assemblyRef.page, selectedRepair.assemblyRef.title || 'Assembly View')}
                      className="group flex flex-col p-6 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-3xl hover:border-blue-500 transition-all text-left"
                    >
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon size={20} />
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assembly Diagram</div>
                      <div className="text-sm font-black text-gray-900 dark:text-white mb-4">{selectedRepair.assemblyRef.title}</div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600">Page {selectedRepair.assemblyRef.page}</span>
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </button>
                  </div>
                </section>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 flex gap-4">
                  <div className="text-blue-600 shrink-0">
                    <Info size={24} />
                  </div>
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed uppercase tracking-tight">
                    Always cross-reference the parts with the machine's actual serial number. Some assemblies may have variations based on the installation year.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-slate-800/20 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[3rem] text-center">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm mb-6 text-gray-300 dark:text-gray-700">
                <Wrench size={48} strokeWidth={1} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Select a Repair</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs font-medium">Choose a common failure from the left to see required parts and technical instructions.</p>
            </div>
          )}
        </div>
      </div>

      {showManual && manualConfig && (
        <ManualModal 
          onClose={() => setShowManual(false)}
          initialPage={manualConfig.page}
          manualType={manualConfig.file}
          title={manualConfig.title}
        />
      )}
    </div>
  );
};
