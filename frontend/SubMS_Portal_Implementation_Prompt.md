# Subscription Management System — User Portal
## Implementation Prompt for Antigravity

---

## ROLE & CONTEXT

You are a senior UI/UX engineer and frontend developer responsible for implementing the **customer-facing portal** of a Subscription Management System (SubMS). You must deliver a pixel-faithful, production-ready frontend that exactly reproduces the provided wireframes while satisfying all business rules described in the problem statement.



---



## SCOPE & BOUNDARIES

### In Scope
- All pages visible in the wireframes (see Page Inventory below)
- All interactions, state transitions, modals, and dropdowns described
- Fully mocked API layer (no real backend required to run locally)
- Responsive layout: desktop-first, with mobile breakpoints at `768px` and `480px`
- Accessible markup: semantic HTML5, ARIA labels, keyboard navigation, focus rings

### Out of Scope
- Admin panel and internal user views
- Real payment gateway integration (use a simulated payment flow)
- Backend, database, or server-side rendering

---

## PAGE INVENTORY

### 1. HOME PAGE (`/`)
**Wireframe ref:** Image 1 (left panel)

**Layout:**
- Full-width top navbar: `[Company Logo] | Home | Shop | My Account` on the left; `[Cart] [My Profile]` on the right
- "My Profile" triggers a **dropdown** with two items: **Sign Out** (shown in wireframe)
- Hero area: large centered `HOME Page` heading — placeholder for a future hero section

**Navbar states:**
- Unauthenticated: show `[Login]` instead of `[Cart] [My Profile]`
- Authenticated: show `[Cart (count badge)] [My Profile ▾]`

**Interactions:**
- Clicking "My Profile" opens a dropdown: `User Details`, `My Orders`, `Sign Out`
- Clicking "Sign Out" clears auth state and redirects to `/login`

---

### 2. SHOP / PRODUCT LISTING PAGE (`/shop`)
**Wireframe ref:** Image 1 (right panel)

**Layout:**
- Left sidebar: **Category** filter (product type chips/checkboxes) + **Price Range** slider
- Top bar: **Search** input (left) + **Sort By: Price** dropdown (right)
- Product grid: 4-column on desktop, 2-column on tablet, 1-column on mobile
- Each product card: image area (placeholder), Name, Description, **Price + Billing cycle label** (e.g., "₹1200/month")

**Critical note from wireframe annotation:**
> "price and billing should be shown accordingly subscription recurring plan"

**Implementation rule:** Each product card must display the **lowest available recurring plan price** alongside its billing period label (e.g., `₹840/month · Yearly`). Do not show a flat price.

**Interactions:**
- Filtering by Category updates the grid in real-time (client-side filter)
- Price Range slider filters products dynamically
- Sort By Price sorts ascending/descending
- Clicking a product card navigates to `/shop/:productId`

---

### 3. PRODUCT DETAIL PAGE (`/shop/:productId`)
**Wireframe ref:** Image 2

**Layout:**
- Breadcrumb: `All Products / Product Type / Product Name`
- Left: image thumbnails (img1, img2, img3) + large main image viewer
- Right panel:
  - **Product Name** (h1)
  - **Subscription Plan selector table:**

    | Plan | Total Price | Per-Month Rate | Discount Badge |
    |---|---|---|---|
    | Monthly | ₹1200 | ₹1200/month | — |
    | 6 Months | ₹5760 | ₹960/month | 20% off |
    | Yearly | ₹10080 | ₹840/month | 30% off |

  - Discount percentages are **computed dynamically** from the monthly base price
  - **Product Category** label
  - **Variants Available:** clicking opens a **popup/dropdown** listing variant attributes (e.g., Brand → Odoo, Extra Price: +₹560); selected variant adjusts the total price
  - **Quantity selector:** `[−] [1] [+]`
  - **[Add to Cart]** button
  - Terms section: "30 day money back guarantee · Shipping 2–3 Business days"

**Critical note from wireframe annotation:**
> "This discount should be computed on the go and should be shown according with difference"
> "small pop up or list of variant should come to select and accordingly price should vary (extra price)"

