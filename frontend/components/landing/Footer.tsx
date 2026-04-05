"use client";

import { useState } from "react";
import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Resources: ["Documentation", "API Reference", "Status", "Community", "Support"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setSubStatus("error"); return; }
    setSubStatus("success");
  };

  return (
    <>
      {/* Footer CTA strip */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "#2a1a27" }}
        aria-labelledby="cta-heading"
      >
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(143,85,128,0.25) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2
            id="cta-heading"
            className="font-serif font-bold text-white mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
          >
            Start automating subscriptions today.
          </h2>
          <p className="text-[#cba3bc] text-lg mb-10 max-w-lg mx-auto" style={{ fontFamily: "var(--font-sans)" }}>
            Join 2,000+ SaaS teams who&apos;ve taken billing off their plate with Planoo.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] transition-all duration-180 hover:scale-[1.02] focus-visible:outline-[2px] focus-visible:outline-white focus-visible:outline-offset-3"
            style={{ background: "#8f5580", color: "#fff", fontFamily: "var(--font-sans)", boxShadow: "0 4px 24px rgba(143,85,128,0.4)" }}
          >
            Start automating today
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 5l4 3-4 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-xs text-[#a97096] mt-4" style={{ fontFamily: "var(--font-sans)" }}>
            No credit card · Cancel anytime
          </p>
        </div>
      </section>

      {/* Main footer */}
      <footer className="bg-[#1a0f17] text-[#cba3bc]" role="contentinfo">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          {/* Logo + tagline */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 mb-12">
            <div className="flex-shrink-0 max-w-[240px]">
              <span className="font-serif font-bold text-3xl no-underline tracking-tight">
                <span className="text-white">plano</span>
                <span className="text-[#8f5580]">o</span>
              </span>
              <p className="text-sm mt-3 leading-relaxed text-[#946985]" style={{ fontFamily: "var(--font-sans)" }}>
                Recurring revenue, simplified. Built for SaaS teams.
              </p>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#8f5580] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                    {category}
                  </p>
                  <ul className="space-y-2.5" role="list">
                    {links.map((link) => (
                      <li key={link}>
                        <a
                          href={
                            link === "Features" ? "#features" :
                              link === "Pricing" ? "#pricing" :
                                link === "Integrations" ? "/portal/shop" :
                                  link === "Changelog" ? "/portal/reports" :
                                    link === "Roadmap" ? "/portal/reports" :
                                      link === "About" ? "/portal" :
                                        link === "Blog" ? "/portal/reports" :
                                          link === "Careers" ? "/signup" :
                                            link === "Press" ? "/portal/reports" :
                                              link === "Contact" ? "mailto:support@planoo.tech" :
                                                link === "Documentation" ? "/portal/reports" :
                                                  link === "API Reference" ? "/portal/reports" :
                                                    link === "Status" ? "/portal/reports" :
                                                      link === "Community" ? "/signup" :
                                                        link === "Support" ? "mailto:support@planoo.tech" :
                                                          link === "Privacy Policy" ? "/privacy-policy" :
                                                            link === "Terms of Service" ? "/terms-of-service" :
                                                              link === "Cookie Policy" ? "/privacy-policy" :
                                                                link === "GDPR" ? "/privacy-policy" :
                                                                  "/"
                          }
                          className="text-sm text-[#a97096] hover:text-white transition-colors duration-150"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#3d2738] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="text-xs text-[#5a3c53]" style={{ fontFamily: "var(--font-sans)" }}>
              © 2026 Planoo, Inc. All rights reserved.
              <span className="mx-2 text-[#3d2738]">·</span>
              <a href="/privacy-policy" className="hover:text-[#a97096] transition-colors">Privacy</a>
              <span className="mx-2 text-[#3d2738]">·</span>
              <a href="/terms-of-service" className="hover:text-[#a97096] transition-colors">Terms</a>
            </p>

            {/* Newsletter */}
            <form
              onSubmit={handleSubscribe}
              aria-label="Newsletter signup"
              className="flex items-center gap-0 min-w-0 sm:min-w-[300px]"
            >
              {subStatus === "success" ? (
                <p className="text-xs text-[#a97096]" style={{ fontFamily: "var(--font-sans)" }}>
                  ✓ Thanks! You&apos;re subscribed.
                </p>
              ) : (
                <>
                  <label htmlFor="newsletter-email" className="sr-only">Your email address</label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setSubStatus("idle"); }}
                    placeholder="Your email"
                    required
                    className="flex-1 min-w-0 px-3 py-2 text-sm text-white bg-[#2a1a27] border border-[#3d2738] rounded-l-lg outline-none focus:border-[#8f5580] transition-colors"
                    style={{ fontFamily: "var(--font-sans)", borderRight: "none" }}
                    aria-invalid={subStatus === "error"}
                    aria-describedby={subStatus === "error" ? "newsletter-error" : undefined}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold rounded-r-lg transition-colors duration-150 hover:bg-[#714b67] focus-visible:outline-[2px] focus-visible:outline-[#a97096]"
                    style={{ background: "#8f5580", color: "#fff", fontFamily: "var(--font-sans)" }}
                  >
                    Subscribe
                  </button>
                </>
              )}
            </form>
            {subStatus === "error" && (
              <p id="newsletter-error" className="text-xs text-red-400" style={{ fontFamily: "var(--font-sans)" }}>
                Please enter a valid email.
              </p>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
