import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Terminal, Radio, Globe, FolderCode, Layers, Cpu, Compass, HardDrive, 
  Send, Sparkles, Smile, MessageSquare, Volume2, Mic, MicOff, Settings, 
  HelpCircle, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight,
  Database, LogOut, Upload, Download, Cloud, Copy, Check, Menu, X
} from "lucide-react";

import { 
  FileNode, MCPServer, DomainMapping, CloudResource, TerminalLog, ChatMessage, LLMConfig 
} from "./types";
import { initialLinuxFiles, initialWindowsFiles } from "./mockFiles";
import AudioVisualizer from "./components/AudioVisualizer";
import FileEditor from "./components/FileEditor";
import DNSTology from "./components/DNSTology";
import MCPServerManager from "./components/MCPServerManager";
import ProviderSettings from "./components/ProviderSettings";
import AIWorkspaceGenerator from "./components/AIWorkspaceGenerator";

import { initAuth, googleSignIn, googleSignOut, getAccessToken } from "./utils/googleAuth";
import { findDriveBackupFile, downloadDriveBackupFile, uploadDriveBackupFile } from "./utils/googleDrive";
import { saveWorkspaceLocal, loadWorkspaceLocal, saveSnapshotsLocal, loadSnapshotsLocal } from "./utils/indexedDB";
import { User } from "firebase/auth";

export default function App() {
  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<'chat' | 'automation' | 'filesystem' | 'dns' | 'mcp' | 'settings'>('chat');

  // Lifted state for file explorers
  const [platform, setPlatform] = useState<'linux' | 'windows'>('linux');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");

  // Multi-platform file system state (visual CRUD)
  const [linuxFiles, setLinuxFiles] = useState<FileNode[]>(initialLinuxFiles);
  const [windowsFiles, setWindowsFiles] = useState<FileNode[]>(initialWindowsFiles);

  // DNS Domain table records
  const [domains, setDomains] = useState<DomainMapping[]>([
    { id: "d1", hostname: "antg.dev", targetIp: "15.200.12.33", type: "A", sslEnabled: true, sslStatus: "active", proxyStatus: true, ttl: "Auto" },
    { id: "d2", hostname: "www.antg.dev", targetIp: "antg.dev", type: "CNAME", sslEnabled: true, sslStatus: "active", proxyStatus: true, ttl: "Auto" },
    { id: "d3", hostname: "api.antg.dev", targetIp: "15.200.12.33", type: "A", sslEnabled: true, sslStatus: "active", proxyStatus: false, ttl: "Auto" }
  ]);

  // Simulated Hosting Infrastructure Resources
  const [resources, setResources] = useState<CloudResource[]>([
    { id: "r1", name: "Antigravity Main Application-VM", type: "vm", status: "running", ip: "15.200.12.33", specs: "4 vCPUs / 16GB RAM / Docker Core" },
    { id: "r2", name: "Nginx Gateway Proxies", type: "load_balancer", status: "running", ip: "15.200.12.33", specs: "Nginx-v1.24/SSL Layer" },
    { id: "r3", name: "Persistent Postgres Engine Cluster", type: "postgres_db", status: "running", ip: "15.200.12.34", specs: "Postgres 15.4 / 100GB Volume" }
  ]);

  // Registered MCP Servers Schemas
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([
    {
      id: "s1",
      name: "Physical Filesystem Server",
      protocol: "SSE",
      endpoint: "http://localhost:3000/api/mcp/fs",
      status: "connected",
      tools: [
        { name: "read_file", description: "Read full text content of a target workspace file path", inputSchema: "{\n  \"path\": \"string\" \n}", exampleCall: "{\n  \"path\": \"/var/www/html/index.html\"\n}" },
        { name: "write_file", description: "Write / Overwrite raw file contents for a target file path", inputSchema: "{\n  \"path\": \"string\",\n  \"content\": \"string\"\n}", exampleCall: "{\n  \"path\": \"/var/www/html/index.html\",\n  \"content\": \"<h1>Dynamic update</h1>\"\n}" },
        { name: "list_directory", description: "List directories and child nodes inside specified path", inputSchema: "{\n  \"path\": \"string\"\n}", exampleCall: "{\n  \"path\": \"/var/www/\"\n}" }
      ]
    },
    {
      id: "s2",
      name: "DevOps Infrastructure Router",
      protocol: "SSE",
      endpoint: "http://localhost:3000/api/mcp/devops",
      status: "connected",
      tools: [
        { name: "execute_command", description: "Execute a bash / powershell command inside safe sandboxed container host", inputSchema: "{\n  \"command\": \"string\",\n  \"cwd\": \"string\" \n}", exampleCall: "{\n  \"command\": \"nginx -s reload\"\n}" },
        { name: "add_dns_target", description: "Appends proxy domain mappings on simulated active hosting networks", inputSchema: "{\n  \"hostname\": \"string\",\n  \"targetIp\": \"string\",\n  \"type\": \"string\"\n}", exampleCall: "{\n  \"hostname\": \"blog.antg.dev\",\n  \"targetIp\": \"15.200.12.33\",\n  \"type\": \"A\"\n}" }
      ]
    }
  ]);

  // Real-time Action/Terminal logging state
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { id: "log-init", timestamp: "04:38:00", type: "success", text: "SYSTEM: Antigravity IDE MCP Agent Cockpit connection established successfully." },
    { id: "log-mcp1", timestamp: "04:38:01", type: "info", text: "MCP HUD: Mounted active node 'Physical Filesystem Server' in Stdio mode." },
    { id: "log-mcp2", timestamp: "04:38:02", type: "info", text: "MCP HUD: Connected Nginx Router extension to DNS gateway controller." }
  ]);

  // Gemini AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      parts: [
        { text: "안녕하세요! 원스톱 멀티 플랫폼 클라우드 제어 허브, **MCP Drive**에 오신 것을 환영합니다.\n\n저는 듀얼 OS 파일스토어 제어, 가상 DNS 바인딩 모의 설계, 그리고 클라우드 세션 타임라인 스냅샷을 스마트하게 제어하는 자율 개발 비서입니다.\n\n기기와 장소를 넘나들며 드라이브처럼 편리하게 상태를 올리고 복원해보세요! 무엇을 도와드릴까요?" }
      ],
      timestamp: "04:38:00"
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Active LLM Connection Parameters
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    lmStudioUrl: "http://localhost:1234/v1",
    openRouterKey: "",
    openRouterModel: "anthropic/claude-3.5-sonnet",
    activeProvider: "gemini",
    temperature: 0.7
  });

  // Simulated Voice State
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>("Mic Standby");
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const [showExtraTools, setShowExtraTools] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const voiceTimeoutRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

  // Copy chat message function
  const copyMessageToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    logToTerminal(`[Chat] 메시지가 클립보드에 복사되었습니다.`, 'success');
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Auto Scroll ref for chat
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Speech synthesis speaker helper
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      currentUtterancesRef.current = []; // Reset reference list
      
      // Clean up markdown elements, code blocks, bullet points, HTML symbols, and URLs to read purely
      let cleanText = text
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, '코드 생략') // Strip code blocks cleanly
        .replace(/https?:\/\/\S+/g, '')                  // Remove links
        .replace(/[*#_\-~|>\[\]()]+/g, ' ')             // Strip markdown noise
        .replace(/\s+/g, ' ')                            // Deduplicate spaces
        .trim();

      if (!cleanText) return;

      // Split text into moderate segments by punctuation to prevent chromium 15s freeze bug
      const rawSegments = cleanText.split(/([.!?]\s+|\n+)/);
      const segments: string[] = [];
      let temp = "";
      for (const token of rawSegments) {
        if (!token) continue;
        if (/^[.!?\n\s]+$/.test(token)) {
          temp += token.trim();
          if (temp.trim()) {
            segments.push(temp.trim());
          }
          temp = "";
        } else {
          if (temp.trim()) {
            segments.push(temp.trim());
          }
          temp = token;
        }
      }
      if (temp.trim()) {
        segments.push(temp.trim());
      }

      // Filter non-empty segments
      const filteredSegments = segments.filter(s => s.trim().length > 1);
      if (filteredSegments.length === 0) return;

      // Select high-quality natural Korean voice
      const voices = window.speechSynthesis.getVoices();
      const bestKoVoice = voices.find(v => v.lang.startsWith('ko') && v.name.includes('Google')) ||
                          voices.find(v => v.lang.startsWith('ko') && v.name.includes('Natural')) ||
                          voices.find(v => v.lang.startsWith('ko')) ||
                          null;

      // Pre-instantiate all items and hold them strongly in React Ref to bypass garbage collection!
      const utterances = filteredSegments.map((segment) => {
        const utterance = new SpeechSynthesisUtterance(segment);
        utterance.lang = "ko-KR";
        if (bestKoVoice) {
          utterance.voice = bestKoVoice;
        }
        // Ultra natural vocal specs (rate 0.98 for deliberate/comfort pacing, pitch 1.02 for bright warmth)
        utterance.rate = 1.0;
        utterance.pitch = 1.03;
        return utterance;
      });

      currentUtterancesRef.current = utterances;

      // Sequential playlist loop
      const runPlaylist = (index: number) => {
        if (index >= utterances.length) {
          logToTerminal(`[Audio TTS] 대화 내용 전체 낭독이 정상 완료되었습니다.`, 'success');
          return;
        }
        const utterance = utterances[index];
        
        utterance.onend = () => {
          // Play next on end
          runPlaylist(index + 1);
        };
        utterance.onerror = (e) => {
          console.warn("Speech synthesis queue recovered on error:", e);
          runPlaylist(index + 1);
        };

        window.speechSynthesis.speak(utterance);
      };

      // Trigger first node in queue
      runPlaylist(0);

      logToTerminal(`[Audio TTS] 순차 안심 낭독 작동 중 (${filteredSegments.length}개 조각, 성우: ${bestKoVoice?.name || '기본 성우'})`, 'success');
    } catch (e) {
      console.error("Speech synthesis failed:", e);
    }
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  // Global Terminal Logger helper
  const logToTerminal = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTerminalLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        type: type,
        text: text
      }
    ]);
  };

  // Chat message submit handler
  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usermsg-${Date.now()}`,
      role: "user",
      parts: [{ text: msgText }],
      timestamp: new Date().toTimeString().split(' ')[0]
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsChatLoading(true);
    logToTerminal(`[AI Agent] Request sent to default LLM controller (${llmConfig.activeProvider.toUpperCase()})`, 'info');

    // Real-time tool-call simulation intercepter to link Chat with other components
    const msgLower = msgText.toLowerCase();

    // Helper to find file in tree
    const findFileRecursively = (nodes: FileNode[], pathPart: string): FileNode | null => {
      for (const node of nodes) {
        if (node.type === 'file' && (node.name.toLowerCase().includes(pathPart.toLowerCase()) || node.path.toLowerCase().replace(/\\/g, '/').includes(pathPart.toLowerCase()))) {
          return node;
        }
        if (node.children) {
          const found = findFileRecursively(node.children, pathPart);
          if (found) return found;
        }
      }
      return null;
    };

    // Helper to get filepath by name
    const getFileDetails = (text: string): { file: FileNode; plat: 'linux' | 'windows' } | null => {
      const parts = [
        "index.html", "app.js", "nginx.conf", "docker-compose.yml", "hosts", "config.json", "readme.md"
      ];
      for (const p of parts) {
        if (text.toLowerCase().includes(p)) {
          const lf = findFileRecursively(linuxFiles, p);
          if (lf) return { file: lf, plat: 'linux' };
          const wf = findFileRecursively(windowsFiles, p);
          if (wf) return { file: wf, plat: 'windows' };
        }
      }
      const fileKeywords = ["index", "html", "nginx", "hosts", "docker", "compose", "config", "readme"];
      for (const k of fileKeywords) {
        if (text.toLowerCase().includes(k)) {
          const lf = findFileRecursively(linuxFiles, k);
          if (lf) return { file: lf, plat: 'linux' };
          const wf = findFileRecursively(windowsFiles, k);
          if (wf) return { file: wf, plat: 'windows' };
        }
      }
      return null;
    };

    let processedOffline = false;
    let offlineReply = "";

    // 1. Goal-driven: Snapshot and backup intents (e.g., "현재 상태 백업해줘", "작업 저장하자")
    if (msgLower.includes("스냅샷") || msgLower.includes("백업") || msgLower.includes("세이브") || msgLower.includes("체크포인트") || msgLower.includes("작업 저장") || msgLower.includes("작업저장") || msgLower.includes("현재 상태 저장")) {
      processedOffline = true;
      logToTerminal(`[Intent Detected] 사용자 백업 의도 감지: create_snapshot (자동 무중단 백업)`, 'success');
      
      const titleText = `${new Date().toLocaleTimeString()} 사용자 맞춤 자동 백업`;
      const newSnap = {
        id: "snap_" + Date.now(),
        title: titleText,
        timestamp: new Date().toISOString(),
        device: window.innerWidth < 1024 ? "Mobile" : "PC/Desktop",
        payload: currentWorkspaceSnapshotPayload()
      };
      
      setTimeout(() => {
        saveSnapshotsLocal([...snapshots, newSnap]).then(() => {
          setSnapshots(prev => [newSnap, ...prev]);
          logToTerminal(`[스냅샷 자동화] 📸 성공적으로 새로운 스냅샷 시점 ("${titleText}")을 디스크에 저장했습니다!`, 'success');
        });
      }, 500);

      offlineReply = `[사용자 의도 감지] 📸 **체크포인트 자동 저장 완료**

