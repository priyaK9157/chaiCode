import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track actual server errors (5xx), ignoring expected client errors (4xx like 404, 429)
const serverErrors = new Rate('server_errors');

// Base URL: Defaults to localhost for host terminal execution.
// If running inside docker network, override via: k6 run -e BASE_URL=http://api-gateway:5000 k6-stress-test.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  // Scenarios to model a realistic load, stress, and spike test pattern
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up: Warm up the database and services up to 20 VUs (Virtual Users)
    { duration: '1m', target: 20 },   // Sustained Load: Run at normal load (20 VUs) for 1 minute
    { duration: '30s', target: 100 },  // Ramp-up Stress: Rapidly escalate to 80 VUs
    { duration: '1m10s', target: 100 },   // Peak Stress: Hold at maximum stress load (80 VUs)
    { duration: '30s', target: 0 },   // Cool-down: Gracefully ramp-down back to 0 VUs
  ],
  thresholds: {
    // Overall metrics thresholds
    server_errors: ['rate<0.05'], // Only fail threshold if actual server-side errors (5xx) exceed 5%
    http_req_duration: ['p(95)<400'], // 95% of API requests must complete in less than 400ms
  },
};

export default function () {
  // --- TEST CASE 1: API Gateway & Core System Health Check ---
  const healthRes = http.get(`${BASE_URL}/`);
  serverErrors.add(healthRes.status >= 500);
  check(healthRes, {
    'Gateway responds with 200 OK': (r) => r.status === 200,
    'Gateway returns correct greeting': (r) => r.body && r.body.includes('API Gateway is running'),
  });

  sleep(0.5); // Add minor pacing to simulate realistic human delay

  // --- TEST CASE 2: Public Course Retrival (Database intensive read) ---
  const coursesRes = http.get(`${BASE_URL}/api/courses`);
  serverErrors.add(coursesRes.status >= 500);
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
  serverErrors.add(registerRes.status >= 500);

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
  serverErrors.add(loginRes.status >= 500);

  // auth-service login rate limiter is max 5 attempts per 15 min.
  // We check that the response is either 404/401/400 (if let through by rate limiter but wrong credentials) or 429 (rate-limited).
  // If the server crashes and returns 500, this check will fail!
  check(loginRes, {
    'Login responds with 4xx credentials error OR 429 Rate Limit': (r) => r.status >= 400 && r.status < 500,
  });

  sleep(1.5);
}
