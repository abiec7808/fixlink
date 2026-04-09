'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Star, 
  MapPin, 
  Briefcase,
  Loader2,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    businessName: '',
    imageUrl: '',
    companyLogoUrl: '',
    website: '',
    vatNumber: '',
    isVatRegistered: false,
    estimateExpiryDays: 30,
  });
  const [updateLoading, setUpdateLoading] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || profile.companyName || '',
        imageUrl: profile.imageUrl || '',
        companyLogoUrl: profile.companyLogoUrl || '',
        website: profile.website || '',
        vatNumber: profile.vatNumber || '',
        isVatRegistered: profile.isVatRegistered || false,
        estimateExpiryDays: profile.estimateExpiryDays || 30,
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    router.push('/login');
    return null;
  }

  const role = profile.role || 'customer';

  const handleSave = async () => {
    setUpdateLoading(true);
    try {
      const { updateUserProfile } = await import('@/lib/db');
      await updateUserProfile(user.uid, {
        ...formData,
        // Sync both for consistency
        businessName: formData.businessName,
        companyName: formData.businessName,
      });
      setIsEditing(false);
      window.location.reload(); // Refresh to show new data
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-12">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <header className="flex items-center justify-between">
           <div>
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-2 italic">
                 <span className="w-6 h-[2px] bg-primary"></span>
                 Identity Control
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">
                 Account <span className="text-primary">Settings</span>
              </h1>
           </div>
           <button 
             onClick={handleLogout}
             className="p-4 bg-white border border-slate-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-[1.5rem] transition-all shadow-sm group"
           >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
           </button>
        </header>

        {/* Brand Identity Management */}
        <section className="bg-white border border-slate-100 rounded-[3.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
           
           <div className="flex flex-col md:flex-row items-start md:items-center gap-10 relative">
              {/* Logo Preview */}
              <div className="shrink-0 relative">
                 <div className="w-36 h-36 rounded-[2.5rem] border-8 border-white shadow-xl overflow-hidden bg-slate-50 flex items-center justify-center text-primary font-black text-5xl italic group-hover:scale-105 transition-all">
                    {formData.imageUrl ? (
                       <img src={formData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <User className="w-12 h-12 text-slate-300" />
                    )}
                 </div>
                 <label className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg bg-slate-900 cursor-pointer hover:bg-primary transition-all">
                    <Plus className="w-6 h-6" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, imageUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                 </label>
              </div>

              {/* Brand Editor */}
              <div className="flex-1 space-y-6 w-full">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Official Business Name</label>
                       <input 
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="e.g. Acme Services"
                          className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:shadow-sm outline-none text-sm font-bold transition-all placeholder:text-slate-300"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Digital Domain (Website)</label>
                       <input 
                          type="text"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                          className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:shadow-sm outline-none text-sm font-bold transition-all placeholder:text-slate-300"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Professional Invoicing Logo Section */}
           {role !== 'customer' && (
             <div className="mt-10 pt-10 border-t border-slate-50 space-y-5">
                <div className="flex items-center justify-between">
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1 italic">Professional Invoicing Logo</h4>
                      <p className="text-xs font-bold text-slate-400">This dedicated brand mark will appear securely on all generated PDF invoices.</p>
                   </div>
                </div>
                <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                   <div className="w-20 h-20 rounded-[1.5rem] shadow-sm overflow-hidden bg-white flex items-center justify-center text-primary relative">
                      {formData.companyLogoUrl ? (
                         <img src={formData.companyLogoUrl} alt="Company Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                         <Briefcase className="w-8 h-8 text-slate-300" />
                      )}
                   </div>
                   <label className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer shadow-sm hover:border-primary hover:text-primary transition-all flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Inject Brand Mark
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, companyLogoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                   </label>
                </div>
             </div>
           )}

           {/* Hero Financial Config */}
           <div className="mt-10 pt-10 border-t border-slate-50 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1 italic">Tax Configuration Protocol</h4>
                    <p className="text-xs font-bold text-slate-400">Toggle VAT registration for automated billing and calculations.</p>
                 </div>
                 <button 
                    onClick={() => setFormData({ ...formData, isVatRegistered: !formData.isVatRegistered })}
                    className={`shrink-0 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 ${
                       formData.isVatRegistered ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-primary hover:text-primary'
                    }`}
                 >
                    {formData.isVatRegistered ? <Shield className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                    {formData.isVatRegistered ? 'VAT Active' : 'Not Registered'}
                 </button>
              </div>

              {formData.isVatRegistered && (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2 p-6 bg-green-50 border border-green-100 rounded-[2rem]"
                 >
                    <label className="text-[10px] font-black uppercase tracking-widest text-green-700 ml-2 italic">VAT Identification Number</label>
                    <input 
                       type="text"
                       value={formData.vatNumber}
                       onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                       placeholder="Enter 10-digit VAT number"
                       className="w-full px-6 py-5 rounded-[1.5rem] bg-white border border-green-200 focus:border-green-500 focus:shadow-sm outline-none text-sm font-bold text-green-900 transition-all placeholder:text-green-300/50"
                    />
                 </motion.div>
              )}

              <div className="space-y-2 p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic text-left">Estimate Validity (Days)</label>
                     <span className="text-[10px] font-black uppercase text-primary italic">Max 90 Days</span>
                  </div>
                  <input 
                     type="number"
                     min="1"
                     max="90"
                     value={formData.estimateExpiryDays}
                     onChange={(e) => {
                        const val = Math.min(90, Math.max(1, parseInt(e.target.value) || 1));
                        setFormData({ ...formData, estimateExpiryDays: val });
                     }}
                     className="w-full px-6 py-5 rounded-[1.5rem] bg-white border border-slate-100 focus:border-primary focus:shadow-sm outline-none text-sm font-bold text-slate-900 transition-all"
                  />
                  <p className="text-[9px] font-bold text-slate-400 ml-2 italic">Estimates will be automatically hidden after this period.</p>
               </div>

              <button 
                 onClick={handleSave}
                 disabled={updateLoading}
                 className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-2xl shadow-primary/30"
              >
                 {updateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                 {updateLoading ? "Synchronizing..." : "Update Identity Variables"}
              </button>
           </div>
        </section>

        {/* Account Info Bar */}
        <section className="bg-slate-900 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between border border-transparent shadow-2xl gap-6">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Authorized Identity</p>
              <p className="text-lg font-black italic text-white uppercase tracking-tight">{profile.fullName}</p>
           </div>
           <div className="md:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">System Status</p>
              <p className="text-xs font-black uppercase text-accent italic tracking-widest px-4 py-2 bg-accent/10 rounded-xl inline-block border border-accent/20">Active & Verified</p>
           </div>
        </section>

        {/* Branding Support Information */}
        <section className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-4">
           <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm text-primary">
              <Shield className="w-8 h-8" />
           </div>
           <div className="max-w-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2 italic">Core Integrity Maintained</p>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">Your visual identity and tax variables are secured within the Fix Link ecosystem.</p>
           </div>
        </section>

        <footer className="mt-4 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Fix Link Engine • Build v2.0</p>
        </footer>
      </div>
    </div>
  );
}
