export type UserRole = 'ADMIN' | 'INTERNAL_USER' | 'CUSTOMER';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductType = 'software' | 'service' | 'addon';

export interface Variant {
  id: string;
  _id?: string;
  attribute: string;
  value: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  sku?: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  basePrice: number;
  currency: string;
  unitLabel: string;
  isActive: boolean;
  taxApplicable: boolean;
  taxIds: (string | Tax)[];
  plans?: Plan[];
  variants?: Variant[];
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  productId: string | Product;
  billingCycle: BillingCycle;
  price: number;
  currency: string;
  trialDays: number;
  features: string[];
  maxUsers?: number | null;
  minQuantity: number;
  isAutoClose: boolean;
  isClosable: boolean;
  isPausable: boolean;
  isRenewable: boolean;
  isActive: boolean;
  discountIds: (string | Discount)[];
  taxIds: (string | Tax)[];
  metadata?: Record<string, string>;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | 'draft'
  | 'quotation'
  | 'confirmed'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'closed';

export interface Subscription {
  id: string;
  userId: string | User;
  planId: string | Plan;
  productId: string | Product;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountApplied: number;
  taxApplied: number;
  grandTotal: number;
  currency: string;
  cancellationReason?: string;
  cancelledAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  createdBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string | Subscription;
  userId: string | User;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  balanceDue: number;
  currency: string;
  notes?: string;
  items: InvoiceItem[];
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string | Invoice;
  userId: string | User;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tax {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  rate: number;
  description?: string;
  isActive: boolean;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  appliesTo: 'products' | 'subscriptions' | 'both';
  minPurchaseAmount?: number;
  minQuantity?: number;
  validFrom: string;
  validTo: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  userId: string | User;
  planId: string | Plan;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  issueDate: string;
  expiryDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface KPIStats {
  activeSubscriptions: number;
  activeSubscriptionsTrend: number;
  mrr: number;
  mrrTrend: number;
  overdueInvoices: number;
  overdueInvoicesTrend: number;
  newSubscriptions30d: number;
  newSubscriptions30dTrend: number;
  closedSubscriptions?: number;
  confirmedSubscriptions?: number;
  draftSubscriptions?: number;
}

export interface ChartDataPoint {
  date?: string;
  name?: string;
  revenue?: number;
  value?: number;
}
