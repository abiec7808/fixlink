import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      {/* Info Column */}
      <div className="space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl font-black text-primary tracking-tight">
            Get in <span className="text-accent">Touch</span>.
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-md leading-relaxed">
            Have a question? Our support team is here to help you get the most out of Fix Link.
          </p>
        </div>

        <div className="space-y-8">
          {[
            { icon: Mail, title: 'Email Us', info: 'support@fixlink.co.za', sub: 'We reply within 2 hours.' },
            { icon: Phone, title: 'Call Support', info: '+27 21 555 0123', sub: 'Mon-Fri, 8am - 6pm' },
            { icon: MapPin, title: 'Our Office', info: 'Cape Town, South Africa', sub: 'Tech Hub, Waterfront' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-6 group cursor-pointer hover:translate-x-2 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                 <item.icon className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">{item.title}</h3>
                 <p className="text-xl font-bold">{item.info}</p>
                 <p className="text-sm text-muted-foreground font-medium">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 flex items-center gap-6">
           <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center">
             <MessageSquare className="w-6 h-6" />
           </div>
           <p className="text-sm font-bold text-accent italic">
              "Professional support that actually listens. Experience the Fix Link difference."
           </p>
        </div>
      </div>

      {/* Form Column */}
      <div className="p-10 md:p-14 rounded-[3.5rem] bg-white border border-border shadow-2xl shadow-primary/5 space-y-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-black">Send a Message</h2>
          <p className="text-muted-foreground font-medium">Briefly describe your request below.</p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Your Name</label>
               <input type="text" placeholder="John Doe" className="w-full p-4 rounded-2xl bg-muted/30 border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
               <input type="email" placeholder="john@example.com" className="w-full p-4 rounded-2xl bg-muted/30 border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium" />
            </div>
          </div>
          
          <div className="space-y-2">
             <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
             <select className="w-full p-4 rounded-2xl bg-muted/30 border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium appearance-none">
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Billing Question</option>
                <option>Partner Request</option>
             </select>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Your Message</label>
             <textarea rows={4} placeholder="How can we help?" className="w-full p-4 rounded-2xl bg-muted/30 border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium resize-none"></textarea>
          </div>

          <button type="button" className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
             Send Now
             <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
