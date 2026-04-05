'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Check,
    Loader2,
    Plus,
    ReceiptText,
    Trash2,
    UserCircle2,
    Calculator,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { toAdminPath } from '@/lib/path-scoping';

const CURRENCIES = ['INR'];

const createEmptyLineItem = () => ({
    description: '',
    quantity: '1',
    unitPrice: '',
    discountValue: '0',
    taxValue: '0',
});

export default function NewInvoicePage() {
    const pathname = usePathname();
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);

    const [form, setForm] = useState({
        userId: '',
        currency: 'INR',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        items: [createEmptyLineItem()],
    });

    useEffect(() => {
        async function loadCustomers() {
            try {
                const response = await api.users.getAll({ role: 'portal_user', isActive: 'true', limit: 200 });
                if (response.success) {
                    const data = response.data as any;
                    setCustomers(data.users ?? data ?? []);
                }
            } catch (err) {
                console.error('Failed to load customers', err);
            } finally {
                setIsLoadingCustomers(false);
            }
        }

        loadCustomers();
    }, []);

    const parseNumber = (value: string) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const getLineTotal = (item: any) => {
        const quantity = parseNumber(item.quantity);
        const unitPrice = parseNumber(item.unitPrice);
        const discountValue = parseNumber(item.discountValue);
        const taxValue = parseNumber(item.taxValue);
        return Math.max(quantity * unitPrice - discountValue + taxValue, 0);
    };

    const subtotal = form.items.reduce((sum, item) => sum + parseNumber(item.quantity) * parseNumber(item.unitPrice), 0);
    const discountTotal = form.items.reduce((sum, item) => sum + parseNumber(item.discountValue), 0);
    const taxTotal = form.items.reduce((sum, item) => sum + parseNumber(item.taxValue), 0);
    const grandTotal = Math.max(subtotal - discountTotal + taxTotal, 0);

    const updateItem = (index: number, field: string, value: string) => {
        setForm((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
        }));
    };

    const addItem = () => {
        setForm((current) => ({
            ...current,
            items: [...current.items, createEmptyLineItem()],
        }));
    };

    const removeItem = (index: number) => {
        setForm((current) => ({
            ...current,
            items: current.items.length === 1 ? [createEmptyLineItem()] : current.items.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const items = form.items
            .map((item) => ({
                description: item.description.trim(),
                quantity: parseNumber(item.quantity),
                unitPrice: parseNumber(item.unitPrice),
                discountValue: parseNumber(item.discountValue),
                taxValue: parseNumber(item.taxValue),
            }))
            .filter((item) => item.description && item.quantity > 0);

        if (!form.userId) {
            toastError('Validation', 'Select a customer for the invoice.');
            return;
        }

        if (items.length === 0) {
            toastError('Validation', 'Add at least one line item.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.invoices.create({
                userId: form.userId,
                currency: form.currency,
                dueDate: new Date(form.dueDate).toISOString(),
                notes: form.notes,
                items: items.map((item) => ({
                    ...item,
                    total: Math.max(item.quantity * item.unitPrice - item.discountValue + item.taxValue, 0),
                })),
                subtotal,
                discountTotal,
                taxTotal,
                grandTotal,
            });

            if (res.success) {
                success('Invoice created', 'The manual invoice is ready for review.');
                const createdInvoice = (res.data as any)?.invoice ?? res.data;
                router.push(
                    createdInvoice?._id
                        ? toAdminPath(pathname, `/invoices/${createdInvoice._id}`)
                        : toAdminPath(pathname, '/invoices')
                );
            }
        } catch (err: any) {
            toastError('Creation failed', err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const field = 'h-11 px-4 rounded-lg border border-border dark:border-sidebar-hover bg-white dark:bg-bg-page text-text-primary text-sm font-medium outline-none transition-all focus:border-plano-500 dark:focus:bg-white/10 w-full shadow-sm';
    const label = 'text-[11px] uppercase font-bold tracking-widest text-gray-500 mb-1.5 flex items-center gap-1.5';

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-6xl">
            <div className="flex flex-col gap-2">
                <Link href={toAdminPath(pathname, '/invoices')} className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-plano-600 transition-colors w-fit">
                    <ArrowLeft size={14} /> Back to Invoices
                </Link>
                <h1 className="text-4xl text-text-primary">Create Manual Invoice</h1>
                <p className="text-sm text-text-secondary font-medium tracking-wide">
                    Issue a one-off invoice, then send it to the customer.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <section className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-8">
                        <div className="flex items-center gap-3 pb-5 border-b border-border dark:border-sidebar-hover">
                            <div className="w-10 h-10 rounded-xl bg-plano-50 dark:bg-white/10 text-plano-600 dark:text-plano-400 flex items-center justify-center border border-plano-100 dark:border-sidebar-hover shadow-sm">
                                <UserCircle2 size={20} />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-text-primary">Customer</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col">
                                <label className={label}>Customer *</label>
                                <div className="relative">
                                    <select
                                        value={form.userId}
                                        onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                                        className={cn(field, 'appearance-none pr-10 cursor-pointer')}
                                        disabled={isLoadingCustomers}
                                    >
                                        <option value="">Select a portal customer...</option>
                                        {customers.map((customer) => (
                                            <option key={customer._id} value={customer._id}>
                                                {customer.name} ({customer.email})
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingCustomers ? (
                                        <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-300" />
                                    ) : null}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className={label}>Due Date *</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        suppressHydrationWarning
                                        type="date"
                                        value={form.dueDate}
                                        onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                                        className={cn(field, 'pl-11 pr-4 font-mono')}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className={label}>Currency</label>
                                <select
                                    value={form.currency}
                                    onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                                    className={cn(field, 'appearance-none cursor-pointer')}
                                >
                                    {CURRENCIES.map((currency) => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-8">
                        <div className="flex items-center justify-between gap-4 pb-5 border-b border-border dark:border-sidebar-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/10 text-success-600 flex items-center justify-center border border-success-100 dark:border-sidebar-hover shadow-sm">
                                    <ReceiptText size={20} />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-text-primary">Line Items</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 px-4 h-10 rounded-lg bg-plano-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md"
                            >
                                <Plus size={14} /> Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border dark:border-sidebar-hover bg-gray-50/50 dark:bg-white/10">
                                        <th className="py-4 px-4 text-[10px] uppercase font-bold text-gray-500 tracking-widest">Description</th>
                                        <th className="py-4 px-4 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-center whitespace-nowrap">Qty</th>
                                        <th className="py-4 px-4 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right whitespace-nowrap">Unit Price</th>
                                        <th className="py-4 px-4 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right whitespace-nowrap">Discount</th>
                                        <th className="py-4 px-4 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right whitespace-nowrap">Tax</th>
                                        <th className="py-4 px-4 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right whitespace-nowrap">Total</th>
                                        <th className="py-4 px-4 text-[10px] uppercase font-bold text-gray-500 tracking-widest text-right whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-sidebar-hover">
                                    {form.items.map((item, index) => (
                                        <tr key={index} className="align-top">
                                            <td className="py-4 px-4 w-[32%]">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(event) => updateItem(index, 'description', event.target.value)}
                                                    placeholder="Service, product, or fee description"
                                                    className={field}
                                                />
                                            </td>
                                            <td className="py-4 px-4 w-24">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                                                    className={cn(field, 'text-center px-2')}
                                                />
                                            </td>
                                            <td className="py-4 px-4 w-40">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(event) => updateItem(index, 'unitPrice', event.target.value)}
                                                    className={cn(field, 'text-right font-mono')}
                                                />
                                            </td>
                                            <td className="py-4 px-4 w-36">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.discountValue}
                                                    onChange={(event) => updateItem(index, 'discountValue', event.target.value)}
                                                    className={cn(field, 'text-right font-mono')}
                                                />
                                            </td>
                                            <td className="py-4 px-4 w-36">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.taxValue}
                                                    onChange={(event) => updateItem(index, 'taxValue', event.target.value)}
                                                    className={cn(field, 'text-right font-mono')}
                                                />
                                            </td>
                                            <td className="py-4 px-4 w-40 text-right text-sm font-bold font-mono text-text-primary whitespace-nowrap">
                                                {formatCurrency(getLineTotal(item), form.currency)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 rounded-lg text-gray-300 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all"
                                                    aria-label="Remove line item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-bg-surface p-8 rounded-card border border-border dark:border-sidebar-hover shadow-sm flex flex-col gap-6">
                        <label className={label}>Internal Notes</label>
                        <textarea
                            rows={4}
                            value={form.notes}
                            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                            placeholder="Optional internal notes or payment instructions"
                            className="w-full p-4 rounded-lg border border-border dark:border-sidebar-hover bg-white dark:bg-bg-page text-text-primary focus:border-plano-500 dark:focus:bg-white/10 focus:outline-none transition-all text-sm font-sans resize-none shadow-sm"
                        />
                    </section>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <section className="bg-plano-900 p-8 rounded-card border border-plano-800 shadow-2xl flex flex-col gap-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Calculator size={120} className="-rotate-12" />
                        </div>

                        <div className="flex flex-col gap-1 relative">
                            <span className="text-[10px] font-bold text-plano-400 uppercase tracking-widest border border-plano-800 rounded-full px-3 py-1 w-fit bg-plano-950">
                                Invoice Summary
                            </span>
                            <h3 className="text-3xl font-serif font-bold text-white mt-4">Total Due</h3>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-plano-800/50 pt-6 relative">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-plano-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                <span className="font-mono font-bold">{formatCurrency(subtotal, form.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-plano-400 font-bold uppercase tracking-widest text-[10px]">Discount</span>
                                <span className="font-mono font-bold">-{formatCurrency(discountTotal, form.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-plano-400 font-bold uppercase tracking-widest text-[10px]">Tax</span>
                                <span className="font-mono font-bold">{formatCurrency(taxTotal, form.currency)}</span>
                            </div>
                            <div className="bg-plano-800/40 p-5 rounded-xl border border-plano-700/50 mt-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold uppercase text-white">Grand Total</span>
                                        <span className="text-[10px] text-plano-400 font-medium">Ready for dispatch</span>
                                    </div>
                                    <span className="text-3xl font-serif font-bold text-white">{formatCurrency(grandTotal, form.currency)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 relative pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-14 w-full rounded-xl bg-gradient-to-r from-plano-600 to-plano-700 text-white font-bold text-sm shadow-xl shadow-plano-900/20 hover:from-plano-500 hover:to-plano-700 transition-all flex items-center justify-center gap-3 border border-plano-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                {isSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
                            </button>
                            <Link
                                href={toAdminPath(pathname, '/invoices')}
                                className="h-12 w-full rounded-xl border border-plano-800 text-plano-100 text-sm font-bold flex items-center justify-center hover:bg-plano-800/40 transition-all"
                            >
                                Cancel
                            </Link>
                        </div>
                    </section>
                </div>
            </form>
        </div>
    );
}