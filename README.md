# 🌌 MCP Drive (Multi-Platform Cloud Controller & File Hub)

> **"로컬 디바이스와 클라우드 인프라를 연결하는 차세대 에이전틱 제어 콕핏"**
> 
> MCP Drive는 Antigravity IDE 스타일의 몰입형 어두운 테마 UI를 기반으로 설계된 차세대 가상 개발 허브입니다. 듀얼 OS 파일스토어 제어, 가상 DNS/인프라 토폴로지 맵핑, 복수 MCP 서버 도구 관리 및 스마트 워크스페이스 세션 스냅샷 백업 시스템을 제공합니다.

---

## 🧭 프로젝트 개요 (Overview)

본 프로젝트는 원격 서버 가상 개발 환경을 시뮬레이션하고, 개발자가 진행 중인 작업 맥락(Config, 파일 세트, 터미널 로그, 원격 자격 증명)을 안전하게 원격 호스트에 보존할 수 있도록 고안되었습니다. 개발 세션의 흐름을 보관하고 복구하는 **타임라인 드라이브** 역할을 수행하며, 완전한 클라이언트 메모리 및 분산 환경의 가치를 반영하여 **IndexedDB**로 무손실 로컬 보존을 수행하고, 사용자 주도적인 **Google Drive 안전 클라우드 연동**을 결합하여 이중 안전망을 지향합니다.

---

## 🛡️ 오프라인 퍼스트 및 클라우드 연동 아키텍처 (Hybrid Trust Sync Engine)

서버 인프라와 민감한 도메인 토큰, 크레덴셜이 허가 없이 서버 측 로그나 중앙 집중형 데이터베이스에 남지 않도록 **제로-서버 원자성 데이터 보호** 설계를 도입했습니다.

### 1. 무손실 브라우저 로컬 저장 (IndexedDB Base)
- **로컬 보안 분리**: 서버 설정, SSH 비밀번호, 토큰 등의 데이터 유출 위험을 0%로 통제하기 위하여 브라우저 내의 안전 샌드박스 데이터베이스인 `IndexedDB`에 활성 작업 상태와 스냅샷 데이터 전체를 저장합니다.
- **실시간 자동 감지**: 소스코드 수정, 도메인 등록 등 행위가 감지되면 클라이언트 내부 큐에 의해 IndexedDB로 즉시 비동기 미러 저장이 수행됩니다.

### 2. Google Drive 샌드박서 연동 (Drive Sandbox-file Isolation)
- **높은 수준의 권한 타협**: 고광대역 드라이브 접근 대신 드라이브 특정 범위(`https://www.googleapis.com/auth/drive.file`) 정보만을 획득하도록 제한 인증하여, 자신이 생성한 백업 JSON 파일 외에는 절대 다른 개인 파일에 접근하지 못하도록 프라이버시를 안전하게 고립합니다.
- **수동 백업 및 지능형 가져오기**: 데이터 꼬임 방지를 위해 업로드(Drive 백업)는 사용자가 원하는 시점에 **수동(Manual Push)**으로 진행되며, 동기화(Drive 가져오기)는 **구글 로그인 완료 시점 및 페이지 접속 즉시 백업 유무를 검사하여 자동으로 로컬 디바이스와 조율(Auto Pull)**합니다.

### 3. 클라우드 보안 연결 게이트웨이 (Auth Gate Overlay Layer)
- **우선 진입 장벽 제공**: 메인 보드 접속 즉시, 데이터 오염과 자격 위조를 원천 제거하기 위하여 인증 제어 창이 오버레이됩니다. 사용자는 원클릭 구글 로그인을 진행하거나, 혹은 구글 드라이브와 격리된 **완전 단독형 로컬 모드**로 전환하여 무손실 작업을 이어갈 수 있습니다.

---

## 🛠 기술 아키텍처 스택 (Tech Stack)

