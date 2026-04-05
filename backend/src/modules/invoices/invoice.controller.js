import * as invoiceService from './invoice.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import catchAsync from '../../utils/catchAsync.js';
import { ROLES } from '../../constants/roles.js';
import PDFDocument from 'pdfkit';

export const create = catchAsync(async (req, res) => {
  const invoice = await invoiceService.create(req.body, req.user._id);
  new ApiResponse(201, { invoice }, 'Invoice created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) req.query.userId = req.user._id;
  const result = await invoiceService.getAll(req.query);
  new ApiResponse(200, result, 'Invoices fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getById(req.params.id);
  if (req.user.role === ROLES.PORTAL_USER && invoice.userId._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied');
  }
  new ApiResponse(200, { invoice }, 'Invoice fetched').send(res);
});

export const send = catchAsync(async (req, res) => {
  const invoice = await invoiceService.markSent(req.params.id);
  new ApiResponse(200, { invoice }, 'Invoice marked as sent').send(res);
});

export const confirm = catchAsync(async (req, res) => {
  // Compatibility route: confirm delegates to the existing send/mark-sent flow.
  const invoice = await invoiceService.markSent(req.params.id);
  new ApiResponse(200, { invoice }, 'Invoice confirmed').send(res);
});

export const cancel = catchAsync(async (req, res) => {
  const invoice = await invoiceService.voidInvoice(req.params.id, req.body.reason);
  new ApiResponse(200, { invoice }, 'Invoice cancelled').send(res);
});

export const downloadPdf = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getById(req.params.id);

  // FIX [C2]: Portal users can only download their own invoices
  if (req.user.role === ROLES.PORTAL_USER && invoice.userId._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied');
  }

  const fileName = `${invoice.invoiceNumber || `invoice-${invoice.id}`}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(22).text('Invoice', { align: 'right' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber || '-'}`);
  doc.text(`Status: ${invoice.status || '-'}`);
  doc.text(`Issue Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}`);
  doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}`);
  doc.moveDown();

  const customerName = invoice.userId?.name || 'Customer';
  const customerEmail = invoice.userId?.email || 'N/A';
  doc.fontSize(13).text('Billed To');
  doc.fontSize(11).text(customerName);
  doc.text(customerEmail);
  doc.moveDown();

  doc.fontSize(13).text('Items');
  doc.moveDown(0.4);

  (invoice.items || []).forEach((item, index) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const lineTotal = item.total || quantity * unitPrice;
    doc
      .fontSize(10)
      .text(`${index + 1}. ${item.description || 'Line item'} | Qty: ${quantity} | Unit: ${unitPrice} | Total: ${lineTotal}`);
  });

  doc.moveDown();
  doc.fontSize(11).text(`Subtotal: ${invoice.subtotal ?? 0}`, { align: 'right' });
  doc.text(`Tax: ${invoice.taxTotal ?? 0}`, { align: 'right' });
  doc.text(`Discount: ${invoice.discountTotal ?? 0}`, { align: 'right' });
  doc.fontSize(12).text(`Grand Total: ${invoice.grandTotal ?? 0}`, { align: 'right' });

  doc.end();
});

export const voidInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.voidInvoice(req.params.id, req.body.reason);
  new ApiResponse(200, { invoice }, 'Invoice voided').send(res);
});
