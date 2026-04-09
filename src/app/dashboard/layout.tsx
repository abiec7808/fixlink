'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/shared/bottom-nav';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, needsOnboarding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (needsOnboarding) {
        router.push('/onboarding');
      }
    }
  }, [user, loading, router, needsOnboarding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const role = profile?.role || 'customer';

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black italic tracking-tighter">FL</div>
           <span className="font-black text-xl tracking-tight text-foreground uppercase">Fix Link</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex gap-6 text-xs font-black uppercase tracking-widest mr-8">
              {role === 'customer' ? (
                 <>
                    <a href="/dashboard/customer" className="hover:text-primary transition-colors">Home</a>
                    <a href="/jobs/new" className="hover:text-primary transition-colors">Post Job</a>
                    <a href="/jobs/my-jobs" className="hover:text-primary transition-colors">My Jobs</a>
                 </>
              ) : (
                 <>
                    <a href="/dashboard/tradesman" className="hover:text-primary transition-colors">Feed</a>
                    <a href="/leads" className="hover:text-primary transition-colors">Leads</a>
                    <a href="/earnings" className="hover:text-primary transition-colors">Earnings</a>
                 </>
              )}
           </div>
           <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black overflow-hidden border border-primary/10">
              {profile?.imageUrl ? (
                 <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 profile?.fullName?.charAt(0) || 'U'
              )}
           </div>
        </div>
       </header>

       <main className="flex-1 pb-24 md:pb-12 md:pt-10 px-4 md:px-12 max-w-7xl mx-auto w-full">
          {children}
       </main>

       <BottomNav role={role} />
    </div>
  );
}
