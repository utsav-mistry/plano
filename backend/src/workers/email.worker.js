import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import User from '../modules/users/user.model.js';
import Invoice from '../modules/invoices/invoice.model.js';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const EMAIL_TEMPLATES = {
  'invoice-created': async (data) => {
    const invoice = await Invoice.findById(data.invoiceId).populate('userId', 'name email');
    return {
      to: invoice?.userId?.email,
      subject: `Invoice ${invoice?.invoiceNumber} — Action Required`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Your Invoice is Ready</h2>
          <p>Hi ${invoice?.userId?.name},</p>
          <p>Invoice <strong>${invoice?.invoiceNumber}</strong> for <strong>${invoice?.currency} ${invoice?.grandTotal}</strong> is due on ${new Date(invoice?.dueDate).toDateString()}.</p>
          <a href="${process.env.FRONTEND_URL}/invoices/${invoice?._id}" style="background:#0f172a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">View Invoice</a>
        </div>
      `,
    };
  },
  'payment-success': async (data) => {
    const user = await User.findById(data.userId);
    return {
      to: user?.email,
      subject: `Payment Confirmed — ${data.currency} ${data.amount}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>✅ Payment Received</h2>
          <p>Hi ${user?.name},</p>
          <p>We've received your payment of <strong>${data.currency} ${data.amount}</strong>. Thank you!</p>
          <p>Your subscription is now active.</p>
        </div>
      `,
    };
  },
  'subscription-expiry-warning': async (data) => {
    const user = await User.findById(data.userId);
    return {
      to: user?.email,
      subject: `Your Subscription Expires in ${data.daysLeft} Days`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>⚠️ Subscription Expiring Soon</h2>
          <p>Hi ${user?.name},</p>
          <p>Your subscription expires in <strong>${data.daysLeft} days</strong> on ${data.expiryDate}.</p>
          <a href="${process.env.FRONTEND_URL}/subscriptions" style="background:#0f172a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Renew Now</a>
        </div>
      `,
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

    const { to, subject, html } = await template(job.data);

    if (!to) {
      logger.warn(`[EmailWorker] No recipient for job ${job.id}`);
      return;
    }

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    logger.info(`[EmailWorker] Email sent to ${to} — Subject: ${subject}`);
    return { to, subject };
  },
  {
    connection,
    concurrency: 10,
  }
);

emailWorker.on('failed', (job, err) =>
  logger.error(`[EmailWorker] Job ${job.id} (${job.name}) failed: ${err.message}`)
);

export default emailWorker;
