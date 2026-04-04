# Plano — Complete UI Prompt for Next.js
### Subscription Management System · Full Frontend Specification

---

## Table of Contents

1. [Design System & Brand Identity](#1-design-system--brand-identity)
2. [Global Layout & Navigation](#2-global-layout--navigation)
3. [Authentication Pages](#3-authentication-pages)
4. [Dashboard / Home](#4-dashboard--home)
5. [Products Module](#5-products-module)
6. [Recurring Plans Module](#6-recurring-plans-module)
7. [Subscriptions Module](#7-subscriptions-module)
8. [Quotation Templates Module](#8-quotation-templates-module)
9. [Invoices Module](#9-invoices-module)
10. [Payments Module](#10-payments-module)
11. [Discounts Module](#11-discounts-module)
12. [Tax Management Module](#12-tax-management-module)
13. [Users & Contacts Module](#13-users--contacts-module)
14. [Reports Module](#14-reports-module)
15. [Shared Components Library](#15-shared-components-library)
16. [Animations & Micro-interactions](#16-animations--micro-interactions)
17. [Responsive Behavior](#17-responsive-behavior)
18. [Accessibility Requirements](#18-accessibility-requirements)

---

## 1. Design System & Brand Identity

### Brand

**App Name:** Plano
**Tagline:** "Recurring revenue, simplified."
**Logo:** Wordmark "Plano" in `DM Serif Display` — the "P" optionally stylized as a plan/timeline icon using a horizontal line with a circular node. Keep it clean and minimal.

---

### Typography

```
Display / Hero text:    DM Serif Display — 400 weight only. Used for page titles, hero numbers.
Body / UI text:         Plus Jakarta Sans — 400, 500, 600 weights. Used for everything else.
Monospace:              JetBrains Mono — for IDs, amounts, code snippets, invoice numbers.
```

Import in `app/layout.tsx`:
```tsx
import { DM_Serif_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const serif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-serif' })
const sans = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--font-mono' })
```

**Type scale:**
```
xs:   11px / line-height 1.4  — labels, badges, helper text
sm:   13px / line-height 1.5  — table data, captions
base: 15px / line-height 1.6  — body text, form labels
lg:   18px / line-height 1.4  — section headings
xl:   24px / line-height 1.2  — page titles (Plus Jakarta Sans 600)
2xl:  32px / line-height 1.1  — dashboard KPI numbers (DM Serif Display)
3xl:  48px / line-height 1.0  — hero stat (DM Serif Display)
```

---

### Color Palette

**Primary theme: Light mode default, dark mode supported via `class="dark"`.**

```css
/* globals.css — Plano Design Tokens */
:root {
  /* Brand */
  --plano-50:  #f0f7ff;
  --plano-100: #dbeafe;
  --plano-200: #bfdbfe;
  --plano-400: #60a5fa;
  --plano-500: #3b82f6;
  --plano-600: #2563eb;
  --plano-700: #1d4ed8;
  --plano-900: #1e3a5f;

  /* Neutral (warm gray — avoids cold sterile feel) */
  --gray-25:  #fdfcfb;
  --gray-50:  #f9f7f5;
  --gray-100: #f0ede9;
  --gray-200: #e4e0db;
  --gray-300: #ccc8c2;
  --gray-400: #a8a39c;
  --gray-500: #857f78;
  --gray-600: #635d57;
  --gray-700: #453f3a;
  --gray-800: #2d2925;
  --gray-900: #1a1714;

  /* Semantic */
  --success-50:  #f0fdf4;
  --success-500: #22c55e;
  --success-700: #15803d;
  --warning-50:  #fffbeb;
  --warning-500: #f59e0b;
  --warning-700: #b45309;
  --danger-50:   #fef2f2;
  --danger-500:  #ef4444;
  --danger-700:  #b91c1c;
  --info-50:     #eff6ff;
  --info-500:    #3b82f6;
  --info-700:    #1d4ed8;

  /* Surfaces */
  --bg-page:      #f9f7f5;      /* warm off-white page background */
  --bg-surface:   #ffffff;      /* card / panel backgrounds */
  --bg-elevated:  #ffffff;      /* modals, dropdowns */
  --border:       #e4e0db;      /* default border */
  --border-strong:#ccc8c2;      /* hover / focused borders */

  /* Text */
  --text-primary:   #1a1714;
  --text-secondary: #635d57;
  --text-tertiary:  #a8a39c;
  --text-inverse:   #ffffff;

  /* Sidebar */
  --sidebar-bg:    #1a1714;
  --sidebar-text:  #e4e0db;
  --sidebar-muted: #857f78;
  --sidebar-hover: #2d2925;
  --sidebar-active:#2563eb;
}

.dark {
  --bg-page:      #0f0e0d;
  --bg-surface:   #1a1714;
  --bg-elevated:  #2d2925;
  --border:       #2d2925;
  --border-strong:#453f3a;
  --text-primary:   #f9f7f5;
  --text-secondary: #a8a39c;
  --text-tertiary:  #635d57;
  --sidebar-bg:    #0f0e0d;
  --sidebar-hover: #1a1714;
}
```

**Color usage rules:**
- Page background: `--bg-page` (warm off-white, NOT pure white)
- Cards and panels: `--bg-surface` (white in light mode)
- Sidebar: always dark (`--sidebar-bg: #1a1714`) regardless of theme
- Primary actions: `--plano-600` (#2563eb)
- Destructive actions: `--danger-500`
- Success states: `--success-500`
- All borders: 1px solid `--border` (never 2px except focus rings)

---

### Spacing & Layout

```
Sidebar width (expanded):  240px
Sidebar width (collapsed): 64px
Topbar height:             56px
Page max-width:            1280px
Content padding:           24px (desktop), 16px (tablet), 12px (mobile)
Card padding:              20px 24px
Card border-radius:        12px
Button border-radius:      8px
Input border-radius:       8px
Badge border-radius:       999px (pill)
```

---

### Shadows

```css
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md:  0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.04);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04);
```

Use `shadow-sm` on cards, `shadow-md` on modals, `shadow-lg` on dropdowns.

---

### Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'monospace'],
      },
      colors: {
        plano: {
          50:  '#f0f7ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a5f',
        },
        gray: {
          25:  '#fdfcfb',
          50:  '#f9f7f5',
          100: '#f0ede9',
          200: '#e4e0db',
          300: '#ccc8c2',
          400: '#a8a39c',
          500: '#857f78',
          600: '#635d57',
          700: '#453f3a',
          800: '#2d2925',
          900: '#1a1714',
        },
      },
      borderRadius: {
        card:   '12px',
        btn:    '8px',
        input:  '8px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
        lg: '0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 2. Global Layout & Navigation

### Layout Shell — `app/(dashboard)/layout.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px, dark)    │  TOPBAR (56px, white/border)     │
│  ┌────────────────────┐   ├──────────────────────────────────┤
│  │  🅿 Plano          │   │  Page content area               │
│  ├────────────────────┤   │  max-w-[1280px] mx-auto          │
│  │  Dashboard         │   │  px-6 py-6                       │
│  │  Products          │   │                                  │
│  │  Plans             │   │                                  │
│  │  Subscriptions     │   │                                  │
│  │  Quotations        │   │                                  │
│  │  Invoices          │   │                                  │
│  │  Payments          │   │                                  │
│  │  Discounts         │   │                                  │
│  │  Taxes             │   │                                  │
│  │  Users             │   │                                  │
│  │  Reports           │   │                                  │
│  ├────────────────────┤   │                                  │
│  │  [user avatar]     │   │                                  │
│  │  Name · Role badge │   │                                  │
│  │  Settings / Logout │   │                                  │
│  └────────────────────┘   └──────────────────────────────────┘
```

### Sidebar Component — `components/layout/Sidebar.tsx`

**Visual design:**
- Background: `#1a1714` (deep warm black) — always dark regardless of theme
- Logo area: 56px height, "Plano" in `DM Serif Display` 20px, white, with a small geometric plan-icon SVG to the left
- Nav items: 40px height, 12px horizontal padding, 8px border-radius, `Plus Jakarta Sans 500` 14px
- Active state: `bg-plano-600` (#2563eb) text white, left border `3px solid #60a5fa`
- Hover state: `bg-[#2d2925]` with smooth 150ms transition
- Icons: 18px Lucide icons, left-aligned, 12px gap to label text
- Section labels (e.g. "Billing", "Settings"): 10px uppercase tracking-widest `--sidebar-muted` color
- Collapsed state: show icons only, tooltip on hover with nav label
- Bottom section: User avatar (32px circle with initials), name in 13px, role badge in 11px pill

**Nav groups:**
```
── Overview
   Dashboard

── Catalog
   Products
   Recurring Plans

── Billing
   Subscriptions
   Quotation Templates
   Invoices
   Payments

── Finance
   Discounts
   Tax Management

── Administration  [Admin only — hidden for other roles]
   Users & Contacts
   Reports
```

**Role-based visibility:** Wrap admin-only items in `{session?.user.role === 'ADMIN' && ...}`.

---

### Topbar Component — `components/layout/Topbar.tsx`

**Left side:**
- Hamburger / collapse icon (24px) — toggles sidebar on desktop, opens drawer on mobile
- Breadcrumb: `Dashboard / Subscriptions / #SUB-00142` in `Plus Jakarta Sans 400` 14px gray-500, with `/` separators

**Right side (flex gap-3):**
- 🔍 Search button → opens command palette (Cmd+K) — global search across subscriptions, invoices, customers
- 🔔 Notifications bell icon — badge count if unread, dropdown with recent alerts (overdue invoices, expiring subscriptions)
- 🌙 Theme toggle (sun/moon icon) — switches dark/light mode
- User avatar dropdown (32px circle): name, role badge, "My Profile", "Settings", divider, "Sign out"

---

### Command Palette — `components/layout/CommandPalette.tsx`

Triggered by Cmd+K or search button. Full-screen overlay with centered modal (480px wide).

```
┌─────────────────────────────────────────┐
│  🔍  Search subscriptions, invoices...  │
├─────────────────────────────────────────┤
│  Recent                                 │
│  📋  SUB-00142 · Acme Corp · Active     │
│  🧾  INV-00089 · ₹24,500 · Draft       │
│  📦  Pro Plan · Monthly · ₹2,999       │
├─────────────────────────────────────────┤
│  Quick actions                          │
│  ➕  New Subscription                   │
│  ➕  New Invoice                        │
│  ➕  New Product                        │
└─────────────────────────────────────────┘
```

---

## 3. Authentication Pages

### File structure
```
app/
└── (auth)/
    ├── layout.tsx       ← centered split layout
    ├── login/page.tsx
    ├── signup/page.tsx
    └── reset-password/
        ├── page.tsx     ← request reset
        └── [token]/page.tsx  ← set new password
```

### Auth Layout — `app/(auth)/layout.tsx`

**Split screen — 50/50 on desktop, stacked on mobile:**

```
┌──────────────────────────┬──────────────────────────┐
│   LEFT PANEL             │   RIGHT PANEL             │
│   bg: #1a1714 (dark)     │   bg: #f9f7f5 (warm gray) │
│                          │                           │
│   [Plano logo]           │   [Auth form card]        │
│                          │                           │
│   "Recurring revenue,    │                           │
│    simplified."          │                           │
│                          │                           │
│   ── testimonial quote   │                           │
│   ── 3 feature pills     │                           │
│                          │                           │
│   Subtle grid pattern    │                           │
│   overlay on bg          │                           │
└──────────────────────────┴──────────────────────────┘
```

**Left panel design:**
- Background `#1a1714` with a subtle dot grid overlay (CSS background-image radial-gradient dots, 4% opacity)
- Logo: "Plano" in DM Serif Display 28px white + geometric icon
- Tagline: "Recurring revenue, simplified." — DM Serif Display 32px white, line-height 1.2
- 3 feature pills (rounded, border `rgba(255,255,255,0.15)`, glass effect):
  - ✓ Auto invoice generation
  - ✓ Flexible billing plans
  - ✓ Real-time analytics
- Bottom: small testimonial — quote in italic 14px warm gray, attribution in 12px muted

**Right panel — Form card:**
- White card, centered, max-width 400px, shadow-lg, rounded-card
- No outer border on desktop — the background provides separation

---

### Login Page — `app/(auth)/login/page.tsx`

```
┌─────────────────────────────────────────┐
│  Welcome back                           │  ← DM Serif Display 28px
│  Sign in to your Plano account          │  ← Plus Jakarta Sans 14px gray-500
│                                         │
│  Email address                          │  ← label 13px 500
│  ┌─────────────────────────────────┐    │
│  │  you@company.com                │    │  ← input 40px height
│  └─────────────────────────────────┘    │
│                                         │
│  Password                    Forgot?    │  ← label + right-aligned link
│  ┌─────────────────────────────────┐    │
│  │  ••••••••••••         👁        │    │  ← eye toggle icon
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │     Sign in →                   │    │  ← primary button, full width
│  └─────────────────────────────────┘    │
│                                         │
│  Don't have an account? Create one      │
└─────────────────────────────────────────┘
```

**Validation UI:**
- Error state: input border `--danger-500`, red helper text 12px below input with ⚠ icon
- Success / typing state: input border `--plano-500`
- Loading state on submit button: spinner replaces arrow icon, button disabled + opacity 70%

---

### Signup Page — `app/(auth)/signup/page.tsx`

Fields (in order):
1. Full Name
2. Email Address
3. Password — with strength meter bar (4 segments, green when all 4 rules met)
4. Confirm Password

**Password strength meter:**
```
Weak     [■□□□]  — red
Fair     [■■□□]  — amber
Good     [■■■□]  — blue
Strong   [■■■■]  — green
```
Rules checked: length > 8, uppercase, lowercase, special character. Show checklist with ✓/✗ icons below password field.

**Below form:**
Terms text: "By creating an account, you agree to our [Terms of Service] and [Privacy Policy]." — 12px gray-500, links in plano-600.

---

### Reset Password Page — `app/(auth)/reset-password/page.tsx`

**Step 1 — Request reset:**
- Email field + "Send reset link" button
- Success state: replaces form with green confirmation card:
  ```
  ✓  Check your inbox
  We sent a reset link to you@company.com
  [Resend email]  [Back to login]
  ```

**Step 2 — Set new password (`/reset-password/[token]`):**
- New Password field with strength meter
- Confirm Password field
- "Set new password" button
- On success: auto-redirect to `/login` after 2s with toast: "Password updated — please sign in"

---

## 4. Dashboard / Home

**Route:** `/` (redirects authenticated users here)
**File:** `app/(dashboard)/page.tsx`

### Page structure

```
┌─────────────────────────────────────────────────────────────┐
│  Good morning, Ravi 👋                    [+ New Sub]       │
│  Here's what's happening with Plano today.                  │
├─────────────────────────────────────────────────────────────┤
│  KPI Cards row (4 cards)                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────┐ │
│  │ Active Subs  │ │ MRR          │ │ Overdue Inv  │ │Churn│ │
│  │ 248          │ │ ₹4,82,500    │ │ 12           │ │ 2% │ │
│  │ ↑ 14 this mo │ │ ↑ 8.2% MoM  │ │ ↑ 3 since.. │ │ ↓  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────┘ │
├─────────────────────────────────────────────────────────────┤
│  Revenue Chart (line)           │  Subscription by Status   │
│  MRR over last 12 months        │  (donut chart)            │
│  60% width                      │  40% width                │
├─────────────────────────────────────────────────────────────┤
│  Recent Subscriptions (table)   │  Upcoming Renewals        │
│  Last 5 created                 │  Next 7 days              │
└─────────────────────────────────────────────────────────────┘
```

### KPI Card Component

```
┌─────────────────────────────────┐
│  [icon 32px]        ⋯ (menu)   │
│                                 │
│  Active Subscriptions           │  ← 13px gray-500 500 weight
│  248                            │  ← 36px DM Serif Display
│                                 │
│  ↑ +14 this month               │  ← 12px, green arrow + text
└─────────────────────────────────┘
```

- White background, `shadow-sm`, `rounded-card`, border `--border`
- Icon in 40px circle with colored background (plano-50 bg + plano-600 icon color)
- Trend indicator: green `↑` for positive, red `↓` for negative, gray `→` for neutral
- Hover: `shadow-md` transition 200ms, subtle `translateY(-1px)`

**4 KPI cards:**
| Metric | Icon | Color |
|--------|------|-------|
| Active Subscriptions | `RefreshCw` | blue |
| Monthly Recurring Revenue | `TrendingUp` | green |
| Overdue Invoices | `AlertCircle` | red |
| New Subscriptions (30d) | `UserPlus` | amber |

### Revenue Chart

- Library: **Recharts** `<AreaChart>`
- X-axis: last 12 months abbreviated (Jan, Feb, ...)
- Y-axis: formatted as ₹X,XX,XXX
- Area fill: gradient from `plano-500` to transparent
- Stroke: `plano-600` 2px
- Tooltip: white card with `shadow-lg`, shows month + total MRR
- No grid lines — only subtle horizontal lines in `--border` color

### Subscription Status Donut

- Recharts `<PieChart>` with `innerRadius={60}`
- Center label: total subscription count in DM Serif Display 24px
- Segments:
  - Active: `#22c55e`
  - Draft: `#a8a39c`
  - Confirmed: `#3b82f6`
  - Closed: `#ef4444`
- Legend below chart, horizontal, small colored squares

### Recent Subscriptions Table (mini)

Columns: #, Customer, Plan, Status badge, Start Date, Action link
- Max 5 rows
- "View all →" link at bottom right
- Empty state: centered illustration placeholder + "No subscriptions yet" text + CTA button

### Upcoming Renewals Card

List of subscriptions expiring in next 7 days:
```
  [avatar] Acme Corp          7 days left   ₹12,000
  [avatar] TechSolve Ltd      3 days left   ₹5,500   ← amber warning
  [avatar] StartupX           1 day left    ₹2,000   ← red urgent
```
- Colored left border on urgent items (red for ≤ 2 days, amber for ≤ 5 days)

---

## 5. Products Module

**Routes:**
```
/products              → list
/products/new          → create form
/products/[id]         → detail + edit
/products/[id]/variants → variant management
```

### Product List Page — `/products`

**Page header:**
```
Products                                    [+ Add Product]
Manage your product catalog and pricing
```

**Filters bar (below header):**
```
[🔍 Search products...]   [Type ▾]   [Status ▾]   [Sort ▾]   [⊞ Grid / ≡ List]
```

**Grid view (default) — 3 columns desktop, 2 tablet, 1 mobile:**

```
┌──────────────────────────┐
│  [product type icon]     │
│                          │
│  Pro Analytics Suite     │  ← 15px 600
│  Service · Recurring     │  ← 12px gray-500 badge
│                          │
│  ₹2,999 / mo             │  ← 20px DM Serif Display
│  Cost: ₹800              │  ← 12px gray-400
│                          │
│  [View] [Edit] [⋯]       │
└──────────────────────────┘
```

**List view:**
Columns: Name, Type, Sales Price, Cost Price, Variants count, Actions (Edit, Delete)

---

### Product Create / Edit Form — `/products/new` & `/products/[id]`

**Two-column layout (form left 65%, summary card right 35%):**

**Left — Form fields:**

```
Section: Basic Information
─────────────────────────
Product Name *
[_________________________________]

Product Type *
[○ Service  ○ Physical  ○ Digital]  ← radio button group, card style

Sales Price *              Cost Price
[₹ ___________]            [₹ ___________]

Description
[___________________________________]
[___________________________________]

Section: Recurring Pricing
──────────────────────────
[✓] Enable recurring pricing for this product

Billing Period
[Daily] [Weekly] [Monthly ✓] [Yearly]  ← toggle pill group

Section: Variants
─────────────────
[+ Add Variant]

┌────────────────────────────────────────────┐
│  Attribute    Value        Extra Price      │
│  [Brand   ]  [Odoo     ]  [₹ 560      ]  🗑│
│  [+ Add another variant]                   │
└────────────────────────────────────────────┘
```

**Right — Live Preview Card:**
```
┌─────────────────────────────────┐
│  Product Preview                │
│  ─────────────────────────────  │
│  Pro Analytics Suite            │
│  Service                        │
│                                 │
│  ₹2,999 / month                 │
│  Cost: ₹800                     │
│                                 │
│  Variants: 2                    │
│  Brand: Odoo (+₹560)            │
└─────────────────────────────────┘
```

**Form actions (sticky footer bar):**
```
[Cancel]  [Save as Draft]  [Save Product →]
```

---

## 6. Recurring Plans Module

**Routes:**
```
/plans          → list
/plans/new      → create
/plans/[id]     → detail + edit
```

### Plan List Page

Displayed as cards in a 3-column grid:

```
┌──────────────────────────────────┐
│  🔄  Monthly Pro                 │  ← icon + name
│                                  │
│  ₹2,999 / month                  │  ← DM Serif 24px
│                                  │
│  Min qty: 1  ·  Auto-close: Yes  │  ← 12px tags
│                                  │
│  Apr 1, 2025 → Apr 1, 2026       │  ← date range bar
│  ████████████░░░░░░░░░           │  ← progress through validity
│                                  │
│  ○ Auto-close  ○ Closable        │  ← option badges (active/inactive)
│  ● Pausable    ○ Renewable       │
│                                  │
│  [Edit]  [Duplicate]  [Delete]   │
└──────────────────────────────────┘
```

### Plan Create Form — `/plans/new`

```
Plan Name *
[_________________________________]

Billing Period *
┌──────┐ ┌──────┐ ┌──────────┐ ┌──────┐
│Daily │ │Weekly│ │Monthly ✓ │ │Yearly│
└──────┘ └──────┘ └──────────┘ └──────┘

Price *              Minimum Quantity
[₹ 2,999        ]   [1            ]

Validity
Start Date *         End Date
[📅 2025-04-01  ]   [📅 2026-04-01]

Plan Options
┌────────────────────────────────────────┐
│  ☑ Auto-close    When sub expires, close automatically        │
│  ☑ Closable      Customer can close subscription manually     │
│  ☑ Pausable      Subscription can be paused                   │
│  ☐ Renewable     Auto-renew on expiration                     │
└────────────────────────────────────────┘
Each option row: toggle switch (left) + label (bold) + description (muted 13px)
```

---

## 7. Subscriptions Module

**Routes:**
```
/subscriptions              → list
/subscriptions/new          → create wizard
/subscriptions/[id]         → detail view
/subscriptions/[id]/edit    → edit form
```

### Subscription List Page

**Header:**
```
Subscriptions                              [+ New Subscription]
248 active · 12 expiring this month
```

**Filter bar:**
```
[🔍 Search by customer, #number...]  [Status ▾]  [Plan ▾]  [Date range ▾]  [Export ▾]
```

**Status filter tabs (pill style, below search bar):**
```
[All 312]  [Draft 28]  [Quotation 14]  [Confirmed 22]  [Active 248]  [Closed 0]
```

**Table columns:**
| Column | Width | Notes |
|--------|-------|-------|
| # Sub Number | 120px | `font-mono text-xs`, e.g. `SUB-00142` |
| Customer | 200px | Avatar + name |
| Plan | 150px | Plan name badge |
| Start Date | 110px | Formatted date |
| Expiry Date | 110px | Red text if expired, amber if within 7 days |
| Amount | 100px | `font-mono`, right-aligned |
| Status | 100px | Status badge (see below) |
| Actions | 80px | Edit, View, ⋯ more |

**Status badges:**
```
Draft      → gray pill     (#f0ede9 bg, #635d57 text)
Quotation  → amber pill    (#fffbeb bg, #b45309 text)
Confirmed  → blue pill     (#eff6ff bg, #1d4ed8 text)
Active     → green pill    (#f0fdf4 bg, #15803d text)
Closed     → dark pill     (#f0ede9 bg, #453f3a text)
```

**Row hover:** subtle `bg-gray-25` highlight, show action buttons fully

---

### Subscription Create — Multi-step Wizard `/subscriptions/new`

**Step indicator (top of page):**
```
  ①  Customer & Plan  ──────  ②  Products  ──────  ③  Terms  ──────  ④  Review
  (active)                  (upcoming)             (upcoming)        (upcoming)
```
Active step: filled circle plano-600. Completed: green checkmark. Upcoming: gray outline circle.

---

**Step 1 — Customer & Plan**

```
Select Customer *
[🔍 Search or select customer...]    [+ Create new customer]
Selected: [Avatar] Acme Corp · acme@corp.com

Select Recurring Plan *
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Monthly Pro     │ │ Yearly Basic    │ │ Weekly Starter  │
│ ₹2,999/mo       │ │ ₹29,999/yr      │ │ ₹499/wk        │
│ [Select]        │ │ [Select]        │ │ [Select]        │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Step 2 — Products / Order Lines**

```
┌────────────────────────────────────────────────────────────────────┐
│  Product                  Qty    Unit Price    Taxes      Amount   │
│  [Search & select...]      1    [₹ 2,999  ]  [18% GST]  ₹3,538   │
│  [+ Add product line]                                              │
│                                                         ──────     │
│                                             Subtotal:  ₹2,999     │
│                                             Tax (18%): ₹539       │
│                                             Total:     ₹3,538     │
└────────────────────────────────────────────────────────────────────┘
```

Each product line: product selector (combobox), qty stepper (+/-), price input, tax multi-select, computed amount. Delete row icon on right.

**Step 3 — Terms**

```
Start Date *              Expiration Date
[📅 2025-04-01      ]    [📅 2026-04-01     ]

Payment Terms
[○ Immediate  ● Net 15  ○ Net 30  ○ Net 60]

Notes (internal)
[___________________________________]
[___________________________________]
```

**Step 4 — Review**

Summary card showing all entered data. Two actions:
```
[← Back to edit]    [Save as Draft]    [Send Quotation →]
```

---

### Subscription Detail Page — `/subscriptions/[id]`

**Page layout:**

```
← Back to subscriptions

SUB-00142                                         [Status Badge: Active]
Acme Corp · Monthly Pro Plan                       [Actions dropdown ▾]

┌────────────────────────────────────┬──────────────────────────────────┐
│  LIFECYCLE TIMELINE                │  QUICK STATS                     │
│                                    │  MRR: ₹3,538                     │
│  ● Draft      Apr 1, 2025          │  Next Invoice: May 1, 2025       │
│  ● Quotation  Apr 2, 2025          │  Invoices paid: 3                │
│  ● Confirmed  Apr 3, 2025          │  Outstanding: ₹0                 │
│  ● Active     Apr 5, 2025          │                                  │
│  ○ Closed     —                    │  [Transition action buttons]     │
│                                    │  Showing allowed next actions    │
├────────────────────────────────────┼──────────────────────────────────┤
│  ORDER LINES                       │  CUSTOMER INFO                   │
│  [product table]                   │  [customer card]                 │
├────────────────────────────────────┴──────────────────────────────────┤
│  INVOICES (tab)  │  PAYMENTS (tab)  │  ACTIVITY LOG (tab)            │
│  [related invoices table]                                             │
└─────────────────────────────────────────────────────────────────────┘
```

**Lifecycle action buttons** (shown based on current status):
- Draft → `[Send Quotation]` (primary) + `[Delete]` (danger ghost)
- Quotation → `[Confirm]` (primary) + `[Revert to Draft]` (ghost)
- Confirmed → `[Activate]` (primary, green) + `[Back to Draft]` (ghost)
- Active → `[Close Subscription]` (danger outline) + `[Pause]` (if pausable)
- Closed → No actions (terminal)

Confirmation modal before any destructive transition: "Are you sure you want to close this subscription? This action cannot be undone."

---

## 8. Quotation Templates Module

**Routes:**
```
/quotation-templates          → list
/quotation-templates/new      → create
/quotation-templates/[id]     → view + edit
```

### Template List

Card grid (3 col desktop):
```
┌────────────────────────────────┐
│  📋  Enterprise Annual         │  ← name
│  Valid for 30 days             │  ← validity
│                                │
│  Plan: Yearly Pro              │
│  Products: 3 items             │
│  Total: ₹1,20,000              │
│                                │
│  [Use Template]  [Edit]  [⋯]  │
└────────────────────────────────┘
```

**"Use Template" button:** pre-fills the subscription create wizard (Step 1 skips to Step 3 with plan + products pre-loaded).

### Template Create Form

```
Template Name *
[_________________________________]

Validity (days) *
[30         ]

Recurring Plan *
[Select plan ▾]

Product Lines
[Same UI as subscription order lines — product + qty + price rows]

[Save Template]
```

---

## 9. Invoices Module

**Routes:**
```
/invoices          → list
/invoices/[id]     → detail (printable view)
```

### Invoice List Page

**Header:**
```
Invoices                                          [+ Create Manual Invoice]
```

**Tab filters:**
```
[All]  [Draft]  [Confirmed]  [Paid]  [Overdue]  [Cancelled]
```

**Table columns:**
| Column | Notes |
|--------|-------|
| Invoice # | `INV-00089`, monospace |
| Subscription # | Link to subscription |
| Customer | Avatar + name |
| Issue Date | |
| Due Date | Red if overdue |
| Amount | Right-aligned monospace |
| Status | Badge |
| Actions | Confirm, Send, Print, Cancel |

---

### Invoice Detail Page — `/invoices/[id]`

**Designed to look like a real invoice (printable):**

```
┌──────────────────────────────────────────────────────────────┐
│  🅿 PLANO                              INVOICE               │
│  123 Business Park                     INV-00089             │
│  Mumbai, India                                               │
│                                        Date: Apr 15, 2025   │
│  ────────────────────────────────────  Due: May 15, 2025    │
│                                                              │
│  BILLED TO                             STATUS: [DRAFT]       │
│  Acme Corporation                                            │
│  contact@acme.com                                            │
│  GSTIN: 27AAACR5055K1ZD                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  # │ Product              │ Qty │ Rate   │ Amount     │   │
│  │  1 │ Pro Analytics Suite  │  2  │₹2,999  │ ₹5,998    │   │
│  │  2 │ Onboarding Service   │  1  │₹5,000  │ ₹5,000    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│                              Subtotal:      ₹10,998         │
│                              IGST (18%):    ₹1,979          │
│                              ─────────────────────────       │
│                              Total Due:     ₹12,977         │
│                              Amount Paid:   ₹0              │
│                              Balance Due:   ₹12,977         │
│                                                              │
│  Notes: Payment due within 30 days.                          │
│  Bank: HDFC · A/C: XXXX4521 · IFSC: HDFC0001234            │
└──────────────────────────────────────────────────────────────┘

  [← Back]   [Confirm Invoice]   [Send to Customer]   [🖨 Print / PDF]   [Cancel]
```

**Action bar behavior:**
- `Confirm Invoice` → changes status to Confirmed, button becomes disabled
- `Send to Customer` → opens email preview modal, then sends
- `Print / PDF` → triggers `window.print()` with print-specific CSS that hides sidebar/topbar
- `Cancel` → opens confirmation modal (admin only)

**Print CSS:**
```css
@media print {
  .sidebar, .topbar, .action-bar { display: none !important; }
  .invoice-card { box-shadow: none; border: 1px solid #ccc; }
}
```

---

## 10. Payments Module

**Routes:**
```
/payments          → list
/payments/record   → record new payment
```

### Payment List Page

**Table columns:**
| Column | Notes |
|--------|-------|
| Payment # | `PAY-00041`, monospace |
| Invoice # | Link, monospace |
| Customer | |
| Payment Method | Badge (Cash / Bank Transfer / UPI / Card) |
| Date | |
| Amount | Right-aligned monospace |
| Status | Paid / Partial / Pending |

---

### Record Payment Modal / Drawer

Triggered from Invoice detail page ("Record Payment" button) or Payments list "+ Record Payment":

```
┌──────────────────────────────────────────┐
│  Record Payment                     ✕   │
│  ─────────────────────────────────────  │
│  Invoice: INV-00089                      │
│  Outstanding: ₹12,977                    │
│                                          │
│  Payment Method *                        │
│  [○ Cash  ● Bank Transfer  ○ UPI  ○ Card]│
│                                          │
│  Amount *                                │
│  [₹ 12,977              ]               │
│  [Pay full amount ✓] ← checkbox          │
│                                          │
│  Payment Date *                          │
│  [📅 2025-04-15]                         │
│                                          │
│  Reference / Transaction ID              │
│  [UTR / Cheque number / Txn ID...]       │
│                                          │
│  Notes                                   │
│  [Optional notes...]                     │
│                                          │
│  [Cancel]        [Record Payment ✓]      │
└──────────────────────────────────────────┘
```

On success: toast "Payment of ₹12,977 recorded. Invoice marked as Paid." Invoice status auto-updates.

---

## 11. Discounts Module

**Routes:**
```
/discounts          → list  [Admin only]
/discounts/new      → create  [Admin only]
/discounts/[id]     → edit  [Admin only]
```

> ⚠️ This entire module is **Admin only**. Show 403 page for non-admin users.

### Discount List Page

```
Discounts                                           [+ New Discount]
Manage promotional and pricing rules
```

**Card grid (3-col desktop):**

```
┌────────────────────────────────────┐
│  🏷️  SUMMER20                     │  ← discount name + code badge
│                                    │
│  20% off                           │  ← type + value, large
│  On: Products + Subscriptions      │
│                                    │
│  Min purchase: ₹5,000              │
│  Min qty: 2                        │
│  Uses: 45 / 100                    │  ← usage bar
│  ████████████████░░░               │
│                                    │
│  Apr 1 → Jun 30, 2025              │  ← validity
│  ● Active                          │
│                                    │
│  [Edit]  [Deactivate]  [Delete]    │
└────────────────────────────────────┘
```

### Discount Create / Edit Form

```
Discount Name *
[_________________________________]

Discount Type *
[● Fixed Amount   ○ Percentage]

Value *
[₹ 500    ]    or    [20 %]   ← shows based on type selected

Conditions
─────────────
Minimum Purchase Amount
[₹ _______]

Minimum Quantity
[____]

Validity Period
Start Date *             End Date *
[📅 2025-04-01]          [📅 2025-06-30]

Usage Limit
[✓] Limit total uses: [100    ]

Applies To
[☑] Products
[☑] Subscriptions

[Save Discount]
```

---

## 12. Tax Management Module

**Routes:**
```
/taxes          → list + manage
/taxes/new      → create
```

### Tax List Page

Simple table layout (no complex cards needed):

```
Tax Rules                                            [+ Add Tax]

┌──────────────────┬─────────────┬───────────┬─────────────────┐
│ Tax Name         │ Type        │ Rate      │ Actions         │
├──────────────────┼─────────────┼───────────┼─────────────────┤
│ IGST             │ Percentage  │ 18%       │ [Edit] [Delete] │
│ CGST             │ Percentage  │ 9%        │ [Edit] [Delete] │
│ SGST             │ Percentage  │ 9%        │ [Edit] [Delete] │
│ Cess (Luxury)    │ Percentage  │ 4%        │ [Edit] [Delete] │
└──────────────────┴─────────────┴───────────┴─────────────────┘
```

**Inline edit:** clicking "Edit" expands the row into an editable inline form — no separate page needed for tax rules.

### Add Tax Drawer

```
┌──────────────────────────────────────┐
│  Add Tax Rule                   ✕   │
│  ────────────────────────────────   │
│  Tax Name *                          │
│  [IGST                          ]    │
│                                      │
│  Tax Type *                          │
│  [● Percentage   ○ Fixed Amount]     │
│                                      │
│  Rate *                              │
│  [18             ] %                 │
│                                      │
│  Description (optional)              │
│  [Integrated Goods & Services Tax]   │
│                                      │
│  [Cancel]    [Add Tax Rule]          │
└──────────────────────────────────────┘
```

---

## 13. Users & Contacts Module

**Routes:**
```
/users          → list  [Admin only]
/users/new      → create internal user  [Admin only]
/users/[id]     → profile + edit
```

> ⚠️ Only Admin can create Internal Users. Portal users are created via Signup only.

### User List Page

**Tab toggle:**
```
[Internal Users (12)]  [Customers / Portal (248)]
```

**Table for Internal Users:**
| Column | Notes |
|--------|-------|
| User | Avatar + name + email |
| Role | `ADMIN` / `INTERNAL_USER` badge |
| Created | Date |
| Last Login | Relative time |
| Status | Active / Inactive toggle |
| Actions | Edit, Reset Password, Deactivate |

**Table for Customers (Portal users):**
| Column | Notes |
|--------|-------|
| Customer | Avatar + name + email |
| Active Subs | Count badge |
| Total Billed | ₹ amount |
| Outstanding | ₹ amount (red if > 0) |
| Joined | Date |
| Actions | View subscriptions, Email |

---

### Create Internal User Form — `/users/new`

```
Full Name *
[_________________________________]

Email Address *
[_________________________________]

Role *
[○ Admin   ● Internal User]

A temporary password will be emailed to the user.
They will be prompted to set their own on first login.

[Cancel]   [Create User & Send Invite →]
```

---

## 14. Reports Module

**Route:** `/reports`

**Admin + Internal User only.**

### Reports Page Layout

**Left: filter sidebar (240px)**

```
Filters
──────────────────
Period
[● This Month    ]
[○ Last 30 Days  ]
[○ This Quarter  ]
[○ This Year     ]
[○ Custom range  ]

From:  [📅 2025-01-01]
To:    [📅 2025-04-15]

──────────────────
Subscription Plan
[All Plans ▾]

──────────────────
Customer
[All Customers ▾]

──────────────────
Status
[☑] Active
[☑] Closed
[☐] Draft

──────────────────
[Apply Filters]
[Clear]
```

**Right: Reports content (flex-1)**

```
Report Overview                        [Export PDF]  [Export XLS]
Apr 2025

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Revenue  │ │ Invoices │ │ Payments │ │ Overdue  │
│ ₹4,82,500│ │    89    │ │    76    │ │    12    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

[Revenue over time — Area chart, full width]

┌────────────────────────────────┬──────────────────────────────┐
│ Top Plans by Revenue           │ Payment Methods breakdown     │
│ [Horizontal bar chart]         │ [Donut chart]                 │
├────────────────────────────────┴──────────────────────────────┤
│ Subscriptions by Status over time [Stacked area chart]        │
├────────────────────────────────────────────────────────────────┤
│ Detailed Transactions Table                                    │
│ [Paginated table: Date, Customer, Invoice, Amount, Status]     │
└────────────────────────────────────────────────────────────────┘
```

**Export buttons:**
- PDF: uses `react-to-print` or server-side PDF generation
- XLS: uses `xlsx` npm package to export the filtered data table

---

## 15. Shared Components Library

### Button Component

```tsx
// variants
<Button variant="primary">   // plano-600 bg, white text
<Button variant="secondary"> // white bg, gray border
<Button variant="ghost">     // transparent bg, text only
<Button variant="danger">    // red bg (destructive actions)
<Button variant="outline-danger"> // white bg, red border + text

// sizes
<Button size="sm">  // 32px height, 13px text
<Button size="md">  // 40px height, 14px text (default)
<Button size="lg">  // 48px height, 15px text

// states
<Button loading>    // spinner icon, disabled
<Button disabled>   // opacity 50%, cursor not-allowed
<Button icon={<Plus />}> // left icon, 16px
```

**Visual spec:**
- `border-radius: 8px`
- `font-weight: 500`
- `transition: all 150ms ease`
- Hover: darken background 8%
- Active: scale(0.98)
- Focus: `ring-2 ring-plano-400 ring-offset-2`

---

### Input Component

```tsx
<Input
  label="Email address"
  placeholder="you@company.com"
  helperText="We'll never share your email"
  error="Email is required"
  prefix={<Mail size={16} />}
  suffix={<Eye size={16} />}
/>
```

**Visual spec:**
- Height: 40px
- Border: 1px solid `--border` → hover: `--border-strong` → focus: `--plano-500` 2px
- Background: white
- Prefix/suffix icons: 16px, gray-400, absolute positioned inside input
- Error state: red border, red helper text, red ⚠ icon
- Label: 13px 500 weight gray-700, 6px margin-bottom

---

### Select / Combobox Component

Used for all dropdown selects (Plan, Customer, Tax, etc.):
- Custom trigger (not native `<select>`) for consistent styling
- Searchable via `cmdk` or `@radix-ui/react-select`
- Item height: 36px, left padding 12px
- Selected item: checkmark icon right-aligned, plano-600 color
- Dropdown max-height: 280px with scroll
- Empty state: "No results found" with search icon

---

### Data Table Component

Reusable across all list pages:

```tsx
<DataTable
  data={subscriptions}
  columns={columns}
  loading={isLoading}
  onRowClick={(row) => router.push(`/subscriptions/${row.id}`)}
  pagination={{ page, perPage: 20, total }}
  emptyState={<EmptyState icon={RefreshCw} title="No subscriptions" cta="Create your first subscription" />}
  selectable // enables checkbox column for bulk actions
/>
```

**Table features:**
- Sticky header
- Row hover: `bg-gray-25`
- Sortable columns: clicking column header cycles ASC → DESC → none
- Sort indicator: chevron icon next to column header
- Loading skeleton: animated gray rows (5 rows, pulsing)
- Pagination: `Previous | 1 2 3 ... 12 | Next` — show page info "Showing 1–20 of 248"
- Bulk selection: checkbox column, bulk action bar slides up from bottom when rows selected

---

### Status Badge

```tsx
<StatusBadge status="active" />   // green pill
<StatusBadge status="draft" />    // gray pill
<StatusBadge status="overdue" />  // red pill
// etc.
```

All badges: `font-size: 11px`, `font-weight: 500`, `padding: 2px 10px`, `border-radius: 999px`

---

### Modal / Dialog

```tsx
<Modal title="Confirm closure" size="sm | md | lg" onClose={...}>
  <Modal.Body>
    Are you sure you want to close SUB-00142?
    This action cannot be undone.
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={onClose}>Cancel</Button>
    <Button variant="danger" onClick={handleClose}>Close Subscription</Button>
  </Modal.Footer>
</Modal>
```

- Overlay: `rgba(0,0,0,0.4)` backdrop with blur: `backdrop-blur-sm`
- Animation: modal scales from 95% to 100% + fades in (150ms)
- Sizes: sm=400px, md=520px, lg=680px
- Close: Escape key, backdrop click, or ✕ button

---

### Toast Notifications

Use `sonner` or `react-hot-toast`:

```tsx
toast.success("Subscription activated successfully")
toast.error("Failed to generate invoice")
toast.warning("This subscription expires in 3 days")
toast.loading("Sending invoice...")
```

**Position:** Bottom-right
**Duration:** Success/Error: 4s, Warning: 6s
**Style:** Rounded 10px, shadow-lg, matches brand colors

---

### Empty State Component

Used in all empty list / table views:

```
        [Icon — 48px, gray-300]

     No subscriptions yet

  Create your first subscription to
  start tracking recurring revenue.

        [+ New Subscription]
```

Center-aligned, max-width 360px, generous vertical padding (80px top/bottom).

---

### Skeleton Loader

For all data-loading states — never show blank white areas:

```tsx
<Skeleton className="h-9 w-full rounded-btn" />  // input skeleton
<Skeleton className="h-32 w-full rounded-card" /> // card skeleton
<SkeletonTable rows={5} cols={6} />               // table skeleton
```

Pulsing animation: `animate-pulse` from Tailwind — gray-100 → gray-200.

---

## 16. Animations & Micro-interactions

### Page transitions

Wrap page content in:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  {children}
</motion.div>
```

### KPI Card hover

```css
.kpi-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Sidebar nav item

```css
.nav-item {
  transition: background 150ms ease, color 150ms ease;
}
```

### Status badge change (subscription lifecycle)

When status changes after an action: badge fades out and fades in with new color (150ms each side).

### Button click

```css
button:active {
  transform: scale(0.98);
  transition: transform 80ms ease;
}
```

### Modal enter/exit

```tsx
// Using framer-motion
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    />
  )}
</AnimatePresence>
```

### Number counter animation

KPI numbers on dashboard animate from 0 to their value on page load:
```tsx
// Use react-countup or custom useEffect
<CountUp end={248} duration={1.2} separator="," />
```

### Form validation

Shake animation on submit with errors:
```css
@keyframes shake {
  0%, 100% { transform: translateX(0) }
  20%, 60% { transform: translateX(-4px) }
  40%, 80% { transform: translateX(4px) }
}
.form-error-shake { animation: shake 0.4s ease; }
```

---

## 17. Responsive Behavior

### Breakpoints (Tailwind default)

```
sm:  640px   (large phone landscape)
md:  768px   (tablet)
lg:  1024px  (small desktop / laptop)
xl:  1280px  (desktop)
2xl: 1536px  (large desktop)
```

### Sidebar behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Hidden by default, opens as full-height drawer overlay on hamburger click |
| `768px–1024px` | Collapsed (64px icon-only) by default |
| `≥ 1024px` | Expanded (240px) by default, collapsible |

### Page layouts

| Page | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Dashboard KPIs | 1 col | 2 col | 4 col |
| Product cards | 1 col | 2 col | 3 col |
| Plan cards | 1 col | 2 col | 3 col |
| Subscription table | Card list | Simplified table | Full table |
| Invoice detail | Stacked | Stacked | Side-by-side |
| Create form | Single col | Single col | 2-col (form + preview) |
| Reports | Stacked | Stacked | Sidebar + content |

### Mobile table fallback

On `< 768px`, replace data tables with **card lists**:

```
┌─────────────────────────────────────┐
│  SUB-00142                [Active]  │
│  Acme Corp · Monthly Pro            │
│  ₹3,538 · Expires Apr 30, 2025     │
│  [View]                             │
└─────────────────────────────────────┘
```

Each row becomes a card with the most important columns visible. Tap to go to detail page.

---

## 18. Accessibility Requirements

### WCAG 2.1 AA compliance

**Color contrast:**
- All body text: minimum 4.5:1 contrast ratio against background
- Large text (18px+): minimum 3:1
- Gray-500 on white: ✓ passes (use for secondary text)
- Gray-300 on white: ✗ fails — use only for decorative elements (borders, icons)
- Plano-600 on white: ✓ passes for interactive links

**Focus management:**
- All interactive elements keyboard-focusable in logical order
- Focus ring: `2px solid var(--plano-500)` with `2px offset` — visible on all backgrounds
- Skip to main content link: first focusable element on every page
- Modals: trap focus within modal when open, return focus to trigger on close

**ARIA:**
```tsx
// Status badges — screen readers should hear the status
<span role="status" aria-label="Subscription status: Active">
  <StatusBadge status="active" />
</span>

// Data tables
<table role="table" aria-label="Subscriptions list">
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">Customer</th>
    </tr>
  </thead>
</table>

// Loading states
<div aria-busy="true" aria-label="Loading subscriptions...">
  <SkeletonTable />
</div>

// Form errors
<input aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" role="alert">Email is required</span>
```

**Keyboard navigation:**
- `Tab` / `Shift+Tab`: move between interactive elements
- `Enter` / `Space`: activate buttons and links
- `Escape`: close modals, dropdowns, command palette
- `Arrow keys`: navigate within dropdowns, tab groups, data tables
- `Cmd+K` / `Ctrl+K`: open command palette

**Motion sensitivity:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Appendix — File & Component Naming Conventions

```
Pages:          app/(dashboard)/subscriptions/page.tsx
Components:     components/subscriptions/SubscriptionCard.tsx
Hooks:          hooks/useSubscriptions.ts
API helpers:    lib/api/subscriptions.ts
Types:          types/subscription.ts
Utils:          lib/utils/formatCurrency.ts
Constants:      lib/constants/subscriptionStatuses.ts
Schemas (Zod):  lib/validations/subscriptionSchema.ts
```

**Naming rules:**
- Components: `PascalCase`
- Files: `camelCase` for non-component files, `PascalCase.tsx` for components
- CSS classes: Tailwind utilities only — no custom class names except in `globals.css` design tokens
- Constants: `SCREAMING_SNAKE_CASE` for enum-like values
- Types: `PascalCase` with `I` prefix for interfaces if preferred (`ISubscription`)

---

*Plano — UI Prompt · Version 1.0 · Built for Next.js 15 App Router*
