"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does recurring billing work?",
    a: "Planoo automatically generates and sends invoices on your configured billing cycle — daily, weekly, monthly, or yearly. Payments are collected, tracked, and reconciled without any manual work from your team.",
  },
  {
    q: "Can I offer free trials?",
    a: "Yes. You can set any trial length per plan. During the trial, subscriptions are active but no invoice is generated until the trial period ends. Customers get reminders before they're billed.",
  },
  {
    q: "What payment methods are supported?",
    a: "Planoo integrates with Stripe for card payments (Visa, Mastercard, Amex), and also supports SEPA Direct Debit, ACH transfers, and link-based payment requests for bank transfers.",
  },
  {
    q: "How are taxes handled?",
    a: "Tax rules are configured per plan, product, or region. Planoo applies the correct VAT, GST, or sales tax automatically based on the customer's billing address — and includes a full tax breakdown on every invoice.",
  },
  {
    q: "Can customers upgrade or downgrade plans?",
    a: "Yes. Customers can manage their own subscription from the self-serve portal. Plan changes are prorated automatically — no manual credit notes or re-invoicing required.",
  },
  {
    q: "Is Planoo SOC 2 compliant?",
    a: "Yes. Planoo is SOC 2 Type II certified. All data is encrypted at rest and in transit. We never store card details — payment data is handled entirely by PCI-DSS compliant processors.",
  },
  {
    q: "Can I export invoices to my accounting tool?",
    a: "Absolutely. Planoo integrates with QuickBooks, Xero, and FreshBooks. You can also export all invoices as PDF or CSV at any time from the reports dashboard.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-24 bg-[#f5f0f4]" aria-labelledby="faq-heading">
      <div className="max-w-[760px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-[#604058] bg-[#ebe0e8] mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="font-serif font-bold text-[#2a1a27]"
            style={{ fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: "1.25", letterSpacing: "-0.02em" }}
          >
            Got questions? We've got{" "}
            <span className="relative inline-block">
              answers.
              {/* Blue underline highlight SVG */}
              <img
                src="/SVG/inline-svg-1.svg"
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "2%",
                  bottom: "-6px",
                  width: "100%",
                  height: "auto",
                  pointerEvents: "none",
                }}
              />
            </span>
          </h2>
        </div>

        <div className="divide-y divide-[#d6c2d2]" role="list">
          {faqs.map((item, i) => (
            <div key={i} role="listitem">
              <button
                id={`faq-btn-${i}`}
                aria-expanded={openIndex === i}
                aria-controls={`faq-panel-${i}`}
                className="w-full text-left flex items-center justify-between gap-4 py-5 focus-visible:outline-[2px] focus-visible:outline-[#604058] focus-visible:outline-offset-2 rounded"
                onClick={() => toggle(i)}
              >
                <span className="font-semibold text-[#2a1a27] text-base" style={{ fontFamily: "var(--font-sans)" }}>
                  {item.q}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                  className="flex-shrink-0 text-[#604058] transition-transform duration-300"
                  style={{ transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-btn-${i}`}
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === i ? "500px" : "0px",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <p
                  className="text-[#4e3347] text-[15px] leading-relaxed pb-5 pt-1"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
