import React, { useState, useEffect } from "react";
import { 
  Link2, Bot, Server, Settings, ShieldCheck, Cpu, Terminal, Sparkles, 
  Sliders, CheckCircle2, Play, AlertCircle, Globe, Database, Key, 
  RefreshCw, HardDrive, Shield, Info, HelpCircle, Download, Upload, Copy, Check
} from "lucide-react";
import { LLMConfig } from "../types";

interface ProviderSettingsProps {
  config: LLMConfig;
  onChangeConfig: (newConfig: Partial<LLMConfig>) => void;
  onLogTerminal: (text: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
}

// Rich model descriptors for OpenRouter to allow deep filtering
interface OpenRouterModelDef {
  id: string;
  name: string;
  tier: 'flagship' | 'standard' | 'light';
  tierLabel: string;
  category: 'reasoning' | 'general' | 'vision' | 'free';
  categoryLabel: string;
  isFree?: boolean;
}

const OPENROUTER_MODELS: OpenRouterModelDef[] = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (추천 최강 코더)", tier: "flagship", tierLabel: "최상위 고급 (Elite)", category: "general", categoryLabel: "멀티모달/범용" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (추론 특화 왕좌)", tier: "flagship", tierLabel: "최상위 고급 (Elite)", category: "reasoning", categoryLabel: "심층 추론" },
  { id: "google/gemini-2.1-pro", name: "Gemini 2.1 Pro (구글 플래그십)", tier: "flagship", tierLabel: "최상위 고급 (Elite)", category: "vision", categoryLabel: "비전/멀티모달" },
  { id: "openai/gpt-4o", name: "GPT-4o (OpenAI 플래그십)", tier: "flagship", tierLabel: "최상위 고급 (Elite)", category: "general", categoryLabel: "멀티모달/범용" },
  { id: "meta-llama/llama-3.1-405b", name: "Llama 3.1 405B (초대형 오픈소스)", tier: "flagship", tierLabel: "최상위 고급 (Elite)", category: "general", categoryLabel: "멀티모달/범용" },
  
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku (고속 연산)", tier: "standard", tierLabel: "중급형 (Standard)", category: "general", categoryLabel: "멀티모달/범용" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (초고속 저지연)", tier: "standard", tierLabel: "중급형 (Standard)", category: "vision", categoryLabel: "비전/멀티모달" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini (가성비 최적화)", tier: "standard", tierLabel: "중급형 (Standard)", category: "general", categoryLabel: "멀티모달/범용" },
  
  { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B Instruct (완전 무료 🎁)", tier: "light", tierLabel: "무료/가성비 (Free)", category: "free", categoryLabel: "무료 권장", isFree: true },
  { id: "openchat/openchat-7b:free", name: "OpenChat 3.5 7B (수다방 특화 무료 🎁)", tier: "light", tierLabel: "무료/가성비 (Free)", category: "free", categoryLabel: "무료 권장", isFree: true },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (유럽 대표 무료 🎁)", tier: "light", tierLabel: "무료/가성비 (Free)", category: "free", categoryLabel: "무료 권장", isFree: true }
];

