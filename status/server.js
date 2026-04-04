import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import 'dotenv/config';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const queues = [
  new Queue('invoice-generation',    { connection }),
  new Queue('email-notification',    { connection }),
  new Queue('subscription-lifecycle',{ connection }),
  new Queue('pdf-generation',        { connection }),
];

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/status');

createBullBoard({
  queues: queues.map((q) => new BullMQAdapter(q)),
  serverAdapter,
  options: { uiConfig: { boardTitle: 'Plano — Job Queue Monitor' } },
});

const app = express();

// Basic auth for status board
app.use('/status', (req, res, next) => {
  const auth = req.headers.authorization;
  const expected = 'Basic ' + Buffer.from(
    `${process.env.STATUS_USER || 'admin'}:${process.env.STATUS_PASS || 'admin'}`
  ).toString('base64');
  if (auth !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Plano Status"');
    return res.status(401).send('Unauthorized');
  }
  next();
});

app.use('/status', serverAdapter.getRouter());

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Status board: http://localhost:${PORT}/status`);
});
