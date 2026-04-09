'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  MapPin, 
  Calendar,
  Mail,
  Phone,
  MoreVertical,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { getUsersByRole, UserProfile } from '@/lib/db';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole('customer');
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-3 italic">
            <span className="w-8 h-[2px] bg-primary"></span>
            Customer Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4 uppercase italic">
            Customer <span className="text-primary">Pulse</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Monitor and support the growing base of Fix Link service seekers.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm self-start">
           <div className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic">
              {filteredCustomers.length} Active Seekers
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
           <input 
             type="text"
             placeholder="Search by name or email..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white border border-slate-200 p-6 rounded-[2rem] pl-16 text-sm font-bold outline-none focus:border-primary transition-all shadow-sm group-hover:shadow-md"
           />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Scanning Customer Base...</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Seeker Identity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Contact Matrix</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Mission History</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map((customer, index) => (
                  <motion.tr 
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm relative group-hover:scale-110 transition-transform">
                             <img src={customer.imageUrl || `https://i.pravatar.cc/150?u=${customer.id}`} alt="" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic">{customer.fullName}</p>
                             <p className="text-[10px] font-medium text-slate-400 mt-0.5 lowercase italic tracking-wide">{customer.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 space-y-2">
                       <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{customer.contactPhone || 'No Phone'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">{customer.address || 'Address Pending'}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">12 Requests</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          Joined Nov 2023
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                          <MoreVertical className="w-5 h-5" />
                       </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredCustomers.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center px-10">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-8 opacity-20">
                <Users className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2 italic">Zero Seekers Found</h3>
             <p className="text-slate-500 font-medium max-w-sm lowercase">We couldn't find any customers matching these criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
