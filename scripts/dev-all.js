/**
 * Starts Docker stack then runs pnpm dev (all apps).
 * Cross-platform: no reliance on shell &&.
 */
const { execSync } = require('child_process');

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', ...opts });
}

console.log('Starting Docker (postgres, minio)...');
run('docker compose up -d');
console.log('Starting apps (pnpm dev)...');
run('pnpm dev', { env: { ...process.env } });
