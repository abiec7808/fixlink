'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Shield, 
  ShieldCheck,
  LayoutDashboard, 
  UserCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getUsersByRole, UserProfile } from '@/lib/db';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pros' | 'customers'>('pros');
  const [pros, setPros] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (user) loadData();
  }, [user, profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prosData, customersData] = await Promise.all([
        getUsersByRole('tradesman'),
        getUsersByRole('customer')
      ]);
      setPros(prosData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = (activeTab === 'pros' ? pros : customers).filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Overlay for Mobile */}
      
      {/* Persistent Left Sidebar */}
      <div className="w-80 bg-slate-900 h-screen sticky top-0 border-r border-white/5 flex flex-col p-8 overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16 opacity-50"></div>
         
         <div className="relative mb-12 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
               <Shield className="w-6 h-6 shadow-glow" />
            </div>
            <div>
               <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Fix <span className="text-primary">Admin</span></h2>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Mission Control</p>
            </div>
         </div>

         <nav className="space-y-4 flex-1">
            <button 
              onClick={() => setActiveTab('pros')}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all group ${activeTab === 'pros' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}
            >
               <Briefcase className={`w-5 h-5 ${activeTab === 'pros' ? 'text-white' : 'group-hover:text-primary transition-colors'}`} />
               <span className="text-[11px] font-black uppercase tracking-widest italic">Professionals</span>
            </button>
            <button 
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all group ${activeTab === 'customers' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}
            >
               <Users className={`w-5 h-5 ${activeTab === 'customers' ? 'text-white' : 'group-hover:text-primary transition-colors'}`} />
               <span className="text-[11px] font-black uppercase tracking-widest italic">Customers</span>
            </button>
         </nav>

         <div className="mt-auto p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Authenticated User</p>
            <p className="text-xs font-bold text-white mb-4">{profile?.fullName}</p>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500/20 hover:text-red-500 transition-all border border-transparent hover:border-red-500/30"
            >
               Leave Terminal
            </button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
         <div className="max-w-6xl mx-auto space-y-12">
            {/* Top Stat Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center gap-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                     <Users className="w-8 h-8" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Ecosystem</p>
                     <p className="text-3xl font-black text-slate-900 tracking-tighter">{pros.length + customers.length} Heroes</p>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center gap-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Briefcase className="w-8 h-8" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Active Pros</p>
                     <p className="text-3xl font-black text-slate-900 tracking-tighter">{pros.length}</p>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center gap-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400">
                     <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Security Status</p>
                     <p className="text-3xl font-black text-slate-900 tracking-tighter">Verified</p>
                  </div>
               </div>
            </div>

            {/* List Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div>
                  <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                     Hero <span className="text-primary">{activeTab === 'pros' ? 'Directory' : 'Network'}</span>
                  </h1>
                  <p className="text-slate-500 font-medium italic">Managing registered {activeTab === 'pros' ? 'professionals' : 'customers'} within the Fix Link ecosystem.</p>
               </div>
               
               <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder={`Search ${activeTab === 'pros' ? 'pros' : 'customers'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-100 p-6 rounded-[2rem] pl-16 text-sm font-bold shadow-sm outline-none focus:border-primary transition-all"
                  />
               </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                           <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Identity</th>
                           <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Contact & Mission</th>
                           <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status/Tier</th>
                           <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Oversight</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        <AnimatePresence mode="popLayout">
                           {filteredData.map((hero) => (
                              <motion.tr 
                                key={hero.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="hover:bg-slate-50/50 transition-colors group"
                              >
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-6">
                                       <div className="w-14 h-14 bg-slate-100 rounded-[1.2rem] flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform overflow-hidden font-black">
                                          {hero.imageUrl ? (
                                             <img src={hero.imageUrl} alt={hero.fullName} className="w-full h-full object-cover" />
                                          ) : (
                                             hero.fullName.charAt(0)
                                          )}
                                       </div>
                                       <div>
                                          <p className="text-lg font-black text-slate-900 tracking-tight italic uppercase">{hero.fullName}</p>
                                          <p className="text-[10px] font-bold text-slate-400 lowercase">{hero.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <div className="space-y-1">
                                       <p className="text-xs font-bold text-slate-700">{hero.trade || (hero.role === 'admin' ? 'Elite Admin' : 'Registered Client')}</p>
                                       <p className="text-[10px] font-medium text-slate-400 italic">Registered: {new Date(hero.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    {hero.role === 'tradesman' ? (
                                       <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${
                                          hero.tier === 'legend' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                                          hero.tier === 'missing' ? 'bg-primary/10 border-primary/20 text-primary' : 
                                          'bg-slate-100 border-slate-200 text-slate-400'
                                       }`}>
                                          {hero.tier || 'Starter'} Link
                                       </span>
                                    ) : (
                                       <span className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest italic">
                                          Verified Client
                                       </span>
                                    )}
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    <button className="p-4 bg-white border border-slate-100 text-slate-300 rounded-2xl hover:text-primary hover:border-primary/20 transition-all shadow-sm">
                                       <MoreVertical className="w-5 h-5" />
                                    </button>
                                 </td>
                              </motion.tr>
                           ))}
                        </AnimatePresence>
                     </tbody>
                  </table>
               </div>

               {filteredData.length === 0 && (
                  <div className="py-24 text-center opacity-30">
                     <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No Heroes Detected in Sector</p>
                  </div>
               )}
            </div>
         </div>
      </main>
    </div>
  );
}
