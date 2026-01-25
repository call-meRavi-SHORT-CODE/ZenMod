/**
 * Agent Store
 * 
 * Zustand store for agent state and chat interface.
 */

import { create } from 'zustand';
import { agentService, AgentEvent } from './agent-service';
import { webContainerService } from '../webcontainer-service';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    fileOperations?: Array<{
        type: 'create' | 'modify' | 'delete';
        path: string;
    }>;
    commands?: string[];
    isStreaming?: boolean;
}

interface AgentState {
    // State
    messages: ChatMessage[];
    isProcessing: boolean;
    currentStatus: string | null;
    pendingCommands: string[];

    // Actions
    sendMessage: (content: string) => Promise<void>;
    cancelRequest: () => void;
    clearMessages: () => void;
    executeCommand: (command: string) => Promise<void>;
}

function generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useAgentStore = create<AgentState>((set, get) => ({
    messages: [],
    isProcessing: false,
    currentStatus: null,
    pendingCommands: [],

    sendMessage: async (content: string) => {
        const { isProcessing } = get();
        if (isProcessing) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        set(state => ({
            messages: [...state.messages, userMessage],
            isProcessing: true,
            currentStatus: 'Thinking...',
        }));

        // Create placeholder for assistant response
        const assistantMessageId = generateId();
        const assistantMessage: ChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            fileOperations: [],
            commands: [],
            isStreaming: true,
        };

        set(state => ({
            messages: [...state.messages, assistantMessage],
        }));

        try {
            // Process with agent
            for await (const event of agentService.processPrompt(content)) {
                const { messages } = get();
                const currentAssistantIdx = messages.findIndex(m => m.id === assistantMessageId);

                if (currentAssistantIdx === -1) continue;

                switch (event.type) {
                    case 'thinking':
                    case 'planning':
                        set({ currentStatus: event.content || null });
                        break;

                    case 'file-create':
                    case 'file-modify':
                    case 'file-delete':
                        // Update file operations in the message
                        set(state => {
                            const newMessages = [...state.messages];
                            const msg = newMessages[currentAssistantIdx];
                            if (msg) {
                                msg.fileOperations = [
                                    ...(msg.fileOperations || []),
                                    { type: event.type.replace('file-', '') as 'create' | 'modify' | 'delete', path: event.path || '' }
                                ];
                            }
                            return { messages: newMessages };
                        });
                        break;

                    case 'terminal-command':
                        if (event.command) {
                            set(state => {
                                const newMessages = [...state.messages];
                                const msg = newMessages[currentAssistantIdx];
                                if (msg) {
                                    msg.commands = [...(msg.commands || []), event.command!];
                                }
                                return {
                                    messages: newMessages,
                                    pendingCommands: [...state.pendingCommands, event.command!],
                                };
                            });
                        }
                        break;

                    case 'message':
                        set(state => {
                            const newMessages = [...state.messages];
                            const msg = newMessages[currentAssistantIdx];
                            if (msg) {
                                msg.content = event.content || '';
                            }
                            return { messages: newMessages };
                        });
                        break;

                    case 'complete':
                        set(state => {
                            const newMessages = [...state.messages];
                            const msg = newMessages[currentAssistantIdx];
                            if (msg) {
                                msg.isStreaming = false;
                            }
                            return {
                                messages: newMessages,
                                isProcessing: false,
                                currentStatus: null,
                            };
                        });
                        break;

                    case 'error':
                        set(state => {
                            const newMessages = [...state.messages];
                            const msg = newMessages[currentAssistantIdx];
                            if (msg) {
                                msg.content = `Error: ${event.content}`;
                                msg.isStreaming = false;
                            }
                            return {
                                messages: newMessages,
                                isProcessing: false,
                                currentStatus: null,
                            };
                        });
                        break;
                }
            }
        } catch (error) {
            set(state => {
                const newMessages = [...state.messages];
                const msg = newMessages.find(m => m.id === assistantMessageId);
                if (msg) {
                    msg.content = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    msg.isStreaming = false;
                }
                return {
                    messages: newMessages,
                    isProcessing: false,
                    currentStatus: null,
                };
            });
        }
    },

    cancelRequest: () => {
        agentService.cancel();
        set({ isProcessing: false, currentStatus: null });
    },

    clearMessages: () => {
        agentService.clearHistory();
        set({ messages: [], pendingCommands: [] });
    },

    executeCommand: async (command: string) => {
        try {
            await webContainerService.executeCommand(command);
            // Remove from pending
            set(state => ({
                pendingCommands: state.pendingCommands.filter(c => c !== command),
            }));
        } catch (error) {
            console.error('[AgentStore] Command execution failed:', error);
        }
    },
}));
