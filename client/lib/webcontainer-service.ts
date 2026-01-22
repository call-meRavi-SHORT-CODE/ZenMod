/**
 * WebContainer Service - Browser-based sandbox environment
 * Runs a full Node.js environment entirely in the browser using WebAssembly
 * No Docker or server-side execution required
 */

import { WebContainer, WebContainerProcess, FileSystemTree } from '@webcontainer/api';

export interface CommandResult {
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
}

class WebContainerService {
  private static instance: WebContainerService;
  private webcontainer: WebContainer | null = null;
  private isBooting: boolean = false;
  private bootPromise: Promise<WebContainer> | null = null;
  private currentProcess: WebContainerProcess | null = null;
  private outputBuffer: string = '';
  private errorBuffer: string = '';

  // Event callbacks
  private onOutputCallback: ((data: string) => void) | null = null;
  private onErrorCallback: ((data: string) => void) | null = null;
  private onReadyCallback: (() => void) | null = null;

  private constructor() {}

  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  /**
   * Check if WebContainers are supported in this browser
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    // WebContainers require SharedArrayBuffer which needs specific headers
    return typeof SharedArrayBuffer !== 'undefined';
  }

  /**
   * Boot the WebContainer instance
   */
  async boot(): Promise<WebContainer> {
    // If already booted, return existing instance
    if (this.webcontainer) {
      return this.webcontainer;
    }

    // If currently booting, wait for that to complete
    if (this.isBooting && this.bootPromise) {
      return this.bootPromise;
    }

    this.isBooting = true;

    this.bootPromise = (async () => {
      try {
        console.log('[WebContainer] Booting...');
        
        this.webcontainer = await WebContainer.boot();
        
        console.log('[WebContainer] Boot complete!');

        // Set up initial file system
        await this.setupInitialFileSystem();

        this.onReadyCallback?.();
        
        return this.webcontainer;
      } catch (error) {
        console.error('[WebContainer] Boot failed:', error);
        this.webcontainer = null;
        throw error;
      } finally {
        this.isBooting = false;
      }
    })();

    return this.bootPromise;
  }

  /**
   * Set up initial file system structure
   */
  private async setupInitialFileSystem(): Promise<void> {
    if (!this.webcontainer) return;

    const initialFiles: FileSystemTree = {
      'package.json': {
        file: {
          contents: JSON.stringify({
            name: 'sandbox',
            version: '1.0.0',
            type: 'module',
            scripts: {
              start: 'node index.js',
            },
            dependencies: {},
          }, null, 2),
        },
      },
      'index.js': {
        file: {
          contents: '// Welcome to the WebContainer sandbox!\nconsole.log("Hello from WebContainer!");\n',
        },
      },
      src: {
        directory: {},
      },
    };

    await this.webcontainer.mount(initialFiles);
  }

  /**
   * Execute a shell command
   */
  async executeCommand(command: string): Promise<CommandResult> {
    const startTime = Date.now();
    this.outputBuffer = '';
    this.errorBuffer = '';

    try {
      const container = await this.boot();

      // Parse command and arguments
      const parts = this.parseCommand(command);
      const cmd = parts[0];
      const args = parts.slice(1);

      // Special handling for certain commands
      const processedCommand = this.preprocessCommand(cmd, args);

      console.log('[WebContainer] Executing:', processedCommand.cmd, processedCommand.args);

      // Spawn the process
      this.currentProcess = await container.spawn(processedCommand.cmd, processedCommand.args, {
        env: {
          npm_config_yes: 'true', // Auto-accept npm prompts
        },
      });

      // Capture stdout
      this.currentProcess.output.pipeTo(
        new WritableStream({
          write: (data) => {
            this.outputBuffer += data;
            this.onOutputCallback?.(data);
          },
        })
      );

      // Wait for process to complete
      const exitCode = await this.currentProcess.exit;
      const executionTime = Date.now() - startTime;

      this.currentProcess = null;

      return {
        output: this.outputBuffer,
        error: this.errorBuffer,
        exitCode,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        output: this.outputBuffer,
        error: errorMessage,
        exitCode: 1,
        executionTime,
      };
    }
  }

