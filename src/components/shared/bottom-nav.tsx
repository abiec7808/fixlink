'use client';

import React from 'react';
import { UserRole } from '@/lib/db';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageCircle, 
  User,
  Briefcase,
  History,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

const customerNav: NavItem[] = [
  { label: 'Home', href: '/dashboard/customer', icon: Home },
  { label: 'Jobs', href: '/jobs/my-jobs', icon: History },
  { label: 'Post', href: '/jobs/new', icon: PlusSquare },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User },
];

const tradesmanNav: NavItem[] = [
  { label: 'Feed', href: '/dashboard/tradesman', icon: Briefcase },
  { label: 'Leads', href: '/leads', icon: Search },
  { label: 'Earnings', href: '/earnings', icon: TrendingUp },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = role === 'tradesman' ? tradesmanNav : customerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-4 py-2 pb-6 md:hidden">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive && "bg-primary/10 shadow-sm"
              )}>
                <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
