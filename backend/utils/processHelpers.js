import { execFile, spawn } from 'child_process';
import { ExpressError } from './ExpressError.js';

/**
 * Safely executes a binary executable with arguments as a string array.
 * Bypasses shell execution, eliminating command injection risks.
 * 
 * @param {string} file Path or name of the binary.
 * @param {string[]} args Array of arguments.
 * @param {object} options Optional child_process settings (timeout, cwd, etc.).
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
 */
export const runProcess = (file, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const execOptions = {
      timeout: options.timeout || 30000,
      maxBuffer: options.maxBuffer || 1024 * 1024 * 10, // 10MB limit
      cwd: options.cwd || process.cwd(),
      ...options
    };

    execFile(file, args, execOptions, (error, stdout, stderr) => {
      const trimmedStdout = stdout ? stdout.trim() : '';
      const trimmedStderr = stderr ? stderr.trim() : '';

      if (error) {
        let statusCode = 500;
        let errorMessage = error.message;

        if (error.code === 'ENOENT') {
          errorMessage = `Executable binary not found: "${file}". Ensure it is installed and added to the PATH or configured in .env.`;
        } else if (error.code === 'EACCES') {
          errorMessage = `Permission denied executing binary: "${file}". Verify permissions.`;
        } else if (error.killed || error.code === 'ETIMEDOUT') {
          errorMessage = `Command execution timed out after ${execOptions.timeout}ms: "${file} ${args.join(' ')}"`;
        } else if (typeof error.code === 'number' && error.code !== 0) {
          errorMessage = `Command failed with exit code ${error.code}. Error: ${trimmedStderr || error.message}`;
        }

        return reject(new ExpressError(statusCode, errorMessage));
      }

      resolve({
        stdout: trimmedStdout,
        stderr: trimmedStderr,
        exitCode: 0
      });
    });
  });
};

/**
 * Spawns a child process safely (bypassing shell parsing).
 * Exposes stdout/stderr events and a kill callback.
 * 
 * @param {string} file Binary executable path or name.
 * @param {string[]} args Array of arguments.
 * @param {object} options Optional spawn options.
 * @returns {object} { promise: Promise<void>, child: ChildProcess, kill: Function }
 */
export const spawnProcess = (file, args = [], options = {}) => {
  const spawnOptions = {
    cwd: options.cwd || process.cwd(),
    ...options
  };

  const child = spawn(file, args, spawnOptions);

  const kill = (signal = 'SIGTERM') => {
    if (child && !child.killed) {
      child.kill(signal);
      return true;
    }
    return false;
  };

  const promise = new Promise((resolve, reject) => {
    let stderrData = '';

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('error', (error) => {
      let statusCode = 500;
      let errorMessage = error.message;

      if (error.code === 'ENOENT') {
        errorMessage = `Executable binary not found: "${file}". Verify installation and paths.`;
      } else if (error.code === 'EACCES') {
        errorMessage = `Permission denied executing: "${file}".`;
      }

      reject(new ExpressError(statusCode, errorMessage));
    });

    child.on('close', (code, signal) => {
      if (signal) {
        return reject(new ExpressError(500, `Process was terminated with signal: ${signal}`));
      }

      if (code === 0) {
        return resolve();
      }

      const trimmedStderr = stderrData ? stderrData.trim() : '';
      return reject(
        new ExpressError(500, `Process exited with code ${code}. Error: ${trimmedStderr || 'Unknown error'}`)
      );
    });
  });

  return {
    promise,
    child,
    kill
  };
};

export default {
  runProcess,
  spawnProcess
};
