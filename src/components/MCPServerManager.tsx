import React, { useState } from "react";
import { Link2, Sparkles, Terminal as TermIcon, Play, Radio, Code2, PlusCircle, Check, ShieldCheck, Activity } from "lucide-react";
import { MCPServer, MCPTool } from "../types";

interface MCPServerManagerProps {
  servers: MCPServer[];
  onAddServer: (name: string, protocol: 'SSE' | 'Stdio' | 'Websocket', endpoint: string) => void;
  onLogTerminal: (text: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
}

export default function MCPServerManager({
  servers,
  onAddServer,
  onLogTerminal,
}: MCPServerManagerProps) {
  const [selectedServer, setSelectedServer] = useState<MCPServer>(servers[0]);
  const [selectedTool, setSelectedTool] = useState<MCPTool>(servers[0].tools[0]);
  
  // Custom tool test arguments input state
  const [testArgs, setTestArgs] = useState<string>("{\n  \"path\": \"/var/www/html/index.html\"\n}");
  const [testResult, setTestResult] = useState<string>("");
  const [isRunningTool, setIsRunningTool] = useState<boolean>(false);

  // Custom new server form
  const [newSName, setNewSName] = useState<string>("");
  const [newSProtocol, setNewSProtocol] = useState<'SSE' | 'Stdio' | 'Websocket'>('SSE');
  const [newSEndpoint, setNewSEndpoint] = useState<string>("");

  const handleSelectServer = (srv: MCPServer) => {
    setSelectedServer(srv);
    if (srv.tools && srv.tools.length > 0) {
      setSelectedTool(srv.tools[0]);
      setTestArgs(srv.tools[0].exampleCall);
    }
  };

  const handleSelectTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    setTestArgs(tool.exampleCall);
    setTestResult("");
  };

  const handleRunTool = () => {
    setIsRunningTool(true);
    setTestResult("");
    onLogTerminal(`[MCP Tool SDK] Invoking '${selectedTool.name}' on server '${selectedServer.name}'`, 'info');

    setTimeout(() => {
      try {
        // parse input just to verify shape
        const parsed = JSON.parse(testArgs);
        
        let customMockResult = "";
        // build realistic outputs
        if (selectedTool.name.includes("read_file")) {
          customMockResult = JSON.stringify({
            status: "success",
            path: parsed.path || "/var/www/html/index.html",
            encoding: "utf-8",
            content: "<!DOCTYPE html><html><body><h1>Antigravity App Live</h1></body></html>",
            bytes: 78
          }, null, 2);
        } else if (selectedTool.name.includes("write_file")) {
          customMockResult = JSON.stringify({
            status: "success",
            path: parsed.path || "/var/www/html/index.html",
            operation: "write_flush_close",
            bytes_written: (parsed.content || "").length,
            sync_duration_ms: 12
          }, null, 2);
        } else if (selectedTool.name.includes("exec_command")) {
          customMockResult = JSON.stringify({
            status: "success",
            exit_code: 0,
            stdout: `[Antigravity Host Exec] Command ran successfully: "${parsed.command}"\nCPU cycles allocated: 2100hz\nTotal duration: 18ms`,
            stderr: ""
          }, null, 2);
        } else {
          customMockResult = JSON.stringify({
            status: "success",
            caller: "Antigravity-IDE-Agent",
            arguments_received: parsed,
            system_state: "OK",
            timestamp: new Date().toISOString()
          }, null, 2);
        }

        setTestResult(customMockResult);
        onLogTerminal(`[MCP Tool SDK] SUCCESS: Tool '${selectedTool.name}' response returned cleanly.`, 'success');
      } catch (err: any) {
        setTestResult(JSON.stringify({ error: "Invalid JSON arguments format", details: err.message }, null, 2));
        onLogTerminal(`[MCP Tool SDK] FAILED: Argument validation error inside '${selectedTool.name}'`, 'error');
      } finally {
        setIsRunningTool(false);
      }
    }, 1200);
  };

