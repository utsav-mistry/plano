import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import User from '../modules/users/user.model.js';
import Invoice from '../modules/invoices/invoice.model.js';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 587;

const smtpProfiles = {
  noreply: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  support: {
    user: process.env.SMTP_SUPPORT_USER || process.env.SMTP_USER,
    pass: process.env.SMTP_SUPPORT_PASS || process.env.SMTP_PASS,
  },
};

const buildTransporter = ({ user, pass }) => nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: { user, pass },
});

const transporters = {
  noreply: buildTransporter(smtpProfiles.noreply),
  support: buildTransporter(smtpProfiles.support),
};

const SMTP_VERIFY_ON_START = process.env.SMTP_VERIFY_ON_START !== 'false';

const emailSenders = {
  noreply: {
    email: process.env.SMTP_FROM_EMAIL || process.env.FROM_EMAIL,
    name: process.env.SMTP_FROM_NAME || process.env.FROM_NAME || 'Plano',
  },
  support: {
    email: process.env.SMTP_SUPPORT_EMAIL || process.env.FROM_REPLY_EMAIL || process.env.SMTP_FROM_EMAIL || process.env.FROM_EMAIL,
    name: process.env.SMTP_SUPPORT_NAME || process.env.FROM_REPLY_NAME || process.env.FROM_NAME || 'Support | Planoo',
  },
};

const deriveDisplayName = ({ email, name }, fallback) => {
  const raw = String(name || '').trim();
  if (!raw) return fallback;
  if (raw.includes('@')) return fallback;
  return raw;
};

const buildFromHeader = ({ email, name }, fallbackName) => {
  if (!email) return undefined;
  return {
    name: deriveDisplayName({ email, name }, fallbackName),
    address: email,
  };
};

const supportEmail = process.env.SMTP_SUPPORT_EMAIL || process.env.FROM_REPLY_EMAIL || process.env.SMTP_FROM_EMAIL || process.env.FROM_EMAIL;
const supportName = process.env.SMTP_SUPPORT_NAME || process.env.FROM_REPLY_NAME || process.env.FROM_NAME || 'Support';

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

const maskEmail = (value = '') => {
  const [local = '', domain = ''] = value.split('@');
  if (!local || !domain) return value || 'not-set';
  return `${local.slice(0, 2)}***@${domain}`;
};

const verifySmtpConfig = async () => {
  if (!SMTP_VERIFY_ON_START) {
    logger.warn('[EmailWorker] SMTP_VERIFY_ON_START is false; skipping SMTP preflight verification');
    return;
  }

  if (!SMTP_HOST || !smtpProfiles.noreply.user || !smtpProfiles.noreply.pass) {
    throw new Error('Missing SMTP_HOST, SMTP_USER, or SMTP_PASS in environment');
  }

  const verifyProfile = async (profileKey) => {
    const profile = smtpProfiles[profileKey];
    const transporter = transporters[profileKey];
    logger.info(`[EmailWorker] Verifying SMTP ${profileKey} profile ${SMTP_HOST}:${SMTP_PORT} as ${maskEmail(profile.user)}`);
    await transporter.verify();
  };

  try {
    await verifyProfile('noreply');

    const shouldVerifySupport = normalizeEmail(smtpProfiles.support.user) !== normalizeEmail(smtpProfiles.noreply.user)
      || normalizeEmail(emailSenders.support.email) !== normalizeEmail(emailSenders.noreply.email);

    if (shouldVerifySupport) {
      await verifyProfile('support');
    }

    logger.info('[EmailWorker] SMTP preflight verification successful for configured profiles');
  } catch (error) {
    const responseCode = error?.responseCode ? ` (code ${error.responseCode})` : '';
    const message = error?.message || 'Unknown SMTP error';
    logger.error(`[EmailWorker] SMTP preflight verification failed${responseCode}: ${message}`);

    if (message.includes('535') || error?.responseCode === 535) {
      logger.error('[EmailWorker] Zoho 535 usually means invalid credentials or missing app password. Ensure SMTP_USER is the mailbox and SMTP_PASS is that mailbox app password.');
    }

    throw error;
  }
};

await verifySmtpConfig();

const resolveOutboundMailProfile = (fromType = 'noreply') => {
  const profileKey = fromType === 'support' ? 'support' : 'noreply';
  const sender = emailSenders[profileKey];
  const authUser = smtpProfiles[profileKey]?.user;

  if (!sender?.email) {
    throw new Error(`Missing sender email for profile: ${profileKey}`);
  }

  if (!authUser) {
    throw new Error(`Missing SMTP auth user for profile: ${profileKey}`);
  }

  const senderEmail = normalizeEmail(sender.email);
  const smtpUserEmail = normalizeEmail(authUser);

  if (senderEmail !== smtpUserEmail) {
    const mismatchError = new Error(`Sender/auth mismatch for profile '${profileKey}': sender=${senderEmail}, smtpUser=${smtpUserEmail}`);
    mismatchError.code = 'SENDER_AUTH_MISMATCH';
    throw mismatchError;
  }

  return {
    profileKey,
    sender,
    authUser,
    transporter: transporters[profileKey],
  };
};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const firstName = (value = '') => String(value).trim().split(' ')[0] || 'there';

