import * as reportService from './report.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

/**
 * @swagger
 * /reports/revenue:
 *   get:
 *     tags: [Reports]
 *     summary: Revenue report grouped by day or month
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: groupBy
 *         schema: { type: string, enum: [day, month] }
 *     responses:
 *       200: { description: Revenue data }
 */
export const revenue = catchAsync(async (req, res) => {
  const data = await reportService.revenueReport(req.query);
  new ApiResponse(200, data, 'Revenue report').send(res);
});

export const mrr = catchAsync(async (req, res) => {
  const data = await reportService.mrrReport();
  new ApiResponse(200, data, 'MRR/ARR report').send(res);
});

export const churn = catchAsync(async (req, res) => {
  const data = await reportService.churnReport(req.query);
  new ApiResponse(200, data, 'Churn report').send(res);
});

export const subscriptions = catchAsync(async (req, res) => {
  const data = await reportService.subscriptionReport();
  new ApiResponse(200, data, 'Subscription report').send(res);
});

export const invoices = catchAsync(async (req, res) => {
  const data = await reportService.invoiceReport(req.query);
  new ApiResponse(200, data, 'Invoice report').send(res);
});

export const userGrowth = catchAsync(async (req, res) => {
  const data = await reportService.userGrowthReport(req.query);
  new ApiResponse(200, data, 'User growth report').send(res);
});
