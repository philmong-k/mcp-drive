import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Terminal, Radio, Globe, FolderCode, Layers, Cpu, Compass, HardDrive, 
  Send, Sparkles, Smile, MessageSquare, Volume2, Mic, MicOff, Settings, 
  HelpCircle, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight,
  Database, LogOut, Upload, Download, Cloud
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
  const voiceTimeoutRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto Scroll ref for chat
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Speech synthesis speaker helper
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove any code blocks inside modeling reply to make speaking clean
      const cleanText = text
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, '코드블럭 생략')
        .replace(/[*#_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 180));
      utterance.lang = "ko-KR";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
      logToTerminal(`[Audio TTS] Speaking response audio playback...`, 'success');
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
    if (msgLower.includes("nginx") || msgLower.includes("nginx.conf")) {
      setTimeout(() => {
        handleSaveFileContent('linux', '/etc/nginx/nginx.conf', `server {
    listen 80;
    server_name mcp-control.dev;
    location / {
        root /var/www/html;
        index index.html;
    }
}`);
        logToTerminal("[MCP 스마트 가교 Service] 🚀 AI 에이전트가 챗 명령을 접수하여 '/etc/nginx/nginx.conf' 파일을 직접 수정했습니다!", "success");
      }, 1200);
    } else if (msgLower.includes("도메인") || msgLower.includes("dns") || msgLower.includes("cloudflare")) {
      setTimeout(() => {
        handleAddDomain({
          hostname: "api-agent.antg.dev",
          targetIp: "128.91.43.11",
          type: "A",
          sslEnabled: true,
          sslStatus: "active",
          proxyStatus: true,
          ttl: "Auto"
        });
        logToTerminal("[MCP 스마트 가교 Service] 🌐 AI 에이전트가 'api-agent.antg.dev' (IP: 128.91.43.11) DNS 레코드를 켜고 프록시를 바인딩했습니다!", "success");
      }, 1500);
    } else if (msgLower.includes("mcp") || msgLower.includes("mcp 서버") || msgLower.includes("허브") || msgLower.includes("mcp hub")) {
      setTimeout(() => {
        handleAddMCPServer("MCP-Sqlite-Db", "SSE", "http://localhost:5500/sse");
        logToTerminal("[MCP 스마트 가교 Service] 🔌 챗 대화 중 탐지된 DB 요구사항에 맞추어 'MCP-Sqlite-Db' 서버를 스마트 허브에 자동 플러그인 마운트했습니다!", "success");
      }, 1000);
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
          systemInstruction: "You are Antigravity IDE AI Agent, an elite full-stack autonomous coding/dev assistant. Always reply politely in Korean (한국어로 상냥하게). Give concrete configurations, code examples, or explanations when coding is discussed. Reference files, domains, or infrastructure nodes explicitly if necessary.",
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0C] text-slate-300 selection:bg-blue-500/35 selection:text-blue-100 font-sans p-4 gap-4 overflow-x-hidden">
      
      {/* Dynamic Top Header with status indicators */}
      <header className="border border-slate-800 bg-[#141417] px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.08)] z-20">
        
        {/* Title branding */}
        <div className="flex items-center gap-3">
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
        <div className="xl:col-span-3 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl overflow-hidden p-5 shadow-lg h-fit">
          <div className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider mb-3 px-1.5">
            제어 영역 선택
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('chat')}
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
              onClick={() => setActiveTab('automation')}
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
              onClick={() => setActiveTab('filesystem')}
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
              onClick={() => setActiveTab('dns')}
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
              onClick={() => setActiveTab('mcp')}
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
              onClick={() => setActiveTab('settings')}
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

          <hr className="border-slate-800 my-4" />

          {/* Dynamic helper card */}
          <div className="bg-[#1A1A1F] p-4 rounded-2xl border border-slate-800 text-left text-xs text-slate-400 leading-relaxed font-sans mb-4">
            <strong className="text-slate-200 block mb-1">💡 원스톱 개발 환경 제어팁:</strong>
            자율 에이전트 챗 영역에서 텍스트 또는 마이크 버튼을 통해 듀얼 OS 파일들과 프록시 DNS 정보를 자동으로 편집할 수 있습니다. 
          </div>

          {/* Google Drive Secure Cloud Integration Hub */}
          <div className="bg-[#141417]/80 rounded-2xl border border-slate-800 p-4 font-sans text-left mb-4 shadow-md">
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
                    <span>드라이브 가져오기</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cloud multi-session Snapshot Hub widget */}
          <div className="bg-[#141417]/80 rounded-2xl border border-slate-800 p-4 font-sans text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wide">
                <Database size={13} className="text-blue-400" />
                <span>클라우드 세션 타임라인 Hub</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded border border-blue-800/30">
                {snapshots.length}개 보관 중
              </span>
            </div>

            <p className="text-[10px] text-slate-500 mb-2.5 leading-relaxed">
              중요 작업 단계를 고유 이름으로 저장해두면 세션/기기를 불만하고 복원할 수 있습니다. 각 시점에 덮어쓰거나 관리할 수 있습니다.
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
                            onClick={() => handleRestoreSnapshot(snap)}
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
                            덮어쓰기
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
                          <div className={`p-3.5 rounded-2xl block text-slate-200 whitespace-pre-wrap text-left relative group/bubble ${
                            isModel 
                              ? "bg-[#1A1A1F] border border-slate-800" 
                              : "bg-blue-600/10 border border-blue-500/20 text-blue-100"
                          }`}>
                            {m.parts[0].text}
                            
                            {isModel && (
                              <button
                                onClick={() => speakResponse(m.parts[0].text)}
                                title="음성 안내 재생"
                                className="absolute right-2.5 bottom-2.5 p-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-400 hover:text-blue-400 opacity-0 group-hover/bubble:opacity-100 transition cursor-pointer"
                              >
                                <Volume2 size={12} />
                              </button>
                            )}
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

                {/* Predeclared Scenario Action Buttons list */}
                <div className="mb-4 pt-4 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block mb-2.5 text-left">
                    ⚡ 원터치 자동 가상 개발 시나리오 단추
                  </span>
                  
                  <div className="flex flex-wrap gap-2 text-left">
                    <button
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
                      className="bg-[#1A1A1F] border border-slate-800 hover:border-blue-500 text-slate-350 py-1.5 px-3 rounded-xl text-[10px] font-mono hover:text-blue-400 transition cursor-pointer"
                    >
                      코드인젝션: Nginx 프록시 편집
                    </button>

                    <button
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
                      className="bg-[#1A1A1F] border border-slate-800 hover:border-blue-500 text-slate-350 py-1.5 px-3 rounded-xl text-[10px] font-mono hover:text-blue-400 transition cursor-pointer"
                    >
                      가동: Docker Postgres 확장
                    </button>

                    <button
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
                      className="bg-[#1A1A1F] border border-slate-800 hover:border-blue-500 text-slate-350 py-1.5 px-3 rounded-xl text-[10px] font-mono hover:text-blue-400 transition cursor-pointer"
                    >
                      도메인: antg.dev DNS 바인딩
                    </button>
                  </div>
                </div>

                {/* Audio TTS toggle controls */}
                <div className="flex items-center justify-between gap-2 mb-3.5 p-2 bg-[#1A1A1F] border border-slate-800 rounded-2xl text-[10px] sm:text-xs">
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

                {/* Input form panel */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(userInput);
                  }}
                  className="bg-[#1A1A1F] border border-slate-705 border-slate-800 rounded-2xl p-2.5 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="에이전트에게 코딩, 파일 수정, 도메인 연결을 지시하세요..."
                    value={userInput}
                    disabled={isChatLoading}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 bg-transparent p-2 text-xs text-white focus:outline-none placeholder:text-slate-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !userInput}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition shadow-lg shadow-blue-500/10"
                  >
                    <Send size={15} />
                  </button>
                </form>

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
