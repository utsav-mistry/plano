import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Planoo — Recurring revenue, simplified.",
  description:
    "Automate recurring billing, invoices, taxes, and renewals for your SaaS business. Planoo handles the full subscription lifecycle so your team can focus on growth.",
  openGraph: {
    title: "Planoo — Recurring revenue, simplified.",
    description:
      "Automate recurring billing, invoices, taxes, and renewals for your SaaS business.",
    siteName: "Planoo",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
