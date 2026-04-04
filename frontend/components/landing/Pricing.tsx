"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "29",
    tagline: "For indie founders getting started.",
    features: ["Up to 50 active subscriptions", "Automated invoicing", "Basic tax rules", "Email support"],
    cta: "Start free trial",
    featured: false,
  },
  {
    name: "Growth",
    price: "89",
    tagline: "For scaling SaaS teams.",
    features: ["Unlimited subscriptions", "Smart tax automation", "Customer self-serve portal", "Priority support + Slack"],
    cta: "Start free trial",
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "249",
    tagline: "For large-scale billing operations.",
    features: ["Custom billing workflows", "Dedicated account manager", "SSO & advanced security", "SLA + uptime guarantee"],
    cta: "Contact sales",
    featured: false,
  },
];

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function Pricing() {
  const { ref, visible } = useInView();

  return (
    <section id="pricing" className="py-24 bg-white" aria-labelledby="pricing-heading">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-[#604058] bg-[#ebe0e8] mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Pricing
          </span>
          <h2
            id="pricing-heading"
            className="font-serif font-bold text-[#2a1a27]"
            style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: "1.2", letterSpacing: "-0.02em" }}
          >
            Simple, transparent{" "}
            <span className="relative inline-block px-4">
              <span className="relative z-10">pricing.</span>
              {/* Teal circle SVG — Inlined for absolute reliability */}
              <svg
                width="293"
                height="174"
                viewBox="0 0 293 174"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "110%",
                  height: "auto",
                  zIndex: 0,
                  pointerEvents: "none",
                  mixBlendMode: "multiply",
                }}
              >
                <path
                  d="M164.93 29.9908H192.056C191.356 29.7334 189.533 29.0531 187.71 28.3727C187.857 27.7843 188.023 27.1959 188.17 26.6259C206.125 30.8918 224.153 34.79 241.96 39.5523C250.597 41.8691 258.994 45.3627 267.115 49.1138C282.399 56.1929 288.237 69.9467 291.257 85.3554C291.809 88.1687 292.085 91.0371 292.472 93.8872C295.713 117.239 283.891 129.026 260.835 143.423C259.38 144.324 257.484 144.581 256.176 145.611C235.331 162.178 210.157 166.591 184.966 170.673C142.464 177.55 100.828 173.909 60.5729 158.409C48.64 153.812 36.8913 148.369 25.8423 141.97C9.04793 132.28 1.70038 116.265 0.282427 97.5095C-2.35091 62.6285 13.5043 35.268 44.7545 19.4181C65.4529 8.93721 87.606 3.91744 110.533 2.46483C132.704 1.06739 154.986 -0.458772 177.158 0.129626C200.729 0.754799 224.097 4.59777 245.882 14.5454C248.921 15.9244 251.259 18.8113 253.083 21.9923C238.829 19.8777 224.613 17.6161 210.342 15.6854C203.178 14.7109 195.923 14.1225 188.704 13.7363C153.808 11.8608 119.298 14.4902 85.5804 23.9965C74.2184 27.1959 63.0037 31.4618 52.4151 36.6655C26.1922 49.5367 11.9575 76.1249 14.9591 104.589C15.9351 113.764 20.0969 120.898 28.2179 125.55C67.5706 148.112 109.888 157.728 155.152 154.584C177.95 153.003 200.582 150.502 222.201 142.448C238.461 136.381 253.93 128.897 267.023 117.258C281.349 104.515 284.185 90.081 275.328 72.9439C273.67 69.7261 270.558 66.968 267.52 64.7983C255.826 56.3952 241.481 53.8393 228.756 47.9002C209.347 38.8536 188.409 37.7687 168.19 33.0064C166.993 32.7306 165.888 32.0686 164.746 31.5905C164.801 31.0573 164.875 30.5241 164.93 29.9908Z"
                  fill="#00DAC5"
                />
              </svg>
            </span>
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border transition-all duration-500 relative
                ${plan.featured
                  ? "border-[#604058] shadow-[0_8px_40px_rgba(96,64,88,0.18)] lg:scale-[1.02] bg-white"
                  : "border-[#d6c2d2] bg-[rgba(240,227,236,0.12)]"
                }
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: "#604058", color: "#fff", fontFamily: "var(--font-sans)" }}
                >
                  {plan.badge}
                </span>
              )}

              <p className="text-xs font-semibold uppercase tracking-widest text-[#946985] mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[42px] font-bold text-[#2a1a27] leading-none" style={{ fontFamily: "var(--font-mono)" }}>
                  ${plan.price}
                </span>
                <span className="text-sm text-[#946985]" style={{ fontFamily: "var(--font-sans)" }}>/mo</span>
              </div>
              <p className="text-sm text-[#5a3c53] mb-6" style={{ fontFamily: "var(--font-sans)" }}>{plan.tagline}</p>

              <ul className="space-y-3 mb-8" role="list">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#3d2738]" style={{ fontFamily: "var(--font-sans)" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
                      <circle cx="8" cy="8" r="7" stroke="#604058" strokeWidth="1.5" />
                      <path d="M5 8l2 2 4-4" stroke="#604058" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center py-3 rounded-xl text-[15px] font-semibold transition-all duration-180 focus-visible:outline-[2px] focus-visible:outline-[#a97096] focus-visible:outline-offset-2
                  ${plan.featured
                    ? "bg-[#604058] text-white hover:bg-[#4e3347] hover:scale-[1.02] shadow-[0_4px_16px_rgba(96,64,88,0.3)]"
                    : "bg-[#ebe0e8] text-[#604058] hover:bg-[#d6c2d2] hover:scale-[1.01]"
                  }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[#946985] mt-8" style={{ fontFamily: "var(--font-sans)" }}>
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
