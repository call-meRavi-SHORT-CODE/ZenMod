/**
 * Agent Service
 * 
 * Core orchestration for the AI coding agent.
 * Handles prompt processing, context building, and action execution.
 */

import { unifiedFS, FileNode } from '../unified-filesystem';
import { useProjectStore, TechStack, Project } from '../stores/project-store';
import { llmClient } from './llm-client';
import {
    Message,
    AgentEvent,
    AgentEventType,
    AgentResponse,
    FileOperation
} from './types';

// Re-export types
export type { AgentEvent, AgentEventType, AgentResponse, FileOperation };

export interface AgentContext {
    project: Project | null;
    fileTree: FileNode[];
    techStack: TechStack;
    conversationHistory: Message[];
    relevantFiles: Map<string, string>;
}

// ============================================================================
// Agent Service
// ============================================================================

class AgentService {
    private static instance: AgentService;
    private conversationHistory: Message[] = [];
    private isProcessing = false;
    private abortController: AbortController | null = null;

    private constructor() { }

    static getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService();
        }
        return AgentService.instance;
    }

    // --------------------------------------------------------------------------
    // Main Entry Point
    // --------------------------------------------------------------------------

    async *processPrompt(prompt: string): AsyncGenerator<AgentEvent> {
        if (this.isProcessing) {
            yield { type: 'error', content: 'Already processing a request' };
            return;
        }

        this.isProcessing = true;
        this.abortController = new AbortController();

        try {
            // Add user message to history
            this.conversationHistory.push({ role: 'user', content: prompt });

            // Step 1: Thinking
            yield { type: 'thinking', content: 'Analyzing your request...' };

            // Step 2: Build context
            const context = await this.buildContext(prompt);
            yield { type: 'thinking', content: 'Understanding project structure...' };

            // Step 3: Generate plan
            yield { type: 'planning', content: 'Planning changes...' };
            const response = await this.generateResponse(prompt, context);

            // Step 4: Execute file operations
            for (const op of response.fileOperations) {
                if (this.abortController.signal.aborted) {
                    yield { type: 'error', content: 'Operation cancelled' };
                    return;
                }

                yield { type: op.type === 'create' ? 'file-create' : op.type === 'modify' ? 'file-modify' : 'file-delete', path: op.path, content: op.content };

                try {
                    await this.executeFileOperation(op);
                } catch (error) {
                    yield { type: 'error', content: `Failed to ${op.type} ${op.path}: ${error}` };
                }
            }

            // Step 5: Execute terminal commands
            for (const command of response.commands) {
                if (this.abortController.signal.aborted) {
                    yield { type: 'error', content: 'Operation cancelled' };
                    return;
                }

                yield { type: 'terminal-command', command };
                // Note: Terminal execution happens in the UI layer
            }

            // Step 6: Send response message
            yield { type: 'message', content: response.message };

            // Add assistant response to history
            this.conversationHistory.push({ role: 'assistant', content: response.message });

            // Complete
            yield { type: 'complete' };

        } catch (error) {
            yield { type: 'error', content: error instanceof Error ? error.message : 'Unknown error' };
        } finally {
            this.isProcessing = false;
            this.abortController = null;
        }
    }

    cancel(): void {
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    // --------------------------------------------------------------------------
    // Context Building
    // --------------------------------------------------------------------------

    private async buildContext(prompt: string): Promise<AgentContext> {
        const projectStore = useProjectStore.getState();
        const fileTree = unifiedFS.getFileTree();
        const techStack = await projectStore.detectTechStack();

        // Get relevant files based on prompt
        const relevantFiles = await this.getRelevantFiles(prompt, fileTree);

        return {
            project: projectStore.currentProject,
            fileTree,
            techStack,
            conversationHistory: this.conversationHistory.slice(-10), // Last 10 messages
            relevantFiles,
        };
    }

    private async getRelevantFiles(prompt: string, fileTree: FileNode[]): Promise<Map<string, string>> {
        const relevantFiles = new Map<string, string>();
        const promptLower = prompt.toLowerCase();

        // Keywords that suggest we need to read files
        const keywords = ['modify', 'update', 'change', 'edit', 'fix', 'add to', 'improve'];
        const needsExistingFiles = keywords.some(k => promptLower.includes(k));

        // Always include key config files
        const configFiles = ['/package.json', '/tsconfig.json', '/vite.config.js', '/vite.config.ts'];

        for (const path of configFiles) {
            try {
                const content = await unifiedFS.readFile(path);
                relevantFiles.set(path, content);
            } catch {
                // File doesn't exist
            }
        }

        // If modifying, try to find relevant source files
        if (needsExistingFiles) {
            const allFiles = this.flattenFileTree(fileTree);
            const sourceFiles = allFiles.filter(f =>
                f.endsWith('.jsx') || f.endsWith('.tsx') ||
                f.endsWith('.js') || f.endsWith('.ts') ||
                f.endsWith('.css')
            );

            // Read up to 5 most relevant source files
            for (const path of sourceFiles.slice(0, 5)) {
                try {
                    const content = await unifiedFS.readFile(path);
                    relevantFiles.set(path, content);
                } catch {
                    // Skip files that can't be read
                }
            }
        }

        return relevantFiles;
    }

    private flattenFileTree(nodes: FileNode[], prefix = ''): string[] {
        const files: string[] = [];

        for (const node of nodes) {
            const path = prefix ? `${prefix}/${node.name}` : `/${node.name}`;
            if (node.type === 'file') {
                files.push(path);
            } else if (node.children) {
                files.push(...this.flattenFileTree(node.children, path));
            }
        }

        return files;
    }

    // --------------------------------------------------------------------------
    // LLM Response Generation
    // --------------------------------------------------------------------------

    private async generateResponse(prompt: string, context: AgentContext): Promise<AgentResponse> {
        const systemPrompt = this.buildSystemPrompt(context);

        const messages: Message[] = [
            ...context.conversationHistory,
        ];

        try {
            const response = await llmClient.generateStructuredResponse(systemPrompt, messages);
            return response;
        } catch (error) {
            // Fallback: Parse as simple response
            return {
                message: 'I understand your request. Let me help you with that.',
                fileOperations: [],
                commands: [],
            };
        }
    }

    private buildSystemPrompt(context: AgentContext): string {
        const fileTreeStr = this.formatFileTree(context.fileTree);
        const relevantFilesStr = this.formatRelevantFiles(context.relevantFiles);

        return `You are ZenMod AI, an expert coding assistant that helps users build web applications.

## Current Project Context

**Tech Stack:**
- Framework: ${context.techStack.framework}
- Language: ${context.techStack.language}
- Styling: ${context.techStack.styling}
- Package Manager: ${context.techStack.packageManager}

**File Structure:**
\`\`\`
${fileTreeStr}
\`\`\`

${relevantFilesStr ? `**Relevant Files:**\n${relevantFilesStr}` : ''}

## Design & Implementation Instructions

For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

Use icons from lucide-react for logos.

## Your Capabilities

1. **Create Files**: Generate new files with production-ready code
2. **Modify Files**: Update existing files with precise changes
3. **Delete Files**: Remove unnecessary files
4. **Run Commands**: Execute terminal commands like npm install, npm run dev

## Response Format

You MUST respond with valid JSON in this exact format:
\`\`\`json
{
  "thinking": "Brief explanation of your reasoning",
  "message": "User-friendly response explaining what you did",
  "fileOperations": [
    {
      "type": "create" | "modify" | "delete",
      "path": "/absolute/path/to/file",
      "content": "full file content for create/modify"
    }
  ],
  "commands": ["npm install", "npm run dev"]
}
\`\`\`

## Rules

1. Always use absolute paths starting with /
2. Generate complete, working code - no placeholders or TODOs
3. Follow modern best practices for the detected tech stack
4. Keep existing code when modifying - only change what's necessary
5. Include proper error handling and edge cases
6. Use TypeScript if the project uses TypeScript
7. Match existing code style and patterns`;
    }

    private formatFileTree(nodes: FileNode[], indent = ''): string {
        let result = '';
        for (const node of nodes) {
            result += `${indent}${node.type === 'directory' ? '📁' : '📄'} ${node.name}\n`;
            if (node.children) {
                result += this.formatFileTree(node.children, indent + '  ');
            }
        }
        return result;
    }

    private formatRelevantFiles(files: Map<string, string>): string {
        if (files.size === 0) return '';

        let result = '';
        for (const [path, content] of files) {
            // Truncate large files
            const truncatedContent = content.length > 2000
                ? content.slice(0, 2000) + '\n... (truncated)'
                : content;
            result += `\n### ${path}\n\`\`\`\n${truncatedContent}\n\`\`\`\n`;
        }
        return result;
    }

    // --------------------------------------------------------------------------
    // File Operations
    // --------------------------------------------------------------------------

    private async executeFileOperation(op: FileOperation): Promise<void> {
        switch (op.type) {
            case 'create':
            case 'modify':
                if (op.content !== undefined) {
                    // Ensure parent directory exists
                    const parentDir = op.path.substring(0, op.path.lastIndexOf('/'));
                    if (parentDir && parentDir !== '/') {
                        try {
                            await unifiedFS.mkdir(parentDir);
                        } catch {
                            // Directory might already exist
                        }
                    }
                    await unifiedFS.writeFile(op.path, op.content);
                }
                break;
            case 'delete':
                await unifiedFS.rm(op.path, { recursive: true });
                break;
        }
    }

    // --------------------------------------------------------------------------
    // History Management
    // --------------------------------------------------------------------------

    clearHistory(): void {
        this.conversationHistory = [];
    }

    getHistory(): Message[] {
        return [...this.conversationHistory];
    }
}

// Export singleton
export const agentService = AgentService.getInstance();
export { AgentService };
