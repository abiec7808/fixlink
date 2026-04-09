'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User as UserIcon,
  Search,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/db';
import { TIER_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TierRequestsPage() {
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // We look for users whose tierStatus is 'trial'
      const q = query(usersRef, where('tierStatus', '==', 'trial'));
      const querySnapshot = await getDocs(q);
      
      const results: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ ...doc.data() as UserProfile, id: doc.id });
      });
      setRequests(results);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (userId: string, action: 'approve' | 'revoke') => {
    try {
      const userRef = doc(db, 'users', userId);
      const user = requests.find(r => r.id === userId);
      
      if (action === 'approve') {
        await updateDoc(userRef, {
          tierStatus: 'active',
          tierTrialExpiresAt: null,
          preTrialTier: null
        });
      } else {
        // Revoke reverts to preTrialTier or starter
        const baseTier = user?.preTrialTier || 'starter';
        await updateDoc(userRef, {
          tier: baseTier,
          tierStatus: 'active',
          tierTrialExpiresAt: null,
          preTrialTier: null
        });
      }
      
      // Update local state
      setRequests(prev => prev.filter(r => r.id !== userId));
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-3 italic">
            <span className="w-8 h-[2px] bg-primary"></span>
            Authorization Queue
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase italic">
            Tier <span className="text-primary">Upgrades</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic opacity-60">
            Authorize or revoke professional trial elevations.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search Professionals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
             <ShieldCheck className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-400">Queue is Clear</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">No pending professional elevations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map((request) => {
            const requestedTier = TIER_CONFIG[request.tier || 'starter'];
            const expiryDate = request.tierTrialExpiresAt?.toDate 
              ? request.tierTrialExpiresAt.toDate() 
              : new Date(request.tierTrialExpiresAt);
            const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-10"
              >
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {request.imageUrl ? (
                      <img src={request.imageUrl} alt={request.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{request.fullName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-3">
                      {request.businessName || "Independent Contractor"} • {request.email}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest border border-primary/10 italic">
                        <Zap className="w-3 h-3" /> Requested: {requestedTier.name}
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic",
                        daysLeft < 3 ? "bg-red-50 text-red-500 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
                      )}>
                        <Clock className="w-3 h-3" /> Trial: {daysLeft} Days Remaining
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button 
                    onClick={() => handleAction(request.id, 'revoke')}
                    className="flex-1 md:flex-none px-8 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 italic flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Revoke Elevation
                  </button>
                  <button 
                    onClick={() => handleAction(request.id, 'approve')}
                    className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary shadow-xl shadow-black/10 transition-all italic flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Finalize Upgrade
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
