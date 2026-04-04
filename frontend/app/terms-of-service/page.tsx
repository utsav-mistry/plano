'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Scale, 
  Zap, 
  CreditCard, 
  AlertTriangle, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function TermsOfServicePage() {
  const provisions = [
    {
      icon: <Zap className="text-plano-600" />,
      title: "Service Delivery",
      content: "We provide a subscription management platform. Our service is provided 'as is' and 'as available'. We strive for 99.9% uptime but don't guarantee constant, uninterrupted access."
    },
    {
      icon: <CreditCard className="text-secondary-500" />,
      title: "Payments & Billing",
      content: "You agree to pay the fees for the plan you select. Subscription fees are charged at the beginning of each billing period and are generally non-refundable unless required by law."
    },
    {
      icon: <ShieldCheck className="text-success-500" />,
      title: "Account Security",
      content: "You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately of any unauthorized use of your account."
    },
    {
      icon: <AlertTriangle className="text-danger-500" />,
      title: "Acceptable Use",
      content: "You agree not to use Planoo for any illegal activities, to harass others, or to interfere with the system's security and performance."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfafc]">
      <Navbar />
      
      {/* Decorative Blur */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] bg-plano-300/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[0%] right-[-5%] w-[35vw] h-[35vw] bg-secondary-300/10 rounded-full blur-[100px]" />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-32">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Link 
             href="/" 
             className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#714b67] hover:translate-x-[-4px] transition-transform"
           >
              <ArrowLeft size={14} /> Back to Home
           </Link>
           
           <h1 className="font-serif text-5xl md:text-6xl text-[#2a1a27] font-bold tracking-tight">
             Terms of <span className="text-plano-600">Service</span>
           </h1>
           
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-plano-50 text-[10px] font-bold text-plano-700 uppercase tracking-widest border border-plano-100">
                Official Release
              </span>
              <span className="text-gray-400 text-xs font-medium">Effective Date: April 4, 2026</span>
           </div>
           
           <p className="text-lg text-gray-500 leading-relaxed max-w-2xl font-medium">
             Welcome to Planoo. These terms govern your use of our platform and services. 
             By accessing Planoo, you agree to be bound by these legal provisions.
           </p>
        </div>

        {/* Provisions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
           {provisions.map((item, i) => (
             <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-[#e1c8d9] shadow-[0_8px_30px_rgba(113,75,103,0.04)] hover:shadow-[0_20px_60px_rgba(113,75,103,0.08)] transition-all group relative">
                <div className="relative z-10 text-left">
                   <div className="w-14 h-14 rounded-2xl bg-[#fcfafc] border border-[#f0e3ec] flex items-center justify-center mb-6 shadow-sm group-hover:bg-white group-hover:border-plano-200 group-hover:shadow-md transition-all duration-300">
                      {item.icon}
                   </div>
                   <h3 className="text-xl font-serif font-bold text-[#2a1a27] mb-3">{item.title}</h3>
                   <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.content}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Deep Dive Section */}
        <div className="flex flex-col gap-12 bg-white p-10 md:p-16 rounded-[3.5rem] border border-[#e1c8d9] shadow-sm mb-20">
           <section className="flex flex-col gap-6">
              <h2 className="text-2xl font-serif font-bold text-[#2a1a27] flex items-center gap-3">
                 <BookOpen className="text-plano-600" /> 1. User Responsibility
              </h2>
              <div className="flex flex-col gap-4 text-[#5a4655] leading-loose font-medium">
                 <p>As a user of Planoo, you represent that you are at least 18 years old and have the legal capacity to enter into these terms.</p>
                 <p>You agree to provide accurate, current, and complete information during the registration process and to keep your account information up-to-date at all times.</p>
              </div>
           </section>

           <section className="flex flex-col gap-6">
              <h2 className="text-2xl font-serif font-bold text-[#2a1a27] flex items-center gap-3">
                 <Scale className="text-secondary-500" /> 2. Limitation of Liability
              </h2>
              <p className="text-[#5a4655] leading-loose font-medium">
                 To the maximum extent permitted by law, Planoo and its affiliates shall not be liable for any indirect, incidental, 
                 special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or 
                 indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
           </section>

           <section className="mt-10 p-10 rounded-[2.5rem] bg-[#2a1a27] text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex flex-col gap-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 opacity-80 mb-2">
                       <MessageSquare size={18} />
                       <span className="text-xs font-bold uppercase tracking-widest">Legal Inquiry</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold">Have a legal question?</h3>
                    <p className="text-sm text-white/60 max-w-sm">Our legal team is available for any clarification regarding these terms of service.</p>
                 </div>
                 <a 
                   href="mailto:support@planoo.tech" 
                   className="px-10 h-14 rounded-xl bg-plano-300 text-[#2a1a27] font-bold text-sm uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-xl"
                 >
                    Contact Legal
                 </a>
              </div>
           </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
