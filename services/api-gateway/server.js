import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.set("trust proxy", true);
const PORT = process.env.PORT || 5000;

app.use(cors());

// Default message for the gateway root
app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

// Proxy logic
const targetAuth = process.env.TARGET_AUTH || 'https://chaicode-3.onrender.com';
const targetCourse = process.env.TARGET_COURSE || 'https://chaicode-5.onrender.com';

const handleProxyError = (serviceName) => (err, req, res) => {
  console.error(`❌ [Gateway Proxy Error] in ${serviceName} service for ${req.method} ${req.url}:`, err.message);
  if (!res.headersSent) {
    res.status(502).json({ message: `Gateway proxy error in ${serviceName}: ${err.message}` });
  }
};

// Proxy requests starting with /api/auth to the Auth Service
app.use(createProxyMiddleware('/api/auth', {
  target: targetAuth,
  changeOrigin: true,
  secure: false,
  onError: handleProxyError('AUTH'),
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
  secure: false,
  onError: handleProxyError('COURSE'),
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📡 [Gateway] Proxying COURSE request to: ${targetCourse}${req.url}`);
  },
  pathRewrite: {
  },
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
