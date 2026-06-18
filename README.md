# 🌌 MCP Drive (Multi-Platform Cloud Controller & File Hub)

> **"로컬 디바이스와 클라우드 인프라를 연결하는 차세대 에이전틱 제어 콕핏"**
> 
> MCP Drive는 Antigravity IDE 스타일의 몰입형 어두운 테마 UI를 기반으로 설계된 차세대 가상 개발 허브입니다. 듀얼 OS 파일스토어 제어, 가상 DNS/인프라 토폴로지 맵핑, 복수 MCP 서버 도구 관리 및 스마트 워크스페이스 세션 스냅샷 백업 시스템을 제공합니다.

---

## 🧭 프로젝트 개요 (Overview)

본 프로젝트는 원격 서버 가상 개발 환경을 시뮬레이션하고, 개발자가 진행 중인 작업 맥락(Config, 파일 세트, 터미널 로그, 원격 자격 증명)을 안전하게 원격 호스트에 보존할 수 있도록 고안되었습니다. 개발 세션의 흐름을 보관하고 복구하는 **타임라인 드라이브** 역할을 수행하므로, 디바이스가 종료되거나 세션이 만료되더라도 작업 장단계를 언제든 이어서 진행할 수 있습니다.

---

## 🛠 기술 아키텍처 스택 (Tech Stack)

### 1. 프론트엔드 (Frontend)
- **Framework & Builder**: React 18 (TypeScript) + Vite ⚡
- **Styling**: Tailwind CSS (Utility-First, 일관된 Slate-Grey & Indigo 악센트 테마)
- **Animation**: `motion/react` (Framer motion) 기반 실시간 터미널 스트리밍, 타임라인 전이 효과
- **Icons**: `lucide-react` (SVG 아이콘 표준 컴포넌트 라이브러리)

### 2. 백엔드 (Backend)
- **Server**: Express.js
- **Runtime**: tsx (TypeScript natively stripped run-mode) / Node.js
- **Ingress Rule**: 포트 `3000` 및 호스트 IP `0.0.0.0` 바인딩 고정 (Cloud Run 및 Nginx 컨테이너 최적화)

### 3. 클라우드 세션 지속성 (Persistence/Storage)
- **스냅샷 파일**: `data/snapshots.json` (서버 로컬 영구 파일 저장소)
- **라이브 데이터**: `data/workspace.json` 동기화 연동

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
- **+ 새 스냅샷 생성**: 중복 저장 없이, 현재 작업 모습니다 장치 정보를 반영한 깨끗한 독립 백업 세트 즉시 로깅
- **보관 백업 키워드 검색**: 목록이 늘어나더라도 `🔍` 필터링 인풋을 통해 원하는 시점 바로 색인 가능
- **현 상태 덮어쓰기 (Overwrite)**: 새로운 항목을 무한정 늘리지 않고, 기존 백업 세트(예: "퇴근용")를 골라 현재 작업 물리 상태를 덮어씀으로써 버전 보존 효율 극대화
- **인라인 이름 편집(Rename)**: `✏️` 버튼으로 보관본의 이름과 목적을 현시점에 맞춰 즉시 재정의 가능
- **영구 삭제 및 복원(Restore)**: 사용하지 않는 더미 스냅샷은 서버 디스크에서 즉시 완전 제거하여 물리적 스토리지 최적화

---

## 📦 환경 설정 및 실행 방법 (How to Run)

### 1. 환경 변수 설정
프로젝트 루트 폴더에 `.env` 파일을 생성하거나 `.env.example`을 참고하여 기입하십시오.
```env
# Google Gemini API Key (Server-side 전용, Client-side 노출 전면 방지)
GEMINI_API_KEY=your_gemini_api_key_here
```

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

**안티그래비티 에이전트 및 타사 배포 비서가 이 프로젝트를 빌드하고 도커화(Dockerize)할 때 준수해야 하는 필수 조건:**

1. **포트 바인딩 규격**:
   - 컨테이너 또는 외부 서버에서 구동 시, 내부 포트는 반드시 **`3000`**으로만 인그레스 라우팅 포트가 허용됩니다. (`server.ts`가 포트 `3000`을 바인딩하도록 고정되어 있음)
2. **호스트 주소 설정**:
   - 로컬호스트(`127.0.0.1`) 대신 **`0.0.0.0`** 외부 대기 상태로 리슨해야 도커 브릿지 네트워크 및 모바일 브라우저의 원격 접속이 수월하게 허용됩니다.
3. **가상 스토리지 볼륨 (Data Volume)**:
   - 에이전트 채팅 대화록, 가상 파일 탐색기 인스턴스 정보, 스냅샷 목록 등의 지속 보관을 위해, 루트 경로의 `/data` 디렉토리를 **Docker Volume Mount** 대상으로 지정할 것을 강력히 권장합니다.
4. **프로덕션 환경 최적화**:
   - 배포 후 환경에서 `NODE_ENV=production` 플래그를 누락하지 마십시오. 프로덕션 환경에서는 Vite 개발 미들웨어를 완벽히 비활성화하고 `dist/index.html`과 정적 리스폰스 에셋을 초고속으로 단독 서빙합니다.