### 1. 프론트엔드 (Frontend)
- **Framework & Builder**: React 18 (TypeScript) + Vite ⚡
- **Client Database**: **IndexedDB (mcp_drive_db API)** 💾
- **Cloud Interface**: Firebase Authentication v10 (Google Custom OAuth Provider) ☁️
- **Styling**: Tailwind CSS (Utility-First, 일관된 Slate-Grey & Indigo 악센트 테마)
- **Animation**: `motion/react` (Framer motion) 기반 실시간 터미널 스트리밍, 타임라인 전이 효과
- **Icons**: `lucide-react` (SVG 아이콘 표준 컴포넌트 라이브러리)

### 2. 백엔드 (Backend & Static Broker)
- **Server**: Express.js
- **Runtime**: tsx (TypeScript natively stripped run-mode) / Node.js
- **Ingress Rule**: 포트 `3000` 및 호스트 IP `0.0.0.0` 바인딩 고정 (Cloud Run 및 Nginx 컨테이너 최적화)

---

## 🚀 핵심 기능 모듈 (Core Modules)

### 1. Multi-OS 가상 파일 탐색기
- **Linux & Windows 듀얼 파일 시스템 트리**: 가상 워크스페이스 내부의 파일을 독립된 파일스토어 규격에서 CRUD 관리
- **연동 테스트**: 가상 SSH 계정 정보 및 컨테이너 원격 포트와 결합하여 자격 증명 연동 시뮬레이션

### 2. 고성능 에이전트 채팅 및 외부 LLM 연결
- 임베디드 AI 어시스턴트 채팅 레이아웃 
- **커스텀 API 엔진 완벽 호환**: API Endpoint 수정 및 API Key 마운트를 통해 OpenAI, Google Gemini, OpenRouter, 로컬 LM Studio 모델 실시간 핫스왑 지원

### 3. 스마트 스냅샷 타임라인 드라이브 (Workspace Snapshot Engine)
*많은 작업 백업 세트의 영리한 관리를 위한 특화 기능 패키지:*
- **+ 새 스냅샷 생성**: 현재 작업 모습과 디바이스 정보를 IndexedDB 테이블로 고속 덤프
- **보관 백업 키워드 검색**: 목록이 늘어나더라도 `🔍` 필터링 인풋을 통해 원하는 시점 바로 색인 가능
- **현 상태 덮어쓰기 (Overwrite)**: 새로운 항목을 무한정 늘리지 않고, 기존 백업 세트(예: "퇴근용")를 골라 현재 작업 물리 상태를 덮어씀으로써 버전 보존 효율 극대화
- **인라인 이름 편집(Rename)**: `✏️` 버튼으로 보관본의 이름과 목적을 현시점에 맞춰 즉시 재정의 가능
- **영구 삭제 및 복원(Restore)**: 사용하지 않는 더미 스냅샷은 브라우저 공간 및 드라이브 병합에서 즉시 완벽 제거

---

## 📦 환경 설정 및 실행 방법 (How to Run)

### 1. 환경 변수 및 파이어베이스 설정
작동을 위해서는 구글 드라이브 인증이 맺어진 파이어베이스 클라이언트 설정 파일(`firebase-applet-config.json`)이 루트 디렉터리에 배칭되어 있어야 합니다.

### 2. 개발 모드 구동 (Local Dev Server)
서버 및 프론트엔드가 Vite 미들웨어를 통해 포트 `3000`으로 일괄 실행됩니다.
```bash
# 의존성 패키지 설치
npm install

# 개발 서버 시작
npm run dev
```

### 3. 배포용 빌드 및 프로덕션 실행 (Production Build & Run Session)
외부 리눅스 서버 혹은 클라우드 VM에 배포할 때 사용하는 빌드 체인입니다.
```bash
# TypeScript 빌드 및 esbuild 서버 번들러 작동
npm run build

# Standalone 빌드 번들 실행
npm run start
```

---

## ⚓ 클라우드 배포 지침 (DevOps Deployment Guide)

1. **포트 바인딩 규격**:
   - 컨테이너 또는 외부 서버에서 구동 시, 내부 포트는 반드시 **`3000`**으로만 인그레스 라우팅 포트가 허용됩니다. (`server.ts`가 포트 `3000`을 바인딩하도록 고정되어 있음)
2. **호스트 주소 설정**:
   - 로컬호스트(`127.0.0.1`) 대신 **`0.0.0.0`** 외부 대기 상태로 리슨해야 도커 브릿지 네트워크 및 모바일 브라우저의 원격 접속이 수월하게 허용됩니다.