사용자님의 말씀에서 "현재 상태 백업" 목적을 감지하고, 가상 공간을 보존할 수 있도록 에이전트가 뒤에서 알아서 관련 정보를 취합해 저장 자격 증명을 기동했습니다!

• **수행된 작업**: 브라우저 보안 IndexedDB를 경유하여 파일트리, 도메인, 자격 증명 테이블 가압 상태를 통합 포장
• **백업 명칭**: \`"${titleText}"\`
• **저장 위치**: 로컬 브라우저 기기 격리 디스크 스토어

어려운 명령어 없이도 안심하고 계속 작업을 타임라인으로 백업하실 수 있습니다.`;
    }

    // 2. Goal-driven: Domain or DNS Setup (e.g., "dns 연결해줘", "antg.dev 주소 세팅해", "내 도메인 주소로 사이트 띄워줘")
    else if (msgLower.includes("도메인") || msgLower.includes("dns") || msgLower.includes("cloudflare") || msgLower.includes("주소") || msgLower.includes("연결") && (msgLower.includes("아이피") || msgLower.includes("ip") || msgLower.includes(".dev") || msgLower.includes(".com"))) {
      processedOffline = true;
      const hostSuggestion = msgLower.includes("antg.dev") ? "blog.antg.dev" : "my-web.antg.dev";
      
      logToTerminal(`[Intent Detected] 도메인 연결 의도 감지 -> 1) DNS 레코드 등록 2) Nginx 게이트웨이 프록시 설정 자동 연계 수정`, 'info');
      logToTerminal(`[자동 실행] 중계 서버 도구 구동: cloudflare_api (add_dns_record, target: '${hostSuggestion}')`, 'success');
      logToTerminal(`[자동 실행] 중계 서버 도구 구동: write_file (path: '/etc/nginx/nginx.conf')`, 'success');

      setTimeout(() => {
        // 1) Add dynamic DNS Mapping
        handleAddDomain({
          hostname: hostSuggestion,
          targetIp: "15.200.12.33",
          type: "A",
          sslEnabled: true,
          sslStatus: "active",
          proxyStatus: true,
          ttl: "Auto"
        });

        // 2) Under-the-hood auto configuration for Nginx conf to bind webserver
        const nginxNode = findFileRecursively(linuxFiles, 'nginx.conf');
        if (nginxNode) {
          const updatedNginx = nginxNode.content + `\n# --- Auto-configured Backend binding for ${hostSuggestion} ---\nserver {\n    listen 80;\n    server_name ${hostSuggestion};\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_set_header Host $host;\n    }\n}\n`;
          handleSaveFileContent('linux', '/etc/nginx/nginx.conf', updatedNginx);
          logToTerminal(`[Nginx Smart Patch] Nginx config file /etc/nginx/nginx.conf hot-patched successfully for '${hostSuggestion}'!`, 'success');
        }

        setActiveTab('dns');
        logToTerminal(`[Smart Route Engine] DNS 바인딩 완료: '${hostSuggestion}' -> 15.200.12.33 (IPv4 Proxy Cloudflare Route enabled)`, 'success');
      }, 1000);

      offlineReply = `[사용자 의도 감지] 🌐 **도메인 자동 연동 및 프록시 설정 완료**

사용자님께서 복잡한 인프라 파일명 수정을 직접 신경 쓰실 필요가 전혀 없습니다! 말씀하신 "도메인 주소 세팅 정황"에 발맞추어, 에이전트가 뒤에서 가상 시스템의 **기본 게이트웨이 파일** 및 **Cloudflare DNS 레코딩**을 한 번에 준비해 드렸습니다.

• **자동 수행된 1단계**: DNS 레코드에 \`${hostSuggestion}\` ➔ \`15.200.12.33\`(IPv4 Proxy) 바인딩 추가
• **자동 수행된 2단계**: Nginx 구성문 (\`/etc/nginx/nginx.conf\`)의 서버 블록에 리버스 프록시 연계 모듈 및 SSL 레이어 강제 인젝션 완료
• **현재 화면 포커스**: 배포 완료 상황을 편안하게 확인하실 수 있도록 **DNS 토폴로지** 탭으로 전환해 놓았습니다!

이제 설정된 주소로 세계 곳곳의 고객들이 회원님의 웹 서버에 노크할 수 있도록 길이 활짝 열렸습니다.`;
    }

    // 3. Goal-driven: Database and Container creation (e.g., "데이터베이스 켜줘", "디비 구축해", "서버 올려줘", "도커 연동")
    else if (msgLower.includes("데이터베이스") || msgLower.includes("db") || msgLower.includes("디비") || msgLower.includes("docker") || msgLower.includes("도커") || msgLower.includes("compose") || msgLower.includes("postgres") || msgLower.includes("sqlite") || msgLower.includes("mcp") || msgLower.includes("엠씨피")) {
      processedOffline = true;
      logToTerminal(`[Intent Detected] DB 및 컨테이너 가상 플랫폼 구성 의도 감지 -> 1) Docker Compose 멀티 스택 설계 2) MCP Database 연동 꽂기`, 'info');
      logToTerminal(`[자동 실행] 중계 서버 도구 구동: write_file (path: '/home/mcp-agent/docker-compose.yml')`, 'success');
      logToTerminal(`[자동 실행] 중계 서버 도구 구동: mcp_server_mount (Endpoint: 'http://localhost:5500/sse')`, 'success');

      setTimeout(() => {
        // 1) Update /home/mcp-agent/docker-compose.yml to enable multiple container stacks
        const composeNode = findFileRecursively(linuxFiles, 'docker-compose.yml');
        if (composeNode) {
          const updatedCompose = composeNode.content + `\n# --- Extended Multi-Layer Database cluster config ---\n  redis-cache:\n    image: redis:7-alpine\n    container_name: antg-redis-pool\n    ports:\n      - "6379:6379"\n  mcp-sqlite-connector:\n    image: node:20-alpine\n    container_name: mcp-sqlite-connector\n    volumes:\n      - ./sqlite-data:/data\n    command: npx @modelcontextprotocol/server-sqlite --db /data/app.db\n`;
          handleSaveFileContent('linux', '/home/mcp-agent/docker-compose.yml', updatedCompose);
          logToTerminal(`[Docker Compose Core] PostgreSQL & SQLite & Redis Multi-Services scale deployment configured.`, 'success');
        }

        // 2) Mount Database Service into MCP Gateway
        handleAddMCPServer("MCP-Sqlite-Db", "SSE", "http://localhost:5500/sse");
        setActiveTab('mcp');
        logToTerminal(`[MCP Smart Connect] 🔌 게이트웨이에 'MCP-Sqlite-Db' SSE 채널을 정밀 바인딩하였습니다.`, 'success');
      }, 1000);

      offlineReply = `[사용자 의도 감지] 🔋 **데이터베이스 다중 컨테이너 및 MCP 연동 완료**

회원님께 "docker-compose.yml 파일을 열고 PostgreSQL 설정을 써넣어 주세요"라고 부탁드리는 대신, 에이전트가 데이터베이스 구성 지향을 감지하여 고도로 포장된 분산 DB 환경을 한 발 앞서 구축했습니다!

• **자동 수행된 1단계**: \`/home/mcp-agent/docker-compose.yml\` 파일을 열어 PostgreSQL에 연동될 고속 메모리 캐시인 **Redis** 서버 및 **SQLite 분산 프로파일** 스택을 자동 인젝션
• **자동 수행된 2단계**: 생성된 보안 데이터 노드를 외부 AI나 타 기기가 즉시 정적 쿼리할 수 있도록 **MCP-Sqlite-Db** 통합 커넥터 마운트 게이트웨이 개설 완료
• **현재 화면 포커스**: 추가된 연동 포인트를 모니터링하기 위해 **스마트 협업(MCP)** 전용 대시보드로 자리를 옮겨 드렸습니다!

사용자는 코딩 한 줄 몰라도 백엔드 멀티티어 DB 인프라 구축의 정점을 실시간으로 확인하실 수 있습니다.`;
    }

    // 4. Goal-driven: Frontend UI and Landing Page (e.g., "내 홈페이지 만들어줘", "기본 메인화면 바꿔줘", "첫 웹사이트 뚝딱 세팅해줘")
    else if (msgLower.includes("홈페이지") || msgLower.includes("웹페이지") || msgLower.includes("메인화면") || msgLower.includes("사이트") || msgLower.includes("웹사이트") || msgLower.includes("html") || msgLower.includes("화면")) {
      processedOffline = true;
      logToTerminal(`[Intent Detected] 메인 홈페이지 디자인 및 웹서버 구축 의도 감지 -> 1) html 빌더 기동 2) nginx 퍼블리싱 마운트`, 'info');
      logToTerminal(`[자동 실행] 중계 서버 도구 구동: write_file (path: '/var/www/html/index.html')`, 'success');

      const customTitle = msgLower.includes("방명록") ? "내 아기자기한 방명록 허브" : "Antigravity Custom Live Web Portal";
      const customParagraph = msgLower.includes("방명록")
        ? "어려운 데이터 설계나 데이터베이스 통신 지적은 잊고 편안하게 소통해 보세요. 에이전트가 뒤에서 가상 환경의 Nginx 포트 구성과 영구 저장 모듈을 동적 배포해 놓았습니다."
        : "사용자님의 대화 문맥 속 지향점(웹사이트 개설)을 완벽하게 포착하고, 무중단 실시간 패치(dynamic patch-injection) 기법으로 가상 디바이스의 nginx 마운트 주소에 세련된 메인 웹 문서를 신속 배포하였습니다.";

      const updatedWeb = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${customTitle}</title>
    <style>
        body { background: #07090e; color: #38bdf8; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 6rem 1.5rem; margin: 0; }
        .card { max-width: 650px; margin: 0 auto; background: rgba(15, 23, 42, 0.6); padding: 3rem 2rem; border-radius: 24px; border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); }
        h1 { font-size: 2.75rem; margin-bottom: 1.5rem; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4); font-weight: 800; letter-spacing: -0.04em; color: #10b981; }
        p { color: #cbd5e1; font-size: 1.1rem; line-height: 1.7; margin-bottom: 2rem; }
        .badge { display: inline-block; padding: 0.35rem 0.9rem; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 9999px; font-family: monospace; font-size: 0.82rem; font-weight: 700; color: #34d399; }
    </style>
</head>
<body>
    <div class="card">
        <h1>${customTitle}</h1>
        <p>${customParagraph}</p>
        <span class="badge">ANTG PLATFORM AUTO-DEPLOY PERFECT</span>
    </div>
</body>
</html>`;

      setTimeout(() => {
        handleSaveFileContent('linux', '/var/www/html/index.html', updatedWeb);
        setPlatform('linux');
        const fileNode = findFileRecursively(linuxFiles, 'index.html');
        if (fileNode) {
          setSelectedFile({ ...fileNode, content: updatedWeb });
          setEditorContent(updatedWeb);
        }
        setActiveTab('filesystem');
        logToTerminal(`[File System] SUCCESS: Beautifully regenerated /var/www/html/index.html with interactive HTML UI!`, 'success');
      }, 1000);

      offlineReply = `[사용자 의도 감지] 🎨 **세련된 개인 홈페이지 생성 및 가상 인프라 배포 완료**

도메인 레코드나 Nginx 환경 세팅 명령어, HTML 코딩이 생소하고 어려움을 느끼시더라도 하등 문제없습니다! 회원님의 메인 화면 디자인 및 생성 방향을 전폭 수용하여, 에이전트가 뒤에서 알아서 최고의 스타일링 문서를 준비하고 웹서버 포트에 완벽 배포했습니다.

• **자동 배포된 파일**: \`/var/www/html/index.html\` (리얼타임 인젝션 마감)
• **스타일 바인딩**: 모바일 및 울트라 와이드 화면을 정교하게 커버하는 반응형 테마, 우아한 카드 레이아웃, 그리고 형광 네온 글로우 스타일 탑재
• **현재 화면 포커스**: 배포된 아름다운 코드를 한눈에 검토·수정하실 수 있도록 **물리 파일 탐색기 및 에디터** 장막으로 자동 연동하여 포커스해 올렸습니다!

코딩 지식 없이도 오로지 "원하는 웹 브랜딩과 생각"만을 편히 들려주세요. 해빙이 뒤에서 모든 하드 레벨 시스템 인프라를 가압 마운트해 드립니다.`;
    }

    // 5. Implicit File-Level operation fallback
    else {
      const fileDetails = getFileDetails(msgLower);
      if (fileDetails) {
        processedOffline = true;
        const { file, plat } = fileDetails;
        
        const isEditing = msgLower.includes("수정") || msgLower.includes("변경") || msgLower.includes("바꿔") || msgLower.includes("저장") || msgLower.includes("쓰기") || msgLower.includes("작성") || msgLower.includes("추가");
        
        if (isEditing) {
          // File write operation
          logToTerminal(`[자동 실행] 중계 서버 도구 구동: write_file (path: '${file.path}')`, 'success');
          
          let updatedContent = file.content || "";
          if (file.name === "index.html") {
            updatedContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Antigravity Premium Applet</title>
    <style>
        body { background: #07090e; color: #38bdf8; font-family: 'Space Grotesk', sans-serif; text-align: center; padding-top: 6rem; }
        h1 { font-size: 3.5rem; margin-bottom: 1.5rem; text-shadow: 0 0 15px #0284c7; font-weight: 800; letter-spacing: -0.05em; }
        p { color: #cbd5e1; font-size: 1.1rem; max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .badge { display: inline-block; padding: 0.25rem 0.75rem; background: rgba(56, 189, 248, 0.15); border: 1px border #0284c7; border-radius: 9999px; font-family: monospace; font-size: 0.8rem; margin-top: 2rem; }
    </style>
</head>
<body>
    <h1>Antigravity Premium Applet Live</h1>
    <p>회원님의 일상대화 명령을 분석한 뒤, 실시간 무중단 패치(hot-patch) 인젝션 기법으로 Nginx 게이트웨이에 최신화된 맞춤형 웹문서 배포를 정상 마감하였습니다.</p>
    <div class="badge">AGENT AUTO-DEPLOY SUCCESS</div>
</body>
</html>`;
          } else if (file.name === "nginx.conf") {
            updatedContent = file.content + `\n# Custom Virtual Backend Proxy Added\nupstream backend_cluster {\n    server 127.0.0.1:3000;\n}\n`;
          } else if (file.name === "docker-compose.yml") {
            updatedContent = file.content + `\n# Extended redis cache database integration\n  redis-cache:\n    image: redis:7-alpine\n    container_name: mcp-redis-cache\n    ports:\n      - "6379:6379"\n`;
          } else {
            updatedContent = file.content + `\n// Updated by Antigravity AI Agent on ${new Date().toLocaleDateString()}\n`;
          }

          setTimeout(() => {
            handleSaveFileContent(plat, file.path, updatedContent);
            setPlatform(plat);
            setSelectedFile({ ...file, content: updatedContent });
            setEditorContent(updatedContent);
            setActiveTab('filesystem');
            logToTerminal(`[File System] SUCCESS: Auto-write flush complete on '${file.path}' (${plat.toUpperCase()})`, 'success');
          }, 1100);

          offlineReply = `[자동 실행] 중계 서버 도구 구동: write_file (target: '${file.path}')

사용자님의 일상어 교정 요청에 따라, 개발 중인 가상 파일 중 **'${file.name}'** 파일을 직접 열고 최적의 구성안 및 업그레이드 코드를 새로 고쳐서 안전하게 작성 보관(Write Flush) 처리했습니다! 💾

• 소속 OS 마운트: ${plat.toUpperCase()} 플랫폼
• 갱신된 소스 위치: \`${file.path}\`

에이전트가 회원님을 위해 **물리 파일 탐색기 & 에디터** 탭으로 자동 조준하여 연동해놓았습니다. 편안하게 고쳐진 소스 코드를 관측해 보세요!`;

        } else {
          // File read operation
          logToTerminal(`[자동 실행] 중계 서버 도구 구동: read_file (path: '${file.path}')`, 'success');
          
          setTimeout(() => {
            setPlatform(plat);
            setSelectedFile(file);
            setEditorContent(file.content || "");
            setActiveTab('filesystem');
            logToTerminal(`[File System] SUCCESS: Auto-load complete on '${file.path}' (${plat.toUpperCase()})`, 'success');
          }, 800);

          offlineReply = `[자동 실행] 중계 서버 도구 구동: read_file (target: '${file.path}')

회원님이 말씀하신 파일 탐색 요청을 감지해, 프로젝트 디스크 안에 위치한 **'${file.name}'** 파일을 번개처럼 판독(Read)하여 통합 코드 에디터에 자동으로 전개시켰습니다! 📄

• 활성 대상 경로: \`${file.path}\`
• 인프라 가용 환경: ${plat.toUpperCase()} 에뮬레이터

파일 전송과 탐색기 탭 포커싱이 완전 가동되었습니다.`;
        }
      }
    }

    if (processedOffline) {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            role: "model",
            parts: [{ text: offlineReply }],
            timestamp: new Date().toTimeString().split(' ')[0]
          }
        ]);
        logToTerminal(`[AI Agent] Conversational NLP match triggered successfully`, 'success');
        setIsChatLoading(false);
        if (autoSpeak) {
          speakResponse(offlineReply);
        }
      }, 1200);
      return; // Stop execution here since we handled offline!
    }

    try {
      // Proxy chat request server-side to prevent exposing the API key
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: chatMessages.concat(userMsg).map(m => ({
            role: m.role,
            parts: m.parts
          })),
          systemInstruction: "You are Antigravity IDE AI Agent, an elite full-stack autonomous coding/dev assistant. Always reply politely and warmly in Korean (한국어로 아주 다정하고 상냥하게 존댓말로 답변해주세요).\n\nIf the user is a coding/tech beginner or uses simpler conversational phrases (like '홈페이지', '블로그', '제안해줘', '초보', '공유', '도메인'), DO NOT overwhelm them with raw technical jargon, terminal variables, or code blocks right away.\nInstead:\n1. Proactively catch their ultimate creative/business goal (e.g. sharing work, setting up a neat home site, custom domain connection).\n2. GREET Warmly and explain the steps by comparing technical concepts to comfortable real-world metaphor analogs (e.g. Nginx config as a 'Welcome receptionist / 문지기', IP/DNS mapping as a 'Unique phone number / 연락처 저장', Database as a 'Digital safe box / 데이터 금고').\n3. Recommend 1 or 2 elegant, simplified next steps that they can understand.\n4. Assure them that you (the Agent) will handle all the complex file creation, Docker Compose configuring, and proxy setting-ups behind the scenes. Tell them what you changed, but explain its benefit in simple, rewarding sentences. Avoid excessive markdown noise.",
          config: llmConfig
        })
      });

      if (!response.ok) {
        throw new Error("Server responded with error status");
      }

      const data = await response.json();
      const modelReplyText = data.text || "죄송합니다. 임시 네트워크 오류가 발생했습니다.";

      setChatMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: "model",
          parts: [{ text: modelReplyText }],
          timestamp: new Date().toTimeString().split(' ')[0]
        }
      ]);
      logToTerminal(`[AI Agent] Response generated successfully`, 'success');

      if (autoSpeak) {
        speakResponse(modelReplyText);
      }

    } catch (error: any) {
      console.error("Failed to query Gemini API:", error);
      logToTerminal(`[AI Agent] FAILED: Server-side Gemini API request failed.`, 'error');
      
      // Fallback response so user doesn't get stuck
      setChatMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: "model",
          parts: [{ text: "현재 Google AI Studio의 Secrets 탭에 `GEMINI_API_KEY`가 적절히 주입되지 않았거나 원격 서버 응답에 일시적 지연이 발생하고 있습니다.\n\n개발 콕핏의 다른 영역(물리 파일 CRUD 탐색기, DNS 도메인 제어 테이블, 가상 인프라 배포 등)의 시뮬레이터 기능들은 100% 독립적으로 정상 가동되오니 이들을 자유롭게 테스트해 보세요!" }],
          timestamp: new Date().toTimeString().split(' ')[0]
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quick Action Buttons
  const triggerQuickScenario = (title: string, triggerCode: () => void) => {
    logToTerminal(`[Scenario] Initializing workspace scenario: "${title}"`, 'info');
    triggerCode();
  };

  // Modify File deep node helper
  const updateFileTreeContent = (
    nodes: FileNode[],
    targetPath: string,
    newContent: string
  ): FileNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, content: newContent };
      } else if (node.children) {
        return { ...node, children: updateFileTreeContent(node.children, targetPath, newContent) };
      }
      return node;
    });
  };

  // File save logic (CRUD write with Auto Create if missing)
  const handleSaveFileContent = (plat: 'linux' | 'windows', targetPath: string, content: string) => {
    const findNode = (nodes: FileNode[], path: string): boolean => {
      for (const n of nodes) {
        if (n.path === path) return true;
        if (n.children && findNode(n.children, path)) return true;
      }
      return false;
    };

    const files = plat === 'linux' ? linuxFiles : windowsFiles;
    const exists = findNode(files, targetPath);

    if (!exists) {
      let parentPath = plat === 'windows' ? "C:" : "/";
      let name = targetPath;
      const lastSlashIdx = targetPath.lastIndexOf("/");
      if (lastSlashIdx !== -1) {
        parentPath = targetPath.substring(0, lastSlashIdx);
        name = targetPath.substring(lastSlashIdx + 1);
        if (parentPath === "") parentPath = "/";
      }
      handleCreateFileNode(plat, parentPath, name, false);
    }

    if (plat === 'linux') {
      setLinuxFiles(prev => updateFileTreeContent(prev, targetPath, content));
    } else {
      setWindowsFiles(prev => updateFileTreeContent(prev, targetPath, content));
    }
  };

  // Create File / Folder helper (CRUD create)
  const handleCreateFileNode = (
    plat: 'linux' | 'windows',
    parentPath: string,
    name: string,
    isDirectory: boolean
  ) => {
    const newNodePath = parentPath === '/' || parentPath === 'C:' ? `${parentPath}${name}` : `${parentPath}/${name}`;
    const newNode: FileNode = {
      name: name,
      path: newNodePath,
      type: isDirectory ? 'directory' : 'file',
      content: isDirectory ? undefined : `// Created raw source file: ${name}\n// Antigravity IDE Auto-generator`,
      children: isDirectory ? [] : undefined
    };

    const insertNode = (nodes: FileNode[]): FileNode[] => {
      // Root level insertion
      if (parentPath === '/' || parentPath === 'C:') {
        return [...nodes, newNode];
      }
      return nodes.map(node => {
        if (node.path === parentPath) {
          return { ...node, children: node.children ? [...node.children, newNode] : [newNode] };
        } else if (node.children) {
          return { ...node, children: insertNode(node.children) };
        }
        return node;
      });
    };

    if (plat === 'linux') {
      setLinuxFiles(prev => insertNode(prev));
    } else {
      setWindowsFiles(prev => insertNode(prev));
    }
  };

  // Delete Node helper (CRUD delete)
  const handleDeleteFileNode = (plat: 'linux' | 'windows', targetPath: string) => {
    const pluckNode = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter(n => n.path !== targetPath)
        .map(n => {
          if (n.children) {
            return { ...n, children: pluckNode(n.children) };
          }
          return n;
        });
    };

    if (plat === 'linux') {
      setLinuxFiles(prev => pluckNode(prev));
    } else {
      setWindowsFiles(prev => pluckNode(prev));
    }
  };

  // Reset structures to initial
  const handleResetFiles = () => {
    setLinuxFiles(initialLinuxFiles);
    setWindowsFiles(initialWindowsFiles);
    logToTerminal("[File System] System Mount: Filesystem re-synchronized to pristine default templates.", 'warn');
  };

  // DNS control helpers
  const handleAddDomain = (dom: Omit<DomainMapping, 'id'>) => {
    const newDom: DomainMapping = {
      id: `dom-${Date.now()}`,
      ...dom
    };
    setDomains(prev => [...prev, newDom]);
  };

  const handleToggleProxy = (id: string) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, proxyStatus: !d.proxyStatus } : d));
  };

  const handleToggleSSL = (id: string) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, sslEnabled: !d.sslEnabled } : d));
  };

  // Adding Custom MCP Server Integration
  const handleAddMCPServer = (name: string, protocol: 'SSE' | 'Stdio' | 'Websocket', endpoint: string) => {
    const newSrv: MCPServer = {
      id: `srv-${Date.now()}`,
      name: name,
      protocol: protocol,
      endpoint: endpoint,
      status: "connected",
      tools: [
        { name: "custom_mcp_query", description: "Performs integrated telemetry checks on custom endpoint nodes", inputSchema: "{\n  \"payload\": \"string\"\n}", exampleCall: "{\n  \"payload\": \"health\"\n}" }
      ]
    };
    setMcpServers(prev => [...prev, newSrv]);
  };

  // Voice activation with real SpeechRecognition and simulation fallbacks
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (isVoiceListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
      }
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      setIsVoiceListening(false);
      setVoiceStatusText("마이크 연결 해제됨");
      logToTerminal("[Voice Input] Voice communications closed.", 'warn');
    } else {
      setIsVoiceListening(true);
      setVoiceStatusText("말씀하세요... (인식 대기 중)");
      logToTerminal("[Voice Input] Voice activation enabled. Listening to user input...", 'info');

      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = "ko-KR";
          rec.continuous = false;
          rec.interimResults = false;
          
          rec.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setIsVoiceListening(false);
            setVoiceStatusText(`인식: "${transcript}"`);
            logToTerminal(`[Voice STT] Speech recognized: "${transcript}"`, 'success');
            handleSendMessage(transcript);
          };

          rec.onerror = (e: any) => {
            console.warn("Speech recognition error:", e);
            logToTerminal(`[Voice Input] Web Speech API Warning: ${e.error || 'blocked'}. Using simulated voice commands fallback.`, 'warn');
            triggerVoiceSimulationFallback();
          };

          rec.onend = () => {
            setIsVoiceListening(false);
          };

          recognitionRef.current = rec;
          rec.start();
        } catch (err) {
          console.error("Speech recognition start failed:", err);
          triggerVoiceSimulationFallback();
        }
      } else {
        logToTerminal("[Voice Input] Browser SpeechRecognition API not natively active. Initiating high-fidelity simulation pool.", 'info');
        triggerVoiceSimulationFallback();
      }
    }
  };

  const triggerVoiceSimulationFallback = () => {
    setVoiceStatusText("음량 신호 수신 중...");
    voiceTimeoutRef.current = window.setTimeout(() => {
      const voiceCommands = [
        "/var/www/html/index.html 파일을 열고 타이틀을 Antigravity Prime으로 고쳐서 저장해줘.",
        "Postgres 데이터베이스 노드가 기동 중인지 모니터링 체크해봐.",
        "antg.dev 도메인 프록시설정을 켜고 LetsEncrypt 보안 SSL 인증서를 배포 가동해줘."
      ];
      const chosenCmd = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
      
      setIsVoiceListening(false);
      setVoiceStatusText("PCM Decoding completed.");
      logToTerminal(`[Voice Simulation] SPEECH RECOGNIZED: "${chosenCmd}"`, 'success');
      
      // Auto trigger chat query!
      handleSendMessage(`(음성 인식 명령) ${chosenCmd}`);
    }, 3200);
  };

  // Cross-device cloud sync state & handlers for multi-device (PC <-> Mobile) syncing
  const [isSyncingToServer, setIsSyncingToServer] = useState(false);
  const [isSyncingFromServer, setIsSyncingFromServer] = useState(false);

  // Local IndexedDB & Google Drive state variables
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [dismissGate, setDismissGate] = useState(false);

  // Multi-session historical snapshots list state
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [newSnapTitle, setNewSnapTitle] = useState("");
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  
  // Real-time management helper states (Overriding, Renaming, Filtering)
  const [editingSnapId, setEditingSnapId] = useState<string | null>(null);
  const [editSnapTitleName, setEditSnapTitleName] = useState("");
  const [searchSnapshotKeyword, setSearchSnapshotKeyword] = useState("");

  // 1. Fetch current snapshots with local IndexedDB
  const fetchSnapshots = async () => {
    try {
      const data = await loadSnapshotsLocal();
      setSnapshots(data || []);
    } catch (err) {
      console.error("Failed to fetch snapshots from IDB:", err);
    }
  };

  const currentWorkspaceSnapshotPayload = () => {
    return {
      linuxFiles,
      windowsFiles,
      domains,
      resources,
      mcpServers,
      chatMessages,
      llmConfig,
      credentials: {
        ssh_host: localStorage.getItem("ssh_host"),
        ssh_port: localStorage.getItem("ssh_port"),
        ssh_user: localStorage.getItem("ssh_user"),
        ssh_pass: localStorage.getItem("ssh_pass"),
        db_type: localStorage.getItem("db_type"),
        db_host: localStorage.getItem("db_host"),
        db_port: localStorage.getItem("db_port"),
        db_user: localStorage.getItem("db_user"),
        db_pass: localStorage.getItem("db_pass"),
        db_name: localStorage.getItem("db_name"),
        docker_tag: localStorage.getItem("docker_tag"),
        tailscale_ip: localStorage.getItem("tailscale_ip"),
        cf_api_token: localStorage.getItem("cf_api_token")
      }
    };
  };

  // 2. Create local snapshot in client IndexedDB
  const handleCreateSnapshot = async () => {
    if (isCreatingSnapshot) return;
    setIsCreatingSnapshot(true);
    
    const titleText = newSnapTitle.trim() || `${new Date().toLocaleTimeString()} 작업 체크포인트`;
    logToTerminal(`[스냅샷 생성] 📸 제목: "${titleText}" 로 로컬 IndexedDB 백업 진행 중...`, "info");

    const newSnap = {
      id: "snap_" + Date.now(),
      title: titleText,
      timestamp: new Date().toISOString(),
      device: window.innerWidth < 1024 ? "Mobile" : "PC/Desktop",
      payload: currentWorkspaceSnapshotPayload()
    };

    try {
      const currentSnaps = [newSnap, ...snapshots];
      await saveSnapshotsLocal(currentSnaps);
      setSnapshots(currentSnaps);
      logToTerminal(`[스냅샷 로컬 저장] 📸 성공적으로 새로운 스냅샷 시점 ("${titleText}")을 브라우저의 안전한 IndexedDB에 보존했습니다!`, "success");
      setNewSnapTitle("");
    } catch {
      logToTerminal("[스냅샷 생성 오류] 로컬 IndexedDB 백업 쓰기 실피", "error");
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // 3. Overwrite local snapshot
  const handleOverwriteSnapshot = async (id: string, titleText: string) => {
    if (!window.confirm(`"${titleText}" 스냅샷의 데이터를 현재의 라이브 작업대 상태로 덮어쓰시겠습니까? (백업본이 현시점으로 업데이트됩니다)`)) {
      return;
    }
    logToTerminal(`[스냅샷 덮어쓰기] 🔄 "${titleText}" 스냅샷의 페이로드를 현재 시점으로 업데이트 중...`, "info");

    try {
      const updatedSnaps = snapshots.map((s: any) => {
        if (s.id === id) {
          return {
            ...s,
            timestamp: new Date().toISOString(),
            payload: currentWorkspaceSnapshotPayload()
          };
        }
        return s;
      });
      await saveSnapshotsLocal(updatedSnaps);
      setSnapshots(updatedSnaps);
      logToTerminal(`[스냅샷 업데이트] 🔄 "${titleText}" 스냅샷의 데이터와 타임스탬프를 현 작업 상태로 완벽히 덮어썼습니다!`, "success");
    } catch {
      logToTerminal("[스냅샷 업데이트 오류] 로컬 IndexedDB 스토리지 쓰기 실패", "error");
    }
  };

  // 4. Rename local snapshot
  const handleSaveRenameSnapshot = async (id: string) => {
    const trimmedTitle = editSnapTitleName.trim();
    if (!trimmedTitle) return;

    try {
      const updatedSnaps = snapshots.map((s: any) => {
        if (s.id === id) {
          return { ...s, title: trimmedTitle };
        }
        return s;
      });
      await saveSnapshotsLocal(updatedSnaps);
      setSnapshots(updatedSnaps);
      logToTerminal(`[스냅샷 메타데이터] ✏️ 스냅샷 이름이 "${trimmedTitle}" 로 변경되었습니다.`, "success");
      setEditingSnapId(null);
    } catch {
      logToTerminal("[이름 변경 실패] 로컬 IndexedDB 스토리지 오류", "error");
    }
  };

  // 5. Restore local snapshot
  const handleRestoreSnapshot = (snap: any) => {
    if (!snap || !snap.payload) {
      logToTerminal("[스냅샷 복구 실패] 데이터셋 유실 상태", "error");
      return;
    }

    try {
      const data = snap.payload;
      if (data.linuxFiles) setLinuxFiles(data.linuxFiles);
      if (data.windowsFiles) setWindowsFiles(data.windowsFiles);
      if (data.domains) setDomains(data.domains);
      if (data.resources) setResources(data.resources);
      if (data.mcpServers) setMcpServers(data.mcpServers);
      if (data.chatMessages) setChatMessages(data.chatMessages);
      if (data.llmConfig) setLlmConfig(data.llmConfig);

      if (data.credentials) {
        Object.entries(data.credentials).forEach(([key, value]) => {
          if (value) localStorage.setItem(key, value as string);
        });
      }
      logToTerminal(`[스냅샷 복구 성공] 🕒 "${snap.title}" (백업 시점: ${new Date(snap.timestamp).toLocaleString()}) 상태가 완전 전개되었습니다.`, "success");
    } catch (err) {
      logToTerminal("[스냅샷 복구 실패] 상태 바인딩 도중 예외가 발생했습니다.", "error");
    }
  };

  // 6. Delete local snapshot
  const handleDeleteSnapshot = async (id: string, titleText: string) => {
    try {
      const updatedSnaps = snapshots.filter((s: any) => s.id !== id);
      await saveSnapshotsLocal(updatedSnaps);
      setSnapshots(updatedSnaps);
      logToTerminal(`[스냅샷 영구삭제] 🗑️ "${titleText}" 백업 카드를 정상 제거했습니다.`, "warn");
    } catch {
      logToTerminal("[스냅샷 제거 실패] 로컬 IndexedDB 스토리지 오류", "error");
    }
  };

  // 7. Google Drive Sync and Authentication management handlers
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    logToTerminal("[구글 드라이브 연동] ☁️ 구글 계정 인증 팝업을 호출하는 중...", "info");
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        logToTerminal(`[구글 인증 완료] 👤 "${result.user.email}" 계정으로 로그인했습니다. 구글 드라이브 동기화를 시작합니다.`, "success");
        await handlePullFromGoogleDrive(result.accessToken);
      }
    } catch (err) {
      console.error("Google sync login error:", err);
      logToTerminal("[구글 인증 실패] 연동 승인이 거부되었거나 네트워크 차단이 감지되었습니다.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    logToTerminal("[구글 드라이브 해제] 연동을 해제합니다. 세션 자격 증명이 삭제됩니다.", "warn");
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handlePushToGoogleDrive = async () => {
    const token = googleToken || getAccessToken();
    if (!token) {
      logToTerminal("[구글 드라이브 동기화] ❌ 로그인되지 않은 상태입니다. 먼저 구글 인증을 완료해 주세요.", "error");
      return;
    }

    setIsSyncingDrive(true);
    logToTerminal("[구글 드라이브 백업] 📤 현재의 모든 파일트리, 도메인, 인프라 크레덴셜, 그리고 스냅샷 타임라인을 병합하여 구글 드라이브로 아웃풋 백업 중...", "info");

    const payload = {
      workspace: {
        linuxFiles,
        windowsFiles,
        domains,
        resources,
        mcpServers,
        chatMessages,
        llmConfig,
        credentials: {
          ssh_host: localStorage.getItem("ssh_host"),
          ssh_port: localStorage.getItem("ssh_port"),
          ssh_user: localStorage.getItem("ssh_user"),
          ssh_pass: localStorage.getItem("ssh_pass"),
          db_type: localStorage.getItem("db_type"),
          db_host: localStorage.getItem("db_host"),
          db_port: localStorage.getItem("db_port"),
          db_user: localStorage.getItem("db_user"),
          db_pass: localStorage.getItem("db_pass"),
          db_name: localStorage.getItem("db_name"),
          docker_tag: localStorage.getItem("docker_tag"),
          tailscale_ip: localStorage.getItem("tailscale_ip"),
          cf_api_token: localStorage.getItem("cf_api_token")
        }
      },
      snapshots,
      syncedAt: new Date().toISOString()
    };

    try {
      const fileId = await findDriveBackupFile(token);
      await uploadDriveBackupFile(token, payload, fileId);
      logToTerminal("[구글 드라이브 백업 완료] 📤 'mcp-drive-backup.json' 파일로 구글 드라이브에 안전하게 수동 백업이 저장되었습니다!", "success");
    } catch (err) {
      logToTerminal("[구글 드라이브 백업 오류] 업로드 중 통신 지연 혹은 토큰 만료가 감지되었습니다. 로그인을 다시 시도해주세요.", "error");
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handlePullFromGoogleDrive = async (activeTkn?: string) => {
    const token = activeTkn || googleToken || getAccessToken();
    if (!token) return;

    setIsSyncingDrive(true);
    logToTerminal("[구글 드라이브 동기화] 🔍 구글 드라이브에서 'mcp-drive-backup.json' 클라우드 백업을 검색 중...", "info");

    try {
      const fileId = await findDriveBackupFile(token);
      if (fileId) {
        logToTerminal("[구글 드라이브 동기화] 📥 백업 데이터를 발견했습니다. 로컬 디바이스로 내려받는 중...", "info");
        const driveData = await downloadDriveBackupFile(token, fileId);
        
        if (driveData) {
          const { workspace, snapshots: driveSnaps } = driveData;
          
          if (workspace) {
            if (workspace.linuxFiles) setLinuxFiles(workspace.linuxFiles);
            if (workspace.windowsFiles) setWindowsFiles(workspace.windowsFiles);
            if (workspace.domains) setDomains(workspace.domains);
            if (workspace.resources) setResources(workspace.resources);
            if (workspace.mcpServers) setMcpServers(workspace.mcpServers);
            if (workspace.chatMessages) setChatMessages(workspace.chatMessages);
            if (workspace.llmConfig) setLlmConfig(workspace.llmConfig);
            if (workspace.credentials) {
              Object.entries(workspace.credentials).forEach(([key, value]) => {
                if (value) localStorage.setItem(key, value as string);
              });
            }
            await saveWorkspaceLocal(workspace);
          }

          if (driveSnaps) {
            setSnapshots(driveSnaps);
            await saveSnapshotsLocal(driveSnaps);
          }

          logToTerminal(`[구글 드라이브 연동 완료] 🎉 구글 드라이브에서 가져온 작업 설정과 ${driveSnaps?.length || 0}개의 타임라인 스냅샷이 로컬에 자동 동기화되었습니다! (동기화 시점: ${new Date(driveData.syncedAt).toLocaleString()})`, "success");
        }
      } else {
        logToTerminal("[구글 드라이브 동기화] 🔍 신규 디바이스입니다. 아직 드라이브에 저장된 'mcp-drive-backup.json' 파일이 없습니다.", "info");
      }
    } catch (err) {
      logToTerminal("[구글 드라이브 동기화 오류] 구글 드라이브로부터 백업을 가져오지 못했습니다.", "warn");
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Real-time automatic workspace state synchronization to local IndexedDB
  useEffect(() => {
    if (isDbLoaded) {
      const payload = {
        linuxFiles,
        windowsFiles,
        domains,
        resources,
        mcpServers,
        chatMessages,
        llmConfig,
        credentials: {
          ssh_host: localStorage.getItem("ssh_host"),
          ssh_port: localStorage.getItem("ssh_port"),
          ssh_user: localStorage.getItem("ssh_user"),
          ssh_pass: localStorage.getItem("ssh_pass"),
          db_type: localStorage.getItem("db_type"),
          db_host: localStorage.getItem("db_host"),
          db_port: localStorage.getItem("db_port"),
          db_user: localStorage.getItem("db_user"),
          db_pass: localStorage.getItem("db_pass"),
          db_name: localStorage.getItem("db_name"),
          docker_tag: localStorage.getItem("docker_tag"),
          tailscale_ip: localStorage.getItem("tailscale_ip"),
          cf_api_token: localStorage.getItem("cf_api_token")
        }
      };
      saveWorkspaceLocal(payload);
    }
  }, [linuxFiles, windowsFiles, domains, resources, mcpServers, chatMessages, llmConfig, isDbLoaded]);

  // Load initial IndexedDB states and config google redirect/auth bindings on mount
  useEffect(() => {
    const loadFromIDB = async () => {
      try {
        const localWorkspace = await loadWorkspaceLocal();
        if (localWorkspace) {
          if (localWorkspace.linuxFiles) setLinuxFiles(localWorkspace.linuxFiles);
          if (localWorkspace.windowsFiles) setWindowsFiles(localWorkspace.windowsFiles);
          if (localWorkspace.domains) setDomains(localWorkspace.domains);
          if (localWorkspace.resources) setResources(localWorkspace.resources);
          if (localWorkspace.mcpServers) setMcpServers(localWorkspace.mcpServers);
          if (localWorkspace.chatMessages) setChatMessages(localWorkspace.chatMessages);
          if (localWorkspace.llmConfig) setLlmConfig(localWorkspace.llmConfig);
          if (localWorkspace.credentials) {
            Object.entries(localWorkspace.credentials).forEach(([key, value]) => {
              if (value) localStorage.setItem(key, value as string);
            });
          }
          logToTerminal("[로컬 저장소 활성화] 💾 안전한 클라이언트 브라우저 IndexedDB에서 이전 작업대의 상태를 성공적으로 로드했습니다.", "success");
        } else {
          logToTerminal("[로컬 저장소 활성화] 💾 신규 콕핏 브라우저 세션입니다. 기본 템플릿 파일셋으로 구축을 시작합니다.", "info");
        }

        const localSnaps = await loadSnapshotsLocal();
        setSnapshots(localSnaps || []);
      } catch (err) {
        console.error("IndexedDB bootstrap error:", err);
      } finally {
        setIsDbLoaded(true);
      }
    };

    loadFromIDB();

    if (typeof window !== "undefined") {
      setShowExtraTools(window.innerWidth > 1024);
    }

    // Google Auth observer setup
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        await handlePullFromGoogleDrive(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderSidebarElements = (isMobileView: boolean = false) => {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider px-1.5 flex items-center justify-between">
          <span>제어 영역 선택</span>
          {isMobileView && <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-blue-400 font-bold rounded">모바일 모드</span>}
        </div>

        <nav className="space-y-1.5">
          <button
            onClick={() => {
              setActiveTab('chat');
              if (isMobileView) setMobileSidebarOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer ${
              activeTab === 'chat'
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10"
                : "text-slate-400 hover:bg-[#1A1A1F] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bot size={16} />
              <span>💬 자율 AI 에이전트 챗</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'chat' ? 'bg-white' : 'bg-blue-400 animate-pulse'}`}></span>
          </button>

          <button
            onClick={() => {
              setActiveTab('automation');
              if (isMobileView) setMobileSidebarOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer ${
              activeTab === 'automation'
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10"
                : "text-slate-400 hover:bg-[#1A1A1F] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#38BDF8]" />
              <span>🤖 코드 &amp; 인프라 자동화</span>
            </div>
            <span className="font-mono text-[9px] py-0.5 px-1 bg-slate-900 text-slate-400 rounded">AI</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('filesystem');
              if (isMobileView) setMobileSidebarOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer ${
              activeTab === 'filesystem'
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10"
                : "text-slate-400 hover:bg-[#1A1A1F] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderCode size={16} />
              <span>📁 듀얼 파일시스템 CRUD</span>
            </div>
            <span className="font-mono text-[9px] py-0.5 px-1 bg-slate-900 text-slate-400 rounded">CRUD</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('dns');
              if (isMobileView) setMobileSidebarOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer ${
              activeTab === 'dns'
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10"
                : "text-slate-400 hover:bg-[#1A1A1F] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe size={16} />
              <span>🌐 DNS &amp; 인프라 자동 배포</span>
            </div>
            <span className="font-mono text-[9px] py-0.5 px-1 bg-slate-900 text-slate-400 rounded">DNS</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mcp');
              if (isMobileView) setMobileSidebarOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer ${
              activeTab === 'mcp'
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10"
                : "text-slate-400 hover:bg-[#1A1A1F] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio size={16} />
              <span>🔌 MCP 서버 스마트 허브</span>
            </div>
            <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase">{mcpServers.length} EA</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              if (isMobileView) setMobileSidebarOpen(false);
            }}
            className={`w-full py-3 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between transition cursor-pointer ${
              activeTab === 'settings'
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10"
                : "text-slate-400 hover:bg-[#1A1A1F] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings size={16} />
              <span>⚙️ 핵심 환경설정</span>
            </div>
            <span className="font-mono text-[9px] text-purple-400 font-semibold">LLM</span>
          </button>
        </nav>

        <hr className="border-slate-800 my-1.5" />

        {/* Dynamic helper card */}
        <div className="bg-[#1A1A1F] p-3 rounded-2xl border border-slate-800 text-left text-[11px] text-slate-400 leading-relaxed font-sans shadow-inner">
          <strong className="text-slate-200 block mb-1">💡 원스톱 개발 환경 제어팁:</strong>
          자율 에이전트 챗 영역에서 텍스트 또는 마이크 버튼을 통해 듀얼 OS 파일들과 프록시 DNS 정보를 자동으로 편집할 수 있습니다. 
        </div>

        {/* Google Drive Secure Cloud Integration Hub */}
        <div className="bg-[#141417]/80 rounded-2xl border border-slate-800 p-3 font-sans text-left shadow-md">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wide">
              <Cloud size={14} className={googleUser ? "text-emerald-400" : "text-blue-400"} />
              <span>Google Drive 동기화</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border leading-tight ${
              googleUser 
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" 
                : "bg-slate-900/60 text-slate-500 border-slate-800"
            }`}>
              {googleUser ? "연동 활성" : "미인증"}
            </span>
          </div>

          {!googleUser ? (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                인프라 정보 & 세션 스냅샷은 브라우저 <strong>IndexedDB</strong>에 로컬 저장되어 안전합니다. 구글 계정을 연동하면 클라우드 백업 및 타 장치간 자동 동기화가 활성화됩니다.
              </p>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 text-white font-semibold text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-lg shadow-blue-950/35"
              >
                <Cloud size={14} className={isLoggingIn ? "animate-spin" : ""} />
                <span>{isLoggingIn ? "구글 계정 연동 중..." : "Google Drive 연동하기"}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* User info row */}
              <div className="flex items-center justify-between bg-slate-950/45 border border-slate-800/60 rounded-xl p-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <img 
                    src={googleUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${googleUser.email}`} 
                    alt="Google User" 
                    className="w-6 h-6 rounded-lg border border-slate-800 bg-slate-900 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-200 truncate leading-tight">
                      {googleUser.displayName || "Google 사용자"}
                    </div>
                    <div className="text-[8px] font-mono text-slate-500 truncate mt-0.5 leading-none">
                      {googleUser.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  title="계정 연동 해제"
                  className="p-1 px-1.5 text-[8.5px] font-medium text-slate-400 bg-slate-850 hover:bg-red-950/30 hover:border-red-800/20 hover:text-red-400 border border-slate-700/50 rounded-lg cursor-pointer transition flex items-center gap-1 font-sans shrink-0"
                >
                  <LogOut size={10} />
                  <span>해제</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePushToGoogleDrive}
                  disabled={isSyncingDrive}
                  title="IndexedDB의 작업 데이터와 세션 타임라인을 구글 드라이브에 수동 업로드 보관합니다."
                  className="py-1.5 px-2 bg-blue-600/15 hover:bg-blue-600/25 disabled:opacity-50 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 font-bold text-[10px] rounded-lg cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <Upload size={11} className={isSyncingDrive ? "animate-spin" : ""} />
                  <span>드라이브 저장</span>
                </button>
                <button
                  onClick={() => handlePullFromGoogleDrive()}
                  disabled={isSyncingDrive}
                  title="구글 드라이브의 이전 백업을 내려받아 현재 브라우저 작업대를 수동 오버레이 복원합니다."
                  className="py-1.5 px-2 bg-emerald-600/15 hover:bg-emerald-600/25 disabled:opacity-50 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-bold text-[10px] rounded-lg cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <Download size={11} className={isSyncingDrive ? "animate-bounce" : ""} />
                  <span>가져오기</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cloud multi-session Snapshot Hub widget */}
        <div className="bg-[#141417]/80 rounded-2xl border border-slate-800 p-3.5 font-sans text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wide">
              <Database size={13} className="text-blue-400" />
              <span>클라우드 세션 타임라인 Hub</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded border border-blue-800/30">
              {snapshots.length}개 보관
            </span>
          </div>

          <p className="text-[10px] text-slate-500 mb-2.5 leading-relaxed">
            중요 작업 단계를 고유 이름으로 저장해두면 세션/기기를 불가하고 복원할 수 있습니다.
          </p>

          {/* Quick Creation form */}
          <div className="flex gap-1.5 mb-2">
            <input
              type="text"
              placeholder="예: 로그인 구현 전, 퇴근용 백업"
              value={newSnapTitle}
              onChange={(e) => setNewSnapTitle(e.target.value)}
              className="flex-1 bg-[#1A1A1F] border border-slate-800 text-[10px] rounded-lg px-2.5 py-1 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
            <button
              onClick={handleCreateSnapshot}
              disabled={isCreatingSnapshot}
              title="현 작업 상대를 새 독립 스냅샷으로 생성"
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-600/55 text-white font-bold text-[10px] rounded-lg cursor-pointer transition shrink-0 flex items-center justify-center font-sans"
            >
              {isCreatingSnapshot ? "생성중" : "+ 새 스냅샷"}
            </button>
          </div>

          {/* Keyword Search & Filter */}
          {snapshots.length > 0 && (
            <div className="mb-2.5">
              <input
                type="text"
                placeholder="🔍 보관 백업 검색..."
                value={searchSnapshotKeyword}
                onChange={(e) => setSearchSnapshotKeyword(e.target.value)}
                className="w-full bg-[#1A1A1F]/70 border border-slate-800/80 text-[10px] rounded-lg px-2 py-0.5 text-slate-400 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          )}

          {/* Timeline Snapshot Lists */}
          <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
            {snapshots.length === 0 ? (
              <div className="text-[10px] text-slate-600 text-center py-4 bg-[#1A1A1F]/50 border border-dashed border-slate-800/60 rounded-xl">
                저장된 클라우드 스냅샷이 없습니다.
              </div>
            ) : snapshots.filter(s => s.title.toLowerCase().includes(searchSnapshotKeyword.toLowerCase())).length === 0 ? (
              <div className="text-[10px] text-slate-600 text-center py-2">
                검색어와 부합하는 스냅샷이 없습니다.
              </div>
            ) : (
              snapshots
                .filter(s => s.title.toLowerCase().includes(searchSnapshotKeyword.toLowerCase()))
                .map((snap) => (
                  <div key={snap.id} className="bg-[#1A1A1F] border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 hover:border-slate-700/80 transition relative group">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        {editingSnapId === snap.id ? (
                          <div className="flex gap-1 items-center mt-0.5">
                            <input
                              type="text"
                              value={editSnapTitleName}
                              onChange={(e) => setEditSnapTitleName(e.target.value)}
                              className="bg-[#141417] border border-blue-500/40 text-[10px] rounded px-1.5 py-0.5 text-white focus:outline-none w-full"
                            />
                            <button
                              onClick={() => handleSaveRenameSnapshot(snap.id)}
                              className="text-[8px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-1 rounded transition whitespace-nowrap"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingSnapId(null)}
                              className="text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-1 rounded transition"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="text-[10px] font-bold text-slate-200 truncate cursor-pointer hover:text-blue-400 flex-1" 
                                title="클릭하여 이름 변경 수작업 가능"
                                onClick={() => {
                                  setEditingSnapId(snap.id);
                                  setEditSnapTitleName(snap.title);
                                }}
                              >
                                {snap.title} ✏️
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-mono mt-0.5">
                              <span className="text-sky-400 font-bold">{snap.device || "PC"}</span>
                              <span>•</span>
                              <span className="text-[8px] text-slate-400 bg-slate-900 px-1 rounded-sm border border-slate-800/50">
                                {new Date(snap.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          onClick={() => {
                            handleRestoreSnapshot(snap);
                            if (isMobileView) setMobileSidebarOpen(false);
                          }}
                          title="이 시점으로 전체 화면, 파일셋, 로컬 계정 정보 롤백 복원"
                          className="px-1.5 py-0.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/35 text-[8px] font-bold rounded cursor-pointer transition whitespace-nowrap"
                        >
                          복원
                        </button>
                        <button
                          onClick={() => handleOverwriteSnapshot(snap.id, snap.title)}
                          title="현재 살아있는 실시간 작업 상태로 이 스냅샷 데이터를 덮어써서 업데이트"
                          className="px-1.5 py-0.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/20 hover:border-blue-500/35 text-[8px] font-bold rounded cursor-pointer transition whitespace-nowrap"
                        >
                          덮어
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(snap.id, snap.title)}
                          title="이 스냅샷 저장본을 영구 삭제"
                          className="px-1.5 py-0.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/20 hover:border-red-500/35 text-[8px] font-bold rounded cursor-pointer transition whitespace-nowrap"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0C] text-slate-300 selection:bg-blue-500/35 selection:text-blue-100 font-sans p-4 gap-4 overflow-x-hidden">
      
      {/* Mobile Drawer Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 xl:hidden flex justify-start transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div 
            className="w-[325px] max-w-[85vw] h-full bg-[#0E0E11] border-r border-slate-800 p-5 overflow-y-auto flex flex-col gap-4 shadow-2xl relative animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-blue-500 animate-spin-slow" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">메뉴 및 인프라 제어</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            
            {renderSidebarElements(true)}
          </div>
        </div>
      )}
      
      {/* Dynamic Top Header with status indicators */}
      <header className="border border-slate-800 bg-[#141417] px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.08)] z-20">
        
        {/* Title branding */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            {/* Hamburger trigger menu button on mobile/tablet */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="xl:hidden p-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer flex items-center justify-center shadow"
              title="메뉴 및 인프라 제어"
            >
              <Menu size={18} className="text-blue-500 animate-pulse" />
            </button>

            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-700 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
              <Bot size={22} className="text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white uppercase font-sans flex items-center gap-1.5 leading-none">
                <span>MCP Drive</span>
                <span className="text-[10px] font-mono py-0.5 px-1.5 bg-blue-950/60 text-blue-400 border border-blue-800/50 rounded">
                  CLOUD SYNC DRIVE
                </span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 mt-1 leading-none">
                All-In-One Multi-Platform Cloud Controller & File Hub (Bento Custom)
              </p>
            </div>
          </div>
        </div>

        {/* Live system telemetries */}
        <div className="flex items-center gap-4 flex-wrap bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-400 text-[10px]">MCP Server Hub:</span>
            <span className="text-white font-bold text-[10px]">{mcpServers.length} Active nodes</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs border-l border-slate-800 pl-4">
            <strong className="text-slate-400 font-mono text-[10px]">Dual Mount:</strong>
            <span className="text-blue-400 font-bold font-mono text-[10px]">C: &amp; / Enabled</span>
          </div>

          <div className="flex items-center gap-2 text-xs border-l border-slate-800 pl-4">
            <strong className="text-slate-400 font-mono text-[10px]">Controller Type:</strong>
            <span className="text-purple-400 font-bold font-mono text-[10px] uppercase">
              {llmConfig.activeProvider === 'gemini' ? "GEMINI (LIVE)" : llmConfig.activeProvider}
            </span>
          </div>

          {/* Real-time PC/Mobile Server Cloud Sync Controllers (Direct user-intent solved) */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <Cloud size={11} className={googleUser ? "text-emerald-500 animate-pulse" : "text-slate-500"} />
              <span>구글 드라이브 동기화:</span>
              <span className={`text-[9px] font-mono font-bold ${googleUser ? "text-emerald-400" : "text-slate-500"}`}>
                {googleUser ? "연동됨" : "미연동"}
              </span>
            </div>
            <button
              onClick={handlePushToGoogleDrive}
              disabled={isSyncingDrive || !googleUser}
              title={googleUser ? "현재 작업 상태, 인프라 크레덴셜, 세션 파일을 구글 드라이브에 즉시 보존합니다." : "구글 드라이브 연동 활성화 필요"}
              className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 active:bg-blue-600/35 border border-blue-500/25 text-blue-400 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={11} className={isSyncingDrive ? "animate-spin" : ""} />
              <span>Drive 백업</span>
            </button>
            <button
              onClick={() => handlePullFromGoogleDrive()}
              disabled={isSyncingDrive || !googleUser}
              title={googleUser ? "모바일 등 외부 기기에서 구글 드라이브에 저장한 작업 설정과 파일 구성을 가져옵니다." : "구글 드라이브 연동 활성화 필요"}
              className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 active:bg-emerald-600/35 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={11} className={isSyncingDrive ? "animate-bounce" : ""} />
              <span>Drive 가져오기</span>
            </button>
          </div>
        </div>

      </header>

      {/* Main Dock Container */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 max-w-7xl mx-auto w-full">
        
        {/* Unified Control Navigation Sidebar Tab panel */}
        <div className="hidden xl:flex xl:col-span-3 flex-col bg-[#141417] border border-slate-800 rounded-3xl overflow-hidden p-5 shadow-lg h-fit">
          {renderSidebarElements(false)}
        </div>

        {/* Core dynamic Workspace panel switcher */}
        <div className="xl:col-span-9 flex flex-col h-full min-h-[450px]">
          
          {/* TAB 1: Chat interface workspace */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
              
              {/* Chatbox column */}
              <div className="lg:col-span-8 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl overflow-hidden p-5 relative min-h-[420px] shadow-lg">
                
                {/* Chat title bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-left">
                  <div className="flex items-center gap-2">
                    <Bot className="text-blue-500 animate-bounce" size={16} />
                    <div>
                      <h2 className="text-xs font-bold uppercase text-white tracking-wider leading-none">
                        자율개발 AI 에이전트 챗 (Live Gemini)
                      </h2>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        Server-proxied Google Gemini models: gemini-3.5-flash
                      </span>
                    </div>
                  </div>
                  <HelpCircle size={15} className="text-slate-500 cursor-pointer hover:text-slate-300" title="Gemini 3.5 모델이 원격 마운트되어 실시간 추론을 보장합니다." />
                </div>

                {/* Messages scroll box */}
                <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-[380px] pr-1 pb-4 space-y-4">
                  {chatMessages.map((m) => {
                    const isModel = m.role === 'model';
                    return (
                      <div 
                        key={m.id}
                        className={`flex gap-3 text-xs leading-relaxed max-w-[90%] ${
                          isModel ? "text-left" : "ml-auto text-right flex-row-reverse"
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold ${
                          isModel ? "bg-slate-900 text-blue-500 border border-slate-800" : "bg-blue-600 text-white"
                        }`}>
                          {isModel ? <Bot size={14} /> : "ME"}
                        </div>

                        <div>
                          <div className={`p-3.5 pb-9.5 rounded-2xl block text-slate-200 whitespace-pre-wrap text-left relative group/bubble ${
                            isModel 
                              ? "bg-[#1A1A1F] border border-slate-800" 
                              : "bg-blue-600/10 border border-blue-500/20 text-blue-100"
                          }`}>
                            <div className="break-words">{m.parts[0].text}</div>
                            
                            {/* Action Control buttons (Always visible on mobile/tablets, hover-reveal on desktop) */}
                            <div className="absolute right-2.5 bottom-2 flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover/bubble:opacity-100 transition-opacity duration-200">
                              {/* Speak button of this message */}
                              <button
                                type="button"
                                onClick={() => speakResponse(m.parts[0].text)}
                                title="이 대화 음성으로 듣기"
                                className={`p-1 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                                  isModel 
                                    ? "bg-slate-900/90 border-slate-800 hover:border-blue-500 text-slate-400 hover:text-blue-450 hover:text-blue-400" 
                                    : "bg-blue-950/60 border-blue-800/40 hover:border-blue-400 text-blue-300 hover:text-blue-200"
                                }`}
                              >
                                <Volume2 size={11.5} />
                              </button>

                              {/* Copy button of this message */}
                              <button
                                type="button"
                                onClick={() => copyMessageToClipboard(m.id || '', m.parts[0].text)}
                                title="메시지 텍스트 복사"
                                className={`p-1 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                                  copiedMessageId === m.id
                                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                                    : isModel
                                      ? "bg-slate-900/90 border-slate-800 hover:border-blue-500 text-slate-400 hover:text-blue-450 hover:text-blue-400" 
                                      : "bg-blue-950/60 border-blue-800/40 hover:border-blue-400 text-blue-300 hover:text-blue-200"
                                }`}
                              >
                                {copiedMessageId === m.id ? (
                                  <Check size={11.5} className="text-emerald-400" />
                                ) : (
                                  <Copy size={11.5} />
                                )}
                              </button>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-600 font-mono mt-1 block">
                            {m.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {isChatLoading && (
                    <div className="flex gap-3 text-xs leading-relaxed max-w-[90%] text-left">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-blue-500 border border-slate-800 flex items-center justify-center shrink-0">
                        <Bot size={14} className="animate-spin" />
                      </div>
                      <div className="py-3 px-4 bg-[#1A1A1F] border border-slate-800 rounded-2xl text-slate-400 italic font-mono flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin text-blue-500" />
                        Antigravity 에이전트가 생각 중입니다...
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Beginner-friendly Goal Suggestions Slider */}
                <div className="mt-3 mb-1 text-left sm:px-1">
                  <div className="mb-2 p-2.5 bg-blue-950/20 border border-blue-900/40 rounded-xl">
                    <span className="text-[10px] text-blue-300 font-bold tracking-tight block mb-1">💬 해빙이 일상대화 자동 제어 지원</span>
                    <span className="text-[10px] text-slate-400 block leading-relaxed">
                      "index.html 읽어줘", "docker-compose.yml 수정해줘", "antg.dev 도메인 연결해줘", "스냅샷 백업 부탁해" 등 어려운 명령어 입력 대신 <b>한국어 일상 문장</b>으로 편하게 말씀해 주시면, 에이전트가 완벽히 이해하고 뒤에서 가상 환경과 파일을 오토 세팅해 드립니다!
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2 pl-0.5 select-none">
                    <Sparkles size={11} className="text-yellow-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold tracking-tight">💡 용어가 낯설다면? 원하는 '목표'를 콕 짚어 제안받기</span>
                  </div>
                  
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <button
                      type="button"
                      disabled={isChatLoading}
                      onClick={() => handleSendMessage("저는 전문 용어나 코딩을 잘 모르는 초심자입니다! 제 가상 환경(MCP 개발 허브)에 맞춰 제가 당장 해볼 수 있는 가장 쉽고 재미있는 구성안(로드맵)을 한글로 상냥하게 제안해 주세요!")}
                      className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-900/55 hover:border-blue-500/70 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-300 font-semibold transition cursor-pointer shrink-0 shadow flex items-center gap-1.5 duration-150 disabled:opacity-50"
                    >
                      🌱 왕초보용 로드맵 알아서 제안받기
                    </button>

                    <button
                      type="button"
                      disabled={isChatLoading}
                      onClick={() => handleSendMessage("나만의 아기자기한 첫 개인 홈페이지나 가벼운 방명록 전용 웹사이트를 하나 뚝딱 열고 싶어요! Nginx 웹서버나 포트 세팅 같은 어려운 인프라 설계는 에이전트가 뒤에서 알아서 완벽 세팅해 주시고, 제가 어떤 기분 좋은 첫걸음을 내딛으면 좋을지 알기 쉽게 제안해 드릴게요.")}
                      className="bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-900/50 hover:border-indigo-500/70 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-300 font-semibold transition cursor-pointer shrink-0 shadow flex items-center gap-1.5 duration-150 disabled:opacity-50"
                    >
                      🏠 첫 개인 홈페이지/방명록 개설하기
                    </button>

                    <button
                      type="button"
                      disabled={isChatLoading}
                      onClick={() => handleSendMessage("내 컴퓨터나 안전한 공간에 사진과 메모 문서를 마음껏 모으고 기기 간에 넘나들며 꺼낼 수 있는 개인용 비밀 파일 금고(MCP 파일스토어 허브)를 구축해보고 싶습니다. 어떻게 쉽게 첫 시작을 설계할 수 있는지 안내와 가용 구성을 제안해 주세요!")}
                      className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-900/50 hover:border-emerald-500/70 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-300 font-semibold transition cursor-pointer shrink-0 shadow flex items-center gap-1.5 duration-150 disabled:opacity-50"
                    >
                      ☁️ 사진/문서 클라우드 파일함 구비
                    </button>

                    <button
                      type="button"
                      disabled={isChatLoading}
                      onClick={() => handleSendMessage("내가 만든 블로그나 홈페이지 주소를 남들에게 알릴 때 딱딱한 IP 숫자 주소 대신, 'myblog.dev' 나 'home.antg.dev' 처럼 나만의 예쁘고 세련된 고유 도메인 주소로 연결하고 싶어요. 이 도메인 연결 과정을 제 눈높이에 맞춰 쉽게 제안해주고 설정해줘.")}
                      className="bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-900/50 hover:border-cyan-500/70 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-300 font-semibold transition cursor-pointer shrink-0 shadow flex items-center gap-1.5 duration-150 disabled:opacity-50"
                    >
                      🌐 내 블로그에 예쁜 이름(도메인) 달아주기
                    </button>
                  </div>
                </div>

                {/* Input form panel - Directly below messages viewport for max standard usability */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(userInput);
                  }}
                  className="bg-[#1A1A1F] border border-slate-705 border-slate-800 rounded-2xl p-2.5 flex items-center gap-2 mt-2"
                >
                  <input
                    type="text"
                    placeholder="의도만 편하게 말씀하세요 (예: 멋진 메인화면 만들어줘, 도메인 연결해줘, 백업해줘)..."
                    value={userInput}
                    disabled={isChatLoading}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 bg-transparent p-2 text-xs text-white focus:outline-none placeholder:text-slate-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !userInput}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition shadow-lg shadow-blue-500/10 shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </form>

                {/* Collapsible Utility Panel Button - Space Saver */}
                <button
                  type="button"
                  onClick={() => setShowExtraTools(!showExtraTools)}
                  className="mt-3 w-full py-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/85 rounded-xl text-[10px] text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer font-bold select-none duration-150 shrink-0"
                >
                  <span>⚡ {showExtraTools ? "시나리오 단추 및 환경 설정 접기" : "원터치 가상 시나리오 단추 & 낭독 옵션 펼치기"}</span>
                  <span className="text-[9px] text-blue-500 font-bold">{showExtraTools ? "▲" : "▼"}</span>
                </button>

                {showExtraTools && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800/70 space-y-3/5 text-left transition-all duration-300">
                    {/* Predeclared Scenario Action Buttons list */}
                    <div className="mb-3.5">
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block mb-2 text-left">
                        ⚡ 원터치 자동 가상 개발 시나리오 단추
                      </span>
                      
                      <div className="flex flex-wrap gap-2 text-left">
                        <button
                          type="button"
                          onClick={() => triggerQuickScenario("Nginx 구성 파일 인젝션", () => {
                            handleSaveFileContent('linux', '/etc/nginx/nginx.conf', `user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;

events { worker_connections 1024; }

http {
    server {
        listen 80;
        server_name custom-domain.dev;
        location / {
            root /var/www/html;
            # Updated live title
            index index.html;
        }
    }
}`);
                            logToTerminal("[Scenario Engine] Injection: Loaded and saved edits into Nginx configuration file.", 'success');
                            handleSendMessage("Nginx 구성 파일(/etc/nginx/nginx.conf)에 사용자 맞춤형 도메인 백엔드 주소를 수정 인젝션했습니다, 도메인 연결 설정과 Nginx 핫리스타트를 수행해줘!");
                          })}
                          className="bg-[#1A1A1F] border border-slate-800 hover:border-blue-500 text-slate-350 py-1.5 px-2.5 rounded-xl text-[10px] font-mono hover:text-blue-400 transition cursor-pointer"
                        >
                          코드인젝션: Nginx 프록시 편집
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerQuickScenario("Postgres DB 도커 볼륨 설계", () => {
                            handleSaveFileContent('linux', '/home/mcp-agent/docker-compose.yml', `version: '3.8'
services:
  mcp-server-fs:
    image: node:20-alpine
    container_name: mcp-fs-bridge
    volumes:
      - /var/www/html:/workspace
    command: npx @modelcontextprotocol/server-filesystem /workspace
  
  # Expanded Postgres Core DB Nodes
  postgres-db-expanded:
    image: postgres:15-alpine
    container_name: expanded-core-db
    environment:
      POSTGRES_DB: antg_expanded_database
      POSTGRES_USER: slo_developer
      POSTGRES_PASSWORD: SecretAccessKeyWithCapital2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`);
                            logToTerminal("[Scenario Engine] Created Postgres compose profile inside home directory.", 'success');
                            handleSendMessage("Docker Compose 볼륨 명세(/home/mcp-agent/docker-compose.yml)에 PostgreSQL 데이터베이스 디플로이 구성을 확장해주고 도커를 기동해줘!");
                          })}
                          className="bg-[#1A1A1F] border border-slate-800 hover:border-blue-500 text-slate-350 py-1.5 px-2.5 rounded-xl text-[10px] font-mono hover:text-blue-400 transition cursor-pointer"
                        >
                          가동: Docker Postgres 확장
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerQuickScenario("도메인 antg.dev 연결 설정 추가", () => {
                            handleAddDomain({
                              hostname: "blog.antg.dev",
                              targetIp: "15.200.12.33",
                              type: "A",
                              sslEnabled: true,
                              sslStatus: "active",
                              proxyStatus: true,
                              ttl: "Auto"
                            });
                            logToTerminal(`[Scenario Engine] Generated dynamic mapping blog.antg.dev IP bindings.`, 'success');
                            handleSendMessage("도메인 바인딩 테이블에 신형 IP 15.200.12.33 타겟 DNS 레코드를 추가하고 도메인 바인딩과 배포 가이드라인을 진행해줘.");
                          })}
                          className="bg-[#1A1A1F] border border-slate-800 hover:border-blue-500 text-slate-350 py-1.5 px-2.5 rounded-xl text-[10px] font-mono hover:text-blue-400 transition cursor-pointer"
                        >
                          도메인: antg.dev DNS 바인딩
                        </button>
                      </div>
                    </div>

                    {/* Audio TTS toggle controls */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-[#1A1A1F] border border-slate-800 rounded-2xl text-[10px] sm:text-xs">
                      <span className="text-slate-400 font-sans flex items-center gap-1.5 pl-1 select-none">
                        <Volume2 size={13} className="text-blue-400 animate-pulse" />
                        자동 답변 음성 낭독 (Auto-Speak feedback audio)
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          className="sr-only peer hover:cursor-pointer"
                          checked={autoSpeak}
                          onChange={(e) => {
                            setAutoSpeak(e.target.checked);
                            if (e.target.checked) {
                              speakResponse("자율 비서의 음성 피드백이 자동 활성화되었습니다.");
                            } else {
                              window.speechSynthesis.cancel();
                            }
                          }}
                        />
                        <div className="w-8 h-4.5 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                      </label>
                    </div>
                  </div>
                )}

              </div>

              {/* Voice simulation control column */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Visualizer voice */}
                <AudioVisualizer
                  isListening={isVoiceListening}
                  onToggleListen={handleToggleVoice}
                  statusText={voiceStatusText}
                />

                {/* Core system stats widget */}
                <div className="bg-[#141417] border border-slate-800 p-5 rounded-3xl text-left shadow-lg flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-3.5 pb-2 border-b border-slate-800">
                      <HardDrive className="text-blue-500" size={14} />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">인프라 시스템 세부 상태</span>
                    </div>

                    <div className="space-y-3">
                      {resources.map((res) => (
                        <div key={res.id} className="bg-[#1A1A1F] p-3.5 border border-slate-800 rounded-2xl text-[11px] leading-relaxed relative">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-white font-sans">{res.name}</span>
                            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-0.5 font-semibold">
                              R_OK
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                            <span>IP: {res.ip}</span>
                            <span className="text-[9px] text-blue-400">{res.specs}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: AI Workspace Automation Generator */}
          {activeTab === 'automation' && (
            <AIWorkspaceGenerator
              onAddDomain={handleAddDomain}
              onSaveFile={handleSaveFileContent}
              onLogTerminal={logToTerminal}
              activeProvider={llmConfig.activeProvider}
            />
          )}

          {/* TAB 2: Dual File explorer view CRUD */}
          {activeTab === 'filesystem' && (
            <FileEditor
              linuxFiles={linuxFiles}
              windowsFiles={windowsFiles}
              onSaveFile={handleSaveFileContent}
              onCreateFile={handleCreateFileNode}
              onDeleteNode={handleDeleteFileNode}
              onResetFiles={handleResetFiles}
              onLogTerminal={logToTerminal}
              platform={platform}
              setPlatform={setPlatform}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              editorContent={editorContent}
              setEditorContent={setEditorContent}
            />
          )}

          {/* TAB 3: DNS planner & Deployment pipeline */}
          {activeTab === 'dns' && (
            <DNSTology
              domains={domains}
              resources={resources}
              onAddDomain={handleAddDomain}
              onToggleProxy={handleToggleProxy}
              onToggleSSL={handleToggleSSL}
              onLogTerminal={logToTerminal}
              onDeployPipeline={async (steps) => {
                logToTerminal("[Deploy Service] Processing manual checklist steps...", 'info');
              }}
            />
          )}

          {/* TAB 4: MCP server management router */}
          {activeTab === 'mcp' && (
            <MCPServerManager
              servers={mcpServers}
              onAddServer={handleAddMCPServer}
              onLogTerminal={logToTerminal}
            />
          )}

          {/* TAB 5: Connection and secrets credentials configuration */}
          {activeTab === 'settings' && (
            <ProviderSettings
              config={llmConfig}
              onChangeConfig={(partial) => setLlmConfig(prev => ({ ...prev, ...partial }))}
              onLogTerminal={logToTerminal}
            />
          )}

        </div>

      </div>

      {/* Modern Static Bottom Active Logs / Console Output Panel */}
      <footer className="border border-slate-800 bg-[#141417] px-6 py-3.5 text-left rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.05)] mt-1">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          <div className="flex-1 max-h-24 overflow-y-auto space-y-1 font-mono text-[11px] pr-4 select-text">
            {terminalLogs.slice(-3).map((l) => (
              <div key={l.id} className="flex gap-2.5 items-start leading-normal">
                <span className="text-slate-600 shrink-0 select-none">[{l.timestamp}]</span>
                <span className={`shrink-0 select-none ${
                  l.type === 'success' ? 'text-emerald-400' : l.type === 'warn' ? 'text-amber-400' : l.type === 'error' ? 'text-rose-400' : 'text-blue-400'
                }`}>
                  {l.type.toUpperCase()}:
                </span>
                <span className="text-slate-350">{l.text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono shrink-0">
            <span className="text-slate-500">Workspace status:</span>
            <span className="text-blue-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              ANTG_ONLINE
            </span>
          </div>

        </div>
      </footer>

      {/* Auth Gate Overlay Modal for Google Drive priority routing */}
      {!googleUser && !dismissGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80">
          <div className="bg-[#141417]/95 max-w-md w-full rounded-2xl border-2 border-blue-500/30 p-8 shadow-[0_0_50px_rgba(37,99,235,0.2)] text-center space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-650/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.15)] animate-pulse">
                <Cloud size={32} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold tracking-tight text-white font-sans uppercase">
                  MCP Drive 보안 연결
                </h2>
                <div className="text-[10px] font-mono text-blue-400 flex items-center justify-center gap-1.5 bg-blue-950/40 border border-blue-900/30 py-1 px-2.5 rounded-lg w-max mx-auto">
                  <ShieldCheck size={11} />
                  <span>CLOUD DATA PARANOID ENGINE v1.4</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans px-2">
                서버 기동 스펙, DNS 및 타임라인 파일셋의 원하지 않는 유출과 동기화 충돌을 방지하기 위해 <strong>Google Drive 연동</strong>이 최우선 보안 요구사항으로 적용됩니다.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition flex items-center justify-center gap-2.5 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.45)]"
              >
                <Cloud size={16} className={isLoggingIn ? "animate-spin" : ""} />
                <span>{isLoggingIn ? "구글 계정 연동 중..." : "구글 계정으로 로그인 및 연동"}</span>
              </button>

              <button
                onClick={() => setDismissGate(true)}
                className="w-full py-2.5 px-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-350 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center justify-center gap-1"
              >
                <span>구글 연동 없이 로컬 모드로만 계속 사용하기 (동기화 비활성)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
