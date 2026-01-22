/**
 * Web Sandbox - Browser-based isolated execution environment
 * Uses WebContainers to run commands in the browser without server-side execution
 * 
 * WebContainers run a full Node.js environment in the browser using WebAssembly
 * No Docker or server required - everything runs client-side!
 */

export interface SandboxConfig {
  timeout: number;
  onOutput?: (data: string) => void;
  onError?: (data: string) => void;
}

export interface SandboxResult {
  output: string;
  error: string;
  exitCode: number | null;
  executionTime: number;
  sandbox: boolean;
}

const DEFAULT_CONFIG: SandboxConfig = {
  timeout: 60000, // 60 seconds
};

// Supported runtimes in WebContainers
export const SUPPORTED_RUNTIMES = [
  'node',
  'npm',
  'npx',
  'yarn',
  'pnpm',
] as const;

// Commands that are not supported in WebContainers (Node.js only environment)
export const UNSUPPORTED_COMMANDS = [
  'python',
  'python3',
  'pip',
  'pip3',
  'go',
  'cargo',
  'rustc',
  'java',
  'javac',
  'ruby',
  'php',
  'dotnet',
  'gcc',
  'g++',
] as const;

/**
 * Check if WebContainers are supported in the current browser
 */
export function isWebContainerSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof SharedArrayBuffer !== 'undefined';
}

/**
 * Check if a command is supported in WebContainers
 */
export function isCommandSupported(command: string): { supported: boolean; message?: string } {
  const cmd = command.trim().toLowerCase().split(' ')[0];

  // Check if it's an unsupported command
  if (UNSUPPORTED_COMMANDS.includes(cmd as any)) {
    return {
      supported: false,
      message: `'${cmd}' is not available in WebContainers. This is a Node.js/JavaScript environment. Supported: node, npm, npx, yarn, pnpm, and shell commands.`,
    };
  }

  return { supported: true };
}

/**
 * Get alternative command suggestion for unsupported commands
 */
export function getAlternativeSuggestion(command: string): string | null {
  const cmd = command.trim().toLowerCase();

  if (cmd.startsWith('python') || cmd.startsWith('pip')) {
    return 'Use Node.js instead: node script.js, or install packages with: npm install <package>';
  }

  if (cmd.startsWith('go ')) {
    return 'Go is not supported. Consider using Node.js for your project.';
  }

  if (cmd.startsWith('cargo') || cmd.startsWith('rustc')) {
    return 'Rust is not supported. Consider using Node.js or WebAssembly compiled Rust modules.';
  }

  return null;
}

// Re-export the WebContainer service for direct use
export { webContainerService, WebContainerService } from './webcontainer-service';
export type { CommandResult } from './webcontainer-service';
export type { FileSystemTree } from '@webcontainer/api';
