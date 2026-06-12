import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import http from 'http';
import https from 'https';

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

const pingUrl = (url) => {
  if (!url) return;
  const client = url.startsWith('https') ? https : http;
  console.log(`📡 [Gateway] Waking up target service: ${url}`);
  client.get(url, (res) => {
    console.log(`✅ [Gateway] Wake up ping to ${url} returned status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`❌ [Gateway] Wake up ping error for ${url}:`, err.message);
  });
};

app.get('/api/ping-all', (req, res) => {
  console.log('📡 [Gateway] Ping-all requested. Waking up downstream services...');
  pingUrl(targetAuth);
  pingUrl(targetCourse);
  res.json({ message: 'Wake up pings dispatched' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  // Asynchronously trigger wakeups for the microservices
  pingUrl(targetAuth);
  pingUrl(targetCourse);
});
