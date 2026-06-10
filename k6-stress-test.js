import http from 'k6/http';
import { check, sleep } from 'k6';

// Base URL: Defaults to api-gateway service inside the docker-compose network.
// Can be overridden via environment variable, e.g., k6 run -e BASE_URL=https://chaicode-4.onrender.com k6-stress-test.js
const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:5000';

export const options = {
  // Scenarios to model a realistic load, stress, and spike test pattern
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up: Warm up the database and services up to 20 VUs (Virtual Users)
    { duration: '1m', target: 20 },   // Sustained Load: Run at normal load (20 VUs) for 1 minute
    { duration: '30s', target: 80 },  // Ramp-up Stress: Rapidly escalate to 80 VUs
    { duration: '1m10s', target: 80 },   // Peak Stress: Hold at maximum stress load (80 VUs)
    { duration: '30s', target: 0 },   // Cool-down: Gracefully ramp-down back to 0 VUs
  ],
  thresholds: {
    // Overall metrics thresholds
    http_req_failed: ['rate<0.05'], // General request failure rate must be less than 5% (excluding expected 429 rate-limiting status)
    http_req_duration: ['p(95)<400'], // 95% of API requests must complete in less than 400ms
  },
};

export default function () {
  // --- TEST CASE 1: API Gateway & Core System Health Check ---
  const healthRes = http.get(`${BASE_URL}/`);
  check(healthRes, {
    'Gateway responds with 200 OK': (r) => r.status === 200,
    'Gateway returns correct greeting': (r) => r.body.includes('API Gateway is running'),
  });

  sleep(0.5); // Add minor pacing to simulate realistic human delay

  // --- TEST CASE 2: Public Course Retrival (Database intensive read) ---
  const coursesRes = http.get(`${BASE_URL}/api/courses`);
  check(coursesRes, {
    'GET /api/courses returns 200': (r) => r.status === 200,
    'GET /api/courses returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.5);

  // --- TEST CASE 3: Authenticated Registration Simulation ---
  // We dynamically generate emails using Virtual User (VU) ID and Iteration count to keep them unique
  const uniqueEmail = `stress-user-${__VU}-${__ITER}-${Math.floor(Math.random() * 1000000)}@example.com`;
  
  const registerPayload = JSON.stringify({
    name: 'Stress Test User',
    email: uniqueEmail,
    password: 'SecurePassword123!',
    role: 'STUDENT'
  });

  const registerHeaders = { 'Content-Type': 'application/json' };
  const registerRes = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
    headers: registerHeaders,
  });

  // Note: auth-service has a strict Rate Limiter: max 3 signup attempts per 15 min per IP.
  // Under stress testing, we expect to see 201 Created initially, followed by 429 Too Many Requests.
  // Both are considered "successful" from a system architecture standpoint (rate limiter works vs server works).
  // Any 500 or timeout indicates a failure.
  check(registerRes, {
    'Register responds with 201 Created OR 429 Too Many Requests': (r) => r.status === 201 || r.status === 429,
  });

  sleep(1);

  // --- TEST CASE 4: Authenticated Login Simulation ---
  const loginPayload = JSON.stringify({
    email: 'unregistered-test-email@example.com', // Expected to fail or get rate limited
    password: 'wrong-password'
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // auth-service login rate limiter is max 5 attempts per 15 min.
  // We check that the response is either 404/401/400 (if let through by rate limiter but wrong credentials) or 429 (rate-limited).
  // If the server crashes and returns 500, this check will fail!
  check(loginRes, {
    'Login responds with 4xx credentials error OR 429 Rate Limit': (r) => r.status >= 400 && r.status < 500,
  });

  sleep(1.5);
}
