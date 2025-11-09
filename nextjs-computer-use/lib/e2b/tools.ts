import { z } from 'zod';
import { Sandbox } from 'e2b';

let currentSandbox: Sandbox | null = null;

// Initialize sandbox
async function initSandbox(): Promise<Sandbox> {
  if (!currentSandbox) {
    currentSandbox = await Sandbox.create('base');
  }
  return currentSandbox;
}

// Cleanup sandbox
export async function cleanupSandbox(): Promise<void> {
  if (currentSandbox) {
    await currentSandbox.kill();
    currentSandbox = null;
  }
}

// Export tools using raw schema format compatible with AI SDK v5
export const e2bTools = {
  executeCode: {
    type: 'function',
    function: {
      name: 'executeCode',
      description: 'Execute code in a secure sandbox environment',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The code to execute'
          },
          language: {
            type: 'string',
            description: 'Programming language (bash, python, etc.)',
            default: 'bash'
          }
        },
        required: ['code']
      }
    }
  },

  writeFile: {
    type: 'function',
    function: {
      name: 'writeFile',
      description: 'Write content to a file in the sandbox',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path to write to'
          },
          content: {
            type: 'string',
            description: 'Content to write to the file'
          }
        },
        required: ['path', 'content']
      }
    }
  },

  readFile: {
    type: 'function',
    function: {
      name: 'readFile',
      description: 'Read content from a file in the sandbox',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path to read from'
          }
        },
        required: ['path']
      }
    }
  },

  listFiles: {
    type: 'function',
    function: {
      name: 'listFiles',
      description: 'List files and directories in the sandbox',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory path to list (default: current directory)',
            default: '.'
          }
        },
        required: []
      }
    }
  }
};

// Tool execution functions
export const toolExecutors = {
  executeCode: async ({ code, language = 'bash' }: { code: string; language?: string }) => {
    try {
      const sandbox = await initSandbox();

      let cmd: string;
      if (language === 'python') {
        cmd = `python3 -c "${code.replace(/"/g, '\\"')}"`;
      } else {
        cmd = code;
      }

      const result = await sandbox.commands.run(cmd);

      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  writeFile: async ({ path, content }: { path: string; content: string }) => {
    try {
      const sandbox = await initSandbox();
      await sandbox.files.write(path, content);

      return {
        success: true,
        message: `File written to ${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  readFile: async ({ path }: { path: string }) => {
    try {
      const sandbox = await initSandbox();
      const content = await sandbox.files.read(path);

      return {
        success: true,
        content: content,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  listFiles: async ({ path = '.' }: { path?: string }) => {
    try {
      const sandbox = await initSandbox();
      const result = await sandbox.commands.run(`ls -la ${path}`);

      return {
        success: true,
        output: result.stdout,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