**Interactions:**
- Selecting a plan row highlights it and recalculates the total shown
- Selecting a variant from the popup adds `extraPrice` to the displayed total
- Add to Cart: adds `{productId, planId, variantId, quantity}` to cart store; shows a toast notification

---

### 4. CART PAGE (`/cart`)
**Wireframe ref:** Image 3 (left panel)

**Layout (tabs):** `Order | Address | Payment` — tabbed stepper

**Order Tab:**
- Left column: list of cart items
  - Each item: thumbnail, Product Name, `₹XXXX per [period]`, quantity selector `[−] [n] [+]`, `[Remove]` button
  - Discount line item (if applied): label + `−₹XX`; `[Remove]` button
- Right column — Order Summary card:
  - Subtotal, Taxes, **Total**
  - **Discount Code** input + `[Apply]` button
  - Success message: "You have successfully applied"
  - **[Checkout]** button → advances to Address tab

**Address Tab:**
- Pre-filled with logged-in user's saved address (from profile)
- Option to enter a different address
- **[Continue to Payment]** button

**Payment Tab:**
- Demo/test payment gateway UI (simulated)
- On success → redirect to `/order/confirmation`

**Wireframe annotation:**
> "For payment any demo or testing beta version payment gate will work and accordingly page should be implemented"
> "For address page by default User address should come and later on if they want to add different that option should also be given"

---

### 5. ORDER CONFIRMATION PAGE (`/order/confirmation`)
**Wireframe ref:** Image 3 (right panel)

**Layout:**
- Large heading: **"Thanks you for your order"** (preserve exact copy)
- Order number: `Order S0001`
- Status message: "Your payment has been processed"
- **[Print]** button (triggers `window.print()`)
- Right mini-summary card: product thumbnail, product name, discount line, Subtotal, Taxes, **Total**

---

### 6. USER DETAILS PAGE (`/account/profile`)
**Wireframe ref:** Image 4

**Access:** Via "My Profile → User Details" dropdown

**Layout:**
- Full-page form inside a card
- Fields (all editable inline):
  - User Name
  - Email
  - Phone Number
  - Address
  - Other details (extensible)
- **[Save Changes]** button (submit the form)
- **[My Orders]** quick link in the dropdown/sidebar

**Validation (Zod schema):**
- Email: valid format + unique (mocked check)
- Password (if shown): length > 8, uppercase, lowercase, special character
- Phone: numeric, min 10 digits

**Wireframe annotation:**
> "All information should be editable"

---

### 7. MY ORDERS PAGE (`/account/orders`)
**Wireframe ref:** Image 5

**Access:** Via "My Profile → My Orders"

**Layout:**
- Table with columns: **Order** (order number as a link), **Order Date**, **Total**
- Each row links to `/account/orders/:orderId`
- Clicking an order number navigates to the Order Detail page

**Wireframe annotation:**
> "On click of this it should take to order page accordingly"

---

### 8. ORDER DETAIL PAGE (`/account/orders/:orderId`)
**Wireframe ref:** Image 6

**Layout:**
- Heading: `Order / S0001`
- Sub-reference: `S00022` + **State of subscription** badge (e.g., Active, Closed)
- Action buttons: **[Download]** (PDF) · **[Renew]** · **[Close]**
- **Your Subscription** section:
  - Plan name
  - Start Date
  - End Date
- **Invoicing and Shipping Address** section (read-only)
- **Last Invoices** table:
  - Invoice Number (link to `/account/orders/:orderId/invoices/:invoiceId`)
  - Payment Status badge (Paid / Pending)
- **Products** table:
  - Product Name, Quantity, Unit Price, Taxes %, Amount
  - Discount line
  - Untaxed Amount, Tax (15%), **Total**

**Wireframe annotations:**
> "On clicking this Renew new order should be created and should be visible accordingly"
> "This should redirect me to invoice below"
> "download order in pdf"

**Interactions:**
- `[Download]` → generates PDF of the order using jsPDF/html2canvas
- `[Renew]` → calls mock API to create a new subscription order; shows success toast; new order appears in My Orders list
- `[Close]` → confirms via modal; marks subscription as Closed
- Invoice number link → navigates to Invoice page

---

### 9. INVOICE PAGE (`/account/orders/:orderId/invoices/:invoiceId`)
**Wireframe ref:** Image 7

