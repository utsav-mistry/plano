import { spawn } from 'child_process';

const processes = [];

const startProcess = (command, args, label) => {
    const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        env: process.env,
    });

    child.on('exit', (code, signal) => {
        const exitCode = code ?? (signal ? 1 : 0);
        console.log(`[dev] ${label} exited with code ${exitCode}`);
        shutdown(exitCode);
    });

    processes.push(child);
    return child;
};

const shutdown = (exitCode = 0) => {
    while (processes.length > 0) {
        const child = processes.pop();
        if (child && !child.killed) {
            child.kill('SIGTERM');
        }
    }
    process.exit(exitCode);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('[dev] Starting Plano API and BullMQ workers');
startProcess('npm', ['run', 'dev:server'], 'api');
startProcess('npm', ['run', 'dev:workers'], 'workers');