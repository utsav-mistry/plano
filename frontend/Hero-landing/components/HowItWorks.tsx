"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Add your products",
    description:
      "Configure plans, pricing, billing periods, and trial options in minutes.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="12" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="12" width="7" height="7" rx="1" />
        <path d="M15.5 12v7M12 15.5h7" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Create subscriptions",
    description:
      "Assign customers, set start dates, apply discounts, and go live instantly.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="8" r="4" />
        <path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Automate everything",
    description:
      "Invoices generate, payments are tracked, and reports update live — hands-free.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4 13h8l-3 7 9-11h-8l3-7z" />
      </svg>
    ),
  },
];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export default function HowItWorks() {
  const { ref, visible } = useInView(0.15);

  return (
    <section
      className="py-24"
      style={{ background: "#2a1a27" }}
      aria-labelledby="how-heading"
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              background: "rgba(169,112,150,0.18)",
              color: "#cba3bc",
            }}
          >
            How it works
          </span>

          <h2
            id="how-heading"
            className="font-serif font-bold text-white"
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}
          >
            Up and running in minutes.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 relative">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative flex flex-col items-center text-center px-8 py-2 transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-[28px] left-[50%] w-full border-t-2 border-dashed"
                  style={{
                    borderColor: "rgba(203,163,188,0.25)",
                  }}
                />
              )}

              {/* Icon + Number */}
              <div className="relative mb-6">
                <span
                  className="font-mono text-5xl font-bold absolute -top-4 -left-2 leading-none select-none"
                  style={{
                    color: "rgba(169,112,150,0.18)",
                  }}
                >
                  {step.number}
                </span>

                <div
                  className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-[#cba3bc]"
                  style={{
                    background: "rgba(169,112,150,0.15)",
                    border: "1px solid rgba(203,163,188,0.2)",
                  }}
                >
                  {step.icon}
                </div>
              </div>

              {/* Text */}
              <h3 className="font-serif font-bold text-white text-xl mb-3">
                {step.title}
              </h3>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "#cba3bc" }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}