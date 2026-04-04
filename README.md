# Subscription Management System

A centralized web application to manage subscription-based products, recurring billing, customers, invoices, payments, taxes, discounts, and reports.

Built using **MERN Stack with Next.js**.

---

## Tech Stack

- Frontend: Next.js (React)
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- Styling: Tailwind CSS (optional)

---

## Features

### Authentication
- Login
- Signup
- Reset Password
- Role-based Access (Admin, Internal User, Portal/User)

### Product Management
- Create / Update / Delete Products
- Product Variants
- Recurring Pricing

### Recurring Plans
- Daily / Weekly / Monthly / Yearly billing
- Pausable / Renewable plans

### Subscription Management
- Create subscriptions
- Lifecycle tracking  
  `Draft → Quotation → Confirmed → Active → Closed`

### Quotation Templates
- Predefined templates
- Product lines & plans

### Invoice Management
- Auto-generated invoices
- Status tracking  
  `Draft → Confirmed → Paid`

### Payment Management
- Record payments
- Track outstanding invoices

### Discount Management
- Fixed / Percentage discounts
- Usage limits

### Tax Management
- Configurable tax rules
- Auto calculation

### Reports
- Active subscriptions
- Revenue
- Payments
- Overdue invoices

---

## User Roles

### Admin
- Full system control
- Create Internal Users
- Manage products, plans, taxes, discounts

### Internal User
- Operational access
- Manage subscriptions, invoices, payments

### Portal/User
- Customer access
- View subscriptions and invoices

---

## Functional Requirements

- Role-based authentication
- Recurring billing automation
- Subscription lifecycle management
- Invoice generation
- Payment tracking
- Reporting dashboard

---

## Non-Functional Requirements

- Performance: < 2 seconds response time
- Scalability: Thousands of subscriptions
- Security: Role-based permissions
- Reliability: High availability

---

## Installation

```bash
git clone <repo-url>
cd subscription-system
npm install