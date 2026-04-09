'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  ChevronRight, 
  Clock, 
  Star,
  PlusCircle,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Package,
  LayoutDashboard,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import TradesmanProfileSetup from '@/components/tradesman/TradesmanProfileSetup';
import { getJobsByTradesman, getLeads, Job } from '@/lib/db';
import Link from 'next/link';
import TierSelector from '@/components/dashboard/tier-selector';
import { X } from 'lucide-react';

export default function TradesmanDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'leads' | 'earnings'>('feed');

  useEffect(() => {
    if (!authLoading && profile) {
      if (!profile.trade || !profile.address) {
        setShowSetup(true);
      } else if (!profile.hasSeenWelcome) {
        router.push('/dashboard/tradesman/welcome');
      }
    }
  }, [profile, authLoading]);

  useEffect(() => {
    if (!authLoading && user?.uid) {
      loadDashboardData();
    }
  }, [authLoading, user?.uid]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [jobsData, leadsData] = await Promise.all([
        getJobsByTradesman(user!.uid),
        getLeads(profile?.trades || profile?.trade)
      ]);
      setJobs(jobsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Dashboard load failed:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const revenue = jobs
    .filter(j => j.status === 'completed' || j.status === 'invoiced')
    .reduce((acc: number, curr: Job) => acc + (curr.total || 0), 0);

  const activeProjectsCount = jobs.filter(j => j.status === 'in-progress' || j.status === 'accepted').length;
  const recentJobs = jobs.sort((a, b) => {
    const aTime = (a.createdAt as any)?.seconds || 0;
    const bTime = (b.createdAt as any)?.seconds || 0;
    return bTime - aTime;
  }).slice(0, 5);

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-10 py-8 max-w-2xl mx-auto md:max-w-none">
      {showSetup && user?.uid && (
        <TradesmanProfileSetup 
          userId={user.uid} 
          onComplete={() => {
            setShowSetup(false);
            window.location.reload();
          }} 
        />
      )}

      {/* Header Info */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-2 italic">
               <span className="w-8 h-[2px] bg-primary"></span>
               Hero Command Center
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-1 uppercase italic">Fix Link <span className="text-primary">Pro</span></h1>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3">
               <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {profile?.address || "Location not set"}</span>
               <span className="w-1 h-1 bg-border rounded-full" />
               <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-primary" /> {profile?.trade || "Trade not set"}</span>
            </p>
         </div>
         <div className="flex flex-col md:flex-row flex-wrap gap-4 mt-6 md:mt-0">
            <button 
              onClick={() => router.push('/dashboard/tradesman/inventory')}
              className="px-6 py-4 md:py-5 bg-white border border-slate-100 rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-xl transition-all shadow-sm"
            >
               <Package className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Hub
            </button>
            <button 
              onClick={() => router.push('/dashboard/tradesman/estimates')}
              className="px-6 py-4 md:py-5 bg-slate-50 border border-slate-200 text-slate-600 rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-sm"
            >
               <FileText className="w-4 h-4 md:w-5 md:h-5 text-slate-500" /> Estimates
            </button>
            <button 
              onClick={() => router.push('/dashboard/tradesman/invoices')}
              className="px-6 py-4 md:py-5 bg-slate-50 border border-slate-200 text-slate-600 rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-sm"
            >
               <FileText className="w-4 h-4 md:w-5 md:h-5 text-slate-500" /> Invoices
            </button>
            <button 
              onClick={() => router.push('/dashboard/tradesman/projects')}
              className="px-6 py-4 md:py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 shadow-2xl transition-all"
            >
               <PlusCircle className="w-4 h-4 md:w-5 md:h-5" /> Projects
            </button>
         </div>
      </section>

      {/* Operational Intelligence */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => router.push('/dashboard/tradesman/earnings')}
            className="p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group h-64 border border-white/5 cursor-pointer"
          >
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[4rem] -mb-20 -mr-20" />
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Wallet className="w-7 h-7 text-primary" />
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase italic">
                  Live <TrendingUp className="w-3.5 h-3.5 text-primary" />
               </div>
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 italic">Hero Revenue</p>
               <h2 className="text-4xl font-black tracking-tighter italic text-white flex items-baseline gap-1">R {revenue || '0'}<span className="text-lg opacity-20 italic">.00</span></h2>
            </div>
         </motion.div>

         <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => router.push('/profile')}
            className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-primary/20 hover:shadow-2xl transition-all h-64 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Star className="w-7 h-7 fill-primary/10" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Honor Meter</p>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 italic">Pro Rating</p>
               <div className="flex items-end gap-2">
                  <h2 className="text-4xl font-black tracking-tighter italic text-slate-900">{profile?.rating?.toFixed(1) || '5.0'}</h2>
                  <span className="text-[10px] font-black text-slate-300 mb-2 uppercase tracking-tighter">/ 5.0 HERO RANK</span>
               </div>
            </div>
         </motion.div>

         <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => router.push('/dashboard/tradesman/projects')}
            className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-primary/20 hover:shadow-2xl transition-all h-64 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 fill-accent/10" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Tempo</p>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 italic">Active Projects</p>
               <h2 className="text-4xl font-black tracking-tighter italic text-slate-900">{activeProjectsCount.toString().padStart(2, '0')} <span className="text-lg uppercase not-italic text-slate-300 font-black italic">DEPLOYED</span></h2>
            </div>
         </motion.div>
      </section>

      {/* Brand Identity / Storefront Section */}
      <section className="bg-white border border-slate-100 rounded-[4rem] p-12 shadow-sm relative overflow-hidden group">
        {/* Upgrade Indicator for non-Legend tiers */}
        {profile?.tier !== 'legend' && (
          <div className="absolute top-10 right-10 z-20">
            <button 
              onClick={() => setShowTierModal(true)}
              className="px-6 py-3 bg-accent text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic hover:scale-105 active:scale-95 shadow-xl transition-all flex items-center gap-2"
            >
              <Star className="w-4 h-4 fill-white" /> Upgrade to Legend
            </button>
          </div>
        )}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[6rem] -mr-24 -mt-24 group-hover:bg-primary/10 transition-colors" />
        <div className="flex flex-col md:flex-row items-center gap-12 relative">
           {/* Logo Display */}
           <div className="shrink-0 group/logo relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover/logo:scale-105">
                 {profile?.imageUrl ? (
                    <img src={profile.imageUrl} alt={profile.businessName || profile.fullName} className="w-full h-full object-cover" />
                 ) : (
                    <Briefcase className="w-12 h-12 text-slate-300" />
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white group-hover/logo:rotate-12 transition-transform">
                 <ShieldCheck className="w-5 h-5 fill-current" />
              </div>
           </div>

           {/* Brand Details & Edit Trigger */}
           <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                 <h2 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">{profile?.businessName || profile?.companyName || "Hero Storefront"}</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center justify-center md:justify-start gap-3 mt-1">
                    Official fix link certified storefront
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                 </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <button 
                  onClick={() => router.push('/profile')}
                  className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-md transition-all italic text-slate-600"
                 >
                    Upgrade Identity
                 </button>
                 <button 
                  onClick={() => router.push('/dashboard/tradesman/profile')}
                  className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-md transition-all italic text-slate-600"
                 >
                    Adjust Radius
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="flex items-center gap-6 border-b border-slate-100 pb-2 px-4 overflow-x-auto no-scrollbar">
         {[
            { id: 'feed', label: 'Archived Feed', icon: LayoutDashboard },
            { id: 'leads', label: 'Mission Radar', icon: Zap },
            { id: 'earnings', label: 'Economic Hub', icon: Wallet },
         ].map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                  "flex items-center gap-3 pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                  activeTab === tab.id ? "text-primary italic" : "text-slate-400"
               )}
            >
               <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "fill-primary/10" : "")} />
               {tab.label}
               {activeTab === tab.id && (
                  <motion.div 
                     layoutId="activeTab"
                     className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" 
                  />
               )}
            </button>
         ))}
      </section>

      {/* Dynamic Content Grid */}
      <div className="grid grid-cols-1 gap-12">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.section 
               key="feed"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="space-y-8"
            >
               <div className="flex items-center justify-between px-4 mt-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">Archive <span className="text-primary tracking-normal">Feed</span></h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentJobs.length > 0 ? recentJobs.map((job) => (
                     <div key={job.id} className="p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col gap-8 hover:shadow-xl transition-all border-l-[12px] border-l-green-500 overflow-hidden relative group">
                        <div className="flex items-center justify-between relative z-10">
                           <div>
                              <h4 className="font-black text-lg mb-1 tracking-tight text-slate-900 uppercase italic">{job.title || 'Untitled Operation'}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">{job.customerName || 'Standard Client'}</p>
                           </div>
                           <p className="text-2xl font-black text-slate-900 tracking-tighter italic">R {job.total || '0'}</p>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                           <span className={cn(
                              "text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest border flex items-center gap-2 italic",
                              job.status === 'completed' ? "text-green-500 bg-green-50 border-green-100" : "text-primary bg-primary/5 border-primary/10"
                           )}>
                              <CheckCircle2 className="w-4 h-4" /> {job.status.toUpperCase()}
                           </span>
                           <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">{job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Active'}</p>
                        </div>
                        <button 
                           onClick={() => router.push(`/jobs/${job.id}`)}
                           className="w-full py-6 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm relative z-10 italic"
                        >
                           Mission debrief
                        </button>
                     </div>
                  )) : (
                     <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-[0.2em] italic opacity-40">
                        No operations logged to encrypted archive yet.
                     </div>
                  )}
               </div>
            </motion.section>
          )}

          {activeTab === 'leads' && (
            <motion.section 
               key="leads"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="space-y-8"
            >
               <div className="flex items-center justify-between px-4 mt-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">Mission <span className="text-primary tracking-normal">Radar</span></h3>
                  <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                     Range: <span className="text-primary">{profile?.serviceRadius || '70'}KM</span>
                  </div>
               </div>

               <div className="flex flex-col gap-6">
                  {leads.length > 0 ? leads.map((lead) => (
                     <motion.div 
                       key={lead.id} 
                       whileHover={{ x: 5 }}
                       className="p-10 bg-white rounded-[4rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:shadow-2xl hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
                     >
                        <div className="flex items-center gap-8 relative z-10">
                           <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                              <MapPin className="w-8 h-8" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 italic">Operation {lead.category}</p>
                              <h4 className="font-black text-xl mb-2 group-hover:text-primary transition-colors tracking-tight leading-tight uppercase italic">{lead.title}</h4>
                              <div className="flex items-center gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest italic opacity-60">
                                 <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {lead.locationName || 'Nearby'}</div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-4 shrink-0 relative z-10">
                           <p className="text-3xl font-black text-slate-900 tracking-tighter italic">R {lead.budget || '?'}</p>
                           <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:scale-105 active:scale-95 shadow-xl shadow-black/10 transition-all uppercase tracking-widest italic">
                              Analyze Mission
                           </button>
                        </div>
                     </motion.div>
                  )) : (
                     <div className="py-20 text-center text-slate-400 font-black uppercase tracking-[0.2em] italic opacity-40">
                        Radar clear. No new deployments detected in your radius.
                     </div>
                  )}
               </div>
            </motion.section>
          )}

          {activeTab === 'earnings' && (
            <motion.section 
               key="earnings"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="space-y-8"
            >
               <div className="flex items-center justify-between px-4 mt-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">Economic <span className="text-primary tracking-normal">Hub</span></h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-12 bg-slate-900 text-white rounded-[4rem] relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[4rem] -mr-16 -mt-16" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 italic">Total Gross Revenue</p>
                     <h2 className="text-6xl font-black tracking-tighter italic">R {revenue}<span className="text-xl opacity-20">.00</span></h2>
                  </div>

                  <div className="p-12 bg-white border border-slate-100 rounded-[4rem] shadow-sm">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 italic">Operation Density</p>
                     <h2 className="text-6xl font-black tracking-tighter italic text-slate-900">{jobs.length}<span className="text-xl text-slate-300"> JOBS</span></h2>
                  </div>
               </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Intelligence HQ */}
      <section className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl border border-white/5">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
            <ShieldCheck className="w-6 h-6 text-primary" />
         </div>
         <h3 className="font-black text-xl mb-3 italic uppercase tracking-[0.02em]">Intelligence HQ</h3>
         <p className="text-[11px] text-slate-400 font-bold italic leading-relaxed mb-8 opacity-60">Need operational guidance or mission support? Hero HQ is active 24/7 for you.</p>
         <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b-2 border-primary/20 pb-1 hover:border-primary transition-all italic">Launch Direct Channel</button>
      </section>
      {/* Tier Selector Modal */}
      <AnimatePresence>
        {showTierModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTierModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-6xl shadow-2xl relative z-10 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setShowTierModal(false)}
                className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-3 italic">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  Evolution Mode
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4 text-slate-900">Elevate Your <span className="text-primary">Hero Tier</span></h2>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">
                  Start a 14-day free trial on any higher tier. Experience legendary range and tools immediately. 
                  Reverts automatically unless approved by administration.
                </p>
              </div>

              <TierSelector onComplete={() => setShowTierModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