**Layout:**
- Heading: `Order / S0001 / Inv / 001`
- Buttons: **[Payment]** (only shown if not yet paid — per wireframe annotation) · **[Download]**
- Invoice details: Invoice number, Invoice Date, Due Date, Source
- **Address** section: Customer name, Email
- **Products** table: Product Name, Quantity, Unit Price, Taxes %, Amount
- Discount line
- Untaxed Amount, Tax 15%, **Total**
- Paid on date, **Amount Due**

**Wireframe annotation:**
> "If payment is already done then this button should not show" (re: Payment button)

**Interactions:**
- `[Payment]` → opens simulated payment modal; on success sets status to Paid and hides button
- `[Download]` → PDF download of invoice

---

### 10. AUTH PAGES

#### Login (`/login`)
- Email + Password fields
- `[Sign In]` button
- Link to `/signup` and `/forgot-password`

#### Signup (`/signup`)
- Name, Email, Password, Confirm Password
- Zod validations (see §5.4 of problem statement)
- On success → redirect to `/`

#### Forgot Password (`/forgot-password`)
- Email field; on submit shows "Reset link sent" message

---

## COMPONENT ARCHITECTURE

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx            # Logo, nav links, Cart badge, Profile dropdown
│   │   ├── ProfileDropdown.jsx   # User Details, My Orders, Sign Out
│   │   └── PageWrapper.jsx       # Max-width container + padding
│   ├── shop/
│   │   ├── ProductCard.jsx       # Card with image, name, price/billing
│   │   ├── PlanTable.jsx         # Subscription plan selector (Product Detail)
│   │   ├── VariantPopup.jsx      # Variant picker modal
│   │   └── FilterSidebar.jsx     # Category + Price Range filters
│   ├── cart/
│   │   ├── CartStepper.jsx       # Order | Address | Payment tabs
│   │   ├── CartItem.jsx
│   │   ├── OrderSummary.jsx
│   │   └── DiscountInput.jsx
│   ├── account/
│   │   ├── ProfileForm.jsx
│   │   ├── OrdersTable.jsx
│   │   ├── OrderDetail.jsx
│   │   └── InvoiceDetail.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Badge.jsx             # Status badges (Active, Paid, Closed)
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── Table.jsx
├── pages/
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── OrderConfirmation.jsx
│   ├── account/
│   │   ├── Profile.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetail.jsx
│   │   └── InvoiceDetail.jsx
│   └── auth/
│       ├── Login.jsx
│       ├── Signup.jsx
│       └── ForgotPassword.jsx
├── store/
│   ├── authStore.js              # Zustand: user, token, login/logout
│   ├── cartStore.js              # Zustand: items, addItem, removeItem, discount
│   └── orderStore.js             # Zustand: orders cache
├── mocks/
│   ├── products.js               # 8–12 sample products with plans & variants
│   ├── orders.js                 # Sample orders, invoices
│   └── handlers.js               # axios-mock-adapter routes
├── lib/
│   ├── api.js                    # Axios instance + mock setup
│   ├── pdfExport.js              # jsPDF helpers
│   └── validators.js             # Shared Zod schemas
└── styles/
    ├── tokens.css                # CSS custom properties
    └── index.css                 # Tailwind base + global overrides
```

---

## DATA MODEL (MOCK)

```js
// Product
{
  id: "prod_001",
  name: "Odoo Enterprise",
  type: "Software",
  description: "Full ERP suite",
  images: ["placeholder1.jpg", "placeholder2.jpg", "placeholder3.jpg"],
  plans: [
    { id: "monthly", label: "Monthly", totalPrice: 1200, billingPeriod: "month" },
    { id: "6month",  label: "6 Months", totalPrice: 5760, billingPeriod: "month", cycleMonths: 6 },
    { id: "yearly",  label: "Yearly", totalPrice: 10080, billingPeriod: "month", cycleMonths: 12 }
  ],
  variants: [
    { attribute: "Brand", value: "Odoo", extraPrice: 560 },
    { attribute: "Brand", value: "Community", extraPrice: 0 }
  ]
}

