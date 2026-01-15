'use client';

import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { User, InventoryCategory } from '@/types';
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
  Check
} from 'lucide-react';
import { ManualModal } from './ManualModal';

export const InventoryView: React.FC = () => {
  const { items, isLoaded, adjustStock } = useInventory();
  const [currentUser] = useLocalStorage<User | null>('pinsetter-session', null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
  const [showManual, setShowManual] = useState(false);
  const [manualPage, setManualPage] = useState<number>(1);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

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
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${
                        item.quantity <= 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                        item.quantity <= item.minQuantity ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      }`}>
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 dark:text-white text-sm">{item.name}</div>
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
    </div>
  );
};

const AddPartModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addItem } = useInventory();
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    category: 'Other' as InventoryCategory,
    quantity: 0,
    minQuantity: 5,
    pdfPage: ''
  });

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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PDF Page</label>
              <input 
                type="number"
                value={formData.pdfPage}
                onChange={e => setFormData({...formData, pdfPage: e.target.value})}
                placeholder="14"
                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
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
