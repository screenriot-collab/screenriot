/**
 * Checks liveness of API (and optionally docker services).
 * Usage: node scripts/health-check.js [API_URL]
 * Default API_URL: http://localhost:3001
 * Exit code: 0 if status is ok, 1 if degraded or unreachable.
 */

const apiUrl = process.argv[2] || 'http://localhost:3001';

async function main() {
  console.log('Health check:', apiUrl);
  try {
    const res = await fetch(`${apiUrl}/health`);
    const data = await res.json();
    console.log('Status:', data.status);
    console.log('Checks:', JSON.stringify(data.checks, null, 2));
    if (data.status !== 'ok') {
      console.error('Degraded:', data.checks);
      process.exit(1);
    }
    console.log('Swagger:', `${apiUrl}/docs`);
    process.exit(0);
  } catch (err) {
    console.error('API unreachable:', err.message);
    process.exit(1);
  }
}

main();
