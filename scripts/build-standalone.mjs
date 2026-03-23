import { spawn } from 'node:child_process';
import { join } from 'node:path';

if (process.platform === 'win32') {
  console.error('Standalone build is not supported on Windows with Next.js 16 Turbopack. Use "npm run build" on Windows, or run "npm run build:standalone" in Linux/Docker.');
  process.exit(1);
}

const nextBin = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn(process.execPath, [nextBin, 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    STANDALONE_BUILD: '1',
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});