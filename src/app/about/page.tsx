import React from 'react';
import { ShieldCheck, Target, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary">
          Connecting You with <span className="text-accent">Trusted Pros</span>.
        </h1>
        <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
          Fix Link was born out of a simple need: making home maintenance reliable, transparent, and fast for everyone in South Africa.
        </p>
      </section>

      {/* Values */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { 
            title: 'Reliability first', 
            desc: 'Every pro on our platform is vetted for quality and consistency. We believe in getting it right the first time.',
            icon: ShieldCheck,
            color: 'bg-primary'
          },
          { 
            title: 'Speed & Efficiency', 
            desc: 'Get quotes in under 10 minutes from verified nearby tradesmen. No more waiting days for a call back.',
            icon: Zap,
            color: 'bg-accent'
          },
          { 
            title: 'Direct Connection', 
            desc: 'Chat directly with your pro, share photos, and manage the entire job within the app.',
            icon: Users,
            color: 'bg-blue-500'
          },
          { 
            title: 'Clear Mission', 
            desc: 'Empowering local tradesmen with the tools they need to grow their business while providing top-tier service.',
            icon: Target,
            color: 'bg-green-500'
          }
        ].map((v, i) => (
          <div key={i} className="p-10 rounded-[3rem] bg-white border border-border shadow-sm hover:shadow-xl transition-all">
            <div className={`w-14 h-14 rounded-2xl ${v.color} flex items-center justify-center text-white mb-6`}>
              <v.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-4">{v.title}</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="p-12 md:p-20 rounded-[4rem] bg-primary text-white space-y-8 relative overflow-hidden text-center">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32" />
         <h2 className="text-3xl md:text-4xl font-black">Our Story</h2>
         <p className="text-lg opacity-80 font-medium leading-loose max-w-3xl mx-auto">
           Fix Link started in a small workshop in Cape Town. We noticed how difficult it was to find reliable plumbers and electricians when emergency struck. Today, we are proud to serve thousands of homeowners and empower hundreds of independent contractors across the country.
         </p>
         <button className="px-8 py-4 bg-accent text-white rounded-2xl font-bold shadow-xl shadow-accent/20 hover:scale-105 transition-all">
           Join the Journey
         </button>
      </section>
    </div>
  );
}
