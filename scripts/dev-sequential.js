/**
 * Starts API first, waits for GET /health, then starts web and admin.
 * Ensures frontend has API available at 3001.
 */
const { spawn } = require('child_process');

const API_URL = process.env.HEALTH_URL || 'http://localhost:3001';
const POLL_INTERVAL_MS = 1500;
const HEALTH_TIMEOUT_MS = 60000;

async function waitForHealth() {
  const start = Date.now();
  while (Date.now() - start < HEALTH_TIMEOUT_MS) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok' || data.status === 'degraded') {
          console.log('API is ready:', data.status);
          return;
        }
      }
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`API did not become ready within ${HEALTH_TIMEOUT_MS / 1000}s`);
}

function main() {
  console.log('Starting API first...');
  const apiChild = spawn('pnpm', ['--filter', '@screenriot/api', 'run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env },
  });

  waitForHealth()
    .then(() => {
      console.log('Starting web and admin...');
      const frontChild = spawn(
        'pnpm',
        ['--filter', '@screenriot/web', '--filter', '@screenriot/admin', 'run', 'dev'],
        {
          stdio: 'inherit',
          shell: true,
          cwd: process.cwd(),
          env: { ...process.env },
        },
      );

      frontChild.on('exit', (code) => {
        apiChild.kill();
        process.exit(code ?? 0);
      });

      function killAll() {
        apiChild.kill();
        frontChild.kill();
        process.exit(0);
      }
      process.on('SIGINT', killAll);
      process.on('SIGTERM', killAll);
    })
    .catch((err) => {
      console.error(err.message);
      apiChild.kill();
      process.exit(1);
    });
}

main();