  /**
   * Parse command string into command and arguments
   */
  private parseCommand(command: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (const char of command) {
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Preprocess commands for WebContainer compatibility
   */
  private preprocessCommand(cmd: string, args: string[]): { cmd: string; args: string[] } {
    // Handle common command aliases
    switch (cmd) {
      case 'python':
      case 'python3':
        // WebContainers don't support Python natively, use pyodide or show message
        return { cmd: 'echo', args: ['Python is not available in WebContainers. Use Node.js instead, or install a Python-to-JS transpiler.'] };
      
      case 'pip':
      case 'pip3':
        return { cmd: 'echo', args: ['pip is not available in WebContainers. This is a Node.js environment.'] };

      case 'ls':
        return { cmd: 'ls', args };

      case 'cat':
        return { cmd: 'cat', args };

      case 'mkdir':
        return { cmd: 'mkdir', args };

      case 'rm':
        return { cmd: 'rm', args };

      case 'touch':
        return { cmd: 'touch', args };

      case 'pwd':
        return { cmd: 'pwd', args: [] };

      case 'cd':
        // cd doesn't work as expected in spawn, handle differently
        return { cmd: 'cd', args };

      case 'clear':
      case 'cls':
        return { cmd: 'echo', args: ['\x1Bc'] }; // ANSI clear screen

      case 'npm':
      case 'npx':
      case 'node':
      case 'yarn':
      case 'pnpm':
        return { cmd, args };

      default:
        return { cmd, args };
    }
  }

  /**
   * Kill the current running process
   */
  killCurrentProcess(): void {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
  }

  /**
   * Write a file to the container
   */
  async writeFile(path: string, contents: string): Promise<void> {
    const container = await this.boot();
    await container.fs.writeFile(path, contents);
  }

  /**
   * Read a file from the container
   */
  async readFile(path: string): Promise<string> {
    const container = await this.boot();
    return await container.fs.readFile(path, 'utf-8');
  }

  /**
   * List directory contents
   */
  async readDir(path: string): Promise<string[]> {
    const container = await this.boot();
    return await container.fs.readdir(path);
  }

  /**
   * Create a directory
   */
  async mkdir(path: string): Promise<void> {
    const container = await this.boot();
    await container.fs.mkdir(path, { recursive: true });
  }

  /**
   * Remove a file or directory
   */
  async rm(path: string, options?: { recursive?: boolean }): Promise<void> {
    const container = await this.boot();
    await container.fs.rm(path, options);
  }

  /**
   * Mount files to the container
   */
  async mountFiles(files: FileSystemTree): Promise<void> {
    const container = await this.boot();
    await container.mount(files);
  }

  /**
   * Get the URL for a running server
   */
  onServerReady(callback: (port: number, url: string) => void): void {
    this.boot().then((container) => {
      container.on('server-ready', (port, url) => {
        callback(port, url);
      });
    });
  }

  /**
   * Set output callback
   */
  onOutput(callback: (data: string) => void): void {
    this.onOutputCallback = callback;
  }

  /**
   * Set error callback
   */
  onError(callback: (data: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set ready callback
   */
  onReady(callback: () => void): void {
    this.onReadyCallback = callback;
  }

  /**
   * Check if container is ready
   */
  isReady(): boolean {
    return this.webcontainer !== null;
  }

  /**
   * Get container instance (may be null if not booted)
   */
  getContainer(): WebContainer | null {
    return this.webcontainer;
  }

  /**
   * Teardown the container
   */
  async teardown(): Promise<void> {
    if (this.webcontainer) {
      this.killCurrentProcess();
      await this.webcontainer.teardown();
      this.webcontainer = null;
    }
  }
}

// Export singleton instance
export const webContainerService = WebContainerService.getInstance();
export { WebContainerService };
