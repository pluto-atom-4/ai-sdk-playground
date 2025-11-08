import { tool } from 'ai';
import { Sandbox } from '@e2b/code-interpreter';
import { z } from 'zod';

let sandbox: Sandbox | undefined;

async function ensureSandbox() {
  if (!sandbox) {
    sandbox = await Sandbox.create();
  }
  return sandbox;
}

export const e2bTools = {
  computer: tool({
    description:
      'Execute JavaScript code in a sandboxed environment. ' +
      'Use this tool to run code, perform calculations, analyze data, or execute any programming task. ' +
      'The code runs in a stateful Jupyter notebook environment.',
    parameters: z.object({
      code: z.string().describe('The JavaScript code to execute'),
    }),
    execute: async ({ code }) => {
      const sbx = await ensureSandbox();
      const execution = await sbx.runCode(code);

      if (execution.error) {
        return {
          success: false,
          error: execution.error.name + ': ' + execution.error.value,
        };
      }

      return {
        success: true,
        results: execution.results,
        logs: execution.logs,
      };
    },
  }),
};

export async function cleanupSandbox() {
  if (sandbox) {
    await sandbox.close();
    sandbox = undefined;
  }
}

