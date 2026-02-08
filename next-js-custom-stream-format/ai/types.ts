import { ModelMessage } from 'ai';

/**
 * Type definitions for manual agent loop pattern
 */

export interface ToolResult {
  toolName: string;
  toolCallId: string;
  type: 'tool-result';
  output: { type: 'text'; value: unknown };
}

export interface ToolMessage {
  role: 'tool';
  content: ToolResult[];
}

/**
 * Builds a tool result message for the conversation history
 */
export function createToolResultMessage(
  toolName: string,
  toolCallId: string,
  output: unknown,
): ToolMessage {
  return {
    role: 'tool',
    content: [
      {
        toolName,
        toolCallId,
        type: 'tool-result',
        output: { type: 'text', value: output },
      },
    ],
  };
}

/**
 * Represents a single step in the manual agent loop
 */
export interface AgentLoopStep {
  stepNumber: number;
  finishReason: string;
  toolCalls?: Array<{
    toolName: string;
    toolCallId: string;
    input: unknown;
  }>;
  messages: ModelMessage[];
}

/**
 * Handles custom logging or monitoring during agent loop execution
 */
export interface AgentLoopHooks {
  onStepStart?: (stepNumber: number) => void;
  onStepEnd?: (step: AgentLoopStep) => void;
  onToolCall?: (toolName: string, input: unknown) => void;
  onToolResult?: (toolName: string, result: unknown) => void;
  onLoopComplete?: (finalMessages: ModelMessage[]) => void;
}

/**
 * Configuration for manual agent loop
 */
export interface AgentLoopConfig {
  maxSteps?: number;
  hooks?: AgentLoopHooks;
}

/**
 * Default configuration for agent loop
 */
export const DEFAULT_AGENT_LOOP_CONFIG: Required<AgentLoopConfig> = {
  maxSteps: 10,
  hooks: {},
};

