import React, { useState } from "react";
import { Folder, FolderOpen, FileCode, Plus, Trash2, Save, Terminal as TermIcon, Layers, Laptop2, RotateCcw } from "lucide-react";
import { FileNode } from "../types";

interface FileEditorProps {
  linuxFiles: FileNode[];
  windowsFiles: FileNode[];
  onSaveFile: (platform: 'linux' | 'windows', path: string, content: string) => void;
  onCreateFile: (platform: 'linux' | 'windows', targetPath: string, name: string, isDirectory: boolean) => void;
  onDeleteNode: (platform: 'linux' | 'windows', targetPath: string) => void;
  onResetFiles: () => void;
  onLogTerminal: (text: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  platform: 'linux' | 'windows';
  setPlatform: (plat: 'linux' | 'windows') => void;
  selectedFile: FileNode | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileNode | null>>;
  editorContent: string;
  setEditorContent: (content: string) => void;
}

export default function FileEditor({
  linuxFiles,
  windowsFiles,
  onSaveFile,
  onCreateFile,
  onDeleteNode,
  onResetFiles,
  onLogTerminal,
  platform,
  setPlatform,
  selectedFile,
  setSelectedFile,
  editorContent,
  setEditorContent,
}: FileEditorProps) {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({
    "/var": true, "/var/www": true, "/var/www/html": true,
    "C:": true, "C:\\Users": true, "C:\\Users\\Administrator": true, "C:\\Users\\Administrator\\Projects": true
  });

  const [newIName, setNewIName] = useState<string>("");
  const [isCreatingDir, setIsCreatingDir] = useState<boolean>(false);
  const [createTargetNode, setCreateTargetNode] = useState<FileNode | null>(null);

  const activeFiles = platform === 'linux' ? linuxFiles : windowsFiles;

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleSelectFile = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      setEditorContent(file.content || "");
      onLogTerminal(`[File System] Opened: ${file.path} (${platform.toUpperCase()})`, 'info');
    }
  };

  const handleSave = () => {
    if (!selectedFile) return;
    onSaveFile(platform, selectedFile.path, editorContent);
    // update current selected
    setSelectedFile(prev => prev ? { ...prev, content: editorContent } : null);
    onLogTerminal(`[File System] SUCCESS: Saved edits to ${selectedFile.path}`, 'success');
  };

  const handleCreate = () => {
    if (!newIName) return;
    const parentPath = createTargetNode ? createTargetNode.path : (platform === 'linux' ? '/' : 'C:');
    onCreateFile(platform, parentPath, newIName, isCreatingDir);
    onLogTerminal(`[File System] SUCCESS: Created ${isCreatingDir ? 'Directory' : 'File'} -> ${parentPath}/${newIName}`, 'success');
    setNewIName("");
    setCreateTargetNode(null);
  };

  const handleDelete = (path: string, name: string) => {
    if (confirm(`진짜로 '${name}'을(를) 삭제하시겠습니까?`)) {
      onDeleteNode(platform, path);
      if (selectedFile && selectedFile.path === path) {
        setSelectedFile(null);
        setEditorContent("");
      }
      onLogTerminal(`[File System] WARN: Deleted node at ${path}`, 'warn');
    }
  };

  // Render File Tree Nodes Recursively
  const renderTree = (nodes: FileNode[]) => {
    return (
      <ul className="pl-3 space-y-1 select-none">
        {nodes.map((node) => {
          const isExpanded = expandedPaths[node.path];
          const isSelected = selectedFile?.path === node.path;

          if (node.type === 'directory') {
            return (
              <li key={node.path} className="text-xs">
                <div className="flex items-center justify-between group py-1 px-1.5 rounded-lg hover:bg-slate-800/60 transition cursor-pointer">
                  <div 
                    onClick={() => {
                      toggleExpand(node.path);
                      setCreateTargetNode(node);
                    }}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 font-mono w-[72%]"
                  >
                    {isExpanded ? (
                      <FolderOpen size={14} className="text-amber-400 shrink-0" />
                    ) : (
                      <Folder size={14} className="text-amber-500 shrink-0" />
                    )}
                    <span className="truncate">{node.name}</span>
                  </div>

                  <div className="hidden group-flex flex items-center gap-2 opacity-0 group-hover:opacity-100 transition mr-1">
                    <button
                      title="Add Code/Dir here"
                      onClick={() => {
                        setCreateTargetNode(node);
                        setIsCreatingDir(false);
                      }}
                      className="text-slate-400 hover:text-blue-400"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      title="Delete Directory"
                      onClick={() => handleDelete(node.path, node.name)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isExpanded && node.children && node.children.length > 0 && (
                  <div className="border-l border-slate-800 ml-2">
                    {renderTree(node.children)}
                  </div>
                )}
                {isExpanded && (!node.children || node.children.length === 0) && (
                  <span className="text-[10px] text-slate-600 italic pl-6 py-0.5 block font-mono">
                    (empty dir)
                  </span>
                )}
              </li>
            );
          } else {
            return (
              <li key={node.path} className="text-xs">
                <div 
                  className={`flex items-center justify-between group py-1.5 px-2 rounded-xl transition cursor-pointer ${
                    isSelected ? 'bg-blue-600/10 text-blue-300 border border-blue-500/20' : 'hover:bg-slate-850/40 text-slate-400'
                  }`}
                >
                  <div 
                    onClick={() => handleSelectFile(node)}
                    className="flex items-center gap-1.5 font-mono w-[75%] py-0.5"
                  >
                    <FileCode size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{node.name}</span>
                  </div>

                  <div className="hidden group-flex flex items-center opacity-0 group-hover:opacity-100 transition mr-1">
                    <button
                      title="Delete File"
                      onClick={() => handleDelete(node.path, node.name)}
                      className="text-slate-400 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      
      {/* File Tree Bar */}
      <div className="lg:col-span-4 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl overflow-hidden p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="text-blue-500" size={16} />
            <span className="text-sm font-semibold tracking-wide text-white">
              물리 파일 탐색기
            </span>
          </div>
          <button
            onClick={onResetFiles}
            title="마운트 원복"
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Platform Switches */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setPlatform('linux');
              setSelectedFile(null);
              setEditorContent("");
            }}
            className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition ${
              platform === 'linux' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop2 size={13} />
            Linux OS
          </button>
          <button
            onClick={() => {
              setPlatform('windows');
              setSelectedFile(null);
              setEditorContent("");
            }}
            className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition ${
              platform === 'windows' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TermIcon size={13} />
            Windows OS
          </button>
        </div>

        {/* Root Directory Info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 bg-[#1A1A1F] border border-slate-800 py-1.5 px-3 rounded-xl mb-3">
          <span>Active Mount:</span>
          <span className="text-blue-400 font-semibold">{platform === 'linux' ? '/' : 'C:'}</span>
        </div>

        {/* Tree Render Scrollbox */}
        <div className="flex-1 overflow-y-auto max-h-[350px] lg:max-h-full pr-1 bg-[#1A1A1F] rounded-2xl p-3 border border-slate-800/80">
          {renderTree(activeFiles)}
        </div>

        {/* Interactive CRUD Creator Panel */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="bg-[#1A1A1F] p-4 rounded-2xl border border-slate-800 text-[11px]">
            <div className="text-slate-350 font-semibold mb-2.5 text-xs">
              {createTargetNode ? `'${createTargetNode.name}' 아래 새 노드 생성` : '루트에 새 노드 추가'}
            </div>
            <div className="flex gap-3 mb-3">
              <label className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800/40 text-slate-400 hover:text-slate-300 transition cursor-pointer">
                <input
                  type="radio"
                  checked={!isCreatingDir}
                  onChange={() => setIsCreatingDir(false)}
                  className="accent-blue-500"
                />
                파일
              </label>
              <label className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800/40 text-slate-400 hover:text-slate-300 transition cursor-pointer">
                <input
                  type="radio"
                  checked={isCreatingDir}
                  onChange={() => setIsCreatingDir(true)}
                  className="accent-blue-500"
                />
                디렉터리
              </label>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder={isCreatingDir ? "경로명 (예: nginx)" : "파일명 (예: app.ts)"}
                value={newIName}
                onChange={(e) => setNewIName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-105 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                onClick={handleCreate}
                disabled={!newIName}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
              >
                생성
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Code Editor Workspace */}
      <div className="lg:col-span-8 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl overflow-hidden p-5 relative shadow-lg">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-mono text-slate-500 tracking-wider">Antigravity Code Editor (Simulated v1.0)</span>
            <h2 className="text-sm font-bold text-slate-200 font-mono mt-0.5">
              {selectedFile ? selectedFile.path : "편집할 파일을 탐색기에서 더블클릭/클릭하세요"}
            </h2>
          </div>

          {selectedFile && (
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
            >
              <Save size={13} />
              저장 (Write)
            </button>
          )}
        </div>

        {selectedFile ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 grid grid-cols-12 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs text-slate-300 min-h-[300px]">
              {/* Row Line Numbers decor */}
              <div className="col-span-1 border-r border-slate-800 bg-slate-950/40 text-right pr-2 py-3 text-slate-600 select-none space-y-1">
                {editorContent.split("\n").map((_, i) => (
                  <div key={i}>{i+1}</div>
                ))}
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="col-span-11 bg-transparent p-3 text-slate-200 focus:outline-none resize-none font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre h-full min-h-[300px]"
                placeholder="코드를 입력하세요"
              />
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Lines: {editorContent.split("\n").length}</span>
              <span>Workspace Sync Status: <strong className="text-emerald-450 text-emerald-400">● Live Connected</strong></span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#1A1A1F] border border-dashed border-slate-800 rounded-2xl text-center min-h-[300px]">
            <FileCode size={40} className="text-slate-600 mb-3 animate-pulse" />
            <p className="text-xs text-slate-400 max-w-sm font-sans leading-relaxed">
              물리 파일 탐색기에서 파일을 선택하여 코드를 열고, 편집 및 CRUD 작업을 직접 수행해 보세요. 파일의 생성 및 삭제 또한 정밀하게 시뮬레이션됩니다.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
