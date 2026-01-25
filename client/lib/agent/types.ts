/**
 * Agent Types
 * 
 * Shared types for the agent module to avoid circular dependencies.
 */

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// ============================================================================
// Agent Event Types
// ============================================================================

export type AgentEventType =
    | 'thinking'
    | 'planning'
    | 'file-create'
    | 'file-modify'
    | 'file-delete'
    | 'terminal-command'
    | 'terminal-output'
    | 'message'
    | 'complete'
    | 'error';

export interface AgentEvent {
    type: AgentEventType;
    content?: string;
    path?: string;
    diff?: string;
    command?: string;
    output?: string;
}

// ============================================================================
// File Operation Types
// ============================================================================

export interface FileOperation {
    type: 'create' | 'modify' | 'delete';
    path: string;
    content?: string;
}

// ============================================================================
// Agent Response Types
// ============================================================================

export interface AgentResponse {
    thinking?: string;
    message: string;
    fileOperations: FileOperation[];
    commands: string[];
}

// ============================================================================
// LLM Config Types
// ============================================================================

export interface LLMConfig {
    provider: 'openai' | 'anthropic' | 'gemini' | 'local';
    apiKey?: string;
    model: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
}