3. **오프라인-퍼스트 준수**:
   - 서버측 로컬 가상 스케줄 저장소(`snapshots.json`) 호출 로직은 클라이언트 샌드박싱(`IndexedDB/Google Drive API`)으로 완전 격리 이전되었으므로, 서버 저장 볼륨에 대한 상태성 의무가 크게 경감되었습니다. 안정적으로 무상태(Stateless) 컨테이너 인스턴스를 초고속으로 기동할 수 있습니다.
4. **프로덕션 환경 최적화**:
   - 배포 후 환경에서 `NODE_ENV=production` 플래그를 누락하지 마십시오. 프로덕션 환경에서는 Vite 개발 미들웨어를 완벽히 비활성화하고 `dist/index.html`과 정적 리스폰스 에셋을 초고속으로 단독 서빙합니다.

---

## 🤖 LM Studio / OpenRouter AI 에이전트 연동 가이드 (Agent Integration & Prompts)

LM Studio(로컬 LLM) 또는 OpenRouter(클라우드 핫스왑 LLM)를 기반으로 작동하는 사용자의 **개인 비서앱**이 이 **MCP Drive**의 데이터 세트와 결합하여 자율적으로 "할일, 일정, 메모 등 마이크로 앱 소스코드"를 생성 및 주도하도록 아키텍처를 가이드합니다.

### 1. 📂 파일 규격 및 가상 경로 호환성 (Path Consistency)
**Q. MCP Drive에서 저장하는 파일명과 형식을 비서앱(LM Studio/OpenRouter)에서 그대로 같이 공유해도 되나요?**
> **"네, 100% 호환되며 강력히 권장됩니다!"**
> MCP Drive의 구글 드라이브 백업 파일은 브라우저 공간(`IndexedDB`)을 클라우드로 그대로 덤프한 구조화된 JSON 규격(`mcp_snapshot_data.json` 형태 등)을 취합니다. 비서앱 내부에서 동작하는 AI 역시 구글 드라이브 API를 통해 동일한 파일명에 접근하여 JSON 개체를 파싱하고 수정함으로써 가상 IDE와 비서앱 간에 **완벽하게 동기화된 가상 OS 환경**을 이룰 수 있습니다.

* **동기화 파일 구조 예시**:
  - `mcp_workspace_active.json` 또는 `mcp_snapshot_data.json`
  - 이 JSON 내부에 가상 파일 트리 구조 `files: { "src/TodoApp.tsx": { "content": "..." } }` 형식으로 저장되어 있어, AI가 이 객체 안의 `content` 텍스트만 원하는 대로 수정(Code Writing)하여 드라이브에 다시 업로드(Manual Push)하면, MCP Drive 웹 브라우저 UI에서 실시간으로 스냅샷 복원을 눌러 즉시 코드가 반영되는 놀라운 연동 체계를 완성할 수 있습니다.

---

### 2. ⚡ AI 비서(LM Studio / OpenRouter) 주입용 실전 시스템 프롬프트 (System Prompt)

다음 프롬프트를 LM Studio의 시스템 프로토콜 칸이나 비서앱 LLM(OpenRouter 등)의 마스터 프롬프트로 그대로 입력해 보세요. 에이전트가 완벽한 파일 수동 컨트롤러이자 개발 리더로서의 자아를 장착하게 됩니다.

