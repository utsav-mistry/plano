"use client";

import { useEffect, useRef, useState } from "react";

function useMrrCount(target: number, inView: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(interval); }
      else setValue(start);
    }, 16);
    return () => clearInterval(interval);
  }, [inView, target]);
  return value;
}

const recentInvoices = [
  { id: "INV-0041", company: "Acme Corp", amount: "₹1,200", status: "Paid" },
  { id: "INV-0040", company: "Bright Labs", amount: "₹840", status: "Paid" },
  { id: "INV-0039", company: "Nova SaaS", amount: "₹3,600", status: "Pending" },
  { id: "INV-0038", company: "Vertex Inc", amount: "₹560", status: "Paid" },
];

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [mrrInView, setMrrInView] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const mrrRef = useRef<HTMLDivElement>(null);
  const mrr = useMrrCount(48720, mrrInView);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = mrrRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setMrrInView(true); }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: "#f5f0f4" }}
      aria-labelledby="hero-headline"
    >
      {/* Ambient blob */}
      <div
        aria-hidden="true"
        className="absolute top-[-10%] right-[-8%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(148,105,133,0.28) 0%, rgba(235,224,232,0.18) 55%, transparent 80%)",
          filter: "blur(64px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-5%] left-[-5%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(96,64,88,0.1) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 w-full py-24 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left: Text stack */}
          <div className="flex-1 lg:max-w-[55%] z-10 text-center lg:text-left">
            {/* Badge */}
            <div
              className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0ms" }}
            >
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ background: "#ebe0e8", color: "#604058", fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#604058] inline-block animate-pulse" />
                Trusted by 2,000+ subscription businesses
              </span>
            </div>

            {/* H1 */}
            <h1
              id="hero-headline"
              className={`font-serif font-bold text-[#2a1a27] leading-[1.05] tracking-tight mb-6 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{
                fontSize: "clamp(40px, 5.5vw, 72px)",
                letterSpacing: "-0.03em",
                transitionDelay: "100ms",
              }}
            >
              Subscriptions that{" "}
              <br className="hidden sm:block" />
              <span className="highlight-wrap">
                {/* Yellow marker SVG sits BEHIND the text via z-index */}
                <img
                  src="/SVG/yellow_highlight_bold_05.svg"
                  alt=""
                  aria-hidden="true"
                  className="highlight-svg"
                />
                <span className="highlight-text">run themselves</span>
              </span>
              .
            </h1>

            {/* Subheadline */}
            <p
              id="hero-sub"
              className={`text-[#4e3347] mb-8 max-w-[520px] transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ fontSize: "18px", lineHeight: "1.65", fontFamily: "var(--font-sans)", transitionDelay: "200ms" }}
            >
              Automate recurring billing, invoices, taxes, and renewals — from one clean dashboard. Built for SaaS teams who'd rather ship than chase payments.
            </p>

            {/* CTA row */}
            <div
              className={`flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "350ms" }}
            >
              <a
                href="#"
                className="btn-primary text-[15px] px-6 py-3"
                aria-describedby="hero-sub"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Start free - 14 days
              </a>
              <a
                href="#"
                className="btn-ghost text-[15px] px-6 py-3"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                See it live →
              </a>
            </div>

            {/* Social proof micro-line */}
            <p
              className={`text-xs text-[#946985] flex flex-wrap justify-center lg:justify-start gap-x-3 gap-y-1 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ fontFamily: "var(--font-sans)", transitionDelay: "450ms" }}
            >
              {["No credit card required", "Cancel anytime", "SOC 2 compliant"].map((item, i) => (
                <span key={item} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-[#b894ae]" aria-hidden="true" />}
                  {item}
                </span>
              ))}
            </p>
          </div>

          {/* Right: Dashboard mockup */}
          <div
            className={`flex-1 lg:max-w-[45%] w-full z-10 transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}
            style={{ transitionDelay: "500ms" }}
          >
            {/* Wrapper for overflow-allowing elements */}
            <div className="relative w-full max-w-[540px] mx-auto">
              {/* Decoration SVG (Desktop only) — Inlined for absolute reliability */}
              <svg
                width="251"
                height="233"
                viewBox="0 0 251 233"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -top-12 -left-10 w-28 h-auto z-20 hidden lg:block"
                style={{ filter: "drop-shadow(0 4px 12px rgba(251,177,48,0.3))" }}
                aria-hidden="true"
              >
                <path d="M27.9909 66C19.5825 62.6682 11.0253 59.6392 2.84013 55.7016C1.05428 54.8686 -0.136289 50.8552 0.0125324 48.3564C0.0125324 47.2962 4.0307 45.9332 6.33743 45.5546C8.1977 45.3274 10.2812 46.3875 12.2903 46.9176C13.4064 41.9198 14.4482 36.922 15.5643 32C16.7549 32 17.9455 32 19.0616 32C22.7078 42.7528 26.3539 53.4298 30 64.1826L27.9909 66Z" fill="#FBB130"/>
                <path d="M184.068 12.3C188.832 11.1 192.765 10.05 196.622 9C196.773 9.6 196.924 10.2 197 10.725C190.42 18.15 183.841 25.575 177.261 33C175.976 32.55 174.69 32.1 173.404 31.65C173.253 22.725 172.799 13.8 173.102 4.95C173.102 3.225 175.9 1.65 177.413 0C179.152 1.725 181.421 3.15 182.555 5.175C183.614 7.125 183.538 9.75 184.068 12.3Z" fill="#FBB130"/>
                <path d="M120.941 93C108.137 69.53 96.6058 48.2276 85 27C95.1832 29.5413 122.438 80.2933 120.941 93Z" fill="#FBB130"/>
                <path d="M150.345 91C147.495 80.3955 162.978 42.7911 171.914 37C173.3 43.0167 157.586 83.1031 150.345 91Z" fill="#FBB130"/>
                <path d="M89.6667 101C75.3704 100.259 38.8519 80.3333 37 71C55.5185 80.4074 73.2963 89.3704 91 98.4074C90.5556 99.2963 90.1111 100.185 89.6667 101Z" fill="#FBB130"/>
                <path d="M177 99.8449C194.085 91.3287 211.169 82.8865 229 74C227.956 82.6643 190.802 101.918 177 99.8449Z" fill="#FBB130"/>
                <path d="M250.925 70.8595C248.434 71.6791 245.718 73.3183 243.454 72.9458C241.643 72.6477 238.926 69.8164 239.002 68.1772C239.002 66.389 241.416 63.9302 243.378 63.0361C244.284 62.6635 246.623 65.2713 248.283 66.538C249.189 67.9537 250.094 69.4438 251 70.8595H250.925Z" fill="#FBB130"/>
                <path d="M1.17783 183.178C2.46817 183.199 3.78917 183.318 5.08083 183.258C15.9966 182.669 26.8971 182.031 37.8129 181.443C38.9433 181.38 40.135 181.514 41.2267 181.841C41.7566 181.997 42.4371 182.807 42.4125 183.329C42.4199 183.867 41.7794 184.558 41.2416 184.892C40.6551 185.241 39.8793 185.326 39.1688 185.364C27.8151 186.092 16.4934 186.837 5.17438 187.419C3.88272 187.479 2.49568 186.461 1.16467 185.967L1.17783 183.178Z" fill="#FBB130"/>
                <path d="M22.7392 226.346C23.0097 225.584 23.0576 224.622 23.5828 224.076C30.6763 216.461 37.7546 208.796 45.0708 201.38C46.3837 200.015 48.7123 199.678 50.5485 198.876C49.5349 200.686 48.7912 202.762 47.4437 204.273C41.7576 210.656 36.0243 216.972 30.0836 223.139C28.3276 224.969 25.9843 226.203 23.9109 227.703C23.531 227.256 23.1344 226.842 22.7545 226.395L22.7392 226.346Z" fill="#FBB130"/>
                <path d="M82.7514 131.45C82.5368 132.735 82.5476 134.056 82.1244 135.273C79.2111 143.772 76.2978 152.272 73.1759 160.702C72.7208 161.902 71.2879 162.711 70.2876 163.705C70.0182 162.412 69.2037 160.915 69.5922 159.845C72.6067 151.07 75.8133 142.396 79.0518 133.738C79.457 132.636 80.5186 131.838 81.2604 130.871C81.7569 131.091 82.2381 131.262 82.7347 131.482L82.7514 131.45Z" fill="#FBB130"/>
                <path d="M34.0502 136.086C40.2319 146.822 47.7524 155.59 53.317 166.576C47.1092 165.366 31.7517 141.496 34.0502 136.086Z" fill="#FBB130"/>
              </svg>

              <div
                className="relative rounded-2xl overflow-hidden border border-[#d6c2d2]"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 24px 64px rgba(96,64,88,0.16), 0 4px 16px rgba(96,64,88,0.09)",
                  transform: "perspective(1000px) rotateX(4deg) rotateY(-2deg)",
                  animation: "heroFloat 4s ease-in-out infinite",
                }}
              >
                {/* Dashboard header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ebe0e8]" style={{ background: "#f5f0f4" }}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" aria-hidden="true" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" aria-hidden="true" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
                <span className="ml-3 text-xs text-[#a97096]" style={{ fontFamily: "var(--font-sans)" }}>app.planoo.io / dashboard</span>
              </div>

              <div className="p-5">
                {/* MRR stat */}
                <div ref={mrrRef} className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[#946985] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Monthly Recurring Revenue</p>
                    <p
                      className="font-mono text-3xl font-semibold text-[#2a1a27]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      ₹{mrr.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-[#16a34a] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 9.5V2.5M6 2.5L2.5 6M6 2.5L9.5 6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      +12.4% from last month
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f0fdf4] text-[#15803d]" style={{ fontFamily: "var(--font-sans)" }}>Live</span>
                    <span className="text-xs text-[#946985]" style={{ fontFamily: "var(--font-sans)" }}>142 active subs</span>
                  </div>
                </div>

                {/* Subscriptions mini-table */}
                <p className="text-xs font-medium uppercase tracking-widest text-[#946985] mb-2" style={{ fontFamily: "var(--font-sans)" }}>Recent Invoices</p>
                <div className="rounded-xl overflow-hidden border border-[#ebe0e8]">
                  <table className="w-full text-xs" style={{ fontFamily: "var(--font-sans)" }}>
                    <thead>
                      <tr style={{ background: "#f5f0f4" }}>
                        <th className="text-left px-3 py-2 text-[#946985] font-medium">Invoice</th>
                        <th className="text-left px-3 py-2 text-[#946985] font-medium">Customer</th>
                        <th className="text-right px-3 py-2 text-[#946985] font-medium">Amount</th>
                        <th className="text-right px-3 py-2 text-[#946985] font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((inv, i) => (
                        <tr key={inv.id} style={{ borderTop: "1px solid #f0e3ec", background: i % 2 === 0 ? "#ffffff" : "#fdf9fc" }}>
                          <td className="px-3 py-2 font-mono text-[#604058]" style={{ fontFamily: "var(--font-mono)" }}>{inv.id}</td>
                          <td className="px-3 py-2 text-[#2a1a27] font-medium">{inv.company}</td>
                          <td className="px-3 py-2 text-right text-[#2a1a27] font-mono" style={{ fontFamily: "var(--font-mono)" }}>{inv.amount}</td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={inv.status === "Paid"
                                ? { background: "#f0fdf4", color: "#15803d" }
                                : { background: "#fffbeb", color: "#b45309" }}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: perspective(1000px) rotateX(4deg) rotateY(-2deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateX(4deg) rotateY(-2deg) translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes heroFloat { 0%, 100% { transform: perspective(1000px) rotateX(4deg) rotateY(-2deg); } }
        }
      `}</style>
    </section>
  );
}
