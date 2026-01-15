'use client';

import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { User, InventoryCategory, InventoryItem } from '@/types';
import { 
  Search, 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  Filter,
  History,
  MoreVertical,
  X,
  Check,
  Download,
  Upload,
  BookOpen,
  Image as ImageIcon,
  Edit3,
  Target,
  Trash2
} from 'lucide-react';
import { ManualModal } from './ManualModal';

export const InventoryView: React.FC = () => {
  const { items, isLoaded, adjustStock, addItem, updateItem, deleteItem } = useInventory();
  const [currentUser] = useLocalStorage<User | null>('pinsetter-session', null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
  const [showManual, setShowManual] = useState(false);
  const [manualPage, setManualPage] = useState<number>(1);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<InventoryItem | null>(null);

  const categories: (InventoryCategory | 'All')[] = [
    'All', 'Electrical', 'Ball Lift', 'Cushion', 'Drive', 'Distributor', 'Consumables', 'Other'
  ];

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdjustStock = async (id: string, amount: number) => {
    if (!currentUser) return;
    const reason = amount > 0 ? 'Restock' : 'Usage';
    await adjustStock(id, amount, reason, currentUser.name);
  };

  const handleStartEditing = (item: any) => {
    setEditingStockId(item.id);
    setTempStockValue(item.quantity.toString());
  };

  const handleBlurStock = async (item: any) => {
    const newValue = parseInt(tempStockValue);
    if (!isNaN(newValue) && newValue !== item.quantity) {
      const change = newValue - item.quantity;
      await adjustStock(item.id, change, 'Direct Edit', currentUser?.name || 'Unknown');
    }
    setEditingStockId(null);
  };

  const handleExportCSV = () => {
    const headers = ['Part Number', 'Name', 'Category', 'Quantity', 'Min Quantity', 'Ideal Quantity', 'PDF Page'];
    const rows = items.map(item => [
      item.partNumber,
      item.name,
      item.category,
      item.quantity,
      item.minQuantity,
      item.idealQuantity || 10,
      item.pdfPage || ''
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const part: any = {};
        headers.forEach((h, idx) => {
          part[h] = values[idx];
        });

        if (part['Part Number'] && part['Name']) {
          await addItem({
            partNumber: part['Part Number'],
            name: part['Name'],
            category: (part['Category'] || 'Other') as InventoryCategory,
            quantity: parseInt(part['Quantity']) || 0,
            minQuantity: parseInt(part['Min Quantity']) || 5,
            idealQuantity: parseInt(part['Ideal Quantity']) || 10,
            pdfPage: part['PDF Page'] ? parseInt(part['PDF Page']) : undefined
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const openManual = (page?: number) => {
    if (page) {
      setManualPage(page);
      setShowManual(true);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Parts Inventory</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage and track pinsetter spare parts</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-black transition-all"
          >
            <Download size={18} /> Export
          </button>
          <label className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer">
            <Upload size={18} /> Import
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <div className="w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search parts or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-64 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} /> Add Part
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Part Info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-5 cursor-pointer" onClick={() => setEditingPart(item)}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${
                        item.quantity <= 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                        item.quantity <= item.minQuantity ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      }`}>
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{item.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">#{item.partNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-tight text-gray-600 dark:text-gray-400">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleAdjustStock(item.id, -1)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <Minus size={14} />
                      </button>

                      <div className="w-16 flex flex-col items-center">
                        {editingStockId === item.id ? (
                          <input 
                            type="number"
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(e.target.value)}
                            onBlur={() => handleBlurStock(item)}
                            onKeyDown={(e) => e.key === 'Enter' && handleBlurStock(item)}
                            className="w-full bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-lg px-1 py-0.5 text-center font-black text-sm text-gray-900 dark:text-white outline-none"
                            autoFocus
                          />
                        ) : (
                          <div 
                            onClick={() => handleStartEditing(item)}
                            className={`text-xl font-black cursor-pointer hover:scale-110 transition-transform ${
                              item.quantity <= 0 ? 'text-red-600' :
                              item.quantity <= item.minQuantity ? 'text-amber-600' :
                              'text-gray-900 dark:text-white'
                            }`}
                          >
                            {item.quantity}
                          </div>
                        )}
                        {item.quantity <= item.minQuantity && (
                          <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-widest whitespace-nowrap">
                            <AlertTriangle size={8} /> Low Stock
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => handleAdjustStock(item.id, 1)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openManual(item.pdfPage)}
                        disabled={!item.pdfPage}
                        className={`p-2 rounded-xl transition-all ${
                          item.pdfPage 
                            ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20' 
                            : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                        }`}
                        title="View in Manual"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 font-medium italic">
                    No parts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master Catalogue Section */}
      <div className="mt-12 pt-12 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-900/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Master Parts Catalogue</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Interactive assembly browser and parts list</p>
          </div>
        </div>

        <CatalogueBrowser onAddPart={addItem} currentItems={items} onOpenManual={openManual} />
      </div>

      {showManual && (
        <ManualModal 
          onClose={() => setShowManual(false)}
          initialPage={manualPage}
          manualType="service"
          title="Parts Manual"
        />
      )}

      {showAddModal && (
        <AddPartModal 
          onClose={() => setShowAddModal(false)} 
        />
      )}

      {editingPart && (
        <EditPartModal 
          part={editingPart}
          onClose={() => setEditingPart(null)}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      )}
    </div>
  );
};

const CatalogueBrowser: React.FC<{ onAddPart: (p: any) => Promise<void>, currentItems: any[], onOpenManual: (page: number) => void }> = ({ onAddPart, currentItems, onOpenManual }) => {
  const [query, setQuery] = useState('');
  const [assemblies, setAssemblies] = useState<string[]>([]);
  const [selectedAssembly, setSelectedAssembly] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch unique assemblies on mount
  React.useEffect(() => {
    const fetchAssemblies = async () => {
      const res = await fetch('/api/inventory/catalogue?assemblies=true');
      const data = await res.json();
      setAssemblies(data);
    };
    fetchAssemblies();
  }, []);

  // Fetch parts when assembly or query changes
  React.useEffect(() => {
    const fetchParts = async () => {
      setIsSearching(true);
      try {
        let url = '/api/inventory/catalogue?';
        if (query) url += `q=${encodeURIComponent(query)}&`;
        if (selectedAssembly) url += `assembly=${encodeURIComponent(selectedAssembly)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchParts, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedAssembly]);

  const handleAddFromCatalogue = async (part: any) => {
    const category = part.assemblyTitle.includes('ELECTRICAL') ? 'Electrical' :
                    part.assemblyTitle.includes('DISTRIBUTOR') ? 'Distributor' :
                    part.assemblyTitle.includes('BALL') ? 'Ball Lift' :
                    part.assemblyTitle.includes('CUSHION') ? 'Cushion' :
                    part.assemblyTitle.includes('DRIVE') ? 'Drive' : 'Other';
    
    await onAddPart({
      partNumber: part.partNumber,
      name: part.name,
      category: category as InventoryCategory,
      quantity: 0,
      minQuantity: 5,
      idealQuantity: 10,
      pdfPage: part.pdfPage
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Assembly Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Browse Assemblies</h4>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col max-h-[800px]">
            <div className="p-2 border-b border-gray-50 dark:border-slate-800">
              <button 
                onClick={() => setSelectedAssembly(null)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  !selectedAssembly ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                ALL COMPONENTS
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {assemblies.map(assembly => (
                <button
                  key={assembly}
                  onClick={() => setSelectedAssembly(assembly)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all leading-tight ${
                    selectedAssembly === assembly 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {assembly}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Parts List Area */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={selectedAssembly ? `Search within ${selectedAssembly.toLowerCase()}...` : "Search all 2,200+ components..."}
                className="w-full bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] pl-12 pr-4 py-4 text-base font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {selectedAssembly && (
            <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Selected Assembly:</span>
              <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase">{selectedAssembly}</span>
                <button onClick={() => setSelectedAssembly(null)} className="text-blue-400 hover:text-blue-600 transition-colors">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
            {results.map(part => {
              const isAlreadyTracked = currentItems.some(i => i.partNumber === part.partNumber);
              return (
                <div 
                  key={part.partNumber} 
                  onClick={() => onOpenManual(part.pdfPage)}
                  className="bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-[2rem] p-4 hover:border-blue-500 hover:shadow-xl transition-all group flex flex-col cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2 shrink-0">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">#{part.partNumber}</span>
                    <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter truncate">Page {part.pdfPage}</span>
                  </div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white mb-4 line-clamp-2 leading-tight flex-1">{part.name}</h4>
                  <div className="flex gap-2 shrink-0 mt-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddFromCatalogue(part); }}
                      disabled={isAlreadyTracked}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        isAlreadyTracked 
                          ? 'bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                      }`}
                    >
                      {isAlreadyTracked ? <Check size={12} /> : <Plus size={12} />}
                      {isAlreadyTracked ? 'Added' : 'Add to Stock'}
                    </button>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-all shadow-sm">
                      <ImageIcon size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
            {results.length === 0 && !isSearching && (
              <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-600 font-medium italic">
                {query ? 'No matches found in the AMF 82-70 catalogue.' : 'Select an assembly to browse parts.'}
              </div>
            )}
            {isSearching && (
              <div className="col-span-full py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditPartModal: React.FC<{ part: InventoryItem, onClose: () => void, onUpdate: (id: string, updates: Partial<InventoryItem>) => Promise<void>, onDelete: (id: string) => Promise<void> }> = ({ part, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: part.name,
    partNumber: part.partNumber,
    category: part.category,
    minQuantity: part.minQuantity,
    idealQuantity: part.idealQuantity || 10,
    pdfPage: part.pdfPage?.toString() || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(part.id, {
      ...formData,
      pdfPage: formData.pdfPage ? parseInt(formData.pdfPage) : undefined
    });
    onClose();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to stop tracking ${part.name}?`)) {
      await onDelete(part.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600">
              <Edit3 size={20} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Edit Part</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Part Number</label>
              <input 
                required
                type="text"
                value={formData.partNumber}
                onChange={e => setFormData({...formData, partNumber: e.target.value})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as InventoryCategory})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Electrical">Electrical</option>
                <option value="Ball Lift">Ball Lift</option>
                <option value="Cushion">Cushion</option>
                <option value="Drive">Drive</option>
                <option value="Distributor">Distributor</option>
                <option value="Consumables">Consumables</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Part Name</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                <AlertTriangle size={10} /> Low Stock Threshold
              </label>
              <input 
                type="number"
                value={formData.minQuantity}
                onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Target size={10} /> Ideal Stock Level
              </label>
              <input 
                type="number"
                value={formData.idealQuantity}
                onChange={e => setFormData({...formData, idealQuantity: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PDF Page</label>
            <input 
              type="number"
              value={formData.pdfPage}
              onChange={e => setFormData({...formData, pdfPage: e.target.value})}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={handleDelete}
              className="p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/30"
              title="Stop Tracking Part"
            >
              <Trash2 size={20} />
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20"
            >
              Update Part
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddPartModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addItem } = useInventory();
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const [catalogueResults, setCatalogueQueryResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    category: 'Other' as InventoryCategory,
    quantity: 0,
    minQuantity: 5,
    idealQuantity: 10,
    pdfPage: ''
  });

  const handleCatalogueSearch = async (q: string) => {
    setCatalogueQuery(q);
    if (q.length < 2) {
      setCatalogueQueryResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/inventory/catalogue?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setCatalogueQueryResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCataloguePart = (part: any) => {
    setFormData({
      ...formData,
      partNumber: part.partNumber,
      name: part.name,
      pdfPage: part.pdfPage.toString(),
      // Auto-assign category based on assembly title if possible
      category: part.assemblyTitle.includes('ELECTRICAL') ? 'Electrical' :
                part.assemblyTitle.includes('DISTRIBUTOR') ? 'Distributor' :
                part.assemblyTitle.includes('BALL') ? 'Ball Lift' :
                part.assemblyTitle.includes('CUSHION') ? 'Cushion' :
                part.assemblyTitle.includes('DRIVE') ? 'Drive' : 'Other'
    });
    setCatalogueQueryResults([]);
    setCatalogueQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem({
      ...formData,
      pdfPage: formData.pdfPage ? parseInt(formData.pdfPage) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Add New Part</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 relative">
          <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest ml-1 mb-2 block">Search Master Catalogue</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              value={catalogueQuery}
              onChange={e => handleCatalogueSearch(e.target.value)}
              placeholder="Start typing part name or number..."
              className="w-full bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-blue-300 dark:placeholder:text-blue-700"
            />
          </div>
          
          {catalogueResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto">
              {catalogueResults.map(part => (
                <div 
                  key={part.partNumber}
                  onClick={() => selectCataloguePart(part)}
                  className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b border-gray-50 dark:border-slate-700 last:border-none group"
                >
                  <div className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{part.name}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono">#{part.partNumber}</span>
                    <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tight">{part.assemblyTitle}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
          <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">OR MANUAL ENTRY</span>
          <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Part Number</label>
              <input 
                required
                type="text"
                value={formData.partNumber}
                onChange={e => setFormData({...formData, partNumber: e.target.value})}
                placeholder="070-006-123"
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as InventoryCategory})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Electrical">Electrical</option>
                <option value="Ball Lift">Ball Lift</option>
                <option value="Cushion">Cushion</option>
                <option value="Drive">Drive</option>
                <option value="Distributor">Distributor</option>
                <option value="Consumables">Consumables</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Part Name</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Distributor Pinion"
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Qty</label>
              <input 
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Qty</label>
              <input 
                type="number"
                value={formData.minQuantity}
                onChange={e => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ideal Qty</label>
              <input 
                type="number"
                value={formData.idealQuantity}
                onChange={e => setFormData({...formData, idealQuantity: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PDF Page</label>
            <input 
              type="number"
              value={formData.pdfPage}
              onChange={e => setFormData({...formData, pdfPage: e.target.value})}
              placeholder="14"
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20"
            >
              Save Part
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
