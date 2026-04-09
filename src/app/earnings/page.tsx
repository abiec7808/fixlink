'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function EarningsRedirect() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (profile?.role === 'tradesman') {
        router.replace('/dashboard/tradesman/earnings');
      } else {
        router.replace('/dashboard/customer');
      }
    }
  }, [loading, profile, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Earnings...</p>
    </div>
  );
}
