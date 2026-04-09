import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle } from 'lucide-react';
import { UNIT_TYPES, UnitTypeId } from '@/lib/constants';
import { upsertInventoryItem, InventoryItem } from '@/lib/db';

interface QuickAddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: (item: InventoryItem) => void;
}

export function QuickAddStockModal({ isOpen, onClose, userId, onSuccess }: QuickAddStockModalProps) {
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem>>({
    name: '',
    unitType: 'unit',
    stockLevel: 0,
    costExcl: 0,
    sellingIncl: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const calculateProfit = (item: Partial<InventoryItem>) => {
    const cost = item.costExcl || 0;
    const sellingIncl = item.sellingIncl || 0;
    const sellingExcl = sellingIncl / 1.15;
    const profit = sellingExcl - cost;
    const gp = sellingExcl > 0 ? (profit / sellingExcl) * 100 : 0;
    const markup = cost > 0 ? (profit / cost) * 100 : 0;
    return { gp, markup, profit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await upsertInventoryItem(userId, editingItem);
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="max-w-xl w-full bg-white rounded-[3.5rem] p-12 shadow-2xl relative z-10 overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-10 right-10 p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight italic mb-2">
            Quick Add <span className="text-primary">Stock</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Product Name</label>
             <input 
               type="text"
               required
               value={editingItem?.name || ''}
               onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
               className="w-full bg-slate-50 border-transparent p-6 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
               placeholder="e.g. Copper Pipe"
             />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Measurement</label>
               <select 
                 value={editingItem?.unitType || 'unit'}
                 onChange={(e) => setEditingItem({ ...editingItem, unitType: e.target.value as UnitTypeId })}
                 className="w-full bg-slate-50 border-transparent p-6 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all"
               >
                 {UNIT_TYPES.map(u => (
                   <option key={u.id} value={u.id}>{u.label}</option>
                 ))}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Initial Stock</label>
               <input 
                 type="number"
                 required
                 value={editingItem?.stockLevel || 0}
                 onChange={(e) => setEditingItem({ ...editingItem, stockLevel: parseInt(e.target.value) })}
                 className="w-full bg-slate-50 border-transparent p-6 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1 text-accent">Cost Price (Excl)</label>
               <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R</span>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={editingItem?.costExcl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, costExcl: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border-transparent p-6 rounded-2xl pl-12 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1 text-primary">Selling (Incl)</label>
               <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R</span>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={editingItem?.sellingIncl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, sellingIncl: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border-transparent p-6 rounded-2xl pl-12 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                  />
               </div>
            </div>
          </div>

          {editingItem?.costExcl && editingItem?.sellingIncl ? (
             <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <TrendingUp className="w-5 h-5" />
                   </div>
                   <div className="text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Proj. Profit</p>
                      <p className="text-xl font-black tracking-tighter text-white">R {calculateProfit(editingItem).profit.toFixed(2)}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-primary font-black italic tracking-tight">{calculateProfit(editingItem).gp.toFixed(1)}% GP</p>
                   <p className="text-accent font-black text-[9px] uppercase tracking-widest italic">{calculateProfit(editingItem).markup.toFixed(1)}% MKUP</p>
                </div>
             </div>
          ) : null}

          <button 
            type="submit"
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
          >
            Create & Inject
          </button>
        </form>
      </motion.div>
    </div>
  );
}
