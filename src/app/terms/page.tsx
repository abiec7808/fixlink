import React from 'react';
import { Gavel, FileText, UserCheck, CreditCard } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    { title: 'Acceptance of Terms', desc: 'By using Fix Link, you agree to these legal conditions, which govern our marketplace and services.', icon: Gavel },
    { title: 'User Conduct', desc: 'You must maintain professional conduct. We reserve the right to suspend accounts for misconduct or providing false information.', icon: UserCheck },
    { title: 'Service Fees', desc: 'Fees for premium features or marketplace access are clearly disclosed. We do not charge hidden fees.', icon: CreditCard },
    { title: 'Liability', desc: 'Fix Link is a marketplace connecting users. We are not liable for the specific actions or quality of independent contractors.', icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-32 space-y-16">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-5xl font-black text-primary">Terms of Service</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Clear rules for a better marketplace experience. Read our guidelines for customers and professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {sections.map((s, i) => (
           <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-border hover:border-accent/20 hover:shadow-xl transition-all space-y-6">
             <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
               <s.icon className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold">{s.title}</h3>
             <p className="text-muted-foreground font-medium leading-relaxed">{s.desc}</p>
           </div>
         ))}
      </div>

      <div className="bg-muted p-12 md:p-20 rounded-[3rem] space-y-8">
        <h2 className="text-3xl font-bold">The Fine Print</h2>
        <div className="prose prose-slate max-w-none text-muted-foreground font-medium leading-loose space-y-6">
          <p>
            Welcome to Fix Link. These Terms of Service ("Terms") govern your access to and use of our website and mobile application. By accessing or using Fix Link, you agree to be bound by these Terms.
          </p>
          <p>
            Our marketplace connects high-quality tradesmen with customers searching for home services. Fix Link serves as the intermediary, providing the technology to facilitate these connections, but is not the service provider itself.
          </p>
          <p>
            We reserve the right to update these terms at any time. Significant changes will be communicated via email or through prominent notice within the app.
          </p>
        </div>
      </div>
    </div>
  );
}
