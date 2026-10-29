const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('  🎵 Starting MyMusic Lounge Full-Stack Environment');
console.log('  🌐 Frontend : http://localhost:5173');
console.log('  🌐 Backend  : http://localhost:5000');
console.log('====================================================\n');

// 1. Backend Server (Port 5000)
const serverProc = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

// 2. Frontend Client (Port 5173 - CI=true ensures Vite doesn't exit on terminal stdin)
const clientProc = spawn('npx', ['vite', '--host'], {
  cwd: path.resolve(__dirname, 'client'),
  stdio: ['ignore', 'inherit', 'inherit'],
  shell: true,
  env: { ...process.env, CI: 'true' },
});

function cleanup() {
  console.log('\n🛑 Stopping MyMusic Lounge dev environment...');
  try {
    serverProc.kill();
    clientProc.kill();
  } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
