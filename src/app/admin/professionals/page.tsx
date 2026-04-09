'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin, 
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { getUsersByRole, updateUserProfile, UserProfile } from '@/lib/db';
import { TIER_CONFIG, TierId } from '@/lib/constants';

export default function AdminProfessionalsPage() {
  const [pros, setPros] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierId | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPros();
  }, []);

  const loadPros = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole('tradesman');
      setPros(data);
    } catch (error) {
      console.error('Error loading pros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = async (userId: string, newTier: TierId) => {
    setUpdatingId(userId);
    try {
      await updateUserProfile(userId, { tier: newTier });
      setPros(prev => prev.map(p => p.id === userId ? { ...p, tier: newTier } : p));
    } catch (error) {
      console.error('Error updating tier:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPros = pros.filter(pro => {
    const matchesSearch = pro.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pro.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pro.trade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'all' || pro.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-3 italic">
            <span className="w-8 h-[2px] bg-primary"></span>
            Fleet Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4 uppercase italic">
            Professional <span className="text-primary">Fleet</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Authorize, verify, and scale the professional hierarchy of the Fix Link marketplace.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm self-start">
           <div className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic">
              {filteredPros.length} Active Heroes
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
           <input 
             type="text"
             placeholder="Search by name, business, or trade..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white border border-slate-200 p-6 rounded-[2rem] pl-16 text-sm font-bold outline-none focus:border-primary transition-all shadow-sm group-hover:shadow-md"
           />
        </div>
        <div className="flex gap-3">
           {(['all', 'starter', 'missing', 'legend'] as const).map((tier) => (
             <button
               key={tier}
               onClick={() => setSelectedTier(tier)}
               className={`px-8 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all border ${
                 selectedTier === tier 
                 ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' 
                 : 'bg-white border-slate-100 text-slate-400 hover:border-primary hover:text-primary'
               }`}
             >
               {tier}
             </button>
           ))}
        </div>
      </div>

      {/* Pros Table / List */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Scanning Professional Fleet...</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Hero Identity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Specialization</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Current Tier</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPros.map((pro, index) => (
                  <motion.tr 
                    key={pro.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm relative group-hover:scale-110 transition-transform">
                          <img src={pro.imageUrl || `https://i.pravatar.cc/150?u=${pro.id}`} alt="" />
                          {pro.onboardingCompleted && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic">{pro.fullName}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{pro.businessName || pro.companyName || 'Individual Trader'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Hammer className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{pro.trade || 'Generalist'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                         <MapPin className="w-3.5 h-3.5" />
                         {pro.address?.split(',')[0] || 'Location Pending'}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            pro.tier === 'legend' ? 'bg-accent/10 border-accent text-accent' :
                            pro.tier === 'missing' ? 'bg-primary/10 border-primary text-primary' :
                            'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                            {pro.tier ? TIER_CONFIG[pro.tier].name : 'Link Starter'}
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <select 
                            value={pro.tier || 'starter'}
                            disabled={updatingId === pro.id}
                            onChange={(e) => handleTierChange(pro.id, e.target.value as TierId)}
                            className="bg-slate-50 border-slate-200 text-[10px] font-black uppercase tracking-widest p-3 rounded-xl outline-none focus:border-primary disabled:opacity-50 transition-all cursor-pointer"
                          >
                             <option value="starter">Promote to Starter</option>
                             <option value="missing">Promote to Missing</option>
                             <option value="legend">Elevate to Legend</option>
                          </select>
                          <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                             <MoreVertical className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredPros.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center px-10">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-8 opacity-20">
                <Hammer className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2 italic">Zero Heroes Found</h3>
             <p className="text-slate-500 font-medium max-w-sm lowercase">We couldn't find any professionals matching these criteria. Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px] mb-6 italic">
               <Zap className="w-4 h-4 shadow-glow" />
               Hierarchy Enforcement
            </div>
            <h3 className="text-white font-black text-2xl tracking-tighter mb-4 uppercase italic">Hero <span className="text-primary">Status Console</span></h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed italic mb-8">
               Remember: Tier upgrades grant extended service radii (up to 70km) and billing autonomy. Upgrades should only be authorized after identity verification.
            </p>
            <div className="flex items-center gap-4">
               <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-300 uppercase italic">
                  Verification Buffer: 98%
               </div>
               <button className="px-8 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Global Sync
               </button>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] -mr-16 -mt-16"></div>
            <div className="flex items-center gap-1.5 text-accent font-black uppercase tracking-widest text-[10px] mb-6 italic">
               <ShieldCheck className="w-4 h-4" />
               Safety Protocols
            </div>
            <h3 className="text-slate-900 font-black text-2xl tracking-tighter mb-4 uppercase italic">Auto <span className="text-accent">Verification</span></h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic mb-10">
               Fix Link AI scanning is currently analyzing 24 background checks. Professionals with flagged identity documents will be auto-suspended.
            </p>
            <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-slate-800 transition-all group flex items-center justify-center gap-3">
               Review Pending Verifications
               <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
         </div>
      </div>
    </div>
  );
}
