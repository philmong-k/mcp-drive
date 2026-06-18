import React, { useState } from "react";
import { Globe, Server, Database, ShieldAlert, ShieldCheck, Cpu, Power, Play, RefreshCw, Plus, CheckCircle2, ChevronRight, HardDrive, Unplug } from "lucide-react";
import { DomainMapping, CloudResource } from "../types";

interface DNSTologyProps {
  domains: DomainMapping[];
  resources: CloudResource[];
  onAddDomain: (domain: Omit<DomainMapping, 'id'>) => void;
  onToggleProxy: (id: string) => void;
  onToggleSSL: (id: string) => void;
  onDeployPipeline: (steps: { title: string; delay: number }[]) => void;
  onLogTerminal: (text: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
}

export default function DNSTology({
  domains,
  resources,
  onAddDomain,
  onToggleProxy,
  onToggleSSL,
  onDeployPipeline,
  onLogTerminal,
}: DNSTologyProps) {
  // Domain Input Form State
  const [subdomain, setSubdomain] = useState<string>("");
  const [targetIp, setTargetIp] = useState<string>("15.200.12.33");
  const [recordType, setRecordType] = useState<'A' | 'CNAME' | 'TXT' | 'AAAA'>('A');

  // Deployment Steps Simulation State
  const [deploying, setDeploying] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);

