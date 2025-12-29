# MCP Server Implementation Plan

## Project Overview

This document outlines the implementation plan for building a multi-transport MCP (Model Context Protocol) server that supports Stdio, SSE (Server-Sent Events), and HTTP Stream protocols. The server will be integrated with the Next.js application to handle AI tool invocations through multiple communication channels.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
│              (app/api/completion/route.ts)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ (unified connection)
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ┌─────────────┐           ┌──────────────────────┐
    │ MCP Server  │           │  Client Connections  │
    │   (Core)    │◄──────────│  (Stdio/SSE/HTTP)    │
    └─────────────┘           └──────────────────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
    ┌─────────────┐                      ┌──────────────────┐
    │  Transport  │                      │  Tool Registry   │
    │  Handlers   │                      │  & Resources     │
    └─────────────┘                      └──────────────────┘
```

## Phase 1: MCP Server Foundation

### 1.1 Create Server Project Structure

Create the following directory structure in `server/`:

```
server/
├── src/
│   ├── index.ts                      # Main exports
│   ├── mcp-server.ts                 # Core MCP server logic
│   ├── tools/
│   │   ├── index.ts                  # Tool registry
│   │   └── example-tools.ts          # Example tool definitions
│   ├── transports/
│   │   ├── index.ts                  # Transport exports
│   │   ├── stdio.ts                  # Stdio transport
│   │   ├── sse.ts                    # SSE transport
│   │   └── http.ts                   # HTTP Stream transport
│   ├── bin/
│   │   └── start-server.ts           # CLI entry point
│   ├── config.ts                     # Configuration management
│   └── types.ts                      # TypeScript type definitions
├── package.json                      # Server-specific dependencies
├── tsconfig.json                     # TypeScript config for server
└── README.md                         # This file
```

### 1.2 Install Server Dependencies

Add required dependencies for the MCP server:

```bash
pnpm add @modelcontextprotocol/sdk
pnpm add -D @types/node typescript ts-node
```

### 1.3 Create TypeScript Definitions

**File**: `server/src/types.ts`

Define types for:
- Tool definitions with schemas
- Transport configurations
- Tool execution context
- Error types specific to MCP operations

## Phase 2: Transport Implementation

### 2.1 Stdio Transport

**File**: `server/src/transports/stdio.ts`

Responsibilities:
- Initialize stdio-based MCP client/server
- Handle local process communication
- Tool execution through stdio protocol
- Connection lifecycle management

Key features:
- Command execution in subprocess
- Real-time message streaming
- Resource management and cleanup

### 2.2 SSE Transport

**File**: `server/src/transports/sse.ts`

Responsibilities:
- Implement Server-Sent Events protocol
- HTTP endpoint for SSE connections
- Bidirectional message routing
- Client connection tracking

Key features:
- Event stream formatting
- Connection pooling
- Heartbeat/keep-alive mechanism
- Error recovery

### 2.3 HTTP Stream Transport

**File**: `server/src/transports/http.ts`

Responsibilities:
- Implement HTTP-based streaming protocol
- StreamableHTTPClientTransport compatibility
- Request/response handling
- Authentication support (headers, OAuth)

Key features:
- RESTful tool invocation
- Streaming response support
- Error handling and retries
- Header-based configuration

## Phase 3: Core Server Implementation

### 3.1 MCP Server Class

**File**: `server/src/mcp-server.ts`

Create a unified `MCPServer` class that:
- Manages multiple transport instances
- Registers and catalogs available tools
- Routes tool requests to appropriate handlers
- Manages resource lifecycle
- Handles errors and graceful shutdown

```typescript
class MCPServer {
  private transports: Map<string, Transport>;
  private tools: Map<string, Tool>;
  private resources: Map<string, Resource>;
  
  async initialize(): Promise<void>;
  async addTransport(name: string, transport: Transport): Promise<void>;
  async registerTools(tools: Tool[]): Promise<void>;
  async executeToolCall(toolName: string, args: any): Promise<any>;
  async shutdown(): Promise<void>;
}
```

### 3.2 Tool Registry

**File**: `server/src/tools/index.ts`

Responsibilities:
- Register all available tools
- Define tool schemas using Zod
- Map tool names to handlers
- Validate tool arguments
- Execute tool functions

Example tools structure:
```typescript
export const tools = {
  calculator: {
    name: 'calculator',
    description: 'Performs mathematical calculations',
    inputSchema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.number(),
      b: z.number(),
    }),
    execute: async (args: any) => { /* implementation */ }
  },
  // Add more tools as needed
};
```

## Phase 4: Configuration System

### 4.1 Environment Configuration

**File**: `server/config.ts` and root `.env.local`

Configuration options:
- `MCP_TRANSPORTS`: Comma-separated list (stdio,sse,http)
- `MCP_STDIO_COMMAND`: Stdio server command
- `MCP_STDIO_ARGS`: Stdio server arguments
- `MCP_SSE_PORT`: SSE server port (default: 3001)
- `MCP_HTTP_URL`: HTTP server URL (default: http://localhost:3002)
- `MCP_HTTP_HEADERS`: Custom headers for HTTP transport
- `NODE_ENV`: development/production

### 4.2 Configuration Loader

Create typed configuration with validation:

```typescript
const config = {
  transports: validateTransports(process.env.MCP_TRANSPORTS),
  stdio: { command, args },
  sse: { port },
  http: { url, headers },
};
```

## Phase 5: Server Entry Points

### 5.1 Bin Entry Point

**File**: `server/src/bin/start-server.ts`

- Parse CLI arguments for transport selection
- Initialize MCP server with selected transports
- Start listening on configured ports/endpoints
- Handle graceful shutdown on signals

### 5.2 Main Export

**File**: `server/src/index.ts`

Export:
- `MCPServer` class
- Individual transport classes
- Tool registry
- Type definitions
- Configuration utilities

## Phase 6: Next.js Route Updates

### 6.1 Refactor `app/api/completion/route.ts`

Current issues to address:
1. Redundant client initialization (creating 3 separate clients)
2. Tool name conflicts with simple spread operator
3. No centralized error handling
4. Resource cleanup scattered across handlers

Improvements:
1. **Unified client connection** - Connect to MCP server via single transport configuration
2. **Configurable transport** - Select transport via environment variable or request header
3. **Proper tool merging** - Use namespacing or conflict resolution strategy
4. **Centralized error handling** - Catch all errors in one place
5. **Connection pooling** - Reuse client instances across requests

### 6.2 New Route Implementation

```typescript
// 1. Initialize client once at module level (connection pooling)
const mcpClient = await initializeMCPClient();