// Order
{
  id: "S0001",
  customerId: "user_001",
  planId: "yearly",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  status: "active",           // draft | quotation | confirmed | active | closed
  subscriptionRef: "S00022",
  items: [
    { productId: "prod_001", quantity: 2, unitPrice: 1200, taxes: 15, amount: 2400 }
  ],
  discounts: [{ label: "10% on your order", amount: -120 }],
  subtotal: 2280,
  taxAmount: 360,
  total: 2640,
  invoices: ["INV/0015"]
}

// Invoice
{
  id: "INV/0015",
  orderId: "S0001",
  invoiceDate: "2026-02-06",
  dueDate: "2026-02-06",
  status: "paid",             // draft | confirmed | paid
  paidOn: "2026-02-06",
  items: [...],
  subtotal: 2280, taxAmount: 360, total: 2640, amountDue: 0
}
```

---

## ROUTING PLAN

```jsx
// App.jsx
<Routes>
  <Route path="/"                             element={<Home />} />
  <Route path="/login"                        element={<Login />} />
  <Route path="/signup"                       element={<Signup />} />
  <Route path="/forgot-password"              element={<ForgotPassword />} />
  <Route path="/shop"                         element={<Shop />} />
  <Route path="/shop/:productId"              element={<ProductDetail />} />

  {/* Protected routes — redirect to /login if not authenticated */}
  <Route element={<ProtectedRoute />}>
    <Route path="/cart"                       element={<Cart />} />
    <Route path="/order/confirmation"         element={<OrderConfirmation />} />
    <Route path="/account/profile"            element={<Profile />} />
    <Route path="/account/orders"             element={<Orders />} />
    <Route path="/account/orders/:orderId"    element={<OrderDetail />} />
    <Route path="/account/orders/:orderId/invoices/:invoiceId"
                                              element={<InvoiceDetail />} />
  </Route>