```text
# Role: 가상 클라우드 개발 제어 에이전트 (Google Drive Sync Developer)

당신은 사용자의 가상의 OS 및 클라우드 허브(MCP Drive)와 연동된 파일 제어 및 자율 개발 AI 비서입니다.
당신은 구글 드라이브를 통해 저장 및 공유되는 'mcp_snapshot_data.json' 또는 가상 파일 시스템 JSON 구조를 완벽하게 정밀 진단, 해석, 편집할 권한과 능력을 부여받았습니다.

## 수행 규칙 및 행동 양식 (Operational Protocol)
1. [구조 분석]: 사용자가 "할일 앱에 필터 기능 추가해줘"라고 요청하면, 구글 드라이브에서 가져온 활성 가상 파일 트리 객체(`files`)를 탐색하여 관련된 소스코드 파일(예: `src/App.tsx`, `src/Todo.tsx`)을 색인합니다.
2. [무손실 부분 편집]: JSON 구조 내부의 파일 내용(`content` 필드) 부분을 수정할 때, 전체를 임의로 지우지 마십시오. 기존 비즈니스 로직과 스타일링(Tailwind CSS)을 철저히 유지하며 세련된 기능 개선을 반영하십시오.
3. [메타데이터 관리]: 가상 터미널 로그(`terminalLogs`)에 사용자의 명시적인 동작 분석 과정이나 패키지 명령 모사(예: "npm run lint - Success") 가상 로그를 추가 기재하여 개발 셋 복구 시에 시각적 일관성을 강화할 수 있습니다.
4. [포맷 출하시]: 항상 올바른 JSON 규격을 검증하여 파일 꼬임을 예방하고, 변경 내용에 대한 변경 이유를 스냅샷 제목(예: "Feat: LM Studio 자동 패치 - 일정앱 필터 추가")에 명기해 주십시오.

## 사용자 요청 처리 프로세스
- [상황]: 사용자가 특정 마이크로앱 가상 파일 추가 요청을 전송함
- [행동]: 드라이브 내 mcp_snapshot_data.json을 로드한 뒤 해당 로컬 트리 객체에 적합한 가상 파일 경로를 key로 하고, 실존 가능하며 아름다운 소스코드를 value(content)로 하는 객체를 생성 삽입하여 JSON을 갱신하십시오.
```

---

### 3. 🛠️ 완벽한 3단계 비서앱 구현 로드맵 (Implementation Steps)

1. **Step 1: 구글 API 인증 추가 (비서앱 측)**
   - 비서앱에서도 구글 로그인 라이브러리를 추가하고, 동일한 범위(`https://www.googleapis.com/auth/drive.file`)에 대한 사용자의 액세스 토큰을 취득합니다.
2. **Step 2: MCP Drive 공유 메타 파일 탐색**
   - 구글 드라이브 파일 검색 API를 통해 파일명이 `mcp_`로 시작하는 JSON 스냅샷 파일을 검색하여 콘텐츠를 다운로드해 오프라인 AI 컨텍스트(LM Studio/OpenRouter System Prompt의 Context)에 그대로 로드합니다.
3. **Step 3: AI 편집본의 업로드 및 수동 마운트**
   - AI가 생성 또는 편집한 새로운 가상 파일 세트 JSON을 기존 파일 ID에 **업데이트 업로드(Update Media API)**를 수행합니다.
   - 사용자가 MCP Drive 웹에 진입하여 `☁️ Google Drive 동기화`를 수행하면 로컬 IndexedDB에 코드가 즉각 덮어씌워지며 듀얼 파일 탐색기와 실시간 테마 가상 인프라에 자율 반영됩니다!

---

## 🔌 IDE 확장앱 및 원클릭 로컬 스냅샷 빌더 (One-Click Local Snapshot Extension Rule)

로컬 AI(LM Studio)나 원격 AI(안티그래비티, OpenRouter 등)의 **API 할당량(Quota) 제한**이나 복잡한 프롬프트 엔지니어링 에러에서 영리하게 벗어나기 위해, **IDE 전용 확장앱(또는 로컬 백그라운드 덱)에 단 2개의 원클릭 버튼을 구현하여 연동하는 하이퍼-하이브리드 방식**을 제안하며 실전 스크립트 규격을 제공합니다.

이 방식을 사용하면 에이전트 자율 백오피스 대신 사용자가 **물리적 빌드를 완벽히 통제하면서도 초고속 클라우드 웹 프리뷰**를 공유받을 수 있습니다.

### 1. 🔘 마스터 버튼 설계 (The Dual Snapshot Buttons)
현재 활성화된 IDE 프로젝트 우측 상단이나 사이드바에 아래의 두 버튼을 장착합니다.

