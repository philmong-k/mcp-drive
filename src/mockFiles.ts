import { FileNode } from "./types";

export const initialLinuxFiles: FileNode[] = [
  {
    name: "var",
    path: "/var",
    type: "directory",
    children: [
      {
        name: "www",
        path: "/var/www",
        type: "directory",
        children: [
          {
            name: "html",
            path: "/var/www/html",
            type: "directory",
            children: [
              {
                name: "index.html",
                path: "/var/www/html/index.html",
                type: "file",
                content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Antigravity Deploy Target</title>
    <style>
        body { background: #0c0f16; color: #a5f3fc; font-family: sans-serif; text-align: center; padding-top: 5rem; }
        h1 { font-size: 3rem; margin-bottom: 1rem; text-shadow: 0 0 10px #22d3ee; }
        p { color: #94a3b8; }
    </style>
</head>
<body>
    <h1>Antigravity App Live</h1>
    <p>Powered by MCP agent & Nginx Proxy</p>
</body>
</html>`
              },
              {
                name: "app.js",
                path: "/var/www/html/app.js",
                type: "file",
                content: `// Client-side visual effects
console.log("Antigravity client running... (System OK)");
document.addEventListener('DOMContentLoaded', () => {
  const h1 = document.querySelector('h1');
  if (h1) h1.style.opacity = '1';
});`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "etc",
    path: "/etc",
    type: "directory",
    children: [
      {
        name: "nginx",
        path: "/etc/nginx",
        type: "directory",
        children: [
          {
            name: "nginx.conf",
            path: "/etc/nginx/nginx.conf",
            type: "file",
            content: `user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name antg.dev www.antg.dev;

        location / {
            root /var/www/html;
            index index.html;
        }

        # Reverse proxy to Node Server
        location /api/ {
            proxy_pass http://localhost:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }`
          }
        ]
      },
      {
        name: "hosts",
        path: "/etc/hosts",
        type: "file",
        content: `127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
192.168.1.10 gateway.local
15.200.12.33 antg.dev # Antigravity Cloud Node`
      }
    ]
  },
  {
    name: "home",
    path: "/home",
    type: "directory",
    children: [
      {
        name: "mcp-agent",
        path: "/home/mcp-agent",
        type: "directory",
        children: [
          {
            name: "docker-compose.yml",
            path: "/home/mcp-agent/docker-compose.yml",
            type: "file",
            content: `version: '3.8'

services:
  mcp-server-fs:
    image: node:20-alpine
    container_name: mcp-fs-bridge
    volumes:
      - /var/www/html:/workspace
    environment:
      - ALLOW_CRUD=true
    command: npx @modelcontextprotocol/server-filesystem /workspace
    ports:
      - "4500:4500"

  postgres-db:
    image: postgres:15-alpine
    container_name: antg-db
    environment:
      POSTGRES_DB: antg_prod
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: superSecurePassword123`
          }
        ]
      }
    ]
  }
];

export const initialWindowsFiles: FileNode[] = [
  {
    name: "C:",
    path: "C:",
    type: "directory",
    children: [
      {
        name: "Users",
        path: "C:\\Users",
        type: "directory",
        children: [
          {
            name: "Administrator",
            path: "C:\\Users\\Administrator",
            type: "directory",
            children: [
              {
                name: "Projects",
                path: "C:\\Users\\Administrator\\Projects",
                type: "directory",
                children: [
                  {
                    name: "antg-agent",
                    path: "C:\\Users\\Administrator\\Projects\\antg-agent",
                    type: "directory",
                    children: [
                      {
                        name: "config.json",
                        path: "C:\\Users\\Administrator\\Projects\\antg-agent\\config.json",
                        type: "file",
                        content: `{
  "agentName": "Antigravity Dev Assistant",
  "mcpServers": [
    "http://localhost:3000/sse",
    "http://localhost:4500/sse"
  ],
  "llmProvider": "openrouter",
  "activeModel": "anthropic/claude-3.5-sonnet",
  "features": {
    "fileWatch": true,
    "domainAutoRoute": true,
    "secureShield": true
  }
}`
                      },
                      {
                        name: "readme.md",
                        path: "C:\\Users\\Administrator\\Projects\\antg-agent\\readme.md",
                        type: "file",
                        content: `# Antigravity 자율 개발 비서

VS Code, LM Studio, OpenRouter와 연결하여 자율적인 코딩, 배포, 인프라 관리 및 도메인 바인딩을 자동으로 진행할 수 있는 MCP 에이전트 인터페이스입니다.

## 기능 목록
1. **자율 코딩 (AI Coding Engine)**: 파일 CRUD 및 리팩토링 자동수행
2. **인프라 통합**: Docker, VM, DB 등을 배치 및 관리
3. **가상 도메인 및 듀얼 파일시스템**: Windows & Linux 인프라 제어 탐색 및 CRUD`
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Windows",
        path: "C:\\Windows",
        type: "directory",
        children: [
          {
            name: "System32",
            path: "C:\\Windows\\System32",
            type: "directory",
            children: [
              {
                name: "drivers",
                path: "C:\\Windows\\System32\\drivers",
                type: "directory",
                children: [
                  {
                    name: "etc",
                    path: "C:\\Windows\\System32\\drivers\\etc",
                    type: "directory",
                    children: [
                      {
                        name: "hosts",
                        path: "C:\\Windows\\System32\\drivers\\etc\\hosts",
                        type: "file",
                        content: `# Windows Host Map
127.0.0.1       localhost
::1             localhost
192.168.1.10    router.local
192.168.99.100  docker.local
15.200.12.33    antg.dev`
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "inetpub",
        path: "C:\\inetpub",
        type: "directory",
        children: [
          {
            name: "wwwroot",
            path: "C:\\inetpub\\wwwroot",
            type: "directory",
            children: [
              {
                name: "iisstart.htm",
                path: "C:\\inetpub\\wwwroot\\iisstart.htm",
                type: "file",
                content: `<h1>Welcome to Antigravity Windows Host (IIS)</h1>
<p>Integrated MCP IIS Control active.</p>`
              }
            ]
          }
        ]
      }
    ]
  }
];
