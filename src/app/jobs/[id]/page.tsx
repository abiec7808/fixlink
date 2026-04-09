'use client';

import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Clock,
  FileText,
  PlusCircle,
  Loader2,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getJob } from '@/lib/db';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { id } = React.use(params);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'estimates' | 'invoices'>('overview');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const data = await getJob(id);
      
      // Privacy Guard: Allow only owner, customer, or admin
      if (data && user) {
        const isOwner = data.tradesmanId === user.uid;
        const isCustomer = data.customerId === user.uid;
        if (!isOwner && !isCustomer) {
           router.push('/dashboard?error=unauthorized');
           return;
        }
      }

      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      router.push('/dashboard?error=load_failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
     </div>
  );

  if (!job) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-black uppercase tracking-widest italic">Mission Data Corrupted or Not Found</p>
     </div>
  );

  const isTradesmanView = profile?.role === 'tradesman';
  const tier = profile?.tier as string;
  const canEstimate = tier === 'missing' || tier === 'legend';
  const canInvoice = tier === 'missing' || tier === 'legend';

  return (
    <div className="flex flex-col gap-8 py-8 md:py-12 max-w-6xl mx-auto px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:scale-110 active:scale-95 transition-all"
            >
               <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
               <h1 className="text-3xl font-black tracking-tighter uppercase italic">{job.title}</h1>
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic mt-1">{job.category} <span className="text-slate-300 mx-2">•</span> {job.status}</p>
            </div>
         </div>
         
         {isTradesmanView && (
            <div className="flex gap-4">
               {canEstimate && (
                  <button 
                    onClick={() => router.push(`/jobs/${job.id}/estimate`)}
                    className="px-8 py-5 bg-white border border-slate-100 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:shadow-xl transition-all"
                  >
                     <TrendingUp className="w-4 h-4" /> Issue Estimate
                  </button>
               )}
               {canInvoice && (
                  <button 
                    onClick={() => router.push(`/jobs/${job.id}/invoice`)}
                    className="px-8 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20 transition-all"
                  >
                     <FileText className="w-4 h-4" /> Final Invoice
                  </button>
               )}
            </div>
         )}
      </header>

      {/* Hero Tabs */}
      <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-[2.5rem] w-fit mx-auto md:mx-0">
         {[
            { id: 'overview', label: 'Active Projects', icon: Layers },
            { id: 'estimates', label: 'Estimates', icon: TrendingUp, hidden: !canEstimate && isTradesmanView },
            { id: 'invoices', label: 'Invoices', icon: FileText, hidden: !canInvoice && isTradesmanView }
         ].filter(t => !t.hidden).map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-xl scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
               }`}
            >
               <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
               {tab.label}
            </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
         {activeTab === 'overview' && (
            <motion.div 
               key="overview"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
               {/* Left: Mission Specs */}
               <div className="lg:col-span-8 space-y-12">
                  <section className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem]">
                           <MapPin className="w-6 h-6 text-primary" />
                           <div>
                              <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest italic">Location Hub</p>
                              <p className="text-sm font-bold text-slate-900 leading-tight">{job.location || 'Cape Town, ZA'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem]">
                           <Calendar className="w-6 h-6 text-primary" />
                           <div>
                              <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest italic">Mission Launch</p>
                              <p className="text-sm font-bold text-slate-900 leading-tight">
                                 {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Active Now'}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem]">
                           <TrendingUp className="w-6 h-6 text-accent" />
                           <div>
                              <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest italic">Est. Value</p>
                              <p className="text-lg font-black text-slate-900 tracking-tighter italic">R {job.amount || 'Market Rates'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem]">
                           <ShieldCheck className="w-6 h-6 text-green-500" />
                           <div>
                              <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest italic">Verification</p>
                              <p className="text-sm font-bold text-slate-900 leading-tight">Identity Secured</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 pt-6 border-t border-slate-50">
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Mission <span className="text-primary">Brief</span></h2>
                        <p className="text-slate-500 leading-relaxed font-medium text-lg italic">
                           {job.description || 'No detailed brief provided for this mission.'}
                        </p>
                     </div>

                     {job.images && job.images.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                           <h2 className="text-2xl font-black text-slate-900 uppercase italic">Visuals</h2>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {job.images.map((img: string, i: number) => (
                                 <div key={i} className="aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
                                    <img src={img} alt="Mission evidence" className="w-full h-full object-cover" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </section>

                  {/* Journey Tracks */}
                  <section className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden relative">
                     <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -ml-16 -mt-16" />
                     <h2 className="text-2xl font-black text-slate-900 mb-12 text-center uppercase italic">Mission Progress <span className="text-primary">Pulse</span></h2>
                     <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4">
                        <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-slate-100 -translate-y-1/2 -z-10" />
                        <div className="absolute top-1/2 left-4 w-1/3 h-[2px] bg-primary -translate-y-1/2 -z-10" />
                        
                        {[
                           { label: 'Deployed', icon: Clock, active: true },
                           { label: 'Analysed', icon: TrendingUp, active: true },
                           { label: 'Secured', icon: ShieldCheck, active: false },
                           { label: 'Billed', icon: CheckCircle2, active: job.status === 'billed' }
                        ].map((s, i) => (
                           <div key={i} className="flex flex-col items-center gap-4 group">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                 s.active ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-110' : 'bg-slate-50 text-slate-300'
                              }`}>
                                 <s.icon className="w-6 h-6" />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest italic ${
                                 s.active ? 'text-primary' : 'text-slate-300'
                              }`}>{s.label}</span>
                           </div>
                        ))}
                     </div>
                  </section>
               </div>

               {/* Right: Intelligence Feed */}
               <div className="lg:col-span-4 space-y-12">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 group-hover:scale-110 transition-transform rounded-bl-[10rem] -mr-16 -mt-16" />
                     <h2 className="text-xl font-black text-slate-900 uppercase italic">Lead <span className="text-primary">Source</span></h2>
                     
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-black text-2xl shadow-sm">
                           {job.customerName?.charAt(0) || 'C'}
                        </div>
                        <div>
                           <p className="font-black text-lg text-slate-900 tracking-tight leading-none mb-1">{job.customerName || 'Lead Provider'}</p>
                           <div className="flex items-center gap-2">
                              <div className="flex items-center text-[10px] font-black text-accent italic">
                                 ★ 4.8
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">(Verified Citizen)</span>
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-slate-50 space-y-4">
                        <button className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10">
                           <MessageCircle className="w-5 h-5" /> Open Mission Comms
                        </button>
                        {isTradesmanView && (job.status === 'estimated' || job.status === 'accepted') && (
                           <button 
                              onClick={() => router.push(`/jobs/${job.id}/invoice`)}
                              className="w-full py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                           >
                              <FileText className="w-5 h-5" /> Convert to Invoice
                           </button>
                        )}
                     </div>
                  </div>

                  <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl border border-white/5">
                     <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mb-16 -mr-16" />
                     <TrendingUp className="w-8 h-8 text-primary mb-6" />
                     <h3 className="font-black text-xl mb-4 italic uppercase tracking-tight">Need Support?</h3>
                     <p className="text-sm text-slate-400 font-medium italic leading-relaxed mb-8">Fix Link Hero Support is active 24/7 for operational guidance and mission logistics.</p>
                     <button className="text-[10px] font-black text-primary uppercase tracking-widest border-b-2 border-primary/20 pb-1 hover:border-primary transition-all italic">Launch Direct Support</button>
                  </div>
               </div>
            </motion.div>
         )}

         {activeTab === 'estimates' && (
            <motion.div 
               key="estimates"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 min-h-[400px] flex flex-col items-center justify-center text-center"
            >
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <TrendingUp className="w-10 h-10 text-primary" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight italic mb-2">Estimate <span className="text-primary">Vault</span></h3>
               <p className="text-slate-500 font-medium max-w-sm mb-10">No estimates have been issued for this mission. Deploy a new financial analysis to provide clarity.</p>
               {isTradesmanView && (
                  <button 
                     onClick={() => router.push(`/jobs/${job.id}/estimate`)}
                     className="px-10 py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-primary/20"
                  >
                     Issue New Estimate
                  </button>
               )}
            </motion.div>
         )}

         {activeTab === 'invoices' && (
            <motion.div 
               key="invoices"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 min-h-[400px] flex flex-col items-center justify-center text-center"
            >
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <FileText className="w-10 h-10 text-primary" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight italic mb-2">Invoice <span className="text-primary">Terminal</span></h3>
               <p className="text-slate-500 font-medium max-w-sm mb-10">Awaiting mission completion or estimate approval. No finalized invoices are currently indexed.</p>
               {isTradesmanView && (
                  <button 
                     onClick={() => router.push(`/jobs/${job.id}/invoice`)}
                     className="px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-black/20"
                  >
                     Generate Final Invoice
                  </button>
               )}
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
