'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile) {
        if (profile.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (profile.role === 'tradesman') {
          router.push('/dashboard/tradesman');
        } else {
          router.push('/dashboard/customer');
        }
      } else {
        // Logged in but no profile - send to onboarding
        router.push('/onboarding');
      }
    }
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/30">
      <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
        Securing your session...
      </p>
    </div>
  );
}
