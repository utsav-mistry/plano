"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    stars: 5,
    quote: "Planoo cut our billing admin time by 80%. Invoices just appear — accurate and on time. I haven't manually chased a payment in months.",
    name: "Sarah Chen",
    role: "Head of Finance",
    company: "Lightspeed SaaS",
    initials: "SC",
    color: "#8f5580",
  },
  {
    stars: 5,
    quote: "The plan flexibility is incredible. Our customers can self-upgrade, downgrade, or pause — and the invoice adjustments happen automatically.",
    name: "Marcus Webb",
    role: "CTO",
    company: "Deployify",
    initials: "MW",
    color: "#714b67",
  },
  {
    stars: 5,
    quote: "We handle subscriptions for 200+ enterprise clients. Planoo's accuracy is faultless. Every invoice is right, every time — no exceptions.",
    name: "Priya Nair",
    role: "Founder & CEO",
    company: "StackBase",
    initials: "PN",
    color: "#a97096",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-4" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#604058" aria-hidden="true">
          <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ t, delay }: { t: typeof testimonials[0]; delay: number }) {
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
      className={`bg-white rounded-2xl p-6 sm:p-8 border border-[#d6c2d2] transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <StarRating count={t.stars} />
      <blockquote className="text-[#3d2738] text-[15px] italic leading-relaxed mb-6" style={{ fontFamily: "var(--font-sans)" }}>
        "{t.quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: t.color, fontFamily: "var(--font-sans)" }}
          aria-hidden="true"
        >
          {t.initials}
        </div>
        <div>
          <p className="font-semibold text-[#2a1a27] text-sm" style={{ fontFamily: "var(--font-sans)" }}>{t.name}</p>
          <p className="text-xs text-[#946985]" style={{ fontFamily: "var(--font-sans)" }}>{t.role} · {t.company}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#f5f0f4]" aria-labelledby="testimonials-heading">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-[#604058] bg-[#ebe0e8] mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Customers
          </span>
          <h2
            id="testimonials-heading"
            className="font-serif font-bold text-[#2a1a27]"
            style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
          >
            Loved by teams who bill at scale.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
