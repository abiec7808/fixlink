'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Package,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TIER_CONFIG } from '@/lib/constants';
import { updateUserProfile } from '@/lib/db';

export default function WelcomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleStart = async () => {
    if (user?.uid) {
      await updateUserProfile(user.uid, { hasSeenWelcome: true } as any);
      router.push('/dashboard/tradesman');
    }
  };

  const tiers: any[] = [
    {
      ...TIER_CONFIG.starter,
      icon: Zap,
      description: "The 'Kickstarter' for professionals finding their feet.",
      pros: [
        "15km Search Radius",
        "Public Profile",
        "Direct Messaging",
        "Basic Leads"
      ],
      current: profile?.tier === 'starter' || !profile?.tier,
      highlight: false
    },
    {
      ...TIER_CONFIG.missing,
      icon: ShieldCheck,
      description: "Fully optimized. You've found what was missing.",
      pros: [
        "50km Search Radius",
        "Estimates & Invoicing",
        "150 Inventory Items",
        "Priority Support"
      ],
      current: profile?.tier === 'missing',
      highlight: true
    },
    {
      ...TIER_CONFIG.legend,
      icon: Star,
      description: "Internet Hero. You've peaked. The internet is fixed.",
      pros: [
        "70km+ Radius Control",
        "500 Inventory Items",
        "Customer Ratings",
        "Regional Dominance"
      ],
      current: profile?.tier === 'legend',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/30 py-20 px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/10 rounded-full blur-[10rem] -mr-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-accent/5 rounded-full blur-[8rem] -ml-48 -mb-48" />

      <div className="max-w-7xl mx-auto relative z-10 text-center space-y-16">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">
             <span className="w-12 h-[2px] bg-primary"></span>
             Operational Intelligence
             <span className="w-12 h-[2px] bg-primary"></span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
            Welcome to the <br />
            <span className="text-primary">Hero</span> Network
          </h1>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto italic leading-relaxed">
            Your profile is active. Now, choose your operational tier and prepare for deployment.
          </p>
        </motion.div>

        {/* Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((t, i) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-10 rounded-[4rem] border transition-all duration-500 group relative overflow-hidden flex flex-col justify-between text-left ${
                t.highlight 
                ? 'bg-white border-accent shadow-[0_0_50px_rgba(249,115,22,0.15)] z-10 scale-105' 
                : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
              }`}
            >
              {t.highlight && (
                <div className="absolute top-0 right-0 px-8 py-3 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl italic">
                  Most Popular
                </div>
              )}

              <div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 ${
                  t.highlight ? 'bg-accent/10 text-accent' : 'bg-slate-50 text-slate-400'
                }`}>
                  <t.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter text-slate-900">{t.name}</h3>
                <p className={`text-sm font-bold italic mb-10 leading-relaxed ${t.highlight ? 'text-slate-600' : 'text-slate-500'}`}>
                  {t.description}
                </p>

                <div className="space-y-4 mb-12">
                  {t.pros.map((pro: string, j: number) => (
                    <div key={j} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${t.highlight ? 'text-accent' : 'text-slate-400'}`} />
                      <span className={`text-xs font-black uppercase tracking-widest italic ${t.highlight ? 'text-slate-900' : 'text-slate-500'}`}>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {t.current ? (
                  <div className={`w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border italic ${
                    t.highlight ? 'border-accent/20 text-accent bg-accent/5' : 'border-slate-200 text-slate-500 bg-slate-50'
                  }`}>
                    Currently Active
                  </div>
                ) : (
                  <button 
                    onClick={() => router.push('/profile')} 
                    className={`w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all italic ${
                      t.highlight 
                      ? 'bg-accent text-white hover:scale-105 shadow-xl shadow-accent/20' 
                      : 'bg-slate-100 text-slate-600 hover:scale-105 hover:bg-slate-200'
                    }`}
                  >
                    Elevate Status <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-10 relative z-20"
        >
          <button 
            onClick={handleStart}
            className="px-16 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] italic hover:scale-110 active:scale-95 shadow-2xl flex items-center gap-4 mx-auto transition-all"
          >
            Launch Command Center <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            Fix Link Hero Protocol • Secure Environment
          </p>
        </motion.div>
      </div>
    </div>
  );
}
