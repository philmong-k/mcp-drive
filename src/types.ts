export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export interface MCPServer {
  id: string;
  name: string;
  protocol: 'SSE' | 'Stdio' | 'Websocket';
  endpoint: string;
  status: 'connected' | 'disconnected' | 'connecting';
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: string;
  exampleCall: string;
}

export interface DomainMapping {
  id: string;
  hostname: string;
  targetIp: string;
  type: 'A' | 'CNAME' | 'TXT' | 'AAAA';
  sslEnabled: boolean;
  sslStatus: 'active' | 'expired' | 'pending' | 'none';
  proxyStatus: boolean; // Cloudflare-like orange cloud proxy state
  ttl: string;
}

export interface CloudResource {
  id: string;
  name: string;
  type: 'vm' | 'k8s_cluster' | 'load_balancer' | 'docker_container' | 'postgres_db';
  status: 'running' | 'stopped' | 'provisioning' | 'error';
  ip: string;
  specs: string;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'input';
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
}

export interface LLMConfig {
  lmStudioUrl: string;
  openRouterKey: string;
  openRouterModel: string;
  activeProvider: 'gemini' | 'lmstudio' | 'openrouter';
  temperature: number;
}