export async function POST(req: Request) {
  const { prompt, transport = 'stdio' } = await req.json();
  
  try {
    // 2. Get tools from configured transport
    const tools = await mcpClient.tools();
    
    // 3. Stream text with proper tool invocation
    const response = streamText({
      model: openai('gpt-4o'),
      tools,
      prompt,
      onFinish: async () => {
        // Optionally close connection if not pooling
        if (process.env.MCP_POOL_CONNECTIONS === 'false') {
          await mcpClient.close();
        }
      },
    });
    
    return response.toUIMessageStreamResponse();
  } catch (error) {
    // Centralized error handling
    return handleMCPError(error);
  }
}
```

## Phase 7: Build and Development Scripts

### 7.1 Update `package.json`

Add scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"pnpm dev:server\"",
    "dev:server": "node --loader tsx server/src/bin/start-server.ts",
    "build": "next build && pnpm build:server",
    "build:server": "tsc --project server/tsconfig.json",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```

## Phase 8: Implementation Tasks Checklist

### Server Setup
- [ ] Create server directory structure
- [ ] Set up server TypeScript configuration
- [ ] Install MCP SDK dependencies
- [ ] Define TypeScript types

### Transport Implementation (Priority: Stdio → SSE → HTTP)
- [ ] Implement Stdio transport
- [ ] Test Stdio transport locally
- [ ] Implement SSE transport
- [ ] Test SSE transport locally
- [ ] Implement HTTP Stream transport
- [ ] Test HTTP Stream transport locally

### Core Server
- [ ] Create MCPServer class
- [ ] Implement tool registry
- [ ] Add error handling
- [ ] Implement graceful shutdown

### Configuration
- [ ] Create config system
- [ ] Set up environment variables
- [ ] Add validation

### Integration
- [ ] Update route.ts to connect to server
- [ ] Implement tool merging strategy
- [ ] Add centralized error handling
- [ ] Test end-to-end flow

### Development Experience
- [ ] Add build scripts
- [ ] Set up concurrency for dev mode
- [ ] Test development workflow
- [ ] Create example tools

## Phase 9: Key Design Decisions

### Decision 1: Tool Naming Conflict Resolution

**Options**:
1. **Namespacing**: `stdio:toolName`, `sse:toolName`, `http:toolName`
2. **Priority-based**: Stdio > HTTP > SSE (first wins)
3. **Override**: Last one wins (current implementation)

**Recommendation**: Use namespacing to avoid silent failures and make tool origin explicit.

### Decision 2: Client Lifecycle Management

**Options**:
1. **Per-request**: Create and destroy client per request
2. **Connection pooling**: Reuse client instances
3. **Persistent**: Single client instance for entire process

**Recommendation**: Connection pooling with configurable max connections.

### Decision 3: Server Deployment

**Options**:
1. **Embedded**: Server runs in same process as Next.js
2. **Separate process**: Server spawned by Next.js (development only)
3. **External service**: Separate standalone deployment

**Recommendation**: Separate process for development, configurable for production.

## Phase 10: Testing Strategy

### Unit Tests
- [ ] Tool registry functionality
- [ ] Transport initialization
- [ ] Tool execution with various schemas

### Integration Tests
- [ ] Client connection to each transport
- [ ] Tool discovery and invocation
- [ ] Error handling and recovery
- [ ] Graceful shutdown

### End-to-End Tests
- [ ] Next.js route → MCP server → Tool execution
- [ ] Multiple concurrent requests
- [ ] Transport switching

## Implementation Timeline

**Week 1**: Phases 1-3 (Server foundation and transports)
**Week 2**: Phases 4-5 (Configuration and entry points)
**Week 3**: Phases 6-7 (Route updates and scripts)
**Week 4**: Phases 8-10 (Testing and refinement)

## Success Criteria

- ✅ MCP server starts without errors for all three transports
- ✅ Next.js route successfully connects to server and retrieves tools
- ✅ Tools can be invoked through all transport types
- ✅ No tool name conflicts or resource leaks
- ✅ Proper error handling with meaningful messages
- ✅ Development workflow (`pnpm dev`) starts both server and Next.js
- ✅ All linting and type checks pass
- ✅ End-to-end test completes successfully

## Additional Resources

- [@modelcontextprotocol/sdk Documentation](https://github.com/modelcontextprotocol/sdk)
- [AI SDK MCP Integration](https://sdk.vercel.ai/docs/reference/ai-sdk-core/mcp)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)

## Next Steps

1. Review this plan and confirm approach
2. Decide on tool naming conflict resolution strategy
3. Begin Phase 1: Create server project structure
4. Implement and test Stdio transport first (simplest)
5. Progressively add SSE and HTTP transports
6. Update Next.js route with unified client connection

