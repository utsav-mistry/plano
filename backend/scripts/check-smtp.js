import 'dotenv/config';
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

const maskEmail = (value = '') => {
    const [local = '', domain = ''] = value.split('@');
    if (!local || !domain) return value || 'not-set';
    return `${local.slice(0, 2)}***@${domain}`;
};

if (!host || !user || !pass) {
    console.error('[smtp:check] Missing SMTP_HOST, SMTP_USER, or SMTP_PASS in backend/.env');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
});

console.log(`[smtp:check] Verifying ${host}:${port} as ${maskEmail(user)}...`);

try {
    await transporter.verify();
    console.log('[smtp:check] SMTP credentials are valid.');
    process.exit(0);
} catch (error) {
    const code = error?.responseCode ? ` (code ${error.responseCode})` : '';
    console.error(`[smtp:check] Verification failed${code}: ${error?.message || 'Unknown error'}`);

    if ((error?.message || '').includes('535') || error?.responseCode === 535) {
        console.error('[smtp:check] Zoho hint: use mailbox app password (not account password), ensure SMTP auth is enabled, and verify sender mailbox/alias permissions.');
    }

    process.exit(1);
}