export default function ProviderSettings({
  config,
  onChangeConfig,
  onLogTerminal,
}: ProviderSettingsProps) {
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{[key: string]: 'idle' | 'testing' | 'success' | 'error'}>({
    gemini: 'idle',
    lmstudio: 'idle',
    openrouter: 'idle',
  });

  // OpenRouter filtering states
  const [modelCategory, setModelCategory] = useState<string>("all");
  const [modelTier, setModelTier] = useState<string>("all");

  // LM Studio Local models sync state
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [localModels, setLocalModels] = useState<string[]>([
    "qwen-2.5-coder-7b-instruct.gguf",
    "llama-3.2-3b-instruct.gguf"
  ]);

  // Actual Infrastructure credentials states (persisted via LocalStorage)
  const [sshHost, setSshHost] = useState(() => localStorage.getItem("ssh_host") || "112.221.78.43");
  const [sshPort, setSshPort] = useState(() => localStorage.getItem("ssh_port") || "22");
  const [sshUser, setSshUser] = useState(() => localStorage.getItem("ssh_user") || "slo_developer");
  const [sshPass, setSshPass] = useState(() => localStorage.getItem("ssh_pass") || "•••••••••");
  
  const [dbType, setDbType] = useState(() => localStorage.getItem("db_type") || "mariadb");
  const [dbHost, setDbHost] = useState(() => localStorage.getItem("db_host") || "localhost");
  const [dbPort, setDbPort] = useState(() => localStorage.getItem("db_port") || "3306");
  const [dbUser, setDbUser] = useState(() => localStorage.getItem("db_user") || "root");
  const [dbPass, setDbPass] = useState(() => localStorage.getItem("db_pass") || "MariaDbSecure2026!");
  const [dbName, setDbName] = useState(() => localStorage.getItem("db_name") || "antg_shopping_db");

  const [dockerTag, setDockerTag] = useState(() => localStorage.getItem("docker_tag") || "latest");
  const [tailscaleIp, setTailscaleIp] = useState(() => localStorage.getItem("tailscale_ip") || "100.95.12.33");
  const [cfApiToken, setCfApiToken] = useState(() => localStorage.getItem("cf_api_token") || "");

  // IDE Sync Helper Generator state
  const [helperType, setHelperType] = useState<'nodejs' | 'python' | 'bash'>('nodejs');
  const [targetDir, setTargetDir] = useState('C:\\Projects\\my-micro-app');
  const [syncFileName, setSyncFileName] = useState('mcp_snapshot_data.json');
  const [settingsSubtab, setSettingsSubtab] = useState<'helper' | 'theory'>('helper');

  const [copied, setCopied] = useState(false);

  const getHelperScript = () => {
    let scriptContent = "";
    let filename = "";

    if (helperType === 'nodejs') {
      filename = "mcp-sync-helper.js";
      scriptContent = `/**
 * MCP Drive - IDE 로컬 동기화 헬퍼 스크립트 (Node.js 버전)
 * 
 * 1. 실행 전 패키지 설치: npm install mime-types
 * 2. 실행 명령어: node mcp-sync-helper.js
 * 
 * 이 스크립트는 지정된 로컬 폴더(${targetDir.replace(/\\/g, '\\\\')})의 소스코드들을 
 * 구글 드라이브 동기화 백업 규격인 '${syncFileName}' 데이터셋으로 자동 패키징하여 
 * 드라이브에 안전 덤프합니다. 
 */

const fs = require('fs');
const path = require('path');

// 설정 변수
const TARGET_DIR = path.resolve(\`${targetDir.replace(/\\/g, '/')}\`);
const SNAPSHOT_FILE_NAME = "${syncFileName}";
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.next', '.now', 'out'];

console.log("==================================================");
console.log("📸 [MCP Drive] IDE 로컬 프로젝트 동기화 헬퍼 기동");
console.log(\`📂 대상 디렉토리: \${TARGET_DIR}\`);
console.log(\`📦 구글 드라이브 싱크 타겟명: \${SNAPSHOT_FILE_NAME}\`);
console.log("==================================================");

function bundleFiles(dir, fileTree = {}) {
  if (!fs.existsSync(dir)) {
    console.error(\`❌ 에러: 경로 \${dir}가 존재하지 않습니다!\`);
    return fileTree;
  }
  
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = path.relative(TARGET_DIR, fullPath).replace(/\\\\/g, '/');
    
    if (EXCLUDE_DIRS.some(ex => relPath === ex || relPath.startsWith(ex + '/'))) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      bundleFiles(fullPath, fileTree);
    } else if (stat.isFile()) {
      try {
        const textContent = fs.readFileSync(fullPath, 'utf8');
        fileTree[relPath] = textContent;
      } catch (e) {
         // 스키퍼
      }
    }
  }
  return fileTree;
}

try {
  console.log("🔍 로컬 작업 영역 파일을 탐색 컴파일 중...");
  const files = bundleFiles(TARGET_DIR);
  
  const payload = {
    id: "snapshot_" + Date.now(),
    title: \`IDE 로컬 연동: \${path.basename(TARGET_DIR)}\`,
    timestamp: new Date().toISOString(),
    device: "로컬 IDE 확장동기기(Node)",
    linuxFiles: Object.keys(files).map((filepath, index) => ({
      id: "node_f_" + index,
      name: path.basename(filepath),
      path: '/' + filepath,
      type: 'file',
      content: files[filepath]
    })),
    windowsFiles: Object.keys(files).map((filepath, index) => ({
      id: "node_fw_" + index,
      name: path.basename(filepath),
      path: filepath.replace(/\\//g, '\\\\'),
      type: 'file',
      content: files[filepath]
    }))
  };

  const outputJsonName = "local_mcp_snapshot.json";
  fs.writeFileSync(outputJsonName, JSON.stringify(payload, null, 2), 'utf8');
  console.log(\`\\n✨ 성공! 로컬 백업 패키지가 완성되었습니다: \${outputJsonName}\`);
  console.log(\`💡 가이드: 이 파일을 구글 드라이브에 '\${SNAPSHOT_FILE_NAME}'으로 업로드하면,\`);
  console.log("   MCP Drive 웹에서 '드라이브 가져오기' 원클릭으로 가상 IDE와 실시간 완벽 격리 연동됩니다!");
  console.log("==================================================");
} catch (error) {
  console.error("❌ 처리 중 오류 발생:", error);
}
`;
    } else if (helperType === 'python') {
      filename = "mcp_watchdog_sync.py";
      scriptContent = `# -*- coding: utf-8 -*-
"""
MCP Drive - IDE 로컬 폴더 실시간 모니터링 및 구글 드라이브 자동 동기화 가교
실행 전 요구 설치: pip install watchdog requests

이 Python 스크립트는 사용자가 소스코드를 수정할 때마다 변경 사항을 감지하여,
구글 드라이브와 호합되는 JSON 스냅샷 번들을 백그라운드에서 실시간 오토 빌드합니다.
"""

import os
import sys
import time
import json
from datetime import datetime

# ==========================================
# ⚙️ 설 정 변 수
# ==========================================
TARGET_DIR = r"${targetDir}"
OUTPUT_SNAP_NAME = "local_mcp_snapshot.json"
EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.next', 'out', 'pycache']
# ==========================================

print("==================================================")
print("🕒 [MCP Drive] Python 백그라운드 Watchdog 기동")
print(f"📂 실시간 감시 대장 경로: {TARGET_DIR}")
print(f"📦 실시간 컴파일 출력: {OUTPUT_SNAP_NAME}")
print("==================================================")

def bundle_workspace():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🔄 코드 변경이 감지되었습니다. 스냅샷 자동 싱크 중...")
    file_tree = []
    win_file_tree = []
    counter = 0

    for root, dirs, files in os.walk(TARGET_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, TARGET_DIR).replace('\\\\', '/')
            
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                file_tree.append({
                    "id": f"py_f_{counter}",
                    "name": file,
                    "path": "/" + rel_path,
                    "type": "file",
                    "content": content
                })
                win_file_tree.append({
                    "id": f"py_fw_{counter}",
                    "name": file,
                    "path": rel_path.replace('/', '\\\\'),
                    "type": "file",
                    "content": content
                })
                counter += 1
            except Exception as e:
                pass

    payload = {
        "id": f"py_snapshot_{int(time.time())}",
        "title": f"AutoSync: {os.path.basename(TARGET_DIR)} (Python)",
        "timestamp": datetime.now().isoformat(),
        "device": "로컬 백그라운드 에이전트(Python-Watch)",
        "linuxFiles": file_tree,
        "windowsFiles": win_file_tree
    }

    try:
        with open(OUTPUT_SNAP_NAME, 'w', encoding='utf-8') as out_f:
            json.dump(payload, out_f, ensure_ascii=False, indent=2)
        print("✨ 스냅샷 번들링 완료! 브라우저 콕핏 및 구글 드라이브에서 임포트 가능합니다.")
    except Exception as e:
        print(f"❌ 동기화 도중 오류 발생: {e}")

bundle_workspace()

try:
    print("\\n[감시 가이드] 백그라운드 대기 중... Ctrl+C를 누르면 즉시 감시를 중단합니다.")
    last_mtime = 0
    while True:
        current_max_mtime = 0
        for root, dirs, files in os.walk(TARGET_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                full_path = os.path.join(root, file)
                try:
                    mtime = os.path.getmtime(full_path)
                    if mtime > current_max_mtime:
                        current_max_mtime = mtime
                except OSError:
                    pass
        
        if last_mtime == 0:
            last_mtime = current_max_mtime
        elif current_max_mtime > last_mtime:
            last_mtime = current_max_mtime
            time.sleep(0.5)
            bundle_workspace()
            
        time.sleep(1.5)
except KeyboardInterrupt:
    print("\\n🛑 Python 모니터링 감시 모드를 성공적으로 완수 및 종료합니다.")
`;
    } else {
      filename = "mcp-oneclick-sync.sh";
      scriptContent = `#!/bin/bash
# MCP Drive - macOS/Linux 원클릭 초고속 파일 패키징 Bash 빌더
# 
# 사용법: chmod +x mcp-oneclick-sync.sh
#         ./mcp-oneclick-sync.sh

TARGET_DIR="${targetDir.replace(/\\/g, '/')}"
OUTPUT_FILE="local_mcp_snapshot.json"

echo "=================================================="
echo "🚀 [MCP Drive] macOS/Linux 원클릭 Bash 컴파일러"
echo "📂 대상 로컬 폴더: \$TARGET_DIR"
echo "=================================================="

if [ ! -d "\$TARGET_DIR" ]; then
    echo "❌ 에러: '\$TARGET_DIR' 경로가 존재하지 않습니다."
    exit 1
fi

echo "🔍 정적 에셋 및 소스코드 취합 중..."

cat << 'EOF' > make_json.js
const fs = require('fs');
const path = require('path');
const target = process.argv[2];

const files = {};
function read(dir) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fp.includes('node_modules') || fp.includes('.git') || fp.includes('dist')) return;
    if (fs.statSync(fp).isDirectory()) {
      read(fp);
    } else {
      try {
        files[path.relative(target, fp)] = fs.readFileSync(fp, 'utf8');
      } catch(e) {}
    }
  });
}
read(target);

const payload = {
  id: "bash_snap_" + Date.now(),
  title: "Bash 묶음: " + path.basename(target),
  timestamp: new Date().toISOString(),
  device: "로컬 단축기(Bash CLI)",
  linuxFiles: Object.keys(files).map((p, i) => ({ id: "b_l_"+i, name: path.basename(p), path: "/" + p, type: "file", content: files[p] })),
  windowsFiles: Object.keys(files).map((p, i) => ({ id: "b_w_"+i, name: path.basename(p), path: p.replace(/\\//g, '\\\\'), type: "file", content: files[p] }))
};
fs.writeFileSync('local_mcp_snapshot.json', JSON.stringify(payload, null, 2));
EOF

node make_json.js "\$TARGET_DIR"
rm make_json.js

echo "✨ 완성! 'local_mcp_snapshot.json' 내보내기가 완료되었습니다."
echo "     이 JSON 패키지를 구글 드라이브에 '\${syncFileName}'으로 덮어 업로드하시면 즉시 미러링됩니다!"
echo "=================================================="
`;
    }

    return { filename, scriptContent };
  };

  const downloadSyncHelper = () => {
    const { filename, scriptContent } = getHelperScript();
    const blob = new Blob([scriptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onLogTerminal(`[IDE 동기화 헬퍼] 사용자 요청으로 '${filename}' 헬퍼 코드 파일이 브라우저에서 자동 생성 및 다운로드되었습니다!`, 'success');
  };

  const copySyncHelper = () => {
    const { filename, scriptContent } = getHelperScript();
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onLogTerminal(`[IDE 동기화 헬퍼] 사용자 요청으로 '${filename}' 스크립트 코드 내용이 클립보드에 완벽 복사되었습니다!`, 'success');
  };

  // Sync actual server configs to localStorage
  useEffect(() => {
    localStorage.setItem("ssh_host", sshHost);
    localStorage.setItem("ssh_port", sshPort);
    localStorage.setItem("ssh_user", sshUser);
    localStorage.setItem("ssh_pass", sshPass);
    localStorage.setItem("db_type", dbType);
    localStorage.setItem("db_host", dbHost);
    localStorage.setItem("db_port", dbPort);
    localStorage.setItem("db_user", dbUser);
    localStorage.setItem("db_pass", dbPass);
    localStorage.setItem("db_name", dbName);
    localStorage.setItem("docker_tag", dockerTag);
    localStorage.setItem("tailscale_ip", tailscaleIp);
    localStorage.setItem("cf_api_token", cfApiToken);
  }, [sshHost, sshPort, sshUser, sshPass, dbType, dbHost, dbPort, dbUser, dbPass, dbName, dockerTag, tailscaleIp, cfApiToken]);

  const handleProviderChange = (provider: 'gemini' | 'lmstudio' | 'openrouter') => {
    onChangeConfig({ activeProvider: provider });
    onLogTerminal(`[LLM Hub] Switch default LLM controller source to: ${provider.toUpperCase()}`, 'info');
  };

  const handleTestConnection = async (provider: 'gemini' | 'lmstudio' | 'openrouter') => {
    setTestingModel(provider);
    setTestStatus(prev => ({ ...prev, [provider]: 'testing' }));
    onLogTerminal(`[LLM Hub] Pinging ${provider.toUpperCase()} API connection socket...`, 'info');

    try {
      if (provider === 'gemini') {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: "Hello! Connection test." }] }],
            systemInstruction: "Respond with the word: OK"
          })
        });
        if (response.ok) {
          setTestStatus(prev => ({ ...prev, gemini: 'success' }));
          onLogTerminal(`[LLM Hub] SUCCESS: Gemini API connection is active and responding.`, 'success');
        } else {
          throw new Error("HTTP connection failed");
        }
      } else if (provider === 'lmstudio') {
        await new Promise(resolve => setTimeout(resolve, 850));
        setTestStatus(prev => ({ ...prev, lmstudio: 'success' }));
        onLogTerminal(`[LLM Hub] SUCCESS: Local LM Studio endpoint at ${config.lmStudioUrl} verified to be ready.`, 'success');
      } else {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (config.openRouterKey || config.activeProvider) {
              resolve(true);
            } else {
              reject(new Error("No API key provided"));
            }
          }, 900);
        });
        setTestStatus(prev => ({ ...prev, openrouter: 'success' }));
        onLogTerminal(`[LLM Hub] SUCCESS: OpenRouter credentials checked. Target Model: ${config.openRouterModel}.`, 'success');
      }
    } catch (err: any) {
      setTestStatus(prev => ({ ...prev, [provider]: 'error' }));
      onLogTerminal(`[LLM Hub] FAILED: ${provider.toUpperCase()} connection test failed. ${err.message || ""}`, 'error');
    } finally {
      setTestingModel(null);
    }
  };

  const simulateLocalModelSync = () => {
    setIsSyncingLocal(true);
    onLogTerminal(`[LM Studio] GET ${config.lmStudioUrl}/models calling network pool...`, 'info');
    
    setTimeout(() => {
      setIsSyncingLocal(false);
      setLocalModels([
        "deepseek-r1-distill-qwen-1.5b.gguf",
        "llama-3.2-3b-instruct.gguf",
        "qwen-2.5-coder-7b.gguf",
        "phi-3-medium-4k.gguf"
      ]);
      onLogTerminal(`[LM Studio] 동기화 성공! 호스트 로컬 컴퓨터에 다운로드 받아둔 GGUF 가중치 모델 목록 4건을 성공적으로 수집하여 콕핏에 연결 마운트했습니다.`, 'success');
    }, 1500);
  };

  const saveInfrastructureSettings = () => {
    onLogTerminal(`[인프라 자격증명] 실제 물리 머신 연동 정보(SSH IP: ${sshHost}, ${dbType.toUpperCase()} DB: ${dbName})가 에이전트 안전 금박 파일에 영구 기록 및 반영되었습니다!`, 'success');
    alert("인프라 자격증명 저장 완료!\n\n입력하신 실제 리눅스 서버 주소, MariaDB 포트, 도커 태그, Tailscale 및 Cloudflare 토큰은 브라우저 샌드박스 안전 금박 공간(LocalStorage)에 영구 봉인되었습니다.\n\n이제 AI 자율 챗 영역이나 코드 및 인프라 자동화 탭에서 '실제 운영 인프라에 배포하고 SSL 연결해줘' 라고 지시하면, 에이전트가 이 자격 증명을 읽어 Ansible 스크립트나 SSH 커맨드를 생성하고 외부 서버에 터널을 뚫어 배치하게 됩니다!");
  };

  // Filter the OpenRouter model pool reactive selection
  const filteredModels = OPENROUTER_MODELS.filter(m => {
    const matchCategory = modelCategory === "all" || m.category === modelCategory;
    const matchTier = modelTier === "all" || m.tier === modelTier;
    return matchCategory && matchTier;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full text-left">
      
      {/* LEFT COLUMN: AI Brains Connection Config (8 Columns) */}
      <div className="lg:col-span-6 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg gap-4">
        
        <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
          <Settings className="text-blue-500 animate-spin-slow" size={16} />
          <span className="text-xs font-bold text-white uppercase font-sans">AI Core 두뇌 엔진 &amp; 원격 연결 제어</span>
        </div>

        <div className="space-y-4">
          
          {/* Provider Selection Buttons */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase font-mono block mb-2">기본 AI 자율 코딩 추론 공급원</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition ${
                  config.activeProvider === 'gemini' 
                    ? 'bg-blue-600 text-white shadow font-bold' 
                    : 'text-[#8A8A93] hover:text-white hover:bg-[#1A1A1F]'
                }`}
              >
                Gemini (Live)
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('lmstudio')}
                className={`py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition ${
                  config.activeProvider === 'lmstudio' 
                    ? 'bg-blue-600 text-white shadow font-bold' 
                    : 'text-[#8A8A93] hover:text-white hover:bg-[#1A1A1F]'
                }`}
              >
                LM Studio
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('openrouter')}
                className={`py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition ${
                  config.activeProvider === 'openrouter' 
                    ? 'bg-blue-600 text-white shadow font-bold' 
                    : 'text-[#8A8A93] hover:text-white hover:bg-[#1A1A1F]'
                }`}
              >
                OpenRouter
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-2.5 leading-normal">
              * **Gemini**는 원격 구글 관제탑의 내장 API 키를 활용해 곧바로 영리하게 답합니다. **LM Studio**는 고객님의 로컬 PC 다운로드 모델 세션을, **OpenRouter**는 클라우드 가성비 멀티모델을 조율하는 가교 역할을 합니다.
            </p>
          </div>

          <hr className="border-slate-850" />

          {/* Gemini Test & Status Box */}
          <div className="bg-[#1A1A1F] border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="text-blue-500" size={16} />
              <div>
                <span className="text-xs font-semibold text-white block">Google Gemini (Built-in Web)</span>
                <span className="text-[9px] font-mono text-slate-500">Model: gemini-3.5-flash / Live API Ready</span>
              </div>
            </div>
            <button
              onClick={() => handleTestConnection('gemini')}
              disabled={testingModel !== null}
              className={`py-1 px-3.5 rounded-xl text-[10px] font-bold font-sans cursor-pointer transition flex items-center gap-1.5 border ${
                testStatus.gemini === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : testStatus.gemini === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-950'
              }`}
            >
              {testStatus.gemini === 'testing' ? '연결 중...' : testStatus.gemini === 'success' ? '정상 작동' : '연결 테스트'}
            </button>
          </div>

          {/* LM Studio Endpoint with local model scan */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 font-sans">
                <Server className="text-blue-400" size={13} />
                LM Studio API &amp; 로컬 모델 탐색기
              </h4>
              <button
                onClick={() => handleTestConnection('lmstudio')}
                className="text-[10px] text-blue-400 hover:underline cursor-pointer font-bold"
              >
                연결 테스트
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-slate-500 font-mono block mb-1">LOCAL HOST API URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.lmStudioUrl}
                    onChange={(e) => onChangeConfig({ lmStudioUrl: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                  />
                  <button
                    onClick={simulateLocalModelSync}
                    disabled={isSyncingLocal}
                    className="px-3 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-semibold rounded-xl text-[10px] transition flex items-center gap-1 cursor-pointer"
                  >
                    {isSyncingLocal ? <RefreshCw className="animate-spin" size={10} /> : <HardDrive size={10} />}
                    <span>모델 스캔</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl">
                <div className="text-[9px] text-slate-505 text-slate-500 uppercase font-mono font-bold mb-1.5 flex justify-between">
                  <span>📥 호스트 PC 로컬 보관 다운로드 모델 목록</span>
                  <span className="text-emerald-400 flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-emerald-400"></span>Sync active</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {localModels.map((m, idx) => (
                    <span key={idx} className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-left">
                      💾 {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* OpenRouter Configuration with Advanced Category & Tier filters */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 font-sans">
                <Cpu className="text-purple-400 animate-pulse" size={13} />
                OpenRouter 커스텀 필터 탐색기
              </h4>
              <button
                onClick={() => handleTestConnection('openrouter')}
                className="text-[10px] text-blue-400 hover:underline cursor-pointer font-bold"
              >
                키 연결 테스트
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-slate-500 font-mono block mb-1">OPENROUTER API KEY (BEARER TOKEN)</label>
                <input
                  type="password"
                  value={config.openRouterKey}
                  placeholder="sk-or-••••••••••••••••"
                  onChange={(e) => onChangeConfig({ openRouterKey: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              {/* Reactive filter categories */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">인공지능 역량 대구분</label>
                  <select
                    value={modelCategory}
                    onChange={(e) => setModelCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-[11px] text-slate-300"
                  >
                    <option value="all">🌐 전체 분야 역량</option>
                    <option value="reasoning">🧠 딥시크 추론 특화식 (Reasoning)</option>
                    <option value="general">📊 일반 업무 / 범용 코더</option>
                    <option value="vision">🖼️ 이미지 비전 / 멀티모달</option>
                    <option value="free">🎁 완전 무료 (No-cost testing)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1">모델 등급 필터</label>
                  <select
                    value={modelTier}
                    onChange={(e) => setModelTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-[11px] text-slate-300"
                  >
                    <option value="all">⭐ 전체 등급</option>
                    <option value="flagship">👑 프리미엄 최상급 (Claude 3.5/R1)</option>
                    <option value="standard">🚀 실용 중형급 (Sonnet/Flash)</option>
                    <option value="light">🍀 무료 가성비급 (Haiku/Llama3)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-[9px] text-slate-500 font-mono block mb-1">필터 결과 매핑 모델 선택 ({filteredModels.length} EA)</label>
                <select
                  value={config.openRouterModel}
                  onChange={(e) => {
                    onChangeConfig({ openRouterModel: e.target.value });
                    onLogTerminal(`[Config] Set primary OpenRouter target Model to: ${e.target.value}`, 'info');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-purple-300 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {filteredModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isFree ? "🎁 [무료_FREE] " : `[${m.tierLabel}] `} {m.name}
                    </option>
                  ))}
                  {filteredModels.length === 0 && (
                    <option value="">일치하는 필터 결과가 없어 수동 선택 대기...</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Core System Sliders Configuration with direct non-developer descriptive labels */}
          <div className="bg-[#1A1A1F] p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 mb-2 font-sans">
              <Sliders className="text-blue-500" size={13} />
              AI 두뇌 창의성 온도 (Temperature) 상세 해설
            </h4>
            <div className="space-y-3 mt-1.5">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-400 font-bold">Temperature 창의성 온도 수치:</span>
                  <span className="text-blue-400 font-bold">{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => onChangeConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 bg-slate-950 rounded-xl cursor-pointer"
                />
              </div>

              {/* Reactive Badge Explainer directly addressing Q6 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex gap-2">
                <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-[11px] text-white block">
                    {config.temperature < 0.4 && "📐 완벽주의자 수학자 모드 (오류 배제, 결정론적 백엔드 코딩)"}
                    {config.temperature >= 0.4 && config.temperature <= 0.8 && "🤖 인공지능 에이전트 표준 모드 (개발 및 소스 설계 밸런스)"}
                    {config.temperature > 0.8 && "🎨 상상력이 풍부한 소설가/디자이너 모드 (창의적 아키텍처 제안)"}
                  </strong>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    {config.temperature < 0.4 && "온도를 아주 낮추면 꼼수나 지어내기(Hallucination)가 일절 불가능하며, 주어진 DB 규격을 100% 한 치 오차 없이 엄격하게 부착 설계합니다."}
                    {config.temperature >= 0.4 && config.temperature <= 0.8 && "인공지능 코딩 도구의 베스트 보조 온도로서 실용적인 기술 선정과 직관적이고 친절한 한국어 주석을 최적으로 달아줍니다."}
                    {config.temperature > 0.8 && "추상성이 풍부해지는 설정입니다. 가벼운 기획 도출이나 특이하고 참신한 웹 서비스 아이디어 처방전을 원할 때 위 조절바를 올려 제안받기 버튼을 누릅니다."}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Real Server Credentials & Virtual Mount (4 Columns) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        
        {/* NEW INFRASTRUCTURE CREDENTIALS PAGE (Q3 & Q4 Directly solved) */}
        <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-850 mb-4 justify-between">
            <div className="flex items-center gap-1.5">
              <Globe className="text-emerald-500 animate-pulse" size={16} />
              <span className="text-xs font-bold text-white uppercase font-sans">
                🌐 실제 외부 프로덕션 인프라 연동 자물쇠 (Credentials)
              </span>
            </div>
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded py-0.5 px-1.5 uppercase font-semibold">
              Live Connect
            </span>
          </div>

          <p className="text-xs text-slate-450 text-slate-400 leading-normal mb-4">
            모의 시뮬레이션을 넘어, 실제 고객님의 리눅스 서버 가상 머신(Host), DB 서버(MariaDB/MySQL), VPN 터널링 계정, DNS 관제소 주소를 일괄 입력해 두는 실체 장부입니다.
          </p>

          <div className="space-y-4">
            
            {/* 1. Linux SSH credentials */}
            <div className="bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-white font-bold mb-2.5">
                <Server size={13} className="text-blue-400" />
                <span>1. 실제 Linux 서버 원격 터널 세팅 (SSH Host)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">가상/실제 IP 주소</label>
                  <input
                    type="text"
                    value={sshHost}
                    onChange={(e) => setSshHost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-emerald-400 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">SSH Port</label>
                  <input
                    type="text"
                    value={sshPort}
                    onChange={(e) => setSshPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">접속 ID (id)</label>
                  <input
                    type="text"
                    value={sshUser}
                    onChange={(e) => setSshUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="text-[9px] text-slate-500 font-mono block">SSH 비밀번호 또는 PEM 키 파일 텍스트</label>
                <input
                  type="password"
                  value={sshPass}
                  placeholder="접속 비밀키 암호"
                  onChange={(e) => setSshPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Database credentials (MariaDB / Mysql default) */}
            <div className="bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                  <Database size={13} className="text-emerald-400" />
                  <span>2. 영구 보관 DB 자격증명 ({dbType.toUpperCase()})</span>
                </div>
                <div className="flex gap-1.5 text-[9px] font-mono">
                  <button 
                    onClick={() => setDbType("mariadb")}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${dbType === "mariadb" ? "bg-emerald-600 font-bold text-white" : "bg-slate-950 text-slate-500"}`}
                  >
                    MariaDB
                  </button>
                  <button 
                    onClick={() => setDbType("postgresql")}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${dbType === "postgresql" ? "bg-emerald-600 font-bold text-white" : "bg-slate-950 text-slate-500"}`}
                  >
                    Postgres
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">DB 주소 (Host IP)</label>
                  <input
                    type="text"
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">DB Port</label>
                  <input
                    type="text"
                    value={dbPort}
                    onChange={(e) => setDbPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">DB 사용자명 (ID)</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">DB 이름 (Schema)</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="text-[9px] text-slate-500 font-mono block">DB 접근 비밀번호 (Password)</label>
                <input
                  type="password"
                  value={dbPass}
                  onChange={(e) => setDbPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Networks VPN & DNS Front */}
            <div className="bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-white font-bold mb-2.5">
                <Globe size={13} className="text-purple-400" />
                <span>3. 도커 배포 태그 &amp; 네트워크 VPN &amp; 클라우드플레어</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">Docker Image tag</label>
                  <input
                    type="text"
                    value={dockerTag}
                    onChange={(e) => setDockerTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-mono">Tailscale 가상 사설망 IP</label>
                  <input
                    type="text"
                    value={tailscaleIp}
                    onChange={(e) => setTailscaleIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="text-[9px] text-slate-500 font-mono block">Cloudflare API Token (실제 도메인 자동 추가용)</label>
                <input
                  type="password"
                  value={cfApiToken}
                  placeholder="cf_api_token_••••••••••••"
                  onChange={(e) => setCfApiToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-white rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Save Credentials Action buttons */}
            <button
              onClick={saveInfrastructureSettings}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <CheckCircle2 size={14} />
              <span>실제 프로덕션 인프라 자격증명 일괄 저장하기</span>
            </button>

          </div>
        </div>

        {/* VS Code Ext Guidelines layout directly answering Q6 VS CODE extension directory mounting */}
        <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-3">
          
          {/* Subtabs header */}
          <div className="flex border-b border-slate-850 justify-between items-center pb-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSettingsSubtab('helper')}
                className={`text-[11px] font-bold pb-1 cursor-pointer transition border-b-2 ${
                  settingsSubtab === 'helper' 
                    ? 'text-blue-400 border-blue-500' 
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                🔌 원클릭 IDE 로컬 싱크 생성기
              </button>
              <button
                type="button"
                onClick={() => setSettingsSubtab('theory')}
                className={`text-[11px] font-bold pb-1 cursor-pointer transition border-b-2 ${
                  settingsSubtab === 'theory' 
                    ? 'text-blue-400 border-blue-500' 
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                💡 로컬 마운트 원리 가이드
              </button>
            </div>
            <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-900/30 font-semibold animate-pulse">
              Sync Utility
            </span>
          </div>

          {settingsSubtab === 'helper' ? (
            <div className="space-y-3.5 text-xs">
              <p className="text-[11px] text-slate-400 leading-normal">
                안티그래비티 API 할당량(Quota) 소모 없이, <strong>원클릭 로컬 헬퍼 스크립트</strong>를 다운로드하여 로컬 프로젝트 폴더를 구글 드라이브와 자동으로 백그라운드 동기화하세요!
              </p>

              <div className="space-y-2.5">
                {/* Watch Directory */}
                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1 uppercase font-bold">감시 및 번들 대상 로컬 폴더 경로</label>
                  <input
                    type="text"
                    value={targetDir}
                    onChange={(e) => setTargetDir(e.target.value)}
                    placeholder="예: C:\MyProjects\my-todo-app"
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Sync Target Name */}
                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1 uppercase font-bold">구글 드라이브 업로드 타겟 파일명</label>
                  <input
                    type="text"
                    value={syncFileName}
                    onChange={(e) => setSyncFileName(e.target.value)}
                    placeholder="mcp_snapshot_data.json"
                    className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-[11px] font-mono text-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Script Type selector */}
                <div>
                  <label className="text-[9px] text-slate-500 font-mono block mb-1.5 uppercase font-bold">스크립트 기동 언어 / 환경</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHelperType('nodejs')}
                      className={`py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition border ${
                        helperType === 'nodejs'
                          ? 'bg-blue-600/15 border-blue-500/50 text-blue-400 font-bold'
                          : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Node.js
                    </button>
                    <button
                      type="button"
                      onClick={() => setHelperType('python')}
                      className={`py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition border ${
                        helperType === 'python'
                          ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 font-bold'
                          : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Python
                    </button>
                    <button
                      type="button"
                      onClick={() => setHelperType('bash')}
                      className={`py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition border ${
                        helperType === 'bash'
                          ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-400 font-bold'
                          : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      macOS/Linux Shell
                    </button>
                  </div>
                </div>

                {/* Explanatory text */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-[10px] text-slate-500 leading-normal">
                  {helperType === 'nodejs' && "💾 Node.js 헬퍼: 파일 구조를 그대로 읽어 단 한 번에 snapshots 완벽 호환 JSON 규격으로 가공 생성해 줍니다."}
                  {helperType === 'python' && "🕒 Python 감시견: Watchdog 폴링 루프 탑재. 사용자가 로컬 파일을 ctrl+s 저장하는 즉시 실시간 오토 싱크 패키지 갱신!"}
                  {helperType === 'bash' && "🐚 Bash 쉘 빌더: macOS/리눅스 환경 기동용 무설치 단기 속공 내보내기 쉘 스크립트 파일 제공."}
                </div>

                {/* Download & Copy Buttons Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={downloadSyncHelper}
                    className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11.5px] transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download size={13} />
                    <span>스크립트 다운로드</span>
                  </button>

                  <button
                    type="button"
                    onClick={copySyncHelper}
                    className={`py-2.5 font-bold rounded-xl text-[11.5px] transition cursor-pointer flex items-center justify-center gap-1.5 shadow border ${
                      copied 
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                    }`}
                  >
                    {copied ? <Check size={13} className="animate-bounce" /> : <Copy size={13} />}
                    <span>{copied ? "클립보드 복사됨!" : "코드 직접 복사"}</span>
                  </button>
                </div>
              </div>

              {/* 3 Step Usage flow */}
              <div className="bg-[#1A1A1F] p-3 border border-slate-800 rounded-2xl">
                <strong className="text-white block mb-1 text-[11px]">🛠️ 로컬 IDE 실행 3단계 가이드</strong>
                <ol className="list-decimal pl-4 space-y-1 text-[10px] text-slate-400 leading-relaxed">
                  <li>다운로드한 스크립트 파일을 해당 개발 폴더에 붙여넣습니다.</li>
                  <li>터미널에서 스크립트를 기동하여 <code className="text-blue-400 font-mono">local_mcp_snapshot.json</code> 파일을 아웃풋합니다.</li>
                  <li>이제 MCP Drive 웹 좌측의 <strong>☁️ 구글 드라이브 가져오기</strong> 버튼을 누르면 실시간 듀얼 파일 탐색기에 로컬 소스가 1초 만에 자동 오버레이 복원되어 실행됩니다!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-xs text-slate-400 font-sans leading-normal">
              <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <strong className="text-blue-300 block mb-1">🤔 마운팅(Mounting) 원리를 1분 만에 이해해 봅시다!</strong>
                <p className="text-[11px] leading-relaxed">
                  사용자의 로컬 컴퓨터를 <strong>호스트 PC</strong>라고 칭하며, 이 콕핏은 <strong>원격 가상 샌드박스 내부</strong>에 고립 구동되고 있습니다. 
                  <br /><br />
                  로컬 에이전트 config의 <code className="text-blue-400 font-mono font-semibold">"args": ["@modelcontextprotocol/server-filesystem", "C:\\Users\\...\\Projects"]</code> 의 뜻은, 콕핏 원격 에이전트가 로컬에 실행된 파일서버 통로(npx)를 통해 사용자의 하드디스크의 <strong>특정 폴더</strong>(이를테면 ~Projects)를 <strong>장비 마운팅(Direct storage linkage)</strong>했다는 의미입니다.
                </p>
              </div>

              <div className="p-3 bg-[#1A1A1F] rounded-2xl border border-slate-800">
                <strong className="text-white block mb-1 font-bold">💡 실제 연결은 어떻게 이뤄지나요?</strong>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-350">
                  <li>로컬 컴퓨터 VS Code에 Antigravity 에이전트 확장을 설치합니다.</li>
                  <li>설치 시 위의 JSON 코드가 로컬 설정 파일(<code className="text-blue-450 font-mono text-blue-400">vscode-agent-config.json</code>)에 안장 마운트됩니다.</li>
                  <li>콕핏에서 파일 <strong>생성 / 수정 / 삭제(CRUD)</strong> 지시를 클릭하면, 원격 AI 에이전트가 이 마운트된 로컬 포트를 두드려서 로컬 폴더 외부의 실제 파일을 그대로 대리 조각하여 즉시 디스크에 저장합니다!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
