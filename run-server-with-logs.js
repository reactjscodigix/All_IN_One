const { spawn } = require('child_process');
const path = require('path');

const npmProcess = spawn('npm', ['run', 'server'], {
  cwd: path.join(__dirname, '.'),
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

npmProcess.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data.toString()}`);
});

npmProcess.stderr.on('data', (data) => {
  console.error(`[SERVER ERR] ${data.toString()}`);
});

npmProcess.on('close', (code) => {
  console.log(`[SERVER] Process exited with code ${code}`);
});

setTimeout(() => {
  console.log('[CLIENT] Running test...');
  const testProcess = spawn('node', ['test-contacts.js'], {
    cwd: path.join(__dirname, '.'),
    stdio: 'inherit'
  });
  
  testProcess.on('close', (code) => {
    console.log(`[CLIENT] Test completed with code ${code}`);
    npmProcess.kill();
    process.exit(code);
  });
}, 2000);
