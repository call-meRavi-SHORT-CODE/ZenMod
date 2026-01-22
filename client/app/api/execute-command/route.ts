/**
 * API route handler for executing shell commands.
 * 
 * NOTE: This route is kept for backwards compatibility.
 * The terminal now uses WebContainers for browser-based sandbox execution.
 * Commands run entirely in the browser, not on this server.
 * 
 * This route can still be used for:
 * - Fallback execution when WebContainers are not supported
 * - Server-side command execution if needed
 */

import { NextResponse } from 'next/server';

// Commands that are not allowed for security reasons
const FORBIDDEN_COMMANDS = [
  'rm -rf /',
  'rm -rf ~',
  'rm -rf *',
  'format',
  'fdisk',
  'mkfs',
  'dd if=',
  'shutdown',
  'reboot',
  'halt',
  'poweroff',
  'init 0',
  'init 6',
  'passwd',
  'chmod 777',
  'useradd',
  'userdel',
  'groupadd',
  'groupdel',
  ':(){:|:&};:',
  'fork bomb',
];

// Commands that are allowed (whitelist approach for better security)
const ALLOWED_COMMANDS = [
  'ls',
  'dir',
  'pwd',
  'cd',
  'cat',
  'head',
  'tail',
  'grep',
  'find',
  'which',
  'npm',
  'yarn',
  'pnpm',
  'node',
  'python',
  'python3',
  'pip',
  'pip3',
  'git',
  'git status',
  'git log',
  'git diff',
  'git branch',
  'git remote',
  'echo',
  'touch',
  'mkdir',
  'rm',
  'cp',
  'mv',
  'chmod',
  'chown',
  'ps',
  'top',
  'htop',
  'df',
  'du',
  'free',
  'uname',
  'whoami',
  'id',
  'curl',
  'wget',
  'ping',
  'nslookup',
  'dig',
  'gcc',
  'g++',
  'make',
  'cmake',
  'gdb',
  'vim',
  'nano',
  'emacs',
  'code',
  'subl',
  'docker',
  'docker ps',
  'docker images',
  'docker logs',
  'kubectl',
  'kubectl get',
  'kubectl describe',
  'aws',
  'gcloud',
  'az',
  'npm install',
  'npm run',
  'npm test',
  'npm build',
  'npm list',
  'npm audit',
  'yarn install',
  'yarn add',
  'yarn run',
  'yarn test',
  'yarn build',
  'pnpm install',
  'pnpm add',
  'pnpm run',
  'pnpm test',
  'pnpm build',
  'pip install',
  'pip3 install',
  'pip list',
  'pip3 list',
  'pip show',
  'pip3 show',
  'pip freeze',
  'pip3 freeze',
  'pip uninstall',
  'pip3 uninstall',
  'clear',
  'cls',
  'type',
  'more',
  'less',
  'tree',
  'where',
  'set',
  'env',
  'printenv',
  'export',
  'date',
  'time',
  'hostname',
  'ipconfig',
  'ifconfig',
  'netstat',
  'tracert',
  'traceroute',
  'ssh',
  'scp',
  'rsync',
  'tar',
  'zip',
  'unzip',
  'gzip',
  'gunzip',
  'bzip2',
  'bunzip2',
  '7z',
  'npx',
  'bunx',
  'bun',
  'deno',
  'cargo',
  'rustc',
  'go',
  'dotnet',
  'java',
  'javac',
  'mvn',
  'gradle',
  'composer',
  'php',
  'ruby',
  'gem',
  'bundle',
  'rails',
  'flutter',
  'dart',
  'swift',
  'xcodebuild',
  'powershell',
  'pwsh',
  'cmd',
];

interface RequestBody {
  command: string;
}

function isCommandAllowed(command: string): boolean {
  const cmd = command.trim().toLowerCase();

  // Check forbidden commands
  for (const forbidden of FORBIDDEN_COMMANDS) {
    if (cmd.includes(forbidden.toLowerCase())) {
      return false;
    }
  }

  // Check allowed commands (support partial matches for commands with arguments)
  for (const allowed of ALLOWED_COMMANDS) {
    if (cmd.startsWith(allowed.toLowerCase())) {
      return true;
    }
  }

  // Allow basic file operations with specific patterns
  if (
    cmd.match(
      /^(ls|dir|cat|head|tail|grep|find|which|echo|touch|mkdir|rm|cp|mv|chmod|chown|type|more|less|tree|where)\s+/,
    )
  ) {
    return true;
  }

  // Allow pip and npm commands with arguments
  if (cmd.match(/^(pip|pip3|npm|yarn|pnpm|bun|npx|bunx)\s+/)) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    // Validate request body
    if (!body.command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 },
      );
    }

    const command = body.command.trim();

    // Security check
    if (!isCommandAllowed(command)) {
      return NextResponse.json(
        { error: 'Command not allowed for security reasons' },
        { status: 403 },
      );
    }

    // Return a message directing users to use WebContainers
    // The terminal component now executes commands client-side
    return NextResponse.json({
      output: '',
      error: 'This API endpoint is deprecated. Commands now run in browser-based WebContainers sandbox.',
      exitCode: 0,
      executionTime: 0,
      command,
      sandbox: true,
      message: 'Please use the terminal component which runs commands in WebContainers.',
    });
  } catch (error) {
    console.error('Command execution error:', error);
    return NextResponse.json(
      { error: 'Failed to process command request' },
      { status: 500 },
    );
  }
}
