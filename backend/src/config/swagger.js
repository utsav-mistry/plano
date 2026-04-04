import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Plano — Subscription Management API',
      version: '1.0.0',
      description:
        'Production-ready REST API for managing subscriptions, quotations, invoices, payments, discounts, and taxes.',
      contact: { name: 'Plano Support', email: 'support@plano.com' },
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}/api/v1`, description: 'Local Dev' },
      { url: 'https://plano.yourdomain.com/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',          description: 'Authentication & authorization' },
      { name: 'Users',         description: 'User management' },
      { name: 'Products',      description: 'Product catalog' },
      { name: 'Plans',         description: 'Recurring billing plans' },
      { name: 'Subscriptions', description: 'Customer subscriptions lifecycle' },
      { name: 'Quotations',    description: 'Sales quotations' },
      { name: 'Invoices',      description: 'Invoice management' },
      { name: 'Payments',      description: 'Payment processing & refunds' },
      { name: 'Discounts',     description: 'Discount codes & rules' },
      { name: 'Taxes',         description: 'Tax configuration' },
      { name: 'Reports',       description: 'Analytics & reporting' },
    ],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  if (process.env.SWAGGER_ENABLED !== 'true') return;

  const route = process.env.SWAGGER_ROUTE || '/api-docs';

  app.use(
    route,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { background-color: #0f172a; }',
      customSiteTitle: 'Plano API Docs',
    })
  );

  // Raw JSON spec endpoint (useful for Postman import)
  app.get(`${route}.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📄 Swagger UI: http://localhost:${process.env.PORT || 5000}${route}`);
};
