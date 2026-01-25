/**
 * LLM Client
 * 
 * Handles communication with LLM providers.
 * Supports multiple providers and structured response parsing.
 */

import { AgentResponse, Message, LLMConfig } from './types';

// ============================================================================
// Types
// ============================================================================

export type { Message, LLMConfig };

interface StreamChunk {
    content: string;
    done: boolean;
}

// ============================================================================
// Default Config (from localStorage)
// ============================================================================

function getStoredConfig(): LLMConfig {
    if (typeof window === 'undefined') {
        return {
            provider: 'openai',
            model: 'gpt-4o',
            maxTokens: 4096,
            temperature: 0.7,
        };
    }

    try {
        const stored = localStorage.getItem('zenmod-llm-config');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore parse errors
    }

    return {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 4096,
        temperature: 0.7,
    };
}

// ============================================================================
// LLM Client
// ============================================================================

class LLMClient {
    private static instance: LLMClient;
    private config: LLMConfig;

    private constructor() {
        this.config = getStoredConfig();
    }

    static getInstance(): LLMClient {
        if (!LLMClient.instance) {
            LLMClient.instance = new LLMClient();
        }
        return LLMClient.instance;
    }

    // --------------------------------------------------------------------------
    // Configuration
    // --------------------------------------------------------------------------

    setConfig(config: Partial<LLMConfig>): void {
        this.config = { ...this.config, ...config };

        if (typeof window !== 'undefined') {
            localStorage.setItem('zenmod-llm-config', JSON.stringify(this.config));
        }
    }

    getConfig(): LLMConfig {
        return { ...this.config };
    }

    // --------------------------------------------------------------------------
    // Structured Response
    // --------------------------------------------------------------------------

    async generateStructuredResponse(
        systemPrompt: string,
        messages: Message[]
    ): Promise<AgentResponse> {
        const fullMessages: Message[] = [
            { role: 'system', content: systemPrompt },
            ...messages,
        ];

        const response = await this.callLLM(fullMessages);
        return this.parseAgentResponse(response);
    }

    // --------------------------------------------------------------------------
    // Streaming Response
    // --------------------------------------------------------------------------

    async *streamResponse(
        systemPrompt: string,
        messages: Message[]
    ): AsyncGenerator<string> {
        const fullMessages: Message[] = [
            { role: 'system', content: systemPrompt },
            ...messages,
        ];

        for await (const chunk of this.streamLLM(fullMessages)) {
            yield chunk.content;
        }
    }

    // --------------------------------------------------------------------------
    // Provider Implementations
    // --------------------------------------------------------------------------

    private async callLLM(messages: Message[]): Promise<string> {
        switch (this.config.provider) {
            case 'openai':
                return this.callOpenAI(messages);
            case 'anthropic':
                return this.callAnthropic(messages);
            case 'gemini':
                return this.callGemini(messages);
            case 'local':
                return this.callLocal(messages);
            default:
                throw new Error(`Unknown provider: ${this.config.provider}`);
        }
    }

    private async *streamLLM(messages: Message[]): AsyncGenerator<StreamChunk> {
        switch (this.config.provider) {
            case 'openai':
                yield* this.streamOpenAI(messages);
                break;
            case 'anthropic':
                yield* this.streamAnthropic(messages);
                break;
            default:
                // Fallback to non-streaming
                const response = await this.callLLM(messages);
                yield { content: response, done: true };
        }
    }

    // --------------------------------------------------------------------------
    // OpenAI
    // --------------------------------------------------------------------------

    private async callOpenAI(messages: Message[]): Promise<string> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model || 'gpt-4o',
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                max_tokens: this.config.maxTokens || 4096,
                temperature: this.config.temperature || 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    private async *streamOpenAI(messages: Message[]): AsyncGenerator<StreamChunk> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model || 'gpt-4o',
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                max_tokens: this.config.maxTokens || 4096,
                temperature: this.config.temperature || 0.7,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error('OpenAI streaming error');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        yield { content: '', done: true };
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        if (content) {
                            yield { content, done: false };
                        }
                    } catch {
                        // Ignore parse errors
                    }
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // Anthropic
    // --------------------------------------------------------------------------

    private async callAnthropic(messages: Message[]): Promise<string> {
        const systemMessage = messages.find(m => m.role === 'system');
        const otherMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey || '',
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.config.model || 'claude-3-5-sonnet-20241022',
                max_tokens: this.config.maxTokens || 4096,
                system: systemMessage?.content,
                messages: otherMessages.map(m => ({ role: m.role, content: m.content })),
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Anthropic API error');
        }

        const data = await response.json();
        return data.content[0].text;
    }

    private async *streamAnthropic(messages: Message[]): AsyncGenerator<StreamChunk> {
        const systemMessage = messages.find(m => m.role === 'system');
        const otherMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey || '',
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.config.model || 'claude-3-5-sonnet-20241022',
                max_tokens: this.config.maxTokens || 4096,
                system: systemMessage?.content,
                messages: otherMessages.map(m => ({ role: m.role, content: m.content })),
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error('Anthropic streaming error');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const parsed = JSON.parse(line.slice(6));
                        if (parsed.type === 'content_block_delta') {
                            yield { content: parsed.delta.text, done: false };
                        } else if (parsed.type === 'message_stop') {
                            yield { content: '', done: true };
                            return;
                        }
                    } catch {
                        // Ignore parse errors
                    }
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // Gemini
    // --------------------------------------------------------------------------

    private async callGemini(messages: Message[]): Promise<string> {
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API error');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // --------------------------------------------------------------------------
    // Local (Ollama, LM Studio, etc.)
    // --------------------------------------------------------------------------

    private async callLocal(messages: Message[]): Promise<string> {
        const baseUrl = this.config.baseUrl || 'http://localhost:11434';

        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.config.model || 'llama2',
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error('Local LLM error');
        }

        const data = await response.json();
        return data.message.content;
    }

    // --------------------------------------------------------------------------
    // Response Parsing
    // --------------------------------------------------------------------------

    private parseAgentResponse(response: string): AgentResponse {
        // Try to extract JSON from response
        const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);

        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch {
                // Fall through to plain text parsing
            }
        }

        // Try to parse as direct JSON
        try {
            const parsed = JSON.parse(response);
            if (typeof parsed === 'object' && parsed.message) {
                return parsed;
            }
        } catch {
            // Fall through
        }

        // Fallback: treat as plain text message
        return {
            message: response,
            fileOperations: [],
            commands: [],
        };
    }
}

// Export singleton
export const llmClient = LLMClient.getInstance();
export { LLMClient };