  const handleAddServerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName || !newSEndpoint) return;
    onAddServer(newSName, newSProtocol, newSEndpoint);
    onLogTerminal(`[MCP Hub] Registered & connected new server: ${newSName} via ${newSProtocol} to ${newSEndpoint}`, 'success');
    
    // reset form
    setNewSName("");
    setNewSEndpoint("");
    alert("새 도메인/연결 대상 가상 MCP 도구 서버가 원스톱 연결 마운트되었습니다!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      
      {/* List of active servers */}
      <div className="lg:col-span-4 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-850">
          <Radio className="text-blue-500 animate-pulse" size={15} />
          <span className="text-xs font-bold text-white uppercase font-sans">가용 MCP 서버 노드</span>
        </div>

        <div className="space-y-2 mb-4 overflow-y-auto max-h-[220px]">
          {servers.map((srv) => {
            const isSel = selectedServer.id === srv.id;
            return (
              <div
                key={srv.id}
                onClick={() => handleSelectServer(srv)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                  isSel
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    : "bg-slate-900 border-slate-800/80 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`w-2 h-2 rounded-full ${srv.status === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                    <strong className="text-slate-100">{srv.name}</strong>
                  </div>
                  <span className="text-[9px] font-mono py-0.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 uppercase">
                    {srv.protocol}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5 truncate">
                  URI: {srv.endpoint}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40 text-[10px] text-slate-400">
                  <span>Tools: <strong>{srv.tools.length}개 탑재</strong></span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck size={11} /> Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom Server Integration endpoint */}
        <div className="mt-auto pt-4 border-t border-slate-850">
          <form onSubmit={handleAddServerSubmit} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs">
            <h4 className="font-semibold text-white mb-2.5 flex items-center gap-1 font-sans">
              <PlusCircle size={13} className="text-blue-500" />
              외부 자율 호스트 MCP 마운트
            </h4>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-500 font-mono block mb-0.5 col-span-12">Server Node Name</label>
                <input
                  type="text"
                  placeholder="예: Local filesystem proxy"
                  value={newSName}
                  onChange={(e) => setNewSName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block mb-0.5">Protocol</label>
                  <select
                    value={newSProtocol}
                    onChange={(e) => setNewSProtocol(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] text-white font-mono focus:outline-none"
                  >
                    <option value="SSE">SSE (JSON-RPC)</option>
                    <option value="Stdio">Stdio (Local)</option>
                    <option value="Websocket">Websocket</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!newSName || !newSEndpoint}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold py-1.5 px-1.5 rounded-xl text-[11px] transition cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    마운트 연결
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-mono block mb-0.5">Endpoint URL / command</label>
                <input
                  type="text"
                  placeholder="예: http://localhost:4500/sse"
                  value={newSEndpoint}
                  onChange={(e) => setNewSEndpoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>
          </form>
        </div>

      </div>

      {/* Tools detail & Arguments tester */}
      <div className="lg:col-span-8 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl overflow-hidden p-5 relative shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-850">
          <Code2 className="text-blue-500" size={16} />
          <span className="text-xs font-bold text-white uppercase font-sans font-sans">Tool SDK Signature &amp; Simulation SDK</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
          {/* Sub sidebar showing specific tool list */}
          <div className="md:col-span-4 flex flex-col gap-1.5 bg-slate-900 p-3 rounded-2xl border border-slate-850 overflow-y-auto max-h-[300px] md:max-h-full">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold px-1 pb-1.5 border-b border-slate-800 block mb-1">
              {selectedServer.name} Tools:
            </span>
            {selectedServer.tools.map((t) => {
              const isToolSel = selectedTool.name === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => handleSelectTool(t)}
                  className={`py-2 px-2.5 rounded-xl text-left font-mono text-xs transition cursor-pointer shrink-0 truncate w-full ${
                    isToolSel
                      ? "bg-slate-850 text-blue-400 border border-slate-705 font-semibold"
                      : "text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Test Calling Console */}
          <div className="md:col-span-8 flex flex-col gap-3">
            {/* Tool specs box */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs leading-relaxed">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Description</span>
              <p className="text-slate-200 font-medium mt-1 font-sans font-sans">{selectedTool.description}</p>
              
              <div className="mt-2 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Parameters inputSchema</span>
                <pre className="text-[11px] font-mono text-slate-400 max-h-18 overflow-y-auto bg-slate-950 p-2.5 rounded-xl mt-1 border border-slate-850 scrollbar-none">
                  {selectedTool.inputSchema}
                </pre>
              </div>
            </div>

            {/* Test Args Input */}
            <div className="flex-1 flex flex-col min-h-[120px]">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                <span>Configure Input Arguments (JSON format):</span>
                <button
                  onClick={handleRunTool}
                  disabled={isRunningTool}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white py-1 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow shadow-blue-500/10"
                >
                  <Play size={11} className={isRunningTool ? "animate-spin" : ""} />
                  Test Tool Call
                </button>
              </div>
              <textarea
                value={testArgs}
                onChange={(e) => setTestArgs(e.target.value)}
                className="w-full flex-1 bg-slate-950 p-3 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
              />
            </div>

            {/* Test response Output */}
            <div className="flex-1 flex flex-col min-h-[140px]">
              <div className="text-[11px] font-mono text-slate-500 mb-1">
                Response Output:
              </div>
              <div className="relative w-full flex-1 bg-slate-950 p-3 border border-slate-800 rounded-xl overflow-y-auto max-h-[220px]">
                {testResult ? (
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre">{testResult}</pre>
                ) : isRunningTool ? (
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-mono h-full justify-center">
                    <Activity size={14} className="text-blue-400 animate-spin" />
                    Executing virtual MCP tool socket callback...
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-600 block text-center mt-4">
                    위 [Test Tool Call] 버튼을 클릭하여 테스트 가상 응답을 실시간으로 확인해볼 수 있습니다.
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
