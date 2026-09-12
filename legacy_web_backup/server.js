// Root server entry point - redirects to full-stack TypeScript server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Booting FuelTrack Full-Stack Real-Time Application...');

const isDev = process.env.NODE_ENV !== 'production';
const script = path.join(__dirname, 'server/src/index.ts');

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsx', script], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
