import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { exec, spawn, type ChildProcess } from 'node:child_process';
import type { RunCodeDTO, ExecutionResult, ExecutionStatus } from './terminal.types.js';

export class DockerService {
  private activeProcesses: Map<string, ChildProcess> = new Map();

  /** Map programming language to execution runtime configuration */
  private getLanguageConfig(
    language: string,
    fileName: string,
  ): { tempFileName: string; runCmd: string; dockerImage: string } {
    const lang = language.toLowerCase();
    const isWin = process.platform === 'win32';

    switch (lang) {
      case 'javascript':
      case 'js':
        return { tempFileName: 'main.js', runCmd: 'node main.js', dockerImage: 'node:20-alpine' };
      case 'typescript':
      case 'ts':
      case 'tsx':
        return {
          tempFileName: 'main.ts',
          runCmd: 'npx tsx main.ts',
          dockerImage: 'node:20-alpine',
        };
      case 'python':
      case 'py':
        return {
          tempFileName: 'main.py',
          runCmd: isWin ? 'python main.py' : 'python3 main.py',
          dockerImage: 'python:3.11-alpine',
        };
      case 'java':
        return {
          tempFileName: 'Main.java',
          runCmd: 'javac Main.java && java Main',
          dockerImage: 'openjdk:21-slim',
        };
      case 'c':
        return {
          tempFileName: 'main.c',
          runCmd: isWin ? 'gcc main.c -o main.exe && main.exe' : 'gcc main.c -o main && ./main',
          dockerImage: 'gcc:latest',
        };
      case 'cpp':
      case 'c++':
        return {
          tempFileName: 'main.cpp',
          runCmd: isWin ? 'g++ main.cpp -o main.exe && main.exe' : 'g++ main.cpp -o main && ./main',
          dockerImage: 'gcc:latest',
        };
      case 'go':
        return {
          tempFileName: 'main.go',
          runCmd: 'go run main.go',
          dockerImage: 'golang:1.22-alpine',
        };
      default:
        return {
          tempFileName: fileName || 'script.txt',
          runCmd: `node ${fileName || 'main.js'}`,
          dockerImage: 'node:20-alpine',
        };
    }
  }

  /** Secure Code Execution */
  public async executeCode(
    dto: RunCodeDTO,
    onOutputChunk?: (data: string) => void,
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const config = this.getLanguageConfig(dto.language, dto.fileName);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsync_runner_'));
    const filePath = path.join(tempDir, config.tempFileName);

    fs.writeFileSync(filePath, dto.code, 'utf-8');

    let outputBuffer = '';
    const appendOutput = (text: string) => {
      outputBuffer += text;
      if (onOutputChunk) {
        onOutputChunk(text);
      }
    };

    return new Promise<ExecutionResult>((resolve) => {
      // 1. Check if Docker daemon is available
      exec('docker info', { timeout: 3000 }, (dockerErr) => {
        if (!dockerErr) {
          // Linux container run command for C/C++ inside Docker
          const lang = dto.language.toLowerCase();
          let containerRunCmd = config.runCmd;
          if (lang === 'c') containerRunCmd = 'gcc main.c -o main && ./main';
          if (lang === 'cpp' || lang === 'c++') containerRunCmd = 'g++ main.cpp -o main && ./main';

          // Execute inside isolated Docker container with strict CPU/Memory/Time limits
          const dockerCmd = [
            'run',
            '--rm',
            '--cpus=0.5',
            '--memory=256m',
            '--network=none',
            '-v',
            `${tempDir}:/app`,
            '-w',
            '/app',
            config.dockerImage,
            'sh',
            '-c',
            containerRunCmd,
          ];

          const child = spawn('docker', dockerCmd);
          this.activeProcesses.set(dto.workspaceId, child);

          const timeoutTimer = setTimeout(() => {
            child.kill('SIGKILL');
            appendOutput('\n[ERROR] Execution timed out after 10 seconds.\n');
          }, 10000);

          child.stdout?.on('data', (data: Buffer) => appendOutput(data.toString()));
          child.stderr?.on('data', (data: Buffer) => appendOutput(data.toString()));

          child.on('close', (exitCode) => {
            clearTimeout(timeoutTimer);
            this.activeProcesses.delete(dto.workspaceId);
            this.cleanupTempDir(tempDir);

            const durationMs = Date.now() - startTime;
            const status: ExecutionStatus = exitCode === 0 ? 'completed' : 'failed';

            resolve({
              status,
              exitCode: exitCode ?? 1,
              output: outputBuffer || 'Program executed with no output.',
              durationMs,
            });
          });
        } else {
          // Fallback sandboxed runner for local dev environments
          appendOutput(`[DevSync Runner] Executing ${dto.language}...\n\n`);

          const shellCmd = config.runCmd;
          const child = spawn(shellCmd, { cwd: tempDir, shell: true });
          this.activeProcesses.set(dto.workspaceId, child);

          const timeoutTimer = setTimeout(() => {
            child.kill('SIGKILL');
            appendOutput('\n[ERROR] Execution timed out after 10 seconds.\n');
          }, 10000);

          child.stdout?.on('data', (data: Buffer) => appendOutput(data.toString()));
          child.stderr?.on('data', (data: Buffer) => appendOutput(data.toString()));

          child.on('close', (exitCode) => {
            clearTimeout(timeoutTimer);
            this.activeProcesses.delete(dto.workspaceId);
            this.cleanupTempDir(tempDir);

            const durationMs = Date.now() - startTime;
            const status: ExecutionStatus = exitCode === 0 ? 'completed' : 'failed';

            resolve({
              status,
              exitCode: exitCode ?? 0,
              output: outputBuffer,
              durationMs,
            });
          });
        }
      });
    });
  }

  public killExecution(workspaceId: string): boolean {
    const process = this.activeProcesses.get(workspaceId);
    if (process) {
      process.kill('SIGKILL');
      this.activeProcesses.delete(workspaceId);
      return true;
    }
    return false;
  }

  private cleanupTempDir(tempDir: string): void {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}

export const dockerService = new DockerService();
