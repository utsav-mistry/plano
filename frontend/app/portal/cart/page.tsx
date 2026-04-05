'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard,
  MapPin, CheckCircle2, Loader2, IndianRupee, Tag, ShieldCheck,
  Info, Sparkles, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type TaxRecord = {
  id: string;
  _id?: string;
  name?: string;
  code?: string;
  rate?: number;
  type?: 'inclusive' | 'exclusive';
  isActive?: boolean;
};
type DiscountConfig = {
  code?: string;
  isActive?: boolean;
  minPurchaseAmount?: number;
  type?: 'percentage' | 'fixed';
  value?: number;
  name?: string;
};

type RazorpayResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id?: string;
  name: string;
  description: string;
  image: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: { color: string };
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, discountCode, discountAmount, applyDiscount, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [step, setStep] = useState<'order' | 'address' | 'payment'>('order');
  const [promo, setPromo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuotation, setIsQuotation] = useState(false);
  const [taxesList, setTaxesList] = useState<TaxRecord[]>([]);
  const [discountsList, setDiscountsList] = useState<DiscountConfig[]>([]);
  const [billingAddress, setBillingAddress] = useState(user?.email ? `Block A, Building 4, ${user.name}'s Residence, Mumbai, MH` : '');
  const [planTaxMap, setPlanTaxMap] = useState<Record<string, string[]>>({});
  const [productTaxMap, setProductTaxMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const normalizeId = (value: unknown) => {
      if (typeof value === 'string' || typeof value === 'number') return String(value);
      if (value && typeof value === 'object') {
        const record = value as { id?: string; _id?: string };
        return String(record.id || record._id || '');
      }
      return '';
    };
    const extractTaxIds = (input: unknown): string[] => {
      if (!Array.isArray(input)) return [];
      return input
        .map((tax) => normalizeId(tax))
        .filter(Boolean);
    };

    async function fetchConfig() {
      try {
        const [tRes, dRes, plansRes, productsRes] = await Promise.all([
          api.taxes.getAll(),
          api.discounts.getAll(),
          api.plans.getAll({ isActive: true, limit: 500 }),
          api.products.getAll({ isActive: true, limit: 500 })
        ]);
        if (tRes.success) {
          const taxesData = tRes.data as { taxes?: unknown[] } | unknown[];
          const normalizedTaxes = Array.isArray(taxesData)
            ? taxesData
            : (taxesData?.taxes ?? []);
          setTaxesList(normalizedTaxes as TaxRecord[]);
        }
        if (dRes.success) {
          const discountsData = dRes.data as { discounts?: unknown[] } | unknown[];
          const normalizedDiscounts = Array.isArray(discountsData)
            ? discountsData
            : (discountsData?.discounts ?? []);
          setDiscountsList(normalizedDiscounts as DiscountConfig[]);
        }

        if (plansRes.success) {
          const plansData = plansRes.data as unknown;
          const plansContainer = plansData as { plans?: unknown[] };
          const plans = Array.isArray(plansData) ? plansData : (plansContainer.plans ?? []);
          const nextPlanMap: Record<string, string[]> = {};
          for (const plan of plans) {
            const pid = normalizeId(plan);
            if (!pid) continue;
            const planRecord = (plan && typeof plan === 'object')
              ? (plan as { taxIds?: unknown[] })
              : undefined;
            nextPlanMap[pid] = extractTaxIds(planRecord?.taxIds);
          }
          setPlanTaxMap(nextPlanMap);
        }

        if (productsRes.success) {
          const productsData = productsRes.data as unknown;
          const productsContainer = productsData as { products?: unknown[] };
          const products = Array.isArray(productsData) ? productsData : (productsContainer.products ?? []);
          const nextProductMap: Record<string, string[]> = {};
          for (const product of products) {
            const pid = normalizeId(product);
            if (!pid) continue;
            const productRecord = (product && typeof product === 'object')
              ? (product as { taxIds?: unknown[] })
              : undefined;
            nextProductMap[pid] = extractTaxIds(productRecord?.taxIds);
          }
          setProductTaxMap(nextProductMap);
        }
      } catch (err) {
        console.error('Config Fetch Error:', err);
      }
    }
    fetchConfig();
  }, []);

  const subtotal = useMemo(() =>
    items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    [items]);

  const taxBreakdown = useMemo(() => {
    const mapById = new Map<string, TaxRecord>();
    for (const tax of taxesList) {
      const id = String(tax.id || tax._id || '');
      if (id) mapById.set(id, tax);
    }

    const defaultGstTaxes = taxesList.filter((tax) => {
      if (tax.isActive === false) return false;
      const code = String(tax.code || '').toUpperCase();
      const name = String(tax.name || '').toUpperCase();
      return code.includes('GST') || code.includes('CGST') || code.includes('SGST') || code.includes('IGST')
        || name.includes('GST') || name.includes('CGST') || name.includes('SGST') || name.includes('IGST');
    });

    const effectiveDiscountRatio = subtotal > 0 ? Math.max(0, (subtotal - discountAmount) / subtotal) : 1;
    const breakdown: Record<string, number> = {};
    let payableTax = 0;
    let totalTaxPortion = 0;

    for (const item of items) {
      const itemBase = item.price * item.quantity * effectiveDiscountRatio;
      const linkedPlanTaxes = planTaxMap[item.planId] || [];
      const linkedProductTaxes = productTaxMap[item.productId] || [];
      const taxIds = [...new Set([...linkedPlanTaxes, ...linkedProductTaxes])];

      const taxCandidates: TaxRecord[] = taxIds.length > 0
        ? taxIds
          .map((taxId) => mapById.get(taxId))
          .filter((tax): tax is TaxRecord => Boolean(tax))
        : defaultGstTaxes;

      const inclusiveTaxes = taxCandidates.filter((tax) => tax.type === 'inclusive');
      const exclusiveTaxes = taxCandidates.filter((tax) => tax.type !== 'inclusive');

      const inclusiveRate = inclusiveTaxes.reduce((sum, tax) => sum + Number(tax.rate || 0), 0);
      const inclusiveTotal = inclusiveRate > 0
        ? (itemBase - itemBase / (1 + inclusiveRate / 100))
        : 0;

      for (const tax of inclusiveTaxes) {
        if (!tax || tax.isActive === false) continue;
        const rate = Number(tax.rate || 0);
        if (rate <= 0) continue;

        const taxAmount = inclusiveRate > 0 ? (inclusiveTotal * rate) / inclusiveRate : 0;

        const key = tax.code || tax.name || 'GST';
        breakdown[key] = (breakdown[key] || 0) + taxAmount;
        totalTaxPortion += taxAmount;
      }

      for (const tax of exclusiveTaxes) {
        if (!tax || tax.isActive === false) continue;
        const rate = Number(tax.rate || 0);
        if (rate <= 0) continue;

        const taxAmount = itemBase * (rate / 100);

        const key = tax.code || tax.name || 'GST';
        breakdown[key] = (breakdown[key] || 0) + taxAmount;
        totalTaxPortion += taxAmount;
        payableTax += taxAmount;
      }
    }

    return {
      payableTax,
      totalTaxPortion,
      lines: Object.entries(breakdown).map(([label, amount]) => ({ label, amount })),
    };
  }, [items, planTaxMap, productTaxMap, taxesList, subtotal, discountAmount]);

  const taxes = taxBreakdown.payableTax;

  const total = useMemo(() => subtotal - discountAmount + taxes, [subtotal, taxes, discountAmount]);

  const handleApplyPromo = () => {
    const found = discountsList.find(d => (d.code ?? '').toUpperCase() === promo.toUpperCase() && d.isActive);

    if (found) {
      // Validate Minimum Purchase (Module 13)
      if (found.minPurchaseAmount && subtotal < found.minPurchaseAmount) {
        toastError('Minimum Amount Not Met', `This code requires at least ₹${found.minPurchaseAmount.toLocaleString()}`);
        return;
      }

      const value = found.value ?? 0;
      const amt = found.type === 'percentage' ? (subtotal * (value / 100)) : value;
      applyDiscount(found.code ?? promo.toUpperCase(), amt);
      toastSuccess('Success', `${found.name} Applied!`);
    } else if (promo.toUpperCase() === 'PLANO20') {
      // Fallback for demo
      applyDiscount('PLANO20', subtotal * 0.2);
      toastSuccess('Success', '20% discount applied to your order!');
    } else {
      toastError('Invalid Code', 'The promo code you entered is not valid or expired.');
    }
  };

  async function createSubscriptionsFromCart(paymentId: string) {
    const recurringItems = items.filter((item) => item.planId && !item.planId.startsWith('base-'));
    if (recurringItems.length === 0) {
      throw new Error('No recurring plan found in cart. Please add a plan-based product first.');
    }

    const created = await Promise.all(
      recurringItems.map((item) =>
        api.subscriptions.create({
          planId: item.planId,
          quantity: item.quantity,
          autoRenew: true,
          paymentReference: paymentId,
          billingAddress,
        })
      )
    );

    const subscriptionIds = created
      .map((res) => {
        const data = res.data as { id?: string; _id?: string };
        return data?.id || data?._id || '';
      })
      .filter(Boolean);

    if (subscriptionIds.length === 0) {
      throw new Error('Subscriptions were created but IDs were not returned.');
    }

    return subscriptionIds;
  }

  const handleRazorpayPayment = async () => {
    if (typeof window === 'undefined') return;

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toastError('Razorpay key missing', 'Set NEXT_PUBLIC_RAZORPAY_KEY_ID in frontend environment.');
      return;
    }

    if (!billingAddress.trim()) {
      toastError('Billing address required', 'Please provide billing address before payment.');
      return;
    }

    setIsLoading(true);

    let orderId = '';
    try {
      const orderRes = await api.payments.createRazorpayOrder({
        amount: total,
        currency: 'INR',
        notes: {
          scope: 'portal_cart_checkout',
          itemCount: String(items.length),
        },
      });
      const orderData = orderRes.data as { order?: { id?: string } };
      orderId = orderData?.order?.id || '';
      if (!orderId) {
        throw new Error('Unable to create Razorpay order id.');
      }
    } catch (err) {
      setIsLoading(false);
      toastError('Checkout init failed', err instanceof Error ? err.message : 'Unable to initialize payment order.');
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(total * 100),
      currency: 'INR',
      order_id: orderId,
      name: 'Plano Subscriptions',
      description: `Purchase of ${items.length} services`,
      image: 'https://cdn.razorpay.com/logos/H6U6f9bA6G6E7M_medium.png',
      handler: async function (response: RazorpayResponse) {
        try {
          if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
            throw new Error('Missing Razorpay verification fields. Ensure checkout is created with a Razorpay order.');
          }

          const subscriptionIds = await createSubscriptionsFromCart(response.razorpay_payment_id);
          await Promise.all(
            subscriptionIds.map((subscriptionId) =>
              api.payments.verifyRazorpayCheckout({
                subscriptionId,
                razorpay_order_id: response.razorpay_order_id as string,
                razorpay_payment_id: response.razorpay_payment_id as string,
                razorpay_signature: response.razorpay_signature as string,
                method: 'upi',
                gatewayResponse: response,
              })
            )
          );

          toastSuccess('Payment Captured', `Transaction ID: ${response.razorpay_payment_id}`);
          clearCart();
          router.push(`/portal/order/confirmation?id=S100${Math.floor(Math.random() * 1000)}&ref=${response.razorpay_payment_id}`);
        } catch (err) {
          toastError('Payment captured, subscription failed', err instanceof Error ? err.message : 'Unable to create subscription records.');
        } finally {
          setIsLoading(false);
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: '9999999999'
      },
      theme: { color: '#8f5580' },
      modal: {
        ondismiss: () => setIsLoading(false)
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleRequestQuote = () => {
    setIsLoading(true);

    const validItems = items
      .filter((item) => item.quantity > 0 && item.price >= 0 && item.planId && !item.planId.startsWith('base-'))
      .map((item) => ({
        productId: item.productId,
        planId: item.planId,
        description: `${item.name} (${item.planLabel})`,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      }));

    if (validItems.length === 0) {
      toastError('Quotation failed', 'Your cart has no recurring plan items eligible for quotation.');
      setIsLoading(false);
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 15);

    api.quotations.create({
      items: validItems,
      subtotal,
      discountTotal: discountAmount,
      taxTotal: taxes,
      grandTotal: total,
      currency: 'INR',
      validUntil: validUntil.toISOString(),
      notes: `Portal quotation request by ${user?.email || 'customer'}`,
      terms: `Billing address: ${billingAddress || 'Not provided'}\nGST Payable: ${taxes.toFixed(2)}\nGST Total Portion: ${taxBreakdown.totalTaxPortion.toFixed(2)}\nGST Breakdown: ${taxBreakdown.lines.map((line) => `${line.label}:${line.amount.toFixed(2)}`).join(', ') || 'N/A'}`,
    })
      .then((res) => {
        if (!res.success) {
          throw new Error('Quotation request failed');
        }
        toastSuccess('Quotation Submitted', 'Your quotation request has been saved.');
        clearCart();
        router.push('/portal/quotes');
      })
      .catch((err: unknown) => {
        toastError('Quotation failed', err instanceof Error ? err.message : 'Unable to submit quotation right now.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleCheckout = () => {
    if (step === 'order') setStep('address');
    else if (step === 'address') {
      if (!billingAddress.trim()) {
        toastError('Billing address required', 'Please provide your billing address to continue.');
        return;
      }
      setStep('payment');
    }
    else if (step === 'payment') {
      if (isQuotation) handleRequestQuote();
      else handleRazorpayPayment();
    }
  };

  if (items.length === 0 && step === 'order') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-plano-50 border border-plano-100 flex items-center justify-center text-plano-300 mx-auto mb-8 shadow-sm">
          <ShoppingBag size={48} strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-bold text-plano-900 mb-4 uppercase">Your cart is empty</h2>
        <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">Looks like you haven&apos;t added any products to your catalog yet.</p>
        <Link href="/portal/shop" className="h-14 px-10 rounded-2xl bg-plano-600 text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-plano-900 shadow-xl shadow-plano-600/10 mx-auto w-fit">
          Explore Shop
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const steps = [
    { id: 'order', label: 'Order Summary', icon: ShoppingBag },
    { id: 'address', label: 'Shipping Info', icon: MapPin },
    { id: 'payment', label: 'Payment Method', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plano-50 border border-plano-100 text-plano-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} />
          Secure Checkout
        </div>
        <h1 className="text-4xl font-bold text-plano-900 uppercase tracking-tight mb-8">Review Your Bag</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center max-w-2xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-plano-100 -translate-y-1/2 -z-10" />
          <div className="flex items-center justify-between w-full">
            {steps.map((s) => {
              const isActive = step === s.id;
              const isDone = (step === 'address' && s.id === 'order') || (step === 'payment' && (s.id === 'order' || s.id === 'address'));
              return (
                <div key={s.id} className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                    isActive ? "bg-plano-600 border-plano-600 text-white shadow-xl shadow-plano-600/20 scale-110" :
                      isDone ? "bg-white border-plano-600 text-plano-600" : "bg-white border-plano-100 text-gray-300"
                  )}>
                    {isDone ? <CheckCircle2 size={24} /> : <s.icon size={22} />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors",
                    isActive ? "text-plano-900" : "text-gray-400"
                  )}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Content Panels */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'order' && (
              <motion.div
                key="order"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl border border-plano-50 p-5 flex flex-col sm:flex-row items-center gap-6 group hover:border-plano-200 transition-all shadow-sm">
                    <div className="w-24 h-24 rounded-2xl bg-plano-50 flex flex-shrink-0 items-center justify-center text-plano-300 shadow-sm overflow-hidden relative">
                      <IndianRupee size={40} strokeWidth={1} className="opacity-20 translate-x-2 translate-y-2" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag size={24} className="text-plano-400" />
                      </div>
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-lg font-bold text-plano-900 leading-tight mb-1 group-hover:text-plano-600 transition-colors uppercase">{item.name}</h3>
                      <p className="text-xs font-bold text-plano-600 uppercase tracking-widest">{item.planLabel} • ₹{item.price.toLocaleString()}/month</p>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] mt-2 italic">Recurring billing service</p>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-3">
                      <div className="h-10 px-3 bg-plano-50 border border-plano-100 rounded-xl flex items-center gap-4">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-400 hover:text-plano-900"><Minus size={14} /></button>
                        <span className="w-4 text-center text-xs font-bold text-plano-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-400 hover:text-plano-900"><Plus size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-plano-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-danger-50 hover:text-danger-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl border border-plano-100 p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-plano-50 flex items-center justify-center text-plano-600">
                    <MapPin size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-plano-900 uppercase">Billing Address</h3>
                </div>

                <div className="p-6 rounded-2xl border-2 border-plano-600 bg-plano-50/20 mb-8 relative">
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-plano-600 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                  </div>
                  <p className="text-xs font-bold text-plano-600 uppercase tracking-widest mb-2">Primary Address</p>
                  <p className="text-sm font-bold text-plano-900 mb-1">{user?.name}</p>
                  <p className="text-sm font-medium text-gray-500">{billingAddress}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Verified Customer Account</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Update Shipping Address</label>
                  <textarea
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Enter new address details..."
                    className="w-full p-4 h-32 rounded-2xl border border-plano-100 bg-white text-sm font-medium outline-none focus:border-plano-600 transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl border border-plano-100 p-8 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-plano-50 flex items-center justify-center text-plano-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-plano-900 uppercase">Checkout Path</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Choose your preferred onboarding method</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setIsQuotation(false)}
                    className={cn(
                      "p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-4 transition-all group relative",
                      !isQuotation ? "border-plano-600 bg-plano-50/20 shadow-xl shadow-plano-600/5" : "border-plano-50 hover:border-plano-200 text-gray-400"
                    )}
                  >
                    {!isQuotation && <div className="absolute top-4 right-4 text-plano-600"><CheckCircle2 size={16} /></div>}
                    <CreditCard size={32} className={!isQuotation ? "text-plano-600" : "text-gray-300"} />
                    <div className="text-center">
                      <span className="block text-xs font-bold text-plano-900 uppercase tracking-widest mb-1">Instant Payment</span>
                      <span className="block text-[9px] font-medium uppercase tracking-widest leading-none">Activate via Razorpay</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsQuotation(true)}
                    className={cn(
                      "p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-4 transition-all group relative",
                      isQuotation ? "border-plano-600 bg-plano-50/20 shadow-xl shadow-plano-600/5" : "border-plano-50 hover:border-plano-200 text-gray-400"
                    )}
                  >
                    {isQuotation && <div className="absolute top-4 right-4 text-plano-600"><CheckCircle2 size={16} /></div>}
                    <Info size={32} className={isQuotation ? "text-plano-600" : "text-gray-300"} />
                    <div className="text-center">
                      <span className="block text-xs font-bold text-plano-900 uppercase tracking-widest mb-1">Request Quote</span>
                      <span className="block text-[9px] font-medium uppercase tracking-widest leading-none">Draft → Quotation Flow</span>
                    </div>
                  </button>
                </div>

                <div className="p-5 bg-plano-50/30 rounded-[2rem] border border-plano-50 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white border border-plano-100 flex items-center justify-center text-plano-600 flex-shrink-0">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-plano-900 mb-1 uppercase tracking-tight">
                      {isQuotation ? 'Formal Review Requested' : 'Immediate Access'}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                      {isQuotation
                        ? 'Our team will review your requirements and confirm pricing. You will receive an invoice upon approval.'
                        : 'Your subscription will be activated instantly. Perfect for standard recurring plans.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4 sticky top-28">
          <div className="bg-white rounded-[2.5rem] border border-plano-100 p-8 shadow-xl shadow-plano-600/5">
            <h3 className="text-[11px] font-bold text-plano-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Tag size={16} />
              Order Summary
            </h3>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-lg font-bold text-plano-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">GST Payable (dynamic)</span>
                <span className="text-lg font-bold text-plano-900">₹{taxes.toLocaleString()}</span>
              </div>
              {taxBreakdown.totalTaxPortion > taxes && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GST Included In Price</span>
                  <span className="text-sm font-bold text-plano-700">₹{(taxBreakdown.totalTaxPortion - taxes).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {taxBreakdown.lines.length > 0 && (
                <div className="space-y-2 pl-1">
                  {taxBreakdown.lines.map((line) => (
                    <div key={line.label} className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{line.label}</span>
                      <span className="text-sm font-bold text-plano-700">₹{line.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between items-center py-4 bg-success-50 rounded-2xl px-4 border border-success-100">
                  <span className="text-xs font-bold text-success-600 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={14} />
                    Discount ({discountCode})
                  </span>
                  <span className="text-lg font-bold text-success-700">−₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="h-px bg-plano-50 w-full" />
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 underline underline-offset-4 decoration-plano-200">Grand Total</span>
                <span className="text-4xl font-bold text-plano-900 tabular-nums">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {step === 'order' && (
              <div className="mb-10">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    className="w-full h-14 pl-12 pr-24 rounded-2xl border border-plano-100 bg-plano-50/50 text-sm font-bold text-plano-900 outline-none focus:border-plano-600 focus:bg-white transition-all shadow-inner uppercase"
                  />
                  <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <button
                    onClick={handleApplyPromo}
                    className="absolute right-2 top-2 h-10 px-4 bg-plano-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-plano-900 transition-all shadow-md"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-4">Hint: try PLANO20</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full h-16 rounded-[2rem] bg-plano-600 text-white font-bold text-sm uppercase tracking-widest transition-all hover:bg-plano-900 hover:shadow-2xl shadow-lg shadow-plano-600/20 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {step === 'order' ? 'PROCEED TO DETAILS' :
                      step === 'address' ? 'GO TO PAYMENT' :
                        isQuotation ? 'SUBMIT QUOTATION' : 'COMPLETE PURCHASE'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {step !== 'order' && (
                <button
                  onClick={() => setStep(step === 'payment' ? 'address' : 'order')}
                  className="w-full h-12 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-plano-600 transition-all"
                >
                  <ChevronLeft size={16} />
                  Back to previous
                </button>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-plano-50 flex flex-col items-center gap-4 opacity-40">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <ShieldCheck size={14} className="text-plano-600" />
                Encrypted Transaction
              </div>
              <div className="flex items-center gap-3">
                <Info size={14} />
                <span className="text-[9px] uppercase tracking-widest text-gray-400">T&C Apply · All sales final for subscriptions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
