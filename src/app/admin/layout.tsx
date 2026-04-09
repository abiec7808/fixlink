'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-primary/20 animate-bounce italic tracking-tighter">
            FL
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 animate-pulse italic">Verifying Admin Credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#1e293b] rounded-[3.5rem] p-16 text-center shadow-2xl border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
          <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-white italic">Access Denied</h2>
          <p className="text-slate-400 text-sm font-medium mb-12 leading-relaxed italic">
            You do not have the required permissions to access the Admin Command Center. This incident has been logged.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full py-6 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 ml-80 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-10 py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
