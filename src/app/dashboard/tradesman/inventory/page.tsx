'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Hammer
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInventory, upsertInventoryItem, InventoryItem } from '@/lib/db';
import { UNIT_TYPES, UnitTypeId, TIER_CONFIG } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadInventory();
  }, [user]);

  const loadInventory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getInventory(user.uid);
      setItems(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingItem) return;

    // Check limits for new items
    if (!editingItem.id && profile?.tier) {
      const tier = profile.tier as keyof typeof TIER_CONFIG;
      const tierConfig = TIER_CONFIG[tier] as any;
      const limit = tierConfig.maxItems || 0;
      if (items.length >= limit) {
        setError(`Mission Aborted: Your ${TIER_CONFIG[tier].name} tier is limited to ${limit} items. Upgrade to Legend for 500 items.`);
        return;
      }
    }

    try {
      const saved = await upsertInventoryItem(user.uid, editingItem);
      if (editingItem.id) {
        setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
      } else {
        setItems(prev => [...prev, saved]);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setError(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const calculateProfit = (item: Partial<InventoryItem>) => {
    const cost = item.costExcl || 0;
    const sellingIncl = item.sellingIncl || 0;
    const sellingExcl = sellingIncl / 1.15;
    const profit = sellingExcl - cost;
    const gp = sellingExcl > 0 ? (profit / sellingExcl) * 100 : 0;
    const markup = cost > 0 ? (profit / cost) * 100 : 0;
    return { gp, markup, profit };
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-3 italic">
            <span className="w-8 h-[2px] bg-primary"></span>
            Professional Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4 uppercase italic">
            Hero <span className="text-primary">Inventory</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Manage your materials, track cost structures, and maximize your profit margins.
          </p>
        </div>
        <button 
          onClick={() => { setEditingItem({ unitType: 'unit', stockLevel: 0 }); setIsModalOpen(true); setError(null); }}
          className="flex items-center gap-4 px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all self-start"
        >
          <Plus className="w-5 h-5" />
          Create New Stock Item
        </button>
      </div>

      {/* Analytics Mini-Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <Package className="w-7 h-7" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Stock Items</p>
               <p className="text-2xl font-black text-slate-900 tracking-tighter">{items.length} <span className="text-sm">Listed</span></p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
               <TrendingUp className="w-7 h-7" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Avg Markup</p>
               <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  {(items.reduce((acc, curr) => acc + calculateProfit(curr).markup, 0) / (items.length || 1)).toFixed(1)}%
               </p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
               <DollarSign className="w-7 h-7" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Asset Value (Excl)</p>
               <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  R {items.reduce((acc, curr) => acc + (curr.costExcl * curr.stockLevel), 0).toLocaleString()}
               </p>
            </div>
         </div>
      </div>

      {/* Search & Filter */}
      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
         <input 
           type="text"
           placeholder="Search inventory items..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full bg-white border border-slate-200 p-6 rounded-[2rem] pl-16 text-sm font-bold outline-none focus:border-primary transition-all shadow-sm group-hover:shadow-md"
         />
      </div>

      {/* Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Initializing Logistics Engine...</p>
          </div>
        ) : filteredItems.map((item, index) => {
          const stats = calculateProfit(item);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{item.name}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 italic">
                       {UNIT_TYPES.find(u => u.id === item.unitType)?.label}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); setError(null); }}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Selling (Incl)</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">R {item.sellingIncl.toFixed(2)}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl relative">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Stock Level</p>
                      <p className={`text-lg font-black tracking-tight ${item.stockLevel < 0 ? 'text-primary' : 'text-slate-900'}`}>
                         {item.stockLevel}
                      </p>
                      {item.stockLevel < 0 && (
                         <div className="absolute top-2 right-2">
                            <AlertCircle className="w-3.5 h-3.5 text-primary animate-pulse" />
                         </div>
                      )}
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] font-black text-slate-900 uppercase italic">Profit Analysis</p>
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase italic">
                         GP: R {stats.profit.toFixed(2)} ({stats.gp.toFixed(1)}%)
                      </span>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                         <span>Cost (Excl)</span>
                         <span className="text-slate-600 italic">R {item.costExcl.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                         <span>Markup</span>
                         <span className="text-accent italic">R {stats.profit.toFixed(2)} ({stats.markup.toFixed(1)}%)</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {!loading && filteredItems.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-8 opacity-20 text-slate-900">
                <Hammer className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2 italic">Zero Logistics Data</h3>
             <p className="text-slate-500 font-medium max-w-sm lowercase">Start your inventory by adding your first material or service item.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-w-xl w-full bg-white rounded-[3.5rem] p-12 shadow-2xl relative z-10 overflow-hidden"
            >
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="absolute top-10 right-10 p-2 text-slate-400 hover:text-primary transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>

               <div className="mb-10 text-center">
                  <h2 className="text-3xl font-black uppercase tracking-tight italic mb-2">
                    {editingItem?.id ? 'Adjust' : 'Create New'} <span className="text-primary">Stock Item</span>
                  </h2>
                  <p className="text-slate-500 font-medium text-xs lowercase">Configure material logistics and pricing structures.</p>
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
                       placeholder="e.g. Premium Ceramic Tiles"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Measurement Unit</label>
                       <select 
                         value={editingItem?.unitType || 'unit'}
                         onChange={(e) => setEditingItem({ ...editingItem, unitType: e.target.value as UnitTypeId })}
                         className="w-full bg-slate-50 border-transparent p-6 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
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

                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
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

                   {editingItem?.costExcl && editingItem?.sellingIncl && (
                    <div className="flex flex-col gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white border border-white/5 shadow-2xl">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                <TrendingUp className="w-6 h-6" />
                             </div>
                             <div className="text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Profit Projection</p>
                                <p className="text-2xl font-black tracking-tighter text-white">R {calculateProfit(editingItem).profit.toFixed(2)} <span className="text-[10px] opacity-40 uppercase italic">per {UNIT_TYPES.find(u => u.id === editingItem.unitType)?.short}</span></p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-primary font-black italic tracking-tight text-xl">{calculateProfit(editingItem).gp.toFixed(1)}% GP</p>
                             <p className="text-accent font-black text-[10px] uppercase tracking-widest italic">{calculateProfit(editingItem).markup.toFixed(1)}% MKUP</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                          <div>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">GP (Rand Value)</p>
                             <p className="text-lg font-black text-primary italic">R {calculateProfit(editingItem).profit.toFixed(2)}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Markup (Rand Value)</p>
                             <p className="text-lg font-black text-accent italic">R {calculateProfit(editingItem).profit.toFixed(2)}</p>
                          </div>
                       </div>
                    </div>
                  )}

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4 text-primary"
                    >
                       <AlertCircle className="w-6 h-6 shrink-0" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest italic mb-1">Authorization Denied</p>
                          <p className="text-sm font-bold italic leading-tight">{error}</p>
                          <button 
                            type="button"
                            onClick={() => router.push('/dashboard/tradesman/welcome')}
                            className="mt-3 text-[9px] font-black uppercase underline tracking-[0.2em]"
                          >
                             Elevate Tier Priority
                          </button>
                       </div>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20"
                  >
                    Confirm Configuration
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
