"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" /><circle cx="12" cy="12" r="4" />
        <path d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      </svg>
    ),
    title: "Recurring Plans",
    body: "Set daily, weekly, monthly, or yearly billing cycles. Auto-renew or let customers manage their own plan from a self-service portal.",
    link: "#",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Smart Invoicing",
    body: "Invoices generate the moment a subscription goes active. Tax rules, discounts, and line items applied automatically — zero manual entry.",
    link: "#",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    title: "Payment Tracking",
    body: "See every paid, pending, and overdue invoice in one view. Reconcile payments without leaving the platform.",
    link: "#",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Reports & Revenue",
    body: "MRR, churn, and invoice aging — visualized. Export to PDF or your accounting tool with one click.",
    link: "#",
  },
];

function FeatureCard({ feature, delay }: { feature: typeof features[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group p-8 rounded-2xl border border-[#d6c2d2] bg-white hover:border-[#604058] transition-all duration-200 cursor-default
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{
        transitionProperty: "opacity, transform, border-color, box-shadow",
        transitionDuration: "200ms, 500ms, 200ms, 200ms",
        transitionDelay: `${delay}ms, ${delay}ms, 0ms, 0ms`,
        background: "rgba(240,227,236,0.18)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(96,64,88,0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-[#604058]"
        style={{ background: "rgba(96,64,88,0.1)" }}
      >
        {feature.icon}
      </div>
      <h3 className="font-serif font-bold text-[#2a1a27] text-4xl mb-3">{feature.title}</h3>
      <p className="text-[#5a3c53] text-[15px] leading-relaxed mb-4" style={{ fontFamily: "var(--font-sans)" }}>
        {feature.body}
      </p>
      <Link
        href="/login"
        className="text-sm font-medium text-[#604058] hover:text-[#4e3347] transition-colors inline-flex items-center gap-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Learn more
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 pb-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-[#604058] bg-[#ebe0e8] mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Features
          </span>
          <h2 className="font-serif font-bold text-[#2a1a27] max-w-3xl mx-auto" style={{ fontSize: "clamp(40px, 5vw, 56px)", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
            Every part of the subscription lifecycle,{" "}
            <span className="relative inline-block">
              handled.
              {/* Green wavy underline SVG — sits below the text */}
              <img
                src="/SVG/green_highlight_03.svg"
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-2%",
                  bottom: "-4px",
                  width: "104%",
                  height: "auto",
                  pointerEvents: "none",
                }}
              />
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
