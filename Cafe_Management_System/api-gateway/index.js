const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3000;

app.use(express.json());

// Proxy routes to respective services
app.use('/menu', createProxyMiddleware({ target: 'http://menu-service:3001', changeOrigin: true }));
app.use('/orders', createProxyMiddleware({ target: 'http://order-service:3002', changeOrigin: true }));
app.use('/payments', createProxyMiddleware({ target: 'http://payment-service:3003', changeOrigin: true }));
app.use('/inventory', createProxyMiddleware({ target: 'http://inventory-service:3004', changeOrigin: true }));
app.use('/customers', createProxyMiddleware({ target: 'customer-service:3005', changeOrigin: true }));

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});