</Routes>
```

---

## MINIMAL STARTER SNIPPET

The following bootstraps the Navbar and Portal layout. Expand from here for each page.

```jsx
// src/components/layout/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore(s => s.items.length);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="border px-3 py-1 text-sm font-mono"
            style={{ borderColor: "var(--border-default)", color: "var(--text-accent)" }}>
            company logo
          </Link>
          <div className="flex gap-6 text-sm" style={{ fontFamily: "var(--font-sans)" }}>
            {["Home", "Shop"].map(label => (
              <Link key={label} to={label === "Home" ? "/" : "/shop"}
                className="hover:text-[var(--text-accent)] transition-colors"
                style={{ color: "var(--text-primary)" }}>{label}</Link>
            ))}
            {user && (
              <Link to="/account/profile"
                className="hover:text-[var(--text-accent)] transition-colors"
                style={{ color: "var(--text-primary)" }}>My Account</Link>
            )}
          </div>
        </div>

        {/* Right: Cart + Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="relative border px-3 py-1 text-sm flex items-center gap-2"
                style={{ borderColor: "var(--border-default)", color: "var(--text-accent)",
                         fontFamily: "var(--font-sans)" }}>
                <ShoppingCart size={14} />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px]
                    flex items-center justify-center font-mono"
                    style={{ background: "var(--text-accent)", color: "var(--bg-base)" }}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button onClick={() => setProfileOpen(o => !o)}
                  className="border px-3 py-1 text-sm flex items-center gap-1"
                  style={{ borderColor: "var(--border-default)", color: "var(--text-accent)",
                           fontFamily: "var(--font-sans)" }}>
                  My Profile <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 border w-40 z-50"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}>
                      {[
                        { label: "User Details", to: "/account/profile" },
                        { label: "My Orders",    to: "/account/orders" },
                      ].map(item => (
                        <Link key={item.label} to={item.to}
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm hover:bg-[#2A1818] transition-colors"
                          style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm border-t hover:bg-[#2A1818]
                          transition-colors"
                        style={{ color: "var(--text-accent)", borderColor: "var(--border-subtle)",
                                 fontFamily: "var(--font-sans)" }}>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/login" className="border px-3 py-1 text-sm"
              style={{ borderColor: "var(--border-default)", color: "var(--text-accent)",
                       fontFamily: "var(--font-sans)" }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

```jsx
// src/components/layout/PageWrapper.jsx
export default function PageWrapper({ children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-6 py-8 ${className}`}
      style={{ fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}>
      {children}
    </div>
  );
}
```

```jsx
// src/App.jsx  (root scaffold)
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import { useAuthStore } from "./store/authStore";

function ProtectedRoute() {
  const { user } = useAuthStore();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"                 element={<div style={{color:"var(--text-accent)",
            display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",
            fontSize:"2.5rem",fontFamily:"var(--font-mono)"}}>HOME Page</div>} />
          <Route path="/login"            element={<Login />} />
          <Route path="/signup"           element={<Signup />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />
          <Route path="/shop"             element={<Shop />} />
          <Route path="/shop/:productId"  element={<ProductDetail />} />
          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart"                   element={<Cart />} />
            <Route path="/order/confirmation"     element={<OrderConfirmation />} />
            <Route path="/account/profile"        element={<Profile />} />
            <Route path="/account/orders"         element={<Orders />} />
            <Route path="/account/orders/:id"     element={<OrderDetail />} />
            <Route path="/account/orders/:id/invoices/:invId" element={<InvoiceDetail />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

---

## ACCEPTANCE CRITERIA

### Visual Parity
- [ ] All pages match wireframe layout at 1440px wide (desktop) and 375px (mobile)
- [ ] Dark background `#0D0D0D`, coral accent `#E87070`, mono font for prices/IDs
- [ ] Navbar is sticky; dropdown appears on "My Profile" click with correct items
- [ ] Product cards show plan price (lowest plan) + billing label, not a flat price

### Functional Parity
- [ ] Plan selector on Product Detail correctly computes discount % vs monthly base
- [ ] Variant popup adds `extraPrice` to displayed total in real time
- [ ] Cart totals update on qty change and discount code application
- [ ] Checkout stepper progresses: Order → Address → Payment → Confirmation
- [ ] Address tab pre-populates from user profile; override option works
- [ ] Renew button creates a new order entry visible in My Orders
- [ ] Invoice Payment button is hidden when invoice status is "paid"
- [ ] Download buttons generate a PDF matching the page content
- [ ] Authentication guards redirect unauthenticated users to `/login`
- [ ] All form fields validated per Zod schemas before submission
- [ ] Sign Out clears auth state and redirects to home

### Documentation
- [ ] `README.md` includes: prerequisites, `npm install`, `npm run dev`, `npm run build`, `npm test`
- [ ] Mock data documented in `src/mocks/README.md`
- [ ] CSS token reference documented in `styles/tokens.css` with comments

---

## AMBIGUITIES & CLARIFYING QUESTIONS

Before finalising implementation, please resolve the following:

1. **Currency symbol:** All wireframe prices use `₹` (INR). Confirm this is correct or specify another currency.
2. **"My Account" nav link:** Wireframe shows it in the nav. Does this go to `/account/profile` directly, or open a submenu?
3. **Product images:** Are real product images available, or should placeholder images (e.g., a dark-toned geometric placeholder SVG) be used throughout?
4. **Tax rate:** The wireframes show 15% tax. Is this fixed or configurable per product/region?
5. **Discount code validation:** Should discount codes be validated against a mock list, or is any code accepted in the demo?
6. **"Company Logo":** Should this be replaced with a real brand name/logo asset, or kept as the literal text "company logo" per the wireframe?
7. **Pagination on My Orders:** The wireframe shows only two rows. Should pagination or infinite scroll be implemented for scale?
8. **Subscription status badge colours:** Confirm status→colour mapping (Active = green, Closed = muted red/grey, Draft = amber).

---

## OPTIONAL ENHANCEMENTS (pending approval)

If the project owner approves enhancements, the following can be layered in without disrupting the base implementation:

- **i18n scaffold:** `react-i18next` with English as default; translation keys extracted from all UI strings
- **Accessibility audit pass:** `axe-core` integration in Vitest; WCAG 2.1 AA contrast compliance pass on all tokens
- **Route-level code splitting:** `React.lazy` + `Suspense` per page for faster initial load
- **Skeleton loading states:** Shimmer placeholders while mock API resolves (150ms simulated delay)
- **PWA manifest:** `vite-plugin-pwa` for offline-capable portal shell

---

*Prompt authored for Antigravity · Subscription Management System Hackathon · April 2026*
