import { describe, it, expect } from 'vitest';
import {
  ToolResult,
  ToolMessage,
  createToolResultMessage,
  AgentLoopStep,
  AgentLoopHooks,
  AgentLoopConfig,
  DEFAULT_AGENT_LOOP_CONFIG,
} from './types';

describe('ai/types - Happy Path Tests', () => {
  describe('ToolResult interface', () => {
    it('should create valid tool result', () => {
      const result: ToolResult = {
        toolName: 'getWeather',
        toolCallId: 'call-123',
        type: 'tool-result',
        output: { type: 'text', value: { temperature: 72 } },
      };

      expect(result.toolName).toBe('getWeather');
      expect(result.toolCallId).toBe('call-123');
      expect(result.type).toBe('tool-result');
      expect(result.output.type).toBe('text');
      expect(result.output.value).toEqual({ temperature: 72 });
    });
  });

  describe('ToolMessage interface', () => {
    it('should create valid tool message', () => {
      const message: ToolMessage = {
        role: 'tool',
        content: [
          {
            toolName: 'calculate',
            toolCallId: 'call-456',
            type: 'tool-result',
            output: { type: 'text', value: 42 },
          },
        ],
      };

      expect(message.role).toBe('tool');
      expect(message.content).toHaveLength(1);
      expect(message.content[0].toolName).toBe('calculate');
    });
  });

  describe('createToolResultMessage function', () => {
    it('should create valid tool result message', () => {
      const message = createToolResultMessage(
        'getWeather',
        'call-123',
        { temperature: 72, conditions: 'sunny' }
      );

      expect(message.role).toBe('tool');
      expect(message.content).toHaveLength(1);
      expect(message.content[0].toolName).toBe('getWeather');
      expect(message.content[0].toolCallId).toBe('call-123');
      expect(message.content[0].type).toBe('tool-result');
    });

    it('should store output correctly', () => {
      const output = { result: 42 };
      const message = createToolResultMessage('calculate', 'call-456', output);

      expect(message.content[0].output.type).toBe('text');
      expect(message.content[0].output.value).toEqual(output);
    });

    it('should handle complex output objects', () => {
      const complexOutput = {
        location: 'NYC',
        temperature: 72,
        conditions: 'sunny',
        timestamp: new Date().toISOString(),
      };
      const message = createToolResultMessage('getWeather', 'call-789', complexOutput);

      expect(message.content[0].output.value).toEqual(complexOutput);
    });
  });

  describe('AgentLoopStep interface', () => {
    it('should create valid agent loop step', () => {
      const step: AgentLoopStep = {
        stepNumber: 1,
        finishReason: 'tool-calls',
        toolCalls: [
          {
            toolName: 'getWeather',
            toolCallId: 'call-123',
            input: { location: 'NYC' },
          },
        ],
        messages: [],
      };

      expect(step.stepNumber).toBe(1);
      expect(step.finishReason).toBe('tool-calls');
      expect(step.toolCalls).toHaveLength(1);
    });
  });

  describe('AgentLoopHooks interface', () => {
    it('should support all hook callbacks', () => {
      const hooks: AgentLoopHooks = {
        onStepStart: (step) => console.log(`Step ${step} started`),
        onStepEnd: (step) => console.log(`Step ${step.stepNumber} ended`),
        onToolCall: (name, input) => console.log(`Calling ${name}`),
        onToolResult: (name, result) => console.log(`${name} returned`),
        onLoopComplete: (messages) => console.log('Loop complete'),
      };

      expect(hooks.onStepStart).toBeTruthy();
      expect(hooks.onStepEnd).toBeTruthy();
      expect(hooks.onToolCall).toBeTruthy();
      expect(hooks.onToolResult).toBeTruthy();
      expect(hooks.onLoopComplete).toBeTruthy();
    });

    it('should allow partial hooks', () => {
      const partialHooks: AgentLoopHooks = {
        onToolCall: (name, input) => {},
        onToolResult: (name, result) => {},
      };

      expect(partialHooks.onToolCall).toBeTruthy();
      expect(partialHooks.onToolResult).toBeTruthy();
      expect(partialHooks.onStepStart).toBeUndefined();
    });
  });

  describe('AgentLoopConfig interface', () => {
    it('should create valid agent loop config', () => {
      const config: AgentLoopConfig = {
        maxSteps: 5,
        hooks: {
          onStepStart: () => {},
          onToolCall: () => {},
        },
      };

      expect(config.maxSteps).toBe(5);
      expect(config.hooks).toBeDefined();
      expect(config.hooks?.onStepStart).toBeTruthy();
    });

    it('should allow empty config', () => {
      const config: AgentLoopConfig = {};
      expect(config).toBeDefined();
    });
  });

  describe('DEFAULT_AGENT_LOOP_CONFIG', () => {
    it('should have default configuration', () => {
      expect(DEFAULT_AGENT_LOOP_CONFIG.maxSteps).toBe(10);
      expect(DEFAULT_AGENT_LOOP_CONFIG.hooks).toBeDefined();
      expect(typeof DEFAULT_AGENT_LOOP_CONFIG.hooks).toBe('object');
    });

    it('should be properly typed', () => {
      const config: Required<AgentLoopConfig> = DEFAULT_AGENT_LOOP_CONFIG;
      expect(config.maxSteps).toBeGreaterThan(0);
      expect(config.hooks).not.toBeNull();
    });
  });
});