  const deploymentWorkflow = [
    { title: "Bundling Assets (vite build)", desc: "Analyzing React bundle, outputting optimized chunks to dist/" },
    { title: "Building Backend (esbuild server.ts)", desc: "Transpiling and bundling Express server code to single dist/server.cjs payload" },
    { title: "Checking Virtual DNS Propagation", desc: "Verifying active DNS mappings with proxy network route" },
    { title: "Containerization & Hot Rolling Restart", desc: "docker-compose up -d syncing persistent data volumes" },
    { title: "Let's Encrypt SSL Handshake", desc: "Generating secure certificates for domain targets" },
  ];

  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) return;
    onAddDomain({
      hostname: subdomain,
      targetIp: targetIp,
      type: recordType,
      sslEnabled: true,
      sslStatus: 'active',
      proxyStatus: true,
      ttl: "Auto"
    });
    onLogTerminal(`[DNS Registry] Created dynamic route mapping: ${subdomain} -> ${targetIp}`, 'success');
    setSubdomain("");
  };

  const triggerDeployment = async () => {
    if (deploying) return;
    setDeploying(true);
    setCurrentStepIdx(0);
    setCompletedSteps([]);
    setPipelineProgress(5);
    onLogTerminal("[Deploy Automation] Commencing Antigravity automated full-stack pipeline deployment...", 'info');

    for (let i = 0; i < deploymentWorkflow.length; i++) {
      setCurrentStepIdx(i);
      onLogTerminal(`[Deploy Automation] Running Step ${i+1}/${deploymentWorkflow.length}: ${deploymentWorkflow[i].title}`, 'info');
      
      // wait for some simulation delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      setCompletedSteps(prev => [...prev, i]);
      setPipelineProgress(Math.floor(((i + 1) / deploymentWorkflow.length) * 100));
      onLogTerminal(`[Deploy Automation] SUCCESS: Step ${i+1} finalized.`, 'success');
    }

    setDeploying(false);
    setCurrentStepIdx(-1);
    onLogTerminal("[Deploy Automation] SYSTEM REBUILD LOG: Deployment synchronized. Service launched live seamlessly!", 'success');
    alert("인프라 빌드 및 도메인 바인딩 배포 파이프라인이 성공적으로 가동 완료되었습니다!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
      
      {/* Topology Map Panel (Desktop Flow Visualization) */}
      <div className="xl:col-span-12 bg-[#141417] border border-slate-800 rounded-3xl p-5 overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-850">
          <Globe className="text-blue-500" size={16} />
          <h3 className="text-sm font-semibold tracking-tight text-white font-sans">
            인프라 아키텍처 및 트래픽 실시간 가상 플로우
          </h3>
        </div>

        {/* Visual pipeline path */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 py-4 px-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          
          {/* Node 1: Client web */}
          <div className="flex flex-col items-center bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl w-28 text-center text-[11px] shrink-0">
            <Globe className="text-blue-500 mb-1.5" size={20} />
            <span className="font-semibold text-slate-200 truncate w-full font-sans">브라우저/사용자</span>
            <span className="text-[10px] text-slate-500 font-mono">CORS Request</span>
          </div>

          <ChevronRight className="text-slate-600 hidden md:block" size={16} />

          {/* Node 2: DNS Proxy */}
          <div className="flex flex-col items-center bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl w-32 text-center text-[11px] shrink-0">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-semibold text-slate-200 font-sans">DNS Gateway</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate w-full mt-1">antg.dev (Proxy)</span>
            <span className="text-[9px] text-amber-500 uppercase font-mono tracking-wider mt-0.5">SSL Active</span>
          </div>

          <ChevronRight className="text-slate-600 hidden md:block" size={16} />

          {/* Node 3: Reverse Nginx Proxy */}
          <div className="flex flex-col items-center bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl w-32 text-center text-[11px] shrink-0">
            <Server className="text-blue-500 mb-1.5 animate-pulse" size={18} />
            <span className="font-semibold text-slate-200 font-sans">Nginx Web Server</span>
            <span className="text-[9px] text-blue-400 font-mono mt-0.5">Proxy: Port 80-&gt;3000</span>
          </div>

          <ChevronRight className="text-slate-600 hidden md:block" size={16} />

          {/* Node 4: Backend Node Server */}
          <div className="flex flex-col items-center bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl w-32 text-center text-[11px] shrink-0">
            <Cpu className="text-purple-400 mb-1.5" size={18} />
            <span className="font-semibold text-slate-200 font-sans font-sans">Express Backend</span>
            <span className="text-[9px] text-purple-400 font-mono mt-0.5">Port 3000 Active</span>
          </div>

          <ChevronRight className="text-slate-600 hidden md:block" size={16} />

          {/* Node 5: Postgres DB */}
          <div className="flex flex-col items-center bg-[#1A1A1F] border border-slate-800 p-3.5 rounded-2xl w-32 text-center text-[11px] shrink-0">
            <Database className="text-emerald-500 mb-1.5" size={18} />
            <span className="font-semibold text-slate-200 font-sans">PostgreSQL DB</span>
            <span className="text-[9px] text-emerald-400 font-mono mt-0.5">Volume Persistent</span>
          </div>

        </div>
      </div>

      {/* Domain Mapping controls */}
      <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* DNS Management Table */}
        <div className="lg:col-span-7 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
            <div className="flex items-center gap-1.5">
              <Globe className="text-blue-500 animate-spin" size={15} />
              <span className="text-xs font-bold text-white uppercase font-sans">도메인 바인딩 및 DNS 테이블</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Total mappings: {domains.length}</div>
          </div>

          <form onSubmit={handleAddDomainSubmit} className="grid grid-cols-12 gap-2 mb-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <div className="col-span-3">
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-250 font-mono"
              >
                <option value="A">A</option>
                <option value="CNAME">CNAME</option>
                <option value="AAAA">AAAA</option>
                <option value="TXT">TXT</option>
              </select>
            </div>
            <div className="col-span-4">
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">도메인 주소</label>
              <input
                type="text"
                placeholder="예: blog.antg.dev"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Target IP / Target Domain</label>
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2 flex items-end">
              <button
                type="submit"
                disabled={!subdomain}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10"
              >
                <Plus size={14} />
                추가
              </button>
            </div>
          </form>

          {/* Domains scroll table */}
          <div className="flex-1 overflow-x-auto min-h-[180px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3 font-mono text-[10px] uppercase">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-400">Hostname</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-400">Target IP / Target Domain</th>
                  <th className="py-2.5 px-2 font-semibold text-slate-400 text-center">Proxy</th>
                  <th className="py-2.5 px-2 font-semibold text-slate-400 text-center">SSL Certification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-350 font-mono">
                {domains.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-850/40">
                    <td className="py-2.5 px-3 text-blue-400 font-bold">{d.type}</td>
                    <td className="py-2.5 px-3 text-slate-100">{d.hostname}</td>
                    <td className="py-2.5 px-3 text-slate-400">{d.targetIp}</td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => {
                          onToggleProxy(d.id);
                          onLogTerminal(`[DNS Control] Toggled Orange Proxy shield for: ${d.hostname}`, 'info');
                        }}
                        className={`py-1 px-3.5 rounded-xl text-[9px] font-bold cursor-pointer transition ${
                          d.proxyStatus 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-500 border border-slate-705 border-slate-700'
                        }`}
                      >
                        {d.proxyStatus ? "Proxy (Active)" : "Off"}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => {
                          onToggleSSL(d.id);
                          onLogTerminal(`[Security Handshake] Toggled TLS verification for: ${d.hostname}`, 'info');
                        }}
                        className="mx-auto cursor-pointer flex items-center justify-center"
                      >
                        {d.sslEnabled ? (
                          <ShieldCheck size={16} className="text-emerald-400" title="SSL Active" />
                        ) : (
                          <ShieldAlert size={16} className="text-slate-500" title="SSL Disabled" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Automatization Deployment Workspace */}
        <div className="lg:col-span-5 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
            <div className="flex items-center gap-1.5">
              <HardDrive className="text-blue-500" size={15} />
              <span className="text-xs font-bold text-white uppercase font-sans">배포 자동 가동 컨트롤 및 파이프라인</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Antigravity Engine</div>
          </div>

          <div className="bg-[#1A1A1F] p-4.5 border border-slate-800 rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white font-sans">Cloud Run Production Node</span>
                  <span className="text-[10px] text-slate-500 font-mono">Target: antg-workspace-live:latest</span>
                </div>
                <button
                  onClick={triggerDeployment}
                  disabled={deploying}
                  className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition ${
                    deploying
                      ? "bg-slate-800 text-slate-500 border border-slate-700"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10"
                  }`}
                >
                  <Play size={13} className={deploying ? "animate-spin" : ""} />
                  {deploying ? "배포 작동 중..." : "빌드 및 배포 파이프라인 가동"}
                </button>
              </div>

              {/* Progress bar info */}
              {deploying && (
                <div className="mb-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-blue-400">Automated Assembly Profile:</span>
                    <span>{pipelineProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${pipelineProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Steps vertical sequence */}
              <div className="space-y-3">
                {deploymentWorkflow.map((step, idx) => {
                  const isCompleted = completedSteps.includes(idx);
                  const isActive = currentStepIdx === idx;
                  
                  return (
                    <div 
                      key={idx}
                      className={`flex gap-3 text-xs p-3 rounded-xl transition-all ${
                        isActive 
                          ? "bg-blue-500/5 border border-blue-500/20" 
                          : "border border-slate-800 bg-[#141417]/40"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 size={15} className="text-emerald-400 animate-pulse" />
                        ) : isActive ? (
                          <RefreshCw size={15} className="text-blue-400 animate-spin" />
                        ) : (
                          <Unplug size={15} className="text-slate-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold font-sans ${
                          isCompleted ? "text-slate-400 line-through" : isActive ? "text-blue-400 font-bold" : "text-slate-500"
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-850 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Automatic Domain mappings binded recursively. Live URL:
                <a href="https://antg.dev" target="_blank" className="text-blue-400 ml-1 hover:underline">https://antg.dev</a>
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