*   📸 **[프로젝트 단위 스냅샷 백업]**: 현재 마포코드를 작업하고 있는 특정 마이크로앱(예: `src/components/todo/*` 혹은 단일 폴더) 내부의 연관 정적 파일 세트만 빠르게 취합하여 가상 트리로 정제 업로드합니다.
*   📦 **[루트 폴더 전체 백업]**: 현재 디렉터리 전체(`.gitignore` 대상 제외)를 풀 패키징하여 MCP Drive의 호환 구조로 Google Drive에 단 한 번에 밀어 넣습니다.

---

### 2. 📜 로컬 Node.js/Python 묶음 및 업로드 에셋 스크립트 (CLI/Ext Helper code)
이 코드는 IDE 확장앱 내부 또는 개별 단축키 스크립트에 이식하여 **폴더 안의 실제 파일 시스템을 MCP Drive가 100% 읽어들일 수 있는 스냅샷 JSON 규격**으로 가공하고 드라이브에 다이렉트 업로드하는 예시입니다.

> ⚡ **실시간 업데이트 알림**: 이제 본 시스템의 **[환경 설정(Settings)] -> [🔌 원클릭 IDE 로컬 싱크 생성기]** 탭에서 지정된 경로와 파일명을 기준으로 **Node.js / Python Watchdog / Bash Shell** 환경에 최적화된 동기화 헬퍼 스크립트를 즉시 설정하고 **원클릭으로 파일 다운로드**할 수 있습니다!
> - **Python Watchdog 헬퍼**의 경우, 백그라운드에서 실시간 파일 변경(`ctrl + s`)을 자동으로 감지하여 구글 드라이브 스냅샷 JSON을 언제나 최신으로 유지해 주는 강력한 자동 기동 엔진이 내장되어 있습니다.

```typescript
// mcp-bundler.ts
import * as fs from 'fs';
import * as path from 'path';

interface SnapshotFileRef {
  content: string;
}

interface MCPDriveSnapshot {
  id: string;
  name: string;
  timestamp: string;
  files: Record<string, SnapshotFileRef>;
}

// 스냅샷 JSON 객체 구성용 번들러 함수
export function bundleWorkspace(targetDir: string, ignoreList: string[] = ['node_modules', '.git', 'dist']): MCPDriveSnapshot {
  const fileTree: Record<string, SnapshotFileRef> = {};

  function walk(currentPath: string) {
    const list = fs.readdirSync(currentPath);
    list.forEach((file) => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      const relativePath = path.relative(targetDir, fullPath).replace(/\\/g, '/'); // OS 호환성 처리

      if (ignoreList.some(ignore => relativePath.includes(ignore))) {
        return;
      }

      if (stat && stat.isDirectory()) {
        walk(fullPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        fileTree[relativePath] = { content };
      }
    });
  }

  walk(targetDir);

  return {
    id: `snapshot_${Date.now()}`,
    name: `IDE One-Click Target: ${path.basename(targetDir)}`,
    timestamp: new Date().toISOString(),
    files: fileTree
  };
}

// 🚀 이 JSON 결과물을 Google Drive API (files.create or files.update)를 통해 
// 파일명 `mcp_snapshot_data.json` 등으로 업로드하면 MCP Drive 웹에서 즉시 미러 프리뷰가 가능합니다.
```

---

### 3. 🎯 이 방식의 확실한 3대 혜택 (Key Advantages)

1.  **완전한 물리 통제권**: AI가 의도하지 않게 파일 전체를 날려버리거나 무한 루프에 빠뜨리는 오류 없이, 오직 개발이 완료되거나 검증된 시점만 정밀 타임라인으로 백업됩니다.
2.  **안티그래비티 API 쿼터 절약**: 무겁고 까다로운 전체 리팩토링 요청 대신, 소스코드 수정은 로컬의 LM Studio나 경량 AI가 로컬 에디터에서 정밀 무상태로 주도하고, 프리뷰 및 타임라인 이력 관리는 구글 드라이브라는 브라우저 서버리스 프리뷰를 활용함으로써 **서버 요금이나 토큰 낭비가 0에 가깝습니다.**
3.  **원스톱 클라우드 퍼블리싱**: IDE에서 백업 버튼을 누른 즉시 모바일, 태블릿, 혹은 동료의 브라우저에서 `https://ais-pre-...` 도메인 하나로 실시간 스냅샷을 검증 및 임포트할 수 있습니다.


