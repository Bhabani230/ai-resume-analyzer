import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n======================================================');
console.log('  🚀 AI RESUME ANALYZER - Multi-Service Orchestrator');
console.log('======================================================\n');

// Detect Python executable
const venvPythonWin = path.join(__dirname, 'ai-service', '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(__dirname, 'ai-service', '.venv', 'bin', 'python');
let pythonCmd = 'python';

if (fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

const processes = [];

function startProcess(name, command, args, cwd, colorCode) {
  console.log(`[${name}] Starting in ${cwd}...`);
  const isWindows = process.platform === 'win32';
  const isDirectExe = command.endsWith('.exe');
  const useShell = isWindows ? !isDirectExe : false;
  const child = spawn(command, args, {
    cwd,
    shell: useShell,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONUNBUFFERED: '1', FORCE_COLOR: '1' },
  });

  processes.push({ name, child });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`\x1b[${colorCode}m[${name}]\x1b[0m ${line}`);
      }
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.error(`\x1b[${colorCode}m[${name} ERR]\x1b[0m ${line}`);
      }
    }
  });

  child.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });

  return child;
}

// 1. Start AI Service (Python FastAPI on port 8000)
startProcess(
  'AI-Service',
  pythonCmd,
  ['main.py'],
  path.join(__dirname, 'ai-service'),
  '36' // Cyan
);

// 2. Start Backend (Express on port 5000)
startProcess(
  'Backend',
  'npm',
  ['run', 'dev'],
  path.join(__dirname, 'backend'),
  '32' // Green
);

// 3. Start Frontend (Vite on port 5173)
startProcess(
  'Frontend',
  'npm',
  ['run', 'dev'],
  path.join(__dirname, 'frontend'),
  '35' // Magenta
);

// Graceful cleanup on Ctrl+C
const cleanup = () => {
  console.log('\n[Orchestrator] Shutting down all services gracefully...');
  for (const { name, child } of processes) {
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', child.pid, '/f', '/t'], { stdio: 'ignore' });
      } else {
        child.kill('SIGINT');
      }
    } catch (e) {
      // Ignore cleanup error
    }
  }
  setTimeout(() => process.exit(0), 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
