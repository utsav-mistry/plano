"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#testimonials" },
  { label: "Docs", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trap focus in mobile menu
  useEffect(() => {
    if (!menuOpen) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
      "a, button"
    );
    focusable?.[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-250 ${
          scrolled
            ? "bg-[rgba(248,242,246,0.88)] backdrop-blur-[12px] border-b border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            : "bg-transparent"
        }`}
        style={{ transition: "background 250ms ease, box-shadow 250ms ease" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group no-underline" aria-label="Planoo home">
            {/* Wordmark: Lowercase Caveat (serif) */}
            <span className="font-serif font-bold text-4xl tracking-tight leading-none">
              <span className="text-[#2a1a27]">plano</span>
              <span className="text-[#8f5580]">o</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0" role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="px-4 py-2 text-[15px] font-medium text-[#2a1a27] rounded-lg hover:bg-[#ebe0e8] transition-colors duration-150 focus-visible:outline-[2px] focus-visible:outline-[#604058] focus-visible:outline-offset-2"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[15px] font-medium text-[#4e3347] hover:text-[#2a1a27] transition-colors duration-150 px-3 py-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-[15px]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Start free
            </Link>
          </div>

          {/* Hamburger */}
          <button
            ref={hamburgerRef}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[#ebe0e8] transition-colors focus-visible:outline-[2px] focus-visible:outline-[#604058] focus-visible:outline-offset-2"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`block w-5 h-0.5 bg-[#2a1a27] rounded transition-transform duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-[#2a1a27] rounded transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-[#2a1a27] rounded transition-transform duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-40 flex flex-col bg-[#f8f2f6] transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#e1c8d9]">
          <span className="font-serif font-bold text-2xl tracking-tight text-[#2a1a27]">
            plano<span className="text-[#8f5580]">o</span>
          </span>
          <button
            className="p-2 rounded-lg hover:bg-[#ebe0e8] focus-visible:outline-[2px] focus-visible:outline-[#604058]"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="#2a1a27" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-4 py-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-lg font-medium text-[#2a1a27] rounded-lg hover:bg-[#ebe0e8] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-6 flex flex-col gap-3 px-4">
            <Link href="/login" className="text-center py-3 text-[15px] font-medium text-[#5a3c53] hover:text-[#2a1a27]">Sign in</Link>
            <Link href="/signup" className="btn-primary text-center text-[15px]">Start free</Link>
          </div>
        </nav>
      </div>
    </>
  );
}
