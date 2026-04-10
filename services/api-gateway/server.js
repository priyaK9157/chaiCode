import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Default message for the gateway root
app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

// Proxy logic
const targetAuth = process.env.TARGET_AUTH || 'http://localhost:5001';
const targetCourse = process.env.TARGET_COURSE || 'http://localhost:5002';

// Proxy requests starting with /api/auth to the Auth Service
app.use(createProxyMiddleware('/api/auth', {
  target: targetAuth,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📡 [Gateway] Proxying AUTH request to: ${targetAuth}${req.url}`);
  },
  pathRewrite: { // No need to rewrite, just forwarding
  },
}));

// Proxy requests starting with /api/courses, /api/sections, /api/lessons, /api/payments to the Course Service
app.use(createProxyMiddleware(['/api/courses', '/api/sections', '/api/lessons', '/api/payments'], {
  target: targetCourse,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📡 [Gateway] Proxying COURSE request to: ${targetCourse}${req.url}`);
  },
  pathRewrite: {
  },
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
