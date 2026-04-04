'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Globe, 
  Mail,
  Scale
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <Eye className="text-plano-600" />,
      title: "Data Collection",
      content: "We collect only what's necessary to provide our service. This includes account details (name, email), billing information for subscription management, and technical data for system security and performance monitoring."
    },
    {
      icon: <Lock className="text-secondary-500" />,
      title: "Data Protection",
      content: "All data is encrypted in transit using SSL/TLS protocols and at rest using AES-256 encryption. We utilize industry-standard data centers and firewalls to ensure your subscription data remains private and secure."
    },
    {
      icon: <Database className="text-purple-500" />,
      title: "How We Use Data",
      content: "Your data is used solely to manage your recurring billing, process payments, and improve the Plano platform experience. We never sell your personal information to third parties."
    },
    {
      icon: <Globe className="text-info-500" />,
      title: "Third-party sharing",
      content: "We share data with trusted payment processors (like Stripe or Razorpay) and essential infrastructure providers only when required to process your subscriptions. These providers are bound by strict confidentiality agreements."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfafc]">
      <Navbar />
      
      {/* Decorative Blur and Texture */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-plano-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-5%] left-[-5%] w-[30vw] h-[30vw] bg-plano-300/10 rounded-full blur-[100px]" />
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
             Privacy <span className="text-[#714b67]">Policy</span>
           </h1>
           
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#f0e3ec] text-[10px] font-bold text-[#714b67] uppercase tracking-widest border border-[#e1c8d9]">
                Version 2.4
              </span>
              <span className="text-gray-400 text-xs font-medium">Last Updated: February 12, 2026</span>
           </div>
           
           <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
             At Planoo, we believe that transparency is the foundation of trust. 
             This policy outlines our promise to protect your subscription data and respect your personal privacy.
           </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
           {sections.map((sec, i) => (
             <div key={i} className="p-8 rounded-[2rem] bg-white border border-[#e1c8d9] shadow-[0_8px_30px_rgba(113,75,103,0.05)] hover:shadow-[0_20px_50px_rgba(113,75,103,0.1)] transition-all group overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gray-50 rounded-full transition-transform group-hover:scale-110 duration-500" />
                <div className="relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-[#fcfafc] border border-[#f0e3ec] flex items-center justify-center mb-6 shadow-sm">
                      {sec.icon}
                   </div>
                   <h3 className="text-xl font-serif font-bold text-[#2a1a27] mb-3">{sec.title}</h3>
                   <p className="text-sm text-gray-500 leading-relaxed">{sec.content}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Detailed Content */}
        <div className="flex flex-col gap-12 bg-white p-10 md:p-16 rounded-[3rem] border border-[#e1c8d9] shadow-sm mb-20">
           <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-serif font-bold text-[#2a1a27] flex items-center gap-3">
                 <ShieldCheck className="text-[#16a34a]" /> 1. Overview
              </h2>
              <p className="text-[#5a4655] leading-loose">
                 Planoo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the subscription management platform available at plano.io. 
                 This Privacy Policy governs the manner in which Planoo collects, uses, maintains, and discloses information collected 
                 from users (&quot;User&quot;) of the website.
              </p>
           </section>

           <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-serif font-bold text-[#2a1a27] flex items-center gap-3">
                 <Scale className="text-plano-600" /> 2. Your Rights
              </h2>
              <p className="text-[#5a4655] leading-loose">
                 Under various data protection regulations (including GDPR and CCPA), you have the right to access, rectify, 
                 port, and erase your data. You may also object to or restrict certain processing of your information. 
                 Planoo provides built-in tools within your <Link href="/profile" className="text-[#714b67] font-bold underline">Dashboard</Link> to 
                 manage these rights directly.
              </p>
           </section>

           <section className="flex flex-col gap-6 p-8 rounded-2xl bg-plano-50 border border-plano-100">
              <div className="flex items-center gap-3">
                 <Mail className="text-[#714b67]" />
                 <h2 className="text-xl font-serif font-bold text-[#2a1a27]">Questions or Concerns?</h2>
              </div>
              <p className="text-sm text-[#714b67]/80">
                 Our dedicated Privacy Team is available to assist you with any data-related queries. 
                 Please reach out to our Data Protection Officer at:
              </p>
              <div className="flex flex-wrap gap-4">
                 <a 
                   href="mailto:support@planoo.tech" 
                   className="px-6 py-3 rounded-xl bg-[#714b67] text-white font-bold text-sm hover:bg-black transition-all shadow-lg"
                 >
                    Email Privacy Team
                 </a>
                 <div className="px-6 py-3 rounded-xl bg-white border border-[#e1c8d9] text-[#714b67] font-bold text-sm">
                   support@planoo.tech
                 </div>
              </div>
           </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
