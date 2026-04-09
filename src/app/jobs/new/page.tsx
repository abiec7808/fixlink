'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Droplets, 
  Zap, 
  Hammer, 
  Paintbrush 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createJob } from '@/lib/db';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Loader2 } from 'lucide-react';

const categories = [
  { id: 'plumbing', name: 'Plumbing', icon: Droplets, color: '#3B82F6' },
  { id: 'electrical', name: 'Electrical', icon: Zap, color: '#EAB308' },
  { id: 'handyman', name: 'Handyman', icon: Hammer, color: '#F97316' },
  { id: 'painting', name: 'Painting', icon: Paintbrush, color: '#8B5CF6' },
];

export default function NewJobPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    categories: [] as string[],
    description: '',
    budget: '',
    images: [] as string[]
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.1));
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file);
      const storageRef = ref(storage, `jobs/${user.uid}/${Date.now()}-${file.name}`);
      await uploadString(storageRef, compressedBase64, 'data_url');
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostJob = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createJob({
        title: formData.title,
        description: formData.description,
        categories: formData.categories,
        category: formData.categories[0], // Backwards compat
        budget: formData.budget,
        images: formData.images,
        customerId: user.uid,
        customerName: user.displayName || 'Customer',
        customerEmail: user.email || '',
        status: 'pending',
        location: 'TBD', // This could be enhanced with an address picker later
      });
      nextStep(); // Go to success step
    } catch (err) {
      console.error("Post job failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const router = useRouter();

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <header className="flex items-center justify-between mb-10">
        <button onClick={() => step > 1 ? prevStep() : router.back()} className="p-3 rounded-2xl bg-white border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5">
           {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${
                 step >= i ? 'w-8 bg-primary' : 'w-4 bg-muted'
              }`} />
           ))}
        </div>
        <div className="w-11" /> {/* Spacer */}
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div>
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Select Category</h1>
                <p className="text-muted-foreground font-medium italic">What type of help do you need?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const isSelected = formData.categories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          categories: isSelected 
                            ? prev.categories.filter(id => id !== cat.id)
                            : [...prev.categories, cat.id]
                        }));
                      }}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                        <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-primary mt-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={nextStep}
                disabled={formData.categories.length === 0}
                className="w-full py-5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-50 disabled:shadow-none transition-all mt-4"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div>
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Job Details</h1>
                <p className="text-muted-foreground font-medium">Briefly describe the task for the pros.</p>
              </div>

              <div className="flex flex-col gap-6">
                 <div>
                    <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 block">Job Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. Broken master bathroom tap"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 block">Description</label>
                    <textarea 
                      placeholder="Give more details about the problem..."
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
              </div>

              <button 
                onClick={nextStep}
                disabled={!formData.title || !formData.description}
                className="w-full py-5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 flex items-center justify-center disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Next Section <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div>
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Budget & Photos</h1>
                <p className="text-muted-foreground font-medium italic">Photos help you get more accurate quotes.</p>
              </div>

              <div className="flex flex-col gap-10">
                 <div>
                    <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 block">Estimated Budget (Optional)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R</span>
                       <input 
                        type="number"
                        placeholder="0.00"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="w-full p-4 pl-10 rounded-2xl border border-border focus:ring-2 focus:ring-primary outline-none font-bold"
                       />
                    </div>
                 </div>

                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-2xl bg-muted overflow-hidden relative group">
                        <img src={url} alt="Job" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {formData.images.length < 6 && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-all text-muted-foreground"
                      >
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                        <span className="text-[10px] font-bold">{isUploading ? 'Uploading...' : 'Add Photo'}</span>
                      </button>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                  </div>
              </div>

              <button 
                onClick={nextStep}
                className="w-full py-5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 flex items-center justify-center transition-all"
              >
                Review Application <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div className="text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-6">
                   <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-foreground">All Set!</h1>
                <p className="text-muted-foreground text-center max-w-sm">
                   Your job for <span className="font-bold text-foreground">"{formData.title}"</span> is ready to be posted.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-muted/30 border border-border space-y-4">
                 <div className="flex justify-between font-bold text-sm">
                    <span className="text-muted-foreground">Trades</span>
                    <span className="text-foreground">{formData.categories.map(c => categories.find(cat => cat.id === c)?.name).join(', ')}</span>
                 </div>
                 <div className="flex justify-between font-bold text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="text-foreground">{formData.budget ? `R${formData.budget}` : 'TBD'}</span>
                 </div>
              </div>

              <button 
                onClick={handlePostJob}
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? 'Posting Job...' : 'Post Job Globally'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
