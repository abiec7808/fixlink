import React from 'react';
import { UserProfile, InventoryItem } from '@/lib/db';

export function PdfDocument({ 
  job, 
  profile, 
  lineItems, 
  totals, 
  type 
}: { 
  job: any, 
  profile: UserProfile, 
  lineItems: any[], 
  totals: any, 
  type: 'Estimate' | 'Invoice' 
}) {
  return (
    <div id="pdf-document" className="w-[800px] h-auto min-h-[1131px] relative bg-white font-sans flex flex-col" style={{ color: '#0f172a' }}>
      
      {/* Top Banner */}
      <div className="w-full h-4" style={{ backgroundColor: '#F7931E' }}></div>
      <div className="w-full h-8" style={{ backgroundColor: '#1E4E79' }}></div>

      <div className="p-12 flex-grow flex flex-col">
        {/* Header section */}
        <div className="flex justify-between items-start pb-8 mb-8 border-b-2" style={{ borderColor: '#f1f5f9' }}>
           <div className="flex items-center gap-6">
              {profile?.companyLogoUrl ? (
                 <img src={profile.companyLogoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-xl shadow-sm" />
              ) : profile?.imageUrl ? (
                 <img src={profile.imageUrl} alt="Logo" className="w-24 h-24 object-cover rounded-xl shadow-sm" />
              ) : (
                 <div className="w-24 h-24 rounded-xl flex items-center justify-center font-bold text-3xl" style={{ backgroundColor: '#1E4E79', color: '#ffffff' }}>
                    {profile?.businessName?.charAt(0) || profile?.fullName?.charAt(0) || 'P'}
                 </div>
              )}
              <div>
                 <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: '#1E4E79' }}>{profile?.businessName || profile?.fullName || ''}</h1>
                 <p className="text-sm font-bold mt-1" style={{ color: '#475569' }}>{profile?.email}</p>
                 {profile?.website && <p className="text-xs font-semibold mt-1" style={{ color: '#94a3b8' }}>{profile.website}</p>}
                 {profile?.isVatRegistered && profile?.vatNumber && (
                    <p className="text-xs font-black mt-1 uppercase" style={{ color: '#F7931E' }}>VAT: {profile.vatNumber}</p>
                 )}
              </div>
           </div>
           <div className="text-right">
              <h2 className="text-5xl font-black uppercase tracking-widest" style={{ color: '#1E4E79' }}>{type}</h2>
              <div className="mt-4 px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: '#f8fafc' }}>
                 <p className="text-sm font-bold" style={{ color: '#64748b' }}>ID: <span style={{ color: '#0f172a' }}>{job?.id?.slice(0,8)?.toUpperCase() || 'NEW'}</span></p>
                 <p className="text-xs font-bold mt-1" style={{ color: '#64748b' }}>Date: <span style={{ color: '#0f172a' }}>{new Date().toLocaleDateString()}</span></p>
              </div>
           </div>
        </div>

        {/* Bill To */}
        <div className="mb-10">
           <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#F7931E' }}>Billed To</p>
           <div className="p-6 rounded-2xl border" style={{ borderColor: '#f1f5f9', backgroundColor: '#fafafb' }}>
              <h3 className="text-xl font-black" style={{ color: '#1E4E79' }}>{job?.customerName || 'Standard Client'}</h3>
              {job?.customerPhone && <p className="text-sm font-semibold mt-2" style={{ color: '#475569' }}>{job.customerPhone}</p>}
              {job?.customerEmail && <p className="text-sm font-semibold mt-1" style={{ color: '#475569' }}>{job.customerEmail}</p>}
              <p className="text-sm font-semibold mt-1" style={{ color: '#475569' }}>{job?.customerAddress || job?.location || 'Pending Address'}</p>
           </div>
        </div>

        {/* Line Items */}
        <div className="rounded-2xl overflow-hidden border mb-8" style={{ borderColor: '#f1f5f9' }}>
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="text-xs font-black uppercase tracking-widest" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                    <th className="py-4 px-6 border-b" style={{ borderColor: '#e2e8f0' }}>Description</th>
                    <th className="py-4 px-6 text-center border-b" style={{ borderColor: '#e2e8f0' }}>Qty</th>
                    <th className="py-4 px-6 text-right border-b" style={{ borderColor: '#e2e8f0' }}>Price</th>
                    <th className="py-4 px-6 text-right border-b" style={{ borderColor: '#e2e8f0' }}>Total</th>
                 </tr>
              </thead>
              <tbody>
                 {lineItems.map((item, i) => (
                    <tr key={i} className="border-b last:border-b-0" style={{ borderColor: '#f1f5f9', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafb' }}>
                       <td className="py-4 px-6 font-bold text-sm" style={{ color: '#0f172a' }}>{item.name}</td>
                       <td className="py-4 px-6 text-center font-bold text-sm" style={{ color: '#475569' }}>{item.quantity}</td>
                       <td className="py-4 px-6 text-right font-bold text-sm" style={{ color: '#475569' }}>R {item.sellingIncl.toFixed(2)}</td>
                       <td className="py-4 px-6 text-right font-black text-sm" style={{ color: '#1E4E79' }}>R {(item.sellingIncl * item.quantity).toFixed(2)}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Totals & Notes */}
        <div className="flex justify-between items-start mb-12">
           <div className="w-1/2 pr-8">
              {job?.notes && (
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Terms & Notes</p>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#475569' }}>{job.notes}</p>
                 </div>
              )}
           </div>
           
           <div className="w-1/2 rounded-2xl p-6" style={{ backgroundColor: '#f8fafc' }}>
              {profile?.isVatRegistered ? (
                 <>
                    <div className="flex justify-between text-sm font-bold mb-3" style={{ color: '#64748b' }}><span>Subtotal</span><span>R {totals.excl.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm font-bold mb-4" style={{ color: '#64748b' }}><span>VAT (15%)</span><span>R {totals.vat.toFixed(2)}</span></div>
                    <div className="w-full h-px mb-4" style={{ backgroundColor: '#e2e8f0' }}></div>
                 </>
              ) : null}
              <div className="flex justify-between text-3xl font-black tracking-tight" style={{ color: '#1E4E79' }}>
                 <span>Total</span><span>R {totals.incl.toFixed(2)}</span>
              </div>
           </div>
        </div>

        {/* Banking Details */}
        {profile?.bankName && profile?.accountNumber && (
           <div className="mt-auto pt-8 border-t-2 mb-8" style={{ borderColor: '#f1f5f9' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#F7931E' }}>Payment Information</p>
              <div className="flex gap-12">
                 <div>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: '#94a3b8' }}>Bank</p>
                    <p className="text-sm font-black" style={{ color: '#0f172a' }}>{profile.bankName}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: '#94a3b8' }}>Account Name</p>
                    <p className="text-sm font-black" style={{ color: '#0f172a' }}>{profile.accountHolder || profile.businessName || profile.fullName}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: '#94a3b8' }}>Account No.</p>
                    <p className="text-sm font-black" style={{ color: '#0f172a' }}>{profile.accountNumber}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: '#94a3b8' }}>Branch</p>
                    <p className="text-sm font-black" style={{ color: '#0f172a' }}>{profile.branchCode}</p>
                 </div>
              </div>
           </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-6 border-t flex flex-col items-center justify-center" style={{ borderColor: '#f1f5f9' }}>
           <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#F7931E' }}>
                 <span className="text-[9px] font-black" style={{ color: '#ffffff' }}>FL</span>
              </div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                 Powered By <span className="text-sm" style={{ color: '#1E4E79' }}>Fix Link</span>
              </p>
           </div>
           <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#F7931E' }}>www.fixlink.co.za</p>
        </div>
      </div>
    </div>
  );
}