const renderEmailShell = ({ title, headline, intro, body, ctaLabel, ctaUrl, highlight, footerNote }) => `
  <div style="background:#f8f2f6;padding:32px 0;font-family:Arial,sans-serif;color:#2a1a27;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #ead8e3;border-radius:20px;overflow:hidden;box-shadow:0 20px 45px rgba(113,75,103,0.12);">
      <div style="background:linear-gradient(135deg,#714b67,#5a3c53);padding:28px 32px;color:#fff;">
        <div style="font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;opacity:.8;">Plano</div>
        <div style="font-size:28px;font-weight:800;line-height:1.1;margin-top:8px;">${escapeHtml(title)}</div>
      </div>
      <div style="padding:32px;">
        <div style="font-size:20px;font-weight:700;color:#2a1a27;margin-bottom:12px;">${escapeHtml(headline)}</div>
        <p style="font-size:15px;line-height:1.7;margin:0 0 18px;color:#51424d;">${escapeHtml(intro)}</p>
        ${highlight ? `<div style="background:#f8f2f6;border:1px solid #e1c8d9;border-radius:16px;padding:20px 22px;font-size:28px;font-weight:800;letter-spacing:.14em;text-align:center;color:#714b67;margin:24px 0;">${highlight}</div>` : ''}
        <div style="font-size:15px;line-height:1.7;color:#51424d;">${body}</div>
        ${ctaLabel && ctaUrl ? `<div style="margin:28px 0 10px;"><a href="${ctaUrl}" style="display:inline-block;background:#714b67;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">${escapeHtml(ctaLabel)}</a></div>` : ''}
        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #ead8e3;color:#7a6b73;font-size:12px;line-height:1.6;">
          ${escapeHtml(footerNote || `Need help? Contact ${supportName} at ${supportEmail}.`)}
        </div>
      </div>
    </div>
  </div>
`;

const EMAIL_TEMPLATES = {
  'auth-password-reset': async (data) => ({
    to: data.email,
    subject: `${firstName(data.name)}, reset your Plano password`,
    html: renderEmailShell({
      title: 'Password reset',
      headline: `Hello, ${data.name || 'there'}`,
      intro: 'We received a request to reset your Plano password.',
      body: `
        <p style="margin:0 0 16px;">Use the button below to choose a new password. This link expires in 10 minutes.</p>
        <p style="margin:0;">If you did not request this, you can safely ignore this email.</p>
      `,
      ctaLabel: 'Reset Password',
      ctaUrl: data.resetUrl,
      footerNote: `For assistance, contact ${supportName} at ${supportEmail}. Support is only available through the website contact view.`,
    }),
  }),
  'auth-customer-invite': async (data) => ({
    to: data.email,
    subject: `${firstName(data.name)}, join ${data.invitedByName || 'Plano Admin'}'s team on Plano`,
    fromType: 'support',
    html: renderEmailShell({
      title: 'Customer invitation',
      headline: `Hello, ${data.name || 'there'}`,
      intro: `You have been invited by ${data.invitedByName || 'the Plano admin team'} to access their customer portal.`,
      body: `
        <p style="margin:0 0 16px;">Click the button below to accept the invitation and set your password.</p>
        <p style="margin:0;">This invitation link expires in 7 days.</p>
      `,
      ctaLabel: 'Accept Invitation',
      ctaUrl: data.acceptUrl,
      footerNote: `This invitation was sent by ${supportName}. If you need help, reply to ${supportEmail}.`,
    }),
  }),
  'auth-verification': async (data) => ({
    to: data.email,
    subject: `${firstName(data.name)}, verify your Plano account`,
    html: renderEmailShell({
      title: 'Verify your email',
      headline: `Welcome, ${data.name || 'there'}`,
      intro: 'Please verify your email address to keep your Plano account secure.',
      body: `
        <p style="margin:0 0 16px;">Click the button below to verify your account. This link is time-limited and can be used once.</p>
      `,
      ctaLabel: 'Verify Email',
      ctaUrl: data.verifyUrl,
      footerNote: `If you did not create this account, you can ignore this email. For assistance, contact ${supportName} at ${supportEmail}.`,
    }),
  }),
  'auth-otp': async (data) => ({
    to: data.email,
    subject: `${firstName(data.name)}, your Plano one-time code is ${data.otp}`,
    html: renderEmailShell({
      title: 'One-time code',
      headline: `Hello, ${data.name || 'there'}`,
      intro: 'Use the code below to complete your email verification or sign-in request.',
      highlight: data.otp,
      body: `
        <p style="margin:0 0 10px;">This code expires in 10 minutes. Enter it exactly as shown.</p>
        <p style="margin:0;">Purpose: <strong>${escapeHtml(data.purpose || 'verification')}</strong></p>
      `,
      ctaLabel: 'Open Verification Page',
      ctaUrl: data.verifyUrl,
      footerNote: `If you did not request this code, ignore it. Need help? ${supportName} is available at ${supportEmail}.`,
    }),
  }),
  'invoice-created': async (data) => {
    const invoice = await Invoice.findById(data.invoiceId).populate('userId', 'name email');
    return {
      to: invoice?.userId?.email,
      subject: `${firstName(invoice?.userId?.name)}, invoice ${invoice?.invoiceNumber} is ready`,
      html: renderEmailShell({
        title: 'Invoice ready',
        headline: 'Your invoice is ready',
        intro: `Hi ${invoice?.userId?.name || 'there'},`,
        body: `
          <p style="margin:0 0 12px;">Invoice <strong>${escapeHtml(invoice?.invoiceNumber)}</strong> for <strong>${escapeHtml(`${invoice?.currency} ${invoice?.grandTotal}`)}</strong> is due on ${new Date(invoice?.dueDate).toDateString()}.</p>
        `,
        ctaLabel: 'View Invoice',
        ctaUrl: `${process.env.FRONTEND_URL}/invoices/${invoice?._id}`,
      }),
    };
  },
  'payment-success': async (data) => {
    const user = await User.findById(data.userId);
    return {
      to: user?.email,
      subject: `${firstName(user?.name)}, payment received: ${data.currency} ${data.amount}`,
      html: renderEmailShell({
        title: 'Payment received',
        headline: 'Payment confirmed',
        intro: `Hi ${user?.name || 'there'},`,
        body: `
          <p style="margin:0 0 12px;">We've received your payment of <strong>${escapeHtml(`${data.currency} ${data.amount}`)}</strong>. Thank you!</p>
          <p style="margin:0;">Your subscription is now active.</p>
        `,
      }),
    };
  },
  'subscription-expiry-warning': async (data) => {
    const user = await User.findById(data.userId);
    return {
      to: user?.email,
      subject: `${firstName(user?.name)}, your subscription expires in ${data.daysLeft} days`,
      html: renderEmailShell({
        title: 'Subscription warning',
        headline: 'Subscription expiring soon',
        intro: `Hi ${user?.name || 'there'},`,
        body: `
          <p style="margin:0 0 12px;">Your subscription expires in <strong>${escapeHtml(`${data.daysLeft} days`)}</strong> on ${escapeHtml(data.expiryDate)}.</p>
        `,
        ctaLabel: 'Renew Now',
        ctaUrl: `${process.env.FRONTEND_URL}/subscriptions`,
      }),
    };
  },
};

