'use client';

import React, { useEffect, useState } from 'react';
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
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await api.invoices.getById(id);
        if (res.success) {
          setInvoice(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const issueDate = invoice?.issueDate || invoice?.createdAt;
  const subtotal = invoice?.subtotal ?? invoice?.subTotal ?? 0;
  const taxAmount = invoice?.taxAmount ?? invoice?.taxTotal ?? 0;
  const discountAmount = invoice?.discountAmount ?? invoice?.discountTotal ?? 0;
  const totalAmount = invoice?.totalAmount ?? invoice?.grandTotal ?? 0;
  const lineItems = invoice?.items ?? [];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-plano-600" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Retrieving Document...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle size={48} className="text-danger-500" />
        <p className="text-lg font-serif font-bold">{error || 'Invoice not found'}</p>
        <Link href="/invoices" className="text-sm font-bold text-plano-600 uppercase underline">Back to Invoices</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-4xl mx-auto">
      {/* Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between action-bar print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 rounded-full border border-border hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-bold text-text-primary uppercase tracking-tight">{invoice.invoiceNumber}</h1>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
              Created on {new Date(invoice.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="p-2.5 rounded-btn bg-white border border-border text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={18} />
          </button>
          <button className="p-2.5 rounded-btn bg-white border border-border text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-plano-600 text-white rounded-btn hover:bg-plano-700 transition-all font-bold shadow-sm group">
            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Send to Customer
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
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <h1 className="text-6xl font-serif font-bold text-gray-200 uppercase tracking-widest text-right leading-none">Invoice</h1>
            <div className="flex flex-col items-end mt-4">
              <span className="text-sm font-mono font-bold text-text-primary px-3 py-1 bg-white border border-border rounded-full shadow-sm">{invoice.invoiceNumber}</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-xs font-semibold">
                <span className="text-gray-400 text-right uppercase tracking-widest">Issue Date:</span>
                <span className="text-text-primary">{issueDate ? new Date(issueDate).toLocaleDateString() : '-'}</span>
                <span className="text-gray-400 text-right uppercase tracking-widest">Due Date:</span>
                <span className={cn(invoice.status === 'overdue' ? "text-danger-600" : "text-text-primary")}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Panel Info Section */}
        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] pb-1 border-b-2 border-plano-100 self-start">Billed To</span>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-primary uppercase tracking-tighter">
                {typeof invoice.userId === 'object' ? invoice.userId?.name : 'Valued Customer'}
              </h3>
              <span className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs">
                {typeof invoice.userId === 'object' ? invoice.userId?.email : 'No address provided'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] pb-1 border-b-2 border-plano-100 self-end">Current Status</span>
            <div className="flex flex-col items-end gap-3">
              <div className={cn(
                "px-6 py-2 rounded-full border-2 font-serif font-bold text-2xl uppercase tracking-widest flex items-center gap-3 shadow-sm rotate-[-2deg]",
                invoice.status === 'paid' ? "border-success-500 bg-success-50 text-success-700" :
                  invoice.status === 'overdue' ? "border-danger-500 bg-danger-50 text-danger-700" :
                    "border-warning-500 bg-warning-50 text-warning-700"
              )}>
                {invoice.status === 'paid' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                {invoice.status}
              </div>
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
              {lineItems.map((item: any, idx: number) => (
                <tr key={idx} className="font-sans">
                  <td className="py-4 px-2 text-xs font-bold text-gray-400">{(idx + 1).toString().padStart(2, '0')}</td>
                  <td className="py-4 px-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary">{item.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-sm font-bold text-text-primary text-center">{item.quantity}</td>
                  <td className="py-4 px-2 text-sm font-mono font-bold text-text-secondary text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-4 px-2 text-sm font-mono font-bold text-text-primary text-right">{formatCurrency(item.amount ?? item.total ?? (item.quantity * item.unitPrice), invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Calculations */}
        <div className="px-12 py-8 bg-zinc-50 border-t border-border flex justify-end">
          <div className="w-full max-w-xs flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
              <span>Subtotal:</span>
              <span className="text-text-primary font-mono">{formatCurrency(subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
              <span>Tax:</span>
              <span className="text-text-primary font-mono">{formatCurrency(taxAmount, invoice.currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-danger-600">
                <span>Discount:</span>
                <span className="font-mono">-{formatCurrency(discountAmount, invoice.currency)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-widest text-plano-900">Total Due:</span>
              <span className="text-3xl font-serif font-bold text-plano-900">{formatCurrency(totalAmount, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="p-12 border-t border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100 self-start">Terms & Notes</span>
            <p className="text-xs text-gray-500 italic leading-relaxed font-medium">
              {invoice.notes || "Please pay within 30 days. Late payments may incur a 2% monthly interest fee."}
            </p>
          </div>
        </div>

        <div className="h-2 bg-plano-900 w-full" />
      </div>

      <style jsx global>{`
        @media print {
          aside, header, .action-bar, .sidebar {
            display: none !important;
          }
          main {
             margin: 0 !important;
             padding: 0 !important;
             width: 100% !important;
             max-width: 100% !important;
          }
          .invoice-card {
             border: none !important;
             box-shadow: none !important;
             margin: 0 !important;
             padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
