import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../src/modules/users/user.model.js';

dotenv.config({ path: 'backend/.env' });

const API = 'http://localhost:5000/api/v1';

const stamp = Date.now();
const portalEmail = `qa.portal.matrix@example.com`;
const portalPassword = 'QaPortal#2026!';

const headersJson = {
    'Content-Type': 'application/json',
};

const results = [];

async function call({ module, name, method, path, token, body, expectedStatuses }) {
    const headers = { ...headersJson };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    let payload = null;
    try {
        payload = await res.json();
    } catch {
        payload = null;
    }

    const pass = expectedStatuses.includes(res.status);

    results.push({
        module,
        name,
        method,
        path,
        status: res.status,
        expected: expectedStatuses.join('/'),
        pass,
        message: payload?.message || '',
        success: payload?.success,
    });

    return { res, payload };
}

function printTable() {
    const lines = [];
    lines.push('MODULE | TEST | METHOD | PATH | STATUS | EXPECTED | PASS | MESSAGE');
    lines.push('--- | --- | --- | --- | --- | --- | --- | ---');

    for (const r of results) {
        lines.push(`${r.module} | ${r.name} | ${r.method} | ${r.path} | ${r.status} | ${r.expected} | ${r.pass ? 'YES' : 'NO'} | ${(r.message || '').replaceAll('|', '\\|')}`);
    }

    return lines.join('\n');
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);

    const healthRes = await fetch('http://localhost:5000/health');
    results.push({
        module: 'system',
        name: 'health',
        method: 'GET',
        path: '/health',
        status: healthRes.status,
        expected: '200',
        pass: healthRes.status === 200,
        message: 'Health endpoint',
        success: healthRes.ok,
    });

    await call({
        module: 'auth',
        name: 'register_invalid_weak_password',
        method: 'POST',
        path: '/auth/register',
        body: { name: 'QA Weak', email: `qa.weak.${stamp}@example.com`, password: 'weakpass', role: 'portal_user' },
        expectedStatuses: [422, 429],
    });

    const registerPortal = await call({
        module: 'auth',
        name: 'register_portal_valid',
        method: 'POST',
        path: '/auth/register',
        body: { name: 'QA Portal', email: portalEmail, password: portalPassword },
        expectedStatuses: [201, 409, 429],
    });

    let portalUser = await User.findOne({ email: portalEmail });
    if (!portalUser) {
        portalUser = await User.create({
            name: 'QA Portal Matrix',
            email: portalEmail,
            password: portalPassword,
            role: 'portal_user',
            emailVerified: true,
            emailVerifiedAt: new Date(),
            isActive: true,
        });
    } else {
        portalUser.emailVerified = true;
        portalUser.emailVerifiedAt = new Date();
        portalUser.isActive = true;
        await portalUser.save({ validateBeforeSave: false });
    }

    const portalRole = portalUser.role;
    const protectedToken = jwt.sign(
        { id: portalUser._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    await call({
        module: 'auth',
        name: 'login_wrong_password',
        method: 'POST',
        path: '/auth/login',
        body: { email: portalEmail, password: 'Wrong#2026!' },
        expectedStatuses: [401, 429],
    });

    await call({
        module: 'auth',
        name: 'forgot_password_existing_email',
        method: 'POST',
        path: '/auth/forgot-password',
        body: { email: portalEmail },
        expectedStatuses: [200, 429],
    });

    await call({
        module: 'auth',
        name: 'refresh_without_cookie',
        method: 'POST',
        path: '/auth/refresh-token',
        body: {},
        expectedStatuses: [401],
    });

    await call({
        module: 'subscriptions',
        name: 'get_all_portal',
        method: 'GET',
        path: '/subscriptions',
        token: protectedToken,
        expectedStatuses: [200],
    });

    await call({
        module: 'subscriptions',
        name: 'create_invalid_plan',
        method: 'POST',
        path: '/subscriptions',
        token: protectedToken,
        body: { planId: '507f1f77bcf86cd799439011', quantity: 1 },
        expectedStatuses: [404, 400],
    });

    await call({
        module: 'subscriptions',
        name: 'patch_forbidden_for_portal',
        method: 'PATCH',
        path: '/subscriptions/507f1f77bcf86cd799439011',
        token: protectedToken,
        body: { autoRenew: false },
        expectedStatuses: [403],
    });

    await call({
        module: 'subscriptions',
        name: 'confirm_forbidden_for_portal',
        method: 'POST',
        path: '/subscriptions/507f1f77bcf86cd799439011/confirm',
        token: protectedToken,
        expectedStatuses: [403],
    });

    await call({
        module: 'invoices',
        name: 'get_all_portal',
        method: 'GET',
        path: '/invoices',
        token: protectedToken,
        expectedStatuses: [200],
    });

    await call({
        module: 'invoices',
        name: 'create_forbidden_for_portal',
        method: 'POST',
        path: '/invoices',
        token: protectedToken,
        body: {
            userId: '507f1f77bcf86cd799439011',
            items: [{ description: 'Test item', quantity: 1, unitPrice: 1000, total: 1000 }],
            subtotal: 1000,
            grandTotal: 1000,
            dueDate: new Date(Date.now() + 86400000).toISOString(),
        },
        expectedStatuses: [403],
    });

    await call({
        module: 'invoices',
        name: 'download_invalid_id',
        method: 'GET',
        path: '/invoices/new/download',
        token: protectedToken,
        expectedStatuses: [400],
    });

    await call({
        module: 'discounts',
        name: 'get_all_portal',
        method: 'GET',
        path: '/discounts',
        token: protectedToken,
        expectedStatuses: [200],
    });

    await call({
        module: 'discounts',
        name: 'toggle_forbidden_for_portal',
        method: 'POST',
        path: '/discounts/507f1f77bcf86cd799439011/toggle',
        token: protectedToken,
        expectedStatuses: [403],
    });

    await call({
        module: 'taxes',
        name: 'get_all_portal',
        method: 'GET',
        path: '/taxes',
        token: protectedToken,
        expectedStatuses: [200],
    });

    await call({
        module: 'taxes',
        name: 'create_forbidden_for_portal',
        method: 'POST',
        path: '/taxes',
        token: protectedToken,
        body: { name: 'QA TAX', type: 'percentage', rate: 18 },
        expectedStatuses: [403],
    });

    const summary = {
        total: results.length,
        passed: results.filter((r) => r.pass).length,
        failed: results.filter((r) => !r.pass).length,
        portalEmail,
        portalRole,
    };

    console.log(JSON.stringify(summary, null, 2));
    console.log('\n' + printTable());

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Matrix execution failed:', err.message);
    mongoose.disconnect().catch(() => { });
    process.exit(1);
});