const emailWorker = new Worker(
  'email-notification',
  async (job) => {
    const template = EMAIL_TEMPLATES[job.name];
    if (!template) {
      logger.warn(`[EmailWorker] No template for job name: ${job.name}`);
      return;
    }

    logger.info(`[EmailWorker] Rendering ${job.name} job ${job.id}`);
    const { to, subject, html, fromType = 'noreply' } = await template(job.data);

    if (!to) {
      logger.warn(`[EmailWorker] No recipient for job ${job.id} (${job.name})`);
      return;
    }

    logger.info(`[EmailWorker] Sending ${job.name} email to ${to}`);

    try {
      const outbound = resolveOutboundMailProfile(fromType);

      await outbound.transporter.sendMail({
        from: buildFromHeader(outbound.sender, outbound.profileKey === 'support' ? 'Support | Planoo' : 'Plano'),
        replyTo: buildFromHeader(emailSenders.support, 'Support | Planoo'),
        to,
        subject,
        html,
      });

      logger.info(`[EmailWorker] Sent ${job.name} email to ${to} — Subject: ${subject}`);
      return { to, subject };
    } catch (error) {
      const responseCode = error?.responseCode ? ` (code ${error.responseCode})` : '';
      if (error?.responseCode === 553 || (error?.message || '').includes('Sender is not allowed to relay emails')) {
        logger.error(`[EmailWorker] SMTP relay denied (553) for job ${job.name}. Check sender/auth mapping: support sender=${normalizeEmail(emailSenders.support.email)}, support user=${normalizeEmail(smtpProfiles.support.user)}, noreply sender=${normalizeEmail(emailSenders.noreply.email)}, noreply user=${normalizeEmail(smtpProfiles.noreply.user)}.`);
      }
      if (error?.code === 'SENDER_AUTH_MISMATCH') {
        logger.error('[EmailWorker] Outbound sender does not match SMTP auth user. Zoho relay will fail unless sender and credentials belong to same mailbox or allowed send-as alias.');
      }
      logger.error(`[EmailWorker] Failed sending ${job.name} email to ${to}${responseCode}: ${error.message}`);
      throw error;
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

emailWorker.on('active', (job) => {
  const now = Date.now();
  const enqueuedAt = Number(job?.data?.enqueuedAt || job?.timestamp || now);
  const waitedMs = Math.max(now - enqueuedAt, 0);
  logger.info(`[EmailWorker] Active job ${job.id} (${job.name}) after ${waitedMs}ms in queue`);
});

emailWorker.on('completed', (job) => {
  logger.info(`[EmailWorker] Completed job ${job.id} (${job.name})`);
});

emailWorker.on('failed', (job, err) =>
  logger.error(`[EmailWorker] Job ${job?.id} (${job?.name}) failed: ${err.message}`)
);

export default emailWorker;
