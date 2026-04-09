'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getJobsByTradesman, Job } from '@/lib/db';

export default function EarningsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.uid) {
      loadEarningsData();
    }
  }, [authLoading, user?.uid]);

  const loadEarningsData = async () => {
    setLoading(true);
    try {
      const data = await getJobsByTradesman(user!.uid);
      setJobs(data);
    } catch (error) {
      console.error("Failed to load earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'invoiced');
  const revenue = completedJobs.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const pendingRevenue = jobs.filter(j => j.status === 'billed').reduce((acc, curr) => acc + (curr.total || 0), 0);

  if (authLoading || loading) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center gap-6">
           <button 
             onClick={() => router.push('/dashboard/tradesman')}
             className="p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-primary group"
           >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-2 italic">
                 <span className="w-8 h-[2px] bg-primary"></span>
                 Hero Financials
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                 Economic <span className="text-primary">Console</span>
              </h1>
           </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-2 p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-56 border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[4rem] -mr-16 -mt-16" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Total Lifetime Revenue</p>
              <div className="relative z-10">
                 <h2 className="text-6xl font-black tracking-tighter italic">R {revenue.toFixed(2)}</h2>
                 <div className="flex items-center gap-2 text-green-500 font-bold text-xs mt-2 italic">
                    <TrendingUp className="w-4 h-4" /> Live Payload Active
                 </div>
              </div>
           </div>

           <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-56">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Verified Jobs</p>
              <div>
                 <h2 className="text-5xl font-black tracking-tighter italic text-slate-900">{completedJobs.length}</h2>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">SUCCESS EVENTS</p>
              </div>
           </div>

           <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-56">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Pending Stream</p>
              <div>
                 <h2 className="text-4xl font-black tracking-tighter italic text-slate-400 font-black italic uppercase">R {pendingRevenue.toFixed(2)}</h2>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">UNCAPTURED FUNDS</p>
              </div>
           </div>
        </div>

        {/* Recent Transactions Table */}
        <section className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm">
           <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 mb-8 px-4">Financial Log</h3>
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="text-left border-b border-slate-50">
                       <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Source</th>
                       <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Date</th>
                       <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</th>
                       <th className="pb-6 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {completedJobs.length > 0 ? completedJobs.map((job) => (
                       <tr key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 px-4">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                   <Briefcase className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="font-black text-slate-900 uppercase italic text-sm">{job.customerName || 'Standard Client'}</span>
                             </div>
                          </td>
                          <td className="py-6 px-4 text-[10px] font-bold text-slate-400 italic">
                             {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-6 px-4">
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-500 rounded-full text-[9px] font-black uppercase italic border border-green-100">
                                <CheckCircle2 className="w-3 h-3" /> SECURE
                             </span>
                          </td>
                          <td className="py-6 px-4 text-right font-black text-slate-900 italic">
                             R {job.total || job.amount || 0}
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic text-xs opacity-50">
                             No economic payload detected in records.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </section>

        {/* Professional Note */}
        <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-center gap-6">
           <Wallet className="w-8 h-8 text-slate-300" />
           <p className="text-[11px] text-slate-500 font-bold italic max-w-xl text-center">
              Account payout configurations can be modified in Identity Control. Verified payloads are processed according to the Fix Link standard settlement timeline.
           </p>
        </div>

      </div>
    </div>
  );
}
