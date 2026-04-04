'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Send, 
  CheckCircle2, 
  MoreVertical,
  Banknote,
  Stamp,
  Check
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-4xl mx-auto">
      {/* Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between action-bar print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 rounded-full border border-border hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-bold text-text-primary uppercase tracking-tight">{id}</h1>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Created on Apr 15, 2025</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="p-2.5 rounded-btn bg-white border border-border text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={18} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm group">
            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Send to Customer
          </button>
          <button className="p-2.5 rounded-btn bg-white border border-border text-gray-500 hover:bg-gray-50">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Invoice Document Card */}
      <div className="bg-white rounded-card border border-border shadow-xl overflow-hidden invoice-card print:border-none print:shadow-none">
         {/* Top Header Section */}
         <div className="p-12 border-b border-gray-100 flex justify-between bg-zinc-50/50">
            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-plano-900 rounded flex items-center justify-center text-white font-bold text-2xl">P</div>
                  <span className="font-serif text-3xl font-bold text-plano-900 tracking-tight uppercase">Plano</span>
               </div>
               <div className="flex flex-col gap-1 text-xs text-gray-500 font-medium">
                  <span className="text-sm font-bold text-text-primary uppercase tracking-wider">Corporate Hub</span>
                  <span>123 Business Park, Worli</span>
                  <span>Mumbai, India - 400018</span>
                  <span>GSTIN: 27AAACR5055K1ZD</span>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <h1 className="text-6xl font-serif font-bold text-gray-200 uppercase tracking-widest text-right leading-none">Invoice</h1>
               <div className="flex flex-col items-end mt-4">
                  <span className="text-sm font-mono font-bold text-text-primary px-3 py-1 bg-white border border-border rounded-full shadow-sm">{id}</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-xs font-semibold">
                     <span className="text-gray-400 text-right uppercase tracking-widest">Issue Date:</span>
                     <span className="text-text-primary">Apr 15, 2025</span>
                     <span className="text-gray-400 text-right uppercase tracking-widest">Due Date:</span>
                     <span className="text-danger-600">May 15, 2025</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Multi-Panel Info Section */}
         <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-4">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] pb-1 border-b-2 border-plano-100 self-start">Billed To</span>
               <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-primary uppercase tracking-tighter">Acme Corporation</h3>
                  <span className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs">
                     Building 4, Tech Enclave, <br />
                     Near Silicon Square, Bengaluru, <br />
                     Karnataka - 560103
                  </span>
                  <div className="mt-2 flex flex-col text-xs text-plano-600 font-bold lowercase tracking-wide underline">
                     billing@acme.com
                  </div>
               </div>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] pb-1 border-b-2 border-plano-100 self-end">Current Status</span>
               <div className="flex flex-col items-end gap-3">
                  <div className="px-6 py-2 rounded-full border-2 border-success-500 bg-success-50 text-success-700 font-serif font-bold text-2xl uppercase tracking-widest flex items-center gap-3 shadow-sm rotate-[-2deg]">
                     <CheckCircle2 size={24} />
                     Paid
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic pr-2">Confirmation ID: TXN_90021AC</span>
               </div>
            </div>
         </div>

         {/* Order Lines Table */}
         <div className="px-12 pb-6">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-t-2 border-b-2 border-plano-900">
                     <th className="py-4 px-2 text-[10px] uppercase font-bold text-text-primary tracking-widest">#</th>
                     <th className="py-4 px-2 text-[10px] uppercase font-bold text-text-primary tracking-widest">Description</th>
                     <th className="py-4 px-2 text-[10px] uppercase font-bold text-text-primary tracking-widest text-center">Qty</th>
                     <th className="py-4 px-2 text-[10px] uppercase font-bold text-text-primary tracking-widest text-right">Unit Rate</th>
                     <th className="py-4 px-2 text-[10px] uppercase font-bold text-text-primary tracking-widest text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  <tr className="font-sans">
                     <td className="py-4 px-2 text-xs font-bold text-gray-400">01</td>
                     <td className="py-4 px-2">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-text-primary">Pro Analytics Suite</span>
                           <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">(Monthly Subscription)</span>
                        </div>
                     </td>
                     <td className="py-4 px-2 text-sm font-bold text-text-primary text-center">2</td>
                     <td className="py-4 px-2 text-sm font-mono font-bold text-text-secondary text-right">{formatCurrency(2999, 'INR')}</td>
                     <td className="py-4 px-2 text-sm font-mono font-bold text-text-primary text-right">{formatCurrency(5998, 'INR')}</td>
                  </tr>
                  <tr className="font-sans">
                     <td className="py-4 px-2 text-xs font-bold text-gray-400">02</td>
                     <td className="py-4 px-2">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-text-primary">One-time Onboarding</span>
                           <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">(Setup & Integration Service)</span>
                        </div>
                     </td>
                     <td className="py-4 px-2 text-sm font-bold text-text-primary text-center">1</td>
                     <td className="py-4 px-2 text-sm font-mono font-bold text-text-secondary text-right">{formatCurrency(5000, 'INR')}</td>
                     <td className="py-4 px-2 text-sm font-mono font-bold text-text-primary text-right">{formatCurrency(5000, 'INR')}</td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Summary Calculations */}
         <div className="px-12 py-8 bg-zinc-50 border-t border-border flex justify-end">
            <div className="w-full max-w-xs flex flex-col gap-3">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Subtotal:</span>
                  <span className="text-text-primary font-mono">{formatCurrency(10998, 'INR')}</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>IGST (18%):</span>
                  <span className="text-text-primary font-mono">{formatCurrency(1979.64, 'INR')}</span>
               </div>
               <div className="h-px bg-gray-200 my-1" />
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-plano-900">Total Due:</span>
                  <span className="text-3xl font-serif font-bold text-plano-900">{formatCurrency(12977.64, 'INR')}</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-success-700 bg-success-50 p-2 rounded mt-2">
                  <span>Amount Paid:</span>
                  <span className="font-mono">{formatCurrency(12977.64, 'INR')}</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500 p-2">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹0.00</span>
               </div>
            </div>
         </div>

         {/* Bottom Footer Info */}
         <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100">
            <div className="flex flex-col gap-3">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100 self-start">Terms & Notes</span>
               <p className="text-xs text-gray-500 italic leading-relaxed font-medium">
                  Please pay within 30 days. Make all checks payable to Plano Corporate Hub. 
                  Late payments may incur a 2% monthly interest fee.
               </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100 self-end">Bank Details</span>
               <div className="flex flex-col md:items-end gap-1 text-xs font-bold text-text-primary uppercase tracking-tighter">
                  <span>HDFC BANK · ACCT: 501004521234</span>
                  <span>IFSC: HDFC0001234 · SWIFT: HDFCIBB</span>
                  <div className="mt-1 flex items-center gap-1.5 text-success-600 bg-success-50 px-2 py-0.5 rounded-full border border-success-100">
                     <Check size={12} />
                     Verified Recipient
                  </div>
               </div>
            </div>
         </div>

         <div className="h-2 bg-plano-900 w-full" />
      </div>

      <style jsx global>{`
        @media print {
          .action-bar, .sidebar, header {
            display: none !important;
          }
          main {
             margin: 0 !important;
             padding: 0 !important;
          }
          .invoice-card {
             border: none !important;
             box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
