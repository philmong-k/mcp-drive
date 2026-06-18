import React, { useState } from "react";
import { 
  Bot, Cpu, Database, Globe, Play, Server, RefreshCw, 
  Sparkles, Code, Save, CheckCircle2, ChevronRight, HelpCircle,
  Terminal, ShieldCheck, Activity, Layers, Download, Check, Info,
  Volume2, VolumeX, Eye, Laptop, Send, ArrowRight, UserPlus, LogIn, Lock,
  ShoppingBag, Camera, MessageSquare, Briefcase, HelpCircle as HelpIcon, Flame
} from "lucide-react";

interface AIWorkspaceGeneratorProps {
  onAddDomain: (dom: { 
    hostname: string; 
    targetIp: string; 
    type: 'A' | 'CNAME' | 'TXT' | 'AAAA'; 
    sslEnabled: boolean; 
    sslStatus: 'active' | 'expired' | 'pending' | 'none'; 
    proxyStatus: boolean; 
    ttl: string; 
  }) => void;
  onSaveFile: (plat: 'linux' | 'windows', path: string, content: string) => void;
  onLogTerminal: (text: string, type?: 'info' | 'success' | 'warn' | 'error') => void;
  activeProvider: string;
}

const metaphors = {
  "lb": {
    title: "로드밸런서 (Nginx LB)",
    analogy: "도로 교통 순경 👮‍♂️",
    desc: "수많은 손님이 동시에 홈페이지에 들어올 때 한 컴퓨터가 과부하로 폭발하지 않도록, 여러 대의 컴퓨터로 교통정리를 하여 교통사고(서버 다운)를 완벽하게 예방합니다."
  },
  "vm-web": {
    title: "웹 애플리케이션 (Express VM)",
    analogy: "일류 셰프 조리사 👨‍🍳",
    desc: "로그인, 회원 가입, 포스팅 조회처럼 손님이 주문하는 실질적인 요청을 직접 이해하고, 데이터베이스에서 재료를 수급해서 완성한 음식을 대접해 주는 중추 시스템입니다."
  },
  "pg-db": {
    title: "데이터베이스 (Postgres)",
    analogy: "철통 보안 금고 창고 🏦",
    desc: "회원들의 아이디, 비밀번호, 작성 글을 절대로 도둑맞거나 지워지지 않게 엑셀 장부보다 100만 배 안전한 고도화 보안 포맷으로 영구히 안치하는 비밀 수납장입니다."
  },
  "redis": {
    title: "캐시 메모리 (Redis)",
    analogy: "단골 전용 퀵 트레이 ⚡",
    desc: "매번 무거운 금고나 주방 멀리까지 갈 필요 없이, 손님들이 가장 자주 찾는 인기 메뉴를 요리실 바로 앞의 초고속 선반에 얹어두어 0.001초 만에 바로 꺼내 손님에게 즉각 방출하는 기동 서버입니다."
  },
  "cdn": {
    title: "Anycast CDN",
    analogy: "전국 동네 편의점 분점 🏪",
    desc: "서울 본사 컴퓨터까지 오지 않아도, 전 세계 곳곳에 흩어진 동네 대리점 편의점에 사진이나 이미지 복사본을 미리 비치해서 고객 집 바로 앞에서 순식간에 데이터를 수급받을 수 있게 돕는 시스템입니다."
  }
};

const templates = {
  "express-auth": {
    name: "🔑 회원가입 및 로그인 보안 처리기",
    defaultPath: "/var/www/html/auth-serv.js",
    easyDesc: "인터넷 사이트의 가장 기본! 아이디를 만들고(회원가입), 본인이 맞는지 증명(로그인 및 비밀번호 감별)하여 가상 출입증(JWT 토큰)을 발급해 주는 열쇠 장치 코드입니다.",
    prompt: "세션 기반이 아닌 JWT 토큰을 사용하는 안전한 Node-Express 백엔드 회원 가입 및 로그인 엔드포인트를 구현해줘. 로컬 데이터베이스 배열 연동 및 에러 핸들러 미들웨어를 포함해줘 디테일하게 TS/JS 코드로 작성바람."
  },
  "docker-compose": {
    name: "📦 3분 카레처럼 쉬운 인프라 자동 포장 장치 (Docker-compose)",
    defaultPath: "/home/mcp-agent/docker-compose-prod.yml",
    easyDesc: "서버, 데이터베이스, 교통순경 컴퓨터를 매번 하나씩 사서 연결하지 않고, 원클릭 상자에 밀키트처럼 담아 동시에 완벽 구성하고 즉시 실행해주는 인프라 도화지 조립 세트입니다.",
    prompt: "Nginx 로드밸런서, Node.js 웹 앱 컨테이너, 그리고 Postgres 볼륨 매핑 영구 저장소가 유기적으로 구성된 프로덕션 그레이드 Docker Compose yaml 파일을 생성해줘. 컨테이너 네트워크 브릿지도 설계 포함."
  },
  "postgres-schema": {
    name: "🗄️ 백화점 물품 보관함 비밀 규칙 (Postgres SQL)",
    defaultPath: "/home/mcp-agent/db_schema.sql",
    easyDesc: "귀찮은 글정리, 접속 일물, 인적 사항을 꼬이지 않게 몇 번째 서랍에 어떤 크기로 담을지 '라벨링'을 붙이고 가상 테스트 고객 데이터 10명을 자동으로 생성해 채워 넣는 SQL 템플릿입니다.",
    prompt: "사용자 정보 테이블과 접속 이력 로그, 비활성 계정 영구 추적이 가능한 UUID 기반의 정교한 PostgreSQL DDL SQL 코드를 작성해 주고 데모용 시드 더미 데이터 레코드 10건 작성해줘."
  },
  "nginx-balancer": {
    name: "🚦 8차선 인터넷 신호등 설계도 (Nginx Proxy)",
    defaultPath: "/etc/nginx/nginx-lb.conf",
    easyDesc: "사용자들이 구글 검색이나 브라우저로 내 서브도메인(예 : antg.dev)을 치고 들어왔을 때, 가로막혀 방황하지 않고 실제 뒷단의 VM 1호점, 2호점 컴퓨터로 차선 정리를 안전하게 분배해 주는 통제 레시피입니다.",
    prompt: "서버 3대로 라운드로빈 밸런싱을 제공하며, antg.dev 서브도메인을 처리하고 SSL 프록시 설정이 가미된 최적화 Nginx conf 서버 블록 매핑 지시문을 설계 코드 해줘."
  }
};

export default function AIWorkspaceGenerator({
  onAddDomain,
  onSaveFile,
  onLogTerminal,
  activeProvider
}: AIWorkspaceGeneratorProps) {
  // Beginner-friendly toggle
  const [useEasyMode, setUseEasyMode] = useState(true);

  // Chat-guided consultant state
  const [customAppRequest, setCustomAppRequest] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  
  // High fidelity recommendation prescription state
  const [currentPrescription, setCurrentPrescription] = useState<{
    scenarioName: string;
    techExplanation: string;
    recommendedPath: string;
    recommendedPlatform: 'linux' | 'windows';
    databaseDesign: string;
    requiredNodes: string[];
    defaultPrompt: string;
  }>({
    scenarioName: "강아지 사료 판매 쇼핑몰 (보안 결제 및 회원 장바구니)",
    techExplanation: "쇼핑몰은 고도의 보안 결제 및 장바구니 유실 방지가 핵심입니다. 안전금고 데이터베이스인 Postgres와 교통순경 로드밸런서, 그리고 메인 셰프 컴퓨터가 삼각 구조로 유기적으로 엮여야 합니다. 결제 내역과 사용자 세션은 변조 불가능한 보안 암호화 JWT 뼈대를 갖춘 Node-Express 컴퓨터를 이용해 처리하면 초보자도 안심하고 운영 가능합니다.",
    recommendedPath: "/var/www/html/pet-shop-backend.js",
    recommendedPlatform: "linux",
    databaseDesign: "CREATE TABLE customers (id UUID PRIMARY KEY, name TEXT, balance INT);\nCREATE TABLE orders (id UUID PRIMARY KEY, customer_id UUID, item_name TEXT, krw_price INT);",
    requiredNodes: ["lb", "vm-web", "pg-db", "cdn"],
    defaultPrompt: "강아지 반려동물 사료 쇼핑몰의 장바구니 추가, 결제 인증(JWT), 그리고 데이터베이스 금액 차감 처리 로그가 일목요연하고 친절한 한국어 주석으로 기록된 Node-Express 소스코드를 구현해줘."
  });

  // Code generator state
  const [prompt, setPrompt] = useState(currentPrescription.defaultPrompt);
  const [template, setTemplate] = useState("express-auth");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<'linux' | 'windows'>('linux');
  const [savePath, setSavePath] = useState(currentPrescription.recommendedPath);

  // Negotiation Tuning states for dialogue 조율 (Q2 directly solved)
  const [tuningInput, setTuningInput] = useState("");
  const [isTuning, setIsTuning] = useState(false);
  const [tuningHistory, setTuningHistory] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([
    { role: 'assistant', text: "기획이 아주 든든하네요! 혹시 데이터베이스를 MariaDB로 바꾼다거나 특정 기능(이메일 인증 발송, SSL 보안 추가 등)을 더 추가해서 이 시나리오 설계를 세부 조율하고 싶으시면 아래에 적어주세요. 실시간으로 조율해 가치를 맞춰가겠습니다!" }
  ]);

  const handleTunePrescription = async () => {
    if (!tuningInput.trim()) return;
    const userSay = tuningInput;
    setTuningHistory(prev => [...prev, { role: "user", text: userSay }]);
    setTuningInput("");
    setIsTuning(true);
    onLogTerminal(`[설계 미세조율] 기존 처방 '${currentPrescription.scenarioName}'에 '${userSay}' 조건을 조율 매핑 중...`, "info");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `현재 기획 처방 정보: ${JSON.stringify(currentPrescription)}
사용자의 추가 튜닝/조율 피드백 의견: "${userSay}"

위의 의견을 아주 상냥하게 수용해, 기존의 처방전 정보를 스마트하게 보완 및 변경하여 아래의 JSON 구조로만 반드시 응답해 줘 (다른 텍스트는 빼고 오직 순수 JSON 블럭만 출력할 것):
{
  "scenarioName": "변경/보완된 한글 시나리오 명칭(이모지 포함)",
  "techExplanation": "변경 사항이 왜 필요한지 비개발자 눈높이의 상냥하고 명확한 비유적 한글 해설 (3문장)",
  "recommendedPath": "수정된 가상 파일 경로 (예: /var/www/html/...js)",
  "dbDesign": "새 조건에 꼭 어울리는 SQL DDL 테이블 선언문 (MariaDB 등 지정했다면 해당 문법 지향)",
  "requiredNodes": ["lb", "vm-web", "pg-db", "redis", "cdn" 중 필요한 노드 영문 목록 배열],
  "defaultPrompt": "이 새 교섭튜닝 결과를 코드로 구현하기 위해 AI 하위 코드 생성 기기에 투입할 최고의 원초적 한글 코딩 프롬프트 지시자 문장",
  "tuningSummary": "사용자의 피드백을 수용하여 어떤 구조적 이중화나 DB 기술이 교섭/조율 완료되었는지 친절하게 요약하는 1문장"
}` }]
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API call error");
      const data = await response.json();
      const resultText = data.text || "";
      const jsonStr = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      const modifiedPrescription = {
        scenarioName: parsed.scenarioName || currentPrescription.scenarioName,
        techExplanation: parsed.techExplanation || currentPrescription.techExplanation,
        recommendedPath: parsed.recommendedPath || currentPrescription.recommendedPath,
        recommendedPlatform: (parsed.recommendedPath && parsed.recommendedPath.includes("C:")) ? "windows" as const : "linux" as const,
        databaseDesign: parsed.dbDesign || currentPrescription.databaseDesign,
        requiredNodes: parsed.requiredNodes || currentPrescription.requiredNodes,
        defaultPrompt: parsed.defaultPrompt || currentPrescription.defaultPrompt
      };

      setCurrentPrescription(modifiedPrescription);
      setTuningHistory(prev => [...prev, { 
        role: "assistant", 
        text: `🤝 실시간 설계 교섭 완료!\n- 조율 내용: ${parsed.tuningSummary || "성공적으로 의견이 가미된 처방으로 갱신되었습니다."}\n- 아래 '이 추천 설계 대로 일괄 적용하기' 단추를 클릭해 주시면 수집된 정보가 하단 소스코드 라이터에 동기화 적용됩니다!` 
      }]);

      onLogTerminal(`[조율 완수] '${userSay}' 가 반영되었습니다. 새로운 처방: '${modifiedPrescription.scenarioName}'`, "success");
      speakAudioDescription(`전해주신 피드백 사항을 영리하게 수용하여 처방 기획을 보완 갱신 완료했습니다.`);
    } catch (err: any) {
      onLogTerminal(`[조율 실패] 일시적인 원격 혼선으로 처방 프롬프트에 조율 희망 내용을 간이 수동 누적합니다.`, "warn");
      setPrompt(prev => `${prev}\n\n[추가 조율 조건 지정]: ${userSay}`);
      setTuningHistory(prev => [...prev, { 
        role: "assistant", 
        text: `임시 우회 조율 성사!\n- 요구하신 조건 "${userSay}" 문장을 코드 생성기 프롬프트 아랫단에 즉각 추가 바인딩하였습니다!` 
      }]);
    } finally {
      setIsTuning(false);
    }
  };

  // Infrastructure planner state
  const [selectedNodes, setSelectedNodes] = useState<string[]>(currentPrescription.requiredNodes);
  const [blueprintCode, setBlueprintCode] = useState("");
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [dnsInput, setDnsInput] = useState("app.antg.dev");
  const [bindSuccess, setBindSuccess] = useState(false);

  // Live simulation states
  const [simActive, setSimActive] = useState(false);
  const [simStatus, setSimStatus] = useState<"idle" | "registering" | "registered" | "logging-in" | "logged-in" | "fetching" | "fetched">("idle");
  const [simInputEmail, setSimInputEmail] = useState("beginner@example.com");
  const [simInputPassword, setSimInputPassword] = useState("password123!");
  const [simToken, setSimToken] = useState("");
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simActiveFlowStep, setSimActiveFlowStep] = useState<string | null>(null);

  // TTS states
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Pre-configured beginner friendly templates / prescriptions
  const prescriptions = {
    shopping: {
      scenarioName: "🛒 강아지 사료 판매 쇼핑몰 (보안 결제 및 회원 장바구니)",
      techExplanation: "이 서비스는 고객 결제와 장바구니 내역이 지워지지 않는 것과 해킹 원천 방어가 핵심입니다! 따라서 교통사고를 조율하는 로드밸런서(교통순경), 결제와 회원을 통제하는 웹서버(메인셰프), 그리고 돈 정보를 기록하는 Postgres(금고창고)가 삼각편대로 조립되어 돌아가는 기술을 AI가 적용해 드립니다.",
      recommendedPath: "/var/www/html/pet-shop-backend.js",
      recommendedPlatform: "linux" as const,
      databaseDesign: "CREATE TABLE customers (id UUID PRIMARY KEY, name TEXT, balance INT);\nCREATE TABLE orders (id UUID PRIMARY KEY, customer_id UUID, item_name TEXT, krw_price INT);",
      requiredNodes: ["lb", "vm-web", "pg-db", "cdn"],
      defaultPrompt: "강아지 반려동물 사료 쇼핑몰의 장바구니 추가, 결제 인증(JWT), 그리고 데이터베이스 금액 차감 처리 로그가 일목요연하고 친절한 한국어 주석으로 기록된 Node-Express 소스코드를 구현해줘."
    },
    sns: {
      scenarioName: "📸 인스타그램 스타일 사진 소통 커뮤니티",
      techExplanation: "사진과 영상 데이터가 무제한으로 뿜어져 나옵니다. 전세계 어디서든 사진 로딩이 비정상적으로 느려지지 않도록 대리점(CDN) 캐싱 처리가 필수로 꽂힙니다. 또한 요리의 고속 조리를 위해 매일 보는 인기 게시글 정보를 임시 선반(Redis)에 얹어두는 고수들의 메모리 가속 기술을 전수 적용합니다.",
      recommendedPath: "/var/www/html/instagram-api-serv.js",
      recommendedPlatform: "linux" as const,
      databaseDesign: "CREATE TABLE posts (id UUID PRIMARY KEY, author_email TEXT, photo_url TEXT, likes_count INT);\nCREATE TABLE likes (id SERIAL, post_id UUID, user_email TEXT);",
      requiredNodes: ["vm-web", "redis", "cdn"],
      defaultPrompt: "인스타그램 스타일의 사진 데이터 URL 저장, 좋아요 수 올리기 처리 엔드포인트 및 Redis 고속 캐싱 저장/조회 알고리즘 코드를 작성하고 주석도 왕초보 눈높이로 동봉해줘."
    },
    chat: {
      scenarioName: "💬 동시 수백명 수다방 서비스 (실시간 메시지 송수신)",
      techExplanation: "사용자들이 초고속으로 수다를 떨 때 하드디스크 금고만 쓰면 병목 지연이 유발됩니다. 찰나의 전송 지연을 파괴하기 위해, 인메모리 임시 메모리 퀵 트레이(Redis)를 중심 브릿지로 삼고 통신을 직결해야 합니다. 또한 교통체증 무력화를 위해 웹 분산 노드를 늘려 트래픽을 순식간에 조율합니다.",
      recommendedPath: "/var/www/html/realtime-chat-server.js",
      recommendedPlatform: "linux" as const,
      databaseDesign: "CREATE TABLE chat_rooms (id UUID PRIMARY KEY, title TEXT);\nCREATE TABLE messages (id SERIAL, room_id UUID, sender TEXT, payload TEXT);",
      requiredNodes: ["lb", "vm-web", "redis"],
      defaultPrompt: "웹소켓(web sockets)이나 폴링 기술을 이용하여 대화방 개설 및 최신 50개 채팅 내역을 보존하고 반환해 주는 초고속 Node.js 대화방 구현 소스를 작성해줘."
    },
    office: {
      scenarioName: "👔 사내 비서 데이터 자동 요약 연동기",
      techExplanation: "기획서나 긴 텍스트를 AI 모델에 실시간으로 던져 요약하고, 그 이력을 사주가 정기적으로 보고받을 수 있도록 이중화 Postgres 금고에 안전하게 격리 보관하는 구조입니다. 사무용 내부 시스템이므로 윈도우 기반 컴퓨터가 작업 주소(C: 드라이브)로 매칭되는 이종 플랫폼 적용 기술을 연출해 봅니다.",
      recommendedPath: "C:/Users/Administrator/Projects/report-summarizer.js",
      recommendedPlatform: "windows" as const,
      databaseDesign: "CREATE TABLE reports (id UUID PRIMARY KEY, original_text TEXT, summarized_body TEXT, editor_name TEXT);",
      requiredNodes: ["vm-web", "pg-db"],
      defaultPrompt: "사용자가 올린 장문의 텍스트를 서버 내부에서 수집하고, Gemini 혹은 OpenAI REST API로 전송/회신받아 로컬 및 DB 보고서에 저장해 주는 지능형 비즈니스 서버 요약 모듈을 구현해줘."
    }
  };

  const handleApplyPrescription = (key: keyof typeof prescriptions) => {
    const p = prescriptions[key];
    setCurrentPrescription(p);
    setPrompt(p.defaultPrompt);
    setSavePath(p.recommendedPath);
    setTargetPlatform(p.recommendedPlatform);
    setSelectedNodes(p.requiredNodes);
    onLogTerminal(`[눈높이 추천서 적용] 비개발자님을 위해 "${p.scenarioName}" 구조를 분석했습니다. 메이커 장비에 자동 배포 바인딩을 완료했습니다.`, "success");
    
    // Auto speak
    speakAudioDescription(`알겠습니다. ${p.scenarioName}를 위한 처방전을 활성화했습니다. 교통 순경과 메인 셰프, 금고의 조화가 필요한 최적의 아키텍처를 화면에 도안해 두었으니 AI 코드 가동 버튼만 가볍게 눌러보시면 됩니다.`);
  };

  // Human dialogue AI analysis simulation
  const handleAIPrescriptionChat = async () => {
    if (!customAppRequest.trim()) {
      alert("AI 비서에게 연동법을 물어볼 어플이나 생각 중인 웹 아이디어를 적어보세요!");
      return;
    }
    
    setIsConsulting(true);
    onLogTerminal(`[AI 컨설팅] 왕초보 고객님의 애매모호한 아이디어 "${customAppRequest}"의 숨은 의도를 AI가 똑똑하게 심층 분석하는 중...`, "info");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `사용자의 비전문가적 요구사항: "${customAppRequest}".\n\n이 요구를 처리하기 위한 획기적인 '비개발자용 추천 처방전'을 다음의 완벽한 JSON 양식으로만 구체적으로 응답해 줘. 텍스트 바깥에 다른 설명 쓰지 말고 오직 JSON 자체만 출력해줘.\n{"scenarioName": "애플리케이션 직관적 한글 명칭(이모지 포함)", "techExplanation": "이 분야에 왜 로드밸런서(교통순경)나 DB(금고), 캐시(선반)가 들어가야 하는지 비개발자가 단번에 감동할 기막힌 비유 한글 해설 (아주 쉽고 상냥하게 3문장)", "recommendedPath": "가상으로 생성해서 마운트해 줄 추천 파일 경로 (예: /var/www/html/my-app.js)", "dbDesign": "구현에 꼭 들어맞는 깔끔한 Postgres CREATE TABLE 구문 2개 내외", "requiredNodes": ["lb", "vm-web", "pg-db", "redis", "cdn" 중 이 서비스에 진짜 필요한 영어 키 배열], "defaultPrompt": "이 요구사항을 코드로 한땀 한땀 구현하기 위해 AI 코드 생성기에게 보낼 최고의 엔지니어링 프롬프트 문장"}` }]
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API call error");
      const data = await response.json();
      
      // Clean json block
      const resultText = data.text || "";
      const jsonStr = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      const customPrescription = {
        scenarioName: parsed.scenarioName || `🪄 커스텀 연동 [${customAppRequest.slice(0, 10)}]`,
        techExplanation: parsed.techExplanation || "입력하신 아이디어를 고속 처리하기 위한 최적의 전용 인프라 매개체를 연동합니다.",
        recommendedPath: parsed.recommendedPath || "/var/www/html/custom-app.js",
        recommendedPlatform: (parsed.recommendedPath && parsed.recommendedPath.includes("C:")) ? "windows" as const : "linux" as const,
        databaseDesign: parsed.dbDesign || "CREATE TABLE my_table (id SERIAL PRIMARY KEY, data TEXT);",
        requiredNodes: parsed.requiredNodes || ["vm-web", "pg-db"],
        defaultPrompt: parsed.defaultPrompt || `${customAppRequest} 연동 뼈대 코드를 아주 상냥하고 상세한 한글 주석과 함께 작성해줘.`
      };

      setCurrentPrescription(customPrescription);
      setPrompt(customPrescription.defaultPrompt);
      setSavePath(customPrescription.recommendedPath);
      setTargetPlatform(customPrescription.recommendedPlatform);
      setSelectedNodes(customPrescription.requiredNodes);
      
      onLogTerminal(`[AI 컨설팅 완료] '${customPrescription.scenarioName}' 에 최적화된 맞춤형 기술, 파일경로(${customPrescription.recommendedPath}), 디비 스키마, 기기 구성을 1초 만에 완성하여 처방 보드에 매핑했습니다!`, "success");
      
      speakAudioDescription(`적어주신 요구사항을 완벽히 소화하여 맞춤형 처방전을 새로 지었습니다. ${customPrescription.scenarioName}의 탄생을 위해 필요한 보관함 금고 규격과 장치를 모두 연동해두었으니 어서 인공지능 코드 생성 단추를 눌러보세요.`);
    } catch (err: any) {
      onLogTerminal(`[컨설팅 오류] AI가 좀 더 정형화된 처방전을 자동으로 우회 수립하여 대체 처방해 드립니다. 걱정 마세요!`, "warn");
      
      // Fallback custom prescription
      const fallbackP = {
        scenarioName: `🪄 초간편 맞춤 수수께끼 앱 설계터`,
        techExplanation: `비개발자 고객님이 생각하신 '${customAppRequest}' 아이디어는 정말 참신합니다! 일류 요리사 컴퓨터와 안전한 금고 데이터 저장 수납함이 긴밀하게 협동하여 고객 아이디어를 데이터 유실 없이 굳건하게 구현해내도록 인프라를 맞춰 적용해 두었습니다.`,
        recommendedPath: "/var/www/html/smart-custom.js",
        recommendedPlatform: "linux" as const,
        databaseDesign: `CREATE TABLE custom_data (\n  id UUID PRIMARY KEY,\n  user_opinion TEXT,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`,
        requiredNodes: ["vm-web", "pg-db"],
        defaultPrompt: `'${customAppRequest}' 관련 비즈니스 연산 로직을 처리하는 실용적인 Node.js Express 라우터를 만들어줘. 오류 방지 미들웨어와 보기 좋은 풍부한 한글 변수 주석을 필수 지향해서 작성해줘.`
      };
      
      setCurrentPrescription(fallbackP);
      setPrompt(fallbackP.defaultPrompt);
      setSavePath(fallbackP.recommendedPath);
      setTargetPlatform(fallbackP.recommendedPlatform);
      setSelectedNodes(fallbackP.requiredNodes);
    } finally {
      setIsConsulting(false);
    }
  };

  const handleTemplateChange = (tmplKey: string) => {
    setTemplate(tmplKey);
    const selected = templates[tmplKey as keyof typeof templates];
    if (selected) {
      setPrompt(selected.prompt);
      setSavePath(selected.defaultPath);
      // Log to terminal
      onLogTerminal(`[템플릿 감지] 비개발자 눈높이에 맞춘 "${selected.name}" 템플릿 설명이 매핑되었습니다.`, "info");
    }
  };

  const speakAudioDescription = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("이 브라우저는 음성 낭독 기술을 지원하지 않습니다.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      
      // Remove symbols/markup before reading
      const cleanText = text
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, '코드 생략')
          .replace(/[#*`_~:;()\[\]]/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
      utterance.lang = "ko-KR";
      utterance.rate = 1.05;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      onLogTerminal("코드를 작성할 프롬프트를 입력하세요.", "warn");
      return;
    }
    setIsGenerating(true);
    onLogTerminal(`[AI 인프라 엔진] 초보자의 주문을 접수했습니다. 최우수 비서 ${activeProvider.toUpperCase()} 모델을 가동하여 뇌 구조를 코드로 구현합니다...`, "info");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${prompt}\n\nexplanations은 아주 간결하게 처리하고, 비개발자도 금방 주입해 쓸 수 있는 친절한 주석(//)을 변수마다 한국어로 알기 쉽게 달아준 소스코드를 출력해줘.` }]
            }
          ],
          systemInstruction: "You are an elite code generator. Output ONLY clean formatting-ready code block with beautiful Korean comments explaining everything to a non-developer. Keep formatting very clean."
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setGeneratedCode(data.text || "// AI 생성오류");
      onLogTerminal("[AI 인프라 엔진] 전조 완료! 인간이 읽을 수 있는 세심한 주석을 입힌 소스 코드가 드래프트 패널에 상륙했습니다.", "success");
    } catch (err: any) {
      onLogTerminal(`[AI 인프라 엔진] 로드 실패: API 오류 발생으로 간이 fallback 엔진이 대신 코드를 제조합니다.`, "warn");
      // Fallback
      setGeneratedCode(`// 👨‍🏫 초보자를 위한 초간단 '로그인/회원가입' 수제 요리사 코드
const express = require('express');
const jwt = require('jsonwebtoken'); // 🔑 출입증(토큰) 조작 도구
const app = express();
app.use(express.json()); // 손님의 가공 JSON 데이터를 수용하는 승인제

// 🗄️ 데이터를 임시로 보관하는 소형 바구니 (원래는 여기에 DB가 들어가야 해요!)
const 임시_회원_리스트 = [];
const 비밀번호_암호키 = "GravitySecretKey2026";

// 1. 회원가입 창구 (주문 접수처)
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  
  // 이미 가입했는지 구별하기
  if (임시_회원_리스트.some(u => u.email === email)) {
    return res.status(400).json({ error: "이미 가입되어 있는 회원입니다!" });
  }

  임시_회원_리스트.push({ email, password });
  console.log("새로운 회원가입 발생! 수락완료:", email);
  res.json({ success: true, message: "회원가입이 축하의 꽃바구니와 함께 성사되었습니다. 🎉" });
});

// 2. 로그인 창구 (출입증 발급소)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const 가입회원 = 임시_회원_리스트.find(u => u.email === email && u.password === password);
  
  if (!가입회원) {
    return res.status(401).json({ error: "아이디나 비밀번호가 도무지 맞지 않습니다." });
  }

  // 본인 확인이 되면, 가슴팍에 붙일 가상 출입증(토큰)을 1시간 시한부로 발행해 줍니다!
  const 토큰출입증 = jwt.sign({ email }, 비밀번호_암호키, { expiresIn: '1h' });
  res.json({ 
    success: true, 
    token: 토큰출입증,
    message: "로그인 성공! 즐거운 탐험을 위해 출입증을 전달해 드립니다. 🎫" 
  });
});

app.listen(3000, () => console.log("기본 포트 3000에서 초보자용 서버 가동중!"));
`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToFilesystem = () => {
    if (!generatedCode.trim()) {
      onLogTerminal("저장할 코드가 먼저 생성되어야 합니다.", "warn");
      return;
    }
    onSaveFile(targetPlatform, savePath, generatedCode);
    onLogTerminal(`[자동화 동기화] 생성된 코드를 [${targetPlatform.toUpperCase()}] 호스트 시스템인 ${savePath} 파일로 덮어씌웠습니다!`, "success");
    alert(`성공! [${targetPlatform.toUpperCase()}] 서버의 '${savePath}' 경로에 코드를 안전하게 기록했습니다.\n\n이것은 모의 테스트용 메모리가 아닌, 실제 사용자가 파일 탐색기 및 가상 실행 공간에서 바로 조회하고 에디팅할 수 있는 실제 백엔드 소스입니다!`);
  };

  const toggleNode = (nodeId: string) => {
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(prev => prev.filter(n => n !== nodeId));
    } else {
      setSelectedNodes(prev => [...prev, nodeId]);
    }
  };

  const handleGenerateBlueprint = async () => {
    setIsGeneratingBlueprint(true);
    onLogTerminal("[인프라 도안기] 테라폼 기반의 물리 클라우드 설계도와 주석을 편찬하는 중...", "info");
    
    try {
      const nodesDesc = selectedNodes.map(n => {
        if (n === "lb") return "Nginx HTTPS Load Balancer Gateway";
        if (n === "vm-web") return "Express Web Application Server Node (VM)";
        if (n === "pg-db") return "PostgreSQL Cluster Persistent Database";
        if (n === "redis") return "In-Memory Redis Cache Cluster";
        if (n === "cdn") return "Anycast CDN Front-facing Cache Proxy";
        return n;
      }).join(", ");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `다음 구성 노드를 활용한 실제 클라우드 분산 배치도(IaC) 코드를 작성해 줘 : [${nodesDesc}]. 초보자가 주석만 읽어도 완벽하게 역할을 이해하도록 한글 해설을 줄마다 꼼꼼히 동봉해 줘.` }]
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API call error");
      const data = await response.json();
      setBlueprintCode(data.text || "");
      onLogTerminal("[인프라 도안기] 완수! 주석 가치를 한껏 살린 IaC 레시피가 드로잉 창에 수배되었습니다.", "success");
    } catch (err: any) {
      setBlueprintCode(`# 🚀 구글 클라우드에 자동으로 빌딩할 똑똑한 복제 인프라 명세서 (IaC)
# 선택된 활성 컴포넌트: ${selectedNodes.map(id => metaphors[id as keyof typeof metaphors]?.title || id).join(" + ")}

# 1. 아시아 서울 샌드박스 영역 매핑
provider "google" {
  project = "antigravity-sandbox-33"
  region  = "asia-northeast3" # 서울 리전
}

# 2. 웹 요리사 서버 컴퓨터 1호 설정
resource "google_compute_instance" "web_chef_server" {
  name         = "antg-web-chef"
  machine_type = "e2-medium" # 실시간 웹 트래픽 연산에 가성비 최적인 규격
  zone         = "asia-northeast3-a"

  # 우분투 기반의 최신 뇌 이식
  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network = "default"
    # 전세계에서 들어오는 문을 활짝 엶
    access_config {
      // 자동으로 외부 공유 IP 주소 발급
    }
  }
}

# 3. 비밀 금고 데이터베이스 (Postgres 전용 매칭)
resource "google_sql_database_instance" "security_gold_db" {
  name             = "security-gold-postgres-db"
  database_version = "POSTGRES_15"
  region           = "asia-northeast3"

  settings {
    tier = "db-f1-micro" # 초보자 공부용 부담 없는 용량과 요금의 가상 DB 장비
  }
}
`);
      onLogTerminal("[IaC Configurator] Fallback blueprint schema rendered.", "warn");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleQuickBindDNS = () => {
    if (!dnsInput.trim()) return;
    onAddDomain({
      hostname: dnsInput,
      targetIp: "15.200.12.33",
      type: "A",
      sslEnabled: true,
      sslStatus: 'active',
      proxyStatus: true,
      ttl: "Auto"
    });
    setBindSuccess(true);
    onLogTerminal(`[인터넷 주소 바인더] 연결 지시 성공: 구글 도메인 관제 탑에 수동 신청하지 않고 1초 만에 "${dnsInput}" 주소를 셰프 컴퓨터 (IP: 15.200.12.33) 쪽문으로 배선 완료했습니다!`, "success");
    setTimeout(() => setBindSuccess(false), 2500);
  };

  // Run Non-Developer Friendly Visual Simulator Web Screen!
  const runSimulation = async () => {
    setSimActive(true);
    setSimLogs([]);
    setSimToken("");
    
    // Step 1: Client Request
    setSimStatus("registering");
    setSimActiveFlowStep("user-to-lb");
    addLog("👤 [스마트폰/사용자] '회원가입 및 주문하기' 버튼을 연타했습니다!");
    addLog(`💬  이메일: "${simInputEmail}", 가상 패스워드: "••••••••" 입력함`);
    await sleep(1000);

    // Step 2: LB Traffic Guard Router
    setSimActiveFlowStep("lb-to-web");
    addLog("🚦 [Nginx 교통정리원] 비정상 다중 디도스가 아님을 판별 후, 웹서버 VM1으로 부하분산 전달!");
    await sleep(1200);

    // Step 3: Web server handling
    setSimStatus("registered");
    setSimActiveFlowStep("web-to-db");
    addLog("👨‍🍳 [Express 요리사] 주문 도착! DB 금고에 중복 회원이 있는지 검색 요청 중...");
    await sleep(1000);

    // Step 4: Postgres DB Check
    setSimActiveFlowStep("db-to-web");
    addLog("🏦 [Postgres 영구 비밀창고] 중복 없음 확인 및 신규 데이터 영구 수납 기하 완료!");
    addLog(`💾 DB Saved: { email: "${simInputEmail}", status: "Active customer" }`);
    await sleep(1250);

    // Step 5: Web responds user
    setSimActiveFlowStep("web-to-user");
    addLog("🎉 [Express 요리사] 축하 답변 방출! 사용자에게 회원가입 성공 반환 완료.");
    await sleep(1000);

    // Step 6: LogIn attempt
    setSimStatus("logging-in");
    setSimActiveFlowStep("user-to-lb");
    addLog("🔑 [스마트폰/사용자] 방금 만든 아이디로 로그인을 다시 단행합니다.");
    await sleep(1000);

    // Step 7: Cash check or Web DB match
    setSimActiveFlowStep("web-to-redis");
    addLog("⚡ [Redis 퀵 트레이] 혹시 단골인지 초고속 캐시 선반 체크 중...");
    await sleep(800);
    setSimActiveFlowStep("web-to-db");
    addLog("👨‍🍳 [Express 요리사] 확인 완료! 진짜 주인임을 파악하고 변조 불가한 홀로그램 금박 출입증(JWT Token)을 인쇄합니다.");
    await sleep(1000);

    // Finished
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJlZ2lubmVyQGV4YW1wbGUuY29tIn0";
    setSimToken(mockToken);
    setSimStatus("logged-in");
    setSimActiveFlowStep(null);
    addLog("🎫 [스마트폰/사용자] 홀로그램 출입증(JWT Token)을 스마트폰 메모리에 영구 안장!");
    addLog("🏆 [SUCCESS] 복잡한 백엔드 보안 프로시저 시뮬레이션 종료! 한눈에 그려지시나요?");
  };

  const addLog = (txt: string) => {
    setSimLogs(prev => [...prev, txt]);
  };

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  return (
    <div className="flex flex-col gap-4 text-left h-full">
      
      {/* Top Friendly Header & Meta Information Block */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="py-0.5 px-2 bg-blue-500/15 border border-blue-500/30 rounded-full text-[10px] font-bold text-blue-400 font-mono">
                💡 OPEN-STAND MCP (표준 규격)
              </span>
              <span className="py-0.5 px-2 bg-purple-500/15 border border-purple-500/30 rounded-full text-[10px] font-bold text-purple-400 font-mono">
                모든 IDE 및 비주얼 도구 호환 가능
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
              <Sparkles className="text-yellow-400 animate-pulse" size={20} />
              AI 기반 원클릭 대리 코딩 및 클라우드 소통 관제소
            </h2>
            <p className="text-xs text-slate-350 leading-relaxed mt-1 font-sans">
              이 공간은 특정 협소한 IDE에 한정되지 않습니다. Cursor, VS Code, Windsurf 등 **초보자 분이 쓰시는 모든 종류의 프로그램 에이전트**에 공용으로 연동되는 자율 소통 콕핏입니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-405 text-slate-400 font-medium font-sans">눈높이 설정:</span>
            <button
              onClick={() => {
                setUseEasyMode(!useEasyMode);
                onLogTerminal(`[UI 제어] ${!useEasyMode ? '초보자 원클릭 처방 모드' : '전문가 로데이터 수치 모드'}로 레이아웃을 전환했습니다.`, "info");
              }}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold font-sans transition flex items-center gap-1.5 border cursor-pointer ${
                useEasyMode 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle size={13} />
              <span>{useEasyMode ? "초보자 가이드 ON" : "전문가 모드 ON"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Chat-guided AI Consultant Prescription (비개발자를 위한 즉시 소통 처방전) */}
      <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500/5 rounded-full blur-2xl -z-10"></div>
        
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-850 justify-between">
          <div className="flex items-center gap-1.5">
            <Bot className="text-blue-400" size={17} />
            <span className="text-xs font-bold text-white uppercase font-sans">
              🙋‍♂️ 비개발자 전용 AI 컨설턴트 소통 창구 (채팅 처방전)
            </span>
          </div>
          <span className="text-[10px] text-blue-400 animate-pulse flex items-center gap-1">
            <Flame size={12} /> 실시간 원클릭 설계 제안
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
          만들고 싶은 앱이나 웹 서비스의 구상을 대화하듯 편하게 전해 주세요. AI가 전문적인 서버 경로, 데이터베이스 테이블, 교통순경 및 보안 장비를 자동으로 계산해서 **맞춤 처방전**을 제공하고, 버튼 하나만 누르면 소스코드와 명세가 인공지능에 의해 일괄 생성되어 파일 장부에 반영됩니다.
        </p>

        {/* Option Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => handleApplyPrescription('shopping')}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-sans cursor-pointer flex flex-col justify-between ${
              currentPrescription.scenarioName.includes("쇼핑몰") 
                ? "bg-blue-600/15 border-blue-500 text-blue-300" 
                : "bg-slate-905 bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <ShoppingBag size={14} className="text-amber-400" />
              <span className="text-[8px] font-mono uppercase px-1 bg-slate-950 rounded text-slate-500">Shop</span>
            </div>
            <span className="font-semibold text-[11px] truncate">강아지 사료 쇼핑몰</span>
          </button>

          <button
            onClick={() => handleApplyPrescription('sns')}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-sans cursor-pointer flex flex-col justify-between ${
              currentPrescription.scenarioName.includes("인스타그램") 
                ? "bg-blue-600/15 border-blue-500 text-blue-300" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <Camera size={14} className="text-purple-400" />
              <span className="text-[8px] font-mono uppercase px-1 bg-slate-950 rounded text-slate-500">SNS</span>
            </div>
            <span className="font-semibold text-[11px] truncate">사진 소통 커뮤니티</span>
          </button>

          <button
            onClick={() => handleApplyPrescription('chat')}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-sans cursor-pointer flex flex-col justify-between ${
              currentPrescription.scenarioName.includes("수다방") 
                ? "bg-blue-600/15 border-blue-500 text-blue-300" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <MessageSquare size={14} className="text-emerald-400" />
              <span className="text-[8px] font-mono uppercase px-1 bg-slate-950 rounded text-slate-500">Chat</span>
            </div>
            <span className="font-semibold text-[11px] truncate">실시간 초고속 채팅</span>
          </button>

          <button
            onClick={() => handleApplyPrescription('office')}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-sans cursor-pointer flex flex-col justify-between ${
              currentPrescription.scenarioName.includes("비서") 
                ? "bg-blue-600/15 border-blue-500 text-blue-300" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <Briefcase size={14} className="text-blue-400" />
              <span className="text-[8px] font-mono uppercase px-1 bg-slate-950 rounded text-slate-500">Office</span>
            </div>
            <span className="font-semibold text-[11px] truncate">AI 윈도우 보고서 봇</span>
          </button>
        </div>

        {/* Dialogue input box */}
        <div className="flex gap-2 mb-4 bg-slate-950 p-2 rounded-2xl border border-slate-850">
          <input
            type="text"
            value={customAppRequest}
            onChange={(e) => setCustomAppRequest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIPrescriptionChat()}
            placeholder="예시: '수영장 예약 현황판을 안전한 달력 형태로 연동해줘' 와 같이 한글로 자유롭게 던져 보세요!"
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-550 focus:outline-none"
          />
          <button
            onClick={handleAIPrescriptionChat}
            disabled={isConsulting}
            className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs whitespace-nowrap cursor-pointer transition flex items-center gap-1 shadow-lg shadow-blue-500/10"
          >
            {isConsulting ? <RefreshCw className="animate-spin" size={12} /> : <Send size={12} />}
            <span>AI 설계 제안받기</span>
          </button>
        </div>

        {/* Interactive prescription card layout */}
        <div className="p-4 bg-[#1E1E24]/50 rounded-2xl border border-blue-500/15 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-900/40 border border-blue-500/25 text-blue-400 text-[10px] font-bold">
                🎯 현재 진단서
              </span>
              <strong className="text-sm text-white font-sans">
                {currentPrescription.scenarioName}
              </strong>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              {currentPrescription.techExplanation}
            </p>
            <div className="pt-1.5 flex flex-wrap gap-1.5">
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">
                📁 추천 삽입 주소: <code className="text-blue-300 font-mono text-[9px]">{currentPrescription.recommendedPath}</code>
              </span>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Database size={10} className="text-emerald-450" /> 추천 테이블: <code className="text-emerald-400 font-mono text-[9px]">{currentPrescription.databaseDesign.split("\n")[0].slice(13, 30)}...</code>
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-stretch border-t md:border-t-0 md:border-l border-slate-800 pl-0 md:pl-4 gap-2 shrink-0">
            <span className="text-[10px] text-slate-450 text-slate-400 font-mono text-center block">
              💡 원클릭 일괄 바인딩 처방
            </span>
            <button
              onClick={() => {
                setPrompt(currentPrescription.defaultPrompt);
                setSavePath(currentPrescription.recommendedPath);
                setTargetPlatform(currentPrescription.recommendedPlatform);
                setSelectedNodes(currentPrescription.requiredNodes);
                onLogTerminal(`[즉시 바인딩 완료] 추천된 기술, 설치 세팅이 편집기로 원터치 마운트 완료되었습니다. 아랫단 버튼들을 클릭하여 실행하세요.`, "success");
                alert(`성공!\n\nAI 컨설턴트가 계산한 최적의 처방 구조(서버 경로: ${currentPrescription.recommendedPath}, 데이터베이스 구문, 필요 컴퓨터 장비 리스트)가 아래 '코드 생성기'와 '토폴로지 수납함'에 정교하게 대리 입력되었습니다.\n\n이제 아래의 '🤖 코드 창조하기' 단추만 클릭하시면, 소스코드 전체를 AI가 대리 집필합니다.`);
              }}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition flex items-center justify-center gap-1.5 shadow shadow-emerald-500/10"
            >
              <Sparkles size={13} className="text-yellow-400 animate-pulse" />
              <span>이 추천 설계 대로 일괄 적용하기</span>
            </button>
          </div>

        </div>

        {/* 🗣️ 처방전 양방향 교섭/조율 대화 클라이언트 (Q2 directly solved) */}
        <div className="mt-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
              <MessageSquare size={13} className="text-purple-400 animate-pulse" />
              <span>🗣️ 진단서 설계 조율 교섭소 (처방 협상 챗봇)</span>
            </div>
            <span className="text-[9px] text-purple-400 font-mono">Dialogue Negotiation Lab</span>
          </div>
          
          <div className="space-y-2 max-h-[145px] overflow-y-auto mb-3 scrollbar-none text-[11px] pr-1">
            {tuningHistory.map((item, index) => (
              <div key={index} className={`flex items-start gap-1.5 leading-relaxed ${item.role === 'user' ? 'justify-end text-right' : 'justify-start text-left'}`}>
                {item.role === 'assistant' && (
                  <span className="shrink-0 p-0.5 rounded bg-blue-950 font-bold text-[9px] text-blue-400 font-mono">
                    CONSULT
                  </span>
                )}
                <div className={`p-2.5 rounded-2xl max-w-[85%] font-sans ${
                  item.role === 'user' 
                    ? 'bg-purple-600/10 text-purple-300 border border-purple-500/20' 
                    : 'bg-slate-950 text-slate-350 border border-slate-850'
                }`}>
                  <p className="whitespace-pre-line text-left">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tuningInput}
              disabled={isTuning}
              onChange={(e) => setTuningInput(e.target.value)}
              placeholder="예: '데이터베이스를 MariaDB로 구조 변경하고, 성능 향상을 위한 Redis 캐시도 도안에 담아줘' ..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTunePrescription();
                }
              }}
              className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
            />
            <button
              onClick={handleTunePrescription}
              disabled={isTuning}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition disabled:opacity-50 font-sans"
            >
              {isTuning ? <RefreshCw className="animate-spin" size={11} /> : <Send size={11} />}
              <span>설계 조율하기</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT CARD: Intelligent Guided Code Creator */}
        <div className="lg:col-span-6 flex flex-col bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg">
          
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-850 justify-between">
            <div className="flex items-center gap-1.5">
              <Bot className="text-blue-500" size={17} />
              <span className="text-xs font-bold text-white uppercase font-sans">
                {useEasyMode ? "🧪 지능형 자동 코드 도안 기기 (Code Autopilot)" : "AI Code Automated Synthesizer"}
              </span>
            </div>
            <button
              onClick={() => {
                const descText = templates[template as keyof typeof templates]?.easyDesc || "";
                speakAudioDescription(`현재 선택하신 템플릿의 알기 쉬운 설명입니다. ${descText}`);
              }}
              className={`p-1 px-2.5 rounded-lg border text-[10px] font-sans font-semibold flex items-center gap-1 transition cursor-pointer ${
                isSpeaking 
                  ? "bg-rose-500/15 border-rose-500 text-rose-300 hover:bg-rose-500/20" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/30"
              }`}
              title="설명 소리로 듣기"
            >
              {isSpeaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
              <span>{isSpeaking ? "소리 멈추기" : "성우 설명 듣기"}</span>
            </button>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            
            {/* Friendly Selector */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase font-mono block mb-1.5">
                {useEasyMode ? "🍳 구현 장비에 주입할 기술 템플릿 설정" : "Select Infrastructure Code Template"}
              </label>
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full bg-[#1A1A1F] border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(templates).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                  <option value="custom">✍️ 내가 직접 단어로 상세 요구하기 (Custom Prompt)</option>
                </select>
              </div>

              {/* Intuitive bubble description */}
              {useEasyMode && (
                <div className="mt-2.5 p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-xs text-blue-300 leading-normal font-sans">
                  <div className="font-semibold text-[11px] mb-0.5 text-blue-400 flex items-center gap-1">
                    <Info size={11} />
                    <span>이 기술 규칙은 무엇을 의미하나요?</span>
                  </div>
                  {templates[template as keyof typeof templates]?.easyDesc || "원하는 한글 프롬프트를 지시문 창에 타이핑하시고 가동 버튼을 클릭하시면 세상에 없던 백엔드 모듈이 완성됩니다."}
                </div>
              )}
            </div>

            {/* Custom specification box */}
            <div className="flex-1 flex flex-col min-h-[120px]">
              <label className="text-[10px] text-slate-500 font-bold uppercase font-mono block mb-1.5">
                {useEasyMode ? "📝 AI가 이 코드를 짤 때 참고할 상세 가이드 지시사항" : "AI Prompter Core Input"}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="코드를 적용할 실무 명세나 디테일 동작 조건을 한글로 자유롭게 기재하십시오..."
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
              />
            </div>

            {/* File Path Destination */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-850">
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase font-mono block mb-1">인프라 파일 시스템 타겟</label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="linux">🐧 Linux 리눅스 본점 컴퓨터</option>
                  <option value="windows">💻 Windows 윈도우 가상 장치</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase font-mono block mb-1">설치할 물리 드라이브 파일 경로 주소</label>
                <input
                  type="text"
                  value={savePath}
                  onChange={(e) => setSavePath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-emerald-400 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Firing Button */}
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>AI 요리사가 기재를 판별하여 한 주석과 함께 소스 코드를 제조하고 있습니다...</span>
                </>
              ) : (
                <>
                  <Code size={14} />
                  <span>{useEasyMode ? "🪄 뇌 구조 그대로 작동하는 최고의 소스코드 제작하기" : "Request Instant AI Code Generation"}</span>
                </>
              )}
            </button>

            {/* Result Editor */}
            <div className="flex-[2] flex flex-col relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden min-h-[220px]">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/60 border-b border-slate-850">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Code Playground Output (진짜 코드 상태)</span>
                {generatedCode && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      onLogTerminal("[동작] 생성본 텍스트를 클립보드로 사수했습니다.", "info");
                      alert("코드가 무사 복제되었습니다. 개발자님 컴퓨터 메모장이나 IDE에 즉시 이식 가능해요!");
                    }}
                    className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                  >
                    이 코드 전체 클립 복사
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={generatedCode}
                placeholder="AI 요리사가 다 익힌 코드가 이곳에 노출됩니다. 위의 '소스코드 제작하기' 단추를 클릭해 주세요."
                className="flex-1 p-3 bg-transparent text-[11px] font-mono text-emerald-400 focus:outline-none resize-none overflow-y-auto leading-relaxed"
              />
              <div className="p-2.5 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <span className="text-[9px] text-slate-500 leading-none pl-1">
                  * 듀얼 파일시스템에 마운팅하면 실제 가상 공간에 배포 연동됩니다.
                </span>
                <button
                  onClick={handleSaveToFilesystem}
                  disabled={!generatedCode}
                  className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white font-semibold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1 shadow"
                >
                  <Save size={12} />
                  <span>이 파일 고대로 서버에 안전하게 꽂기 (저장)</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT CARD: Visual Interactive Topology & Non-Developer Work simulator */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Visual Topology Diagram & Explanations */}
          <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg text-left">
            <div className="flex items-center gap-1.5 mb-3.5 pb-2 border-b border-slate-850 justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="text-purple-400" size={16} />
                <span className="text-xs font-bold text-white uppercase font-sans">
                  {useEasyMode ? "🧱 한눈에 보이는 가상 클라우드 컴퓨터 연결판" : "Infrastructure Topology Builder"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">선택 장비: {selectedNodes.length}대</span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 font-sans leading-relaxed">
              사용할 컴퓨터 장비 조각들을 클릭하여 켜거나 끄세요. 연동 아키텍처 블록을 설계하면 AI가 실제 가상 클라우드를 통째로 구축할 레시피(IaC)를 도출합니다.
            </p>

            {/* Clickable Node Layout Blocks with metaphors */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                { id: "lb", label: "교통순경", real: "LB Nginx", color: "hover:border-amber-500/40 text-amber-400 flex items-center" },
                { id: "vm-web", label: "메인셰프", real: "Web VM", color: "hover:border-blue-500/40 text-blue-400" },
                { id: "pg-db", label: "영구금고", real: "Postgres", color: "hover:border-emerald-500/40 text-emerald-400" },
                { id: "redis", label: "익스프레스", real: "Redis", color: "hover:border-pink-500/40 text-pink-400" },
                { id: "cdn", label: "대리점", real: "CDN", color: "hover:border-purple-500/40 text-purple-400" }
              ].map((node) => {
                const active = selectedNodes.includes(node.id);
                const info = metaphors[node.id as keyof typeof metaphors];
                return (
                  <button
                    key={node.id}
                    onClick={() => toggleNode(node.id)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col justify-between h-20 ${
                      active 
                        ? "bg-blue-600/15 border-blue-500 text-blue-400 shadow-md scale-102"
                        : "bg-[#1A1A1F] border-slate-800 text-slate-500 hover:border-slate-705"
                    }`}
                    title={info?.desc}
                  >
                    <div className="text-[11px] font-bold tracking-tight truncate w-full">
                      {useEasyMode ? node.label : node.real}
                    </div>
                    {useEasyMode && (
                      <div className="text-[9px] font-sans opacity-70 truncate text-slate-400">
                        {info?.analogy.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')}
                      </div>
                    )}
                    <span className="text-[8px] font-mono mt-1 px-1 py-0.5 bg-slate-950 border border-slate-850 rounded truncate w-full text-center">
                      {node.real}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Metaphor explanation drawer */}
            {useEasyMode && (
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-850 space-y-2 text-[11px] leading-relaxed select-none mb-3 font-sans">
                <span className="text-slate-400 font-bold block">💡 선택한 서비스들의 현실 비유 사전 :</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 max-h-[140px] overflow-y-auto pr-1">
                  {selectedNodes.map(nodeId => {
                    const info = metaphors[nodeId as keyof typeof metaphors];
                    if (!info) return null;
                    return (
                      <div key={nodeId} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                        <strong className="text-white text-xs block mb-0.5">
                          {info.analogy} {info.title}
                        </strong>
                        <span className="text-[10px] text-slate-450 text-slate-400 leading-normal block">
                          {info.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick DNS configuration bridge */}
            <div className="bg-[#1A1A1F] p-3 rounded-2xl border border-slate-800/80 mb-3 text-xs font-sans">
              <h4 className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>🌐 [원클릭] 간편한 인터넷 집주소 도메인 바인딩</span>
                {bindSuccess && <span className="text-emerald-400 text-[10px] flex items-center gap-0.5"><CheckCircle2 size={10} /> 등록 성료!</span>}
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="예: codingschool.antg.dev"
                  value={dnsInput}
                  onChange={(e) => setDnsInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] text-white font-mono focus:outline-none"
                />
                <button
                  onClick={handleQuickBindDNS}
                  className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer font-sans shrink-0 shadow"
                >
                  기계 연결하기
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateBlueprint}
              disabled={isGeneratingBlueprint}
              className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-blue-500 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              {isGeneratingBlueprint ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-blue-500" />
                  <span>서버 설계도 구조를 AI 비서가 다듬는 중...</span>
                </>
              ) : (
                <>
                  <Layers size={13} className="text-blue-500 animate-pulse" />
                  <span>{useEasyMode ? "📐 완성된 연결판대로 자동 '클라우드 인프라 설계도' 도안하기" : "Synthesize Infrastructure (IaC) Spec Code"}</span>
                </>
              )}
            </button>
          </div>

          {/* NON-DEVELOPER VISUAL CODE INTERACTION SIMULATOR CARD */}
          <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850 mb-3">
              <div className="flex items-center gap-1.5">
                <Eye className="text-emerald-400 animate-pulse" size={16} />
                <span className="text-xs font-bold text-white uppercase font-sans">
                  💡 {useEasyMode ? "가상 현실 시뮬레이터 (코드가 정말 작동하나요?)" : "Live Dynamic Endpoint Simulator"}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                VIRTUAL SANDBOX ACTIVE
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 font-sans leading-relaxed">
              작성한 코드(회원가입, 교통순경, 데이터 보관소)가 실제로 인터넷 상에서 손님의 폰을 만나 어떻게 불꽃 튀며 작동하는지, 시각화 시뮬레이션을 가동해 배웁니다!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
              
              {/* Simulator SmartPhone view Column */}
              <div className="md:col-span-5 bg-black border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between text-xs font-sans relative aspect-[9/14] max-w-[180px] mx-auto md:max-w-none">
                {/* Smartphone notches and layout decorators */}
                <div className="w-16 h-4 bg-slate-900 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                </div>

                <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono mt-1.5 select-none">
                  <span>ANTG LTE</span>
                  <span>12:00 PM</span>
                  <span>🔋 99%</span>
                </div>

                <div className="my-auto space-y-2.5 pt-4">
                  <div className="text-center">
                    <span className="text-[15px] font-bold text-white block">Easy App UI</span>
                    <span className="text-[9px] text-slate-400 block truncate">{currentPrescription.scenarioName.slice(0, 16)}</span>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={simInputEmail}
                      onChange={(e) => setSimInputEmail(e.target.value)}
                      placeholder="이메일 입력"
                      className="w-full bg-[#1A1A1F] border border-slate-800 text-[10px] text-white px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="password"
                      value={simInputPassword}
                      onChange={(e) => setSimInputPassword(e.target.value)}
                      placeholder="비밀번호 입력"
                      className="w-full bg-[#1A1A1F] border border-slate-800 text-[10px] text-white px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={runSimulation}
                    disabled={simActive && simStatus !== 'idle' && simStatus !== 'logged-in'}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-505 bg-blue-500 text-white font-bold text-[10px] rounded transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send size={9} />
                    <span>가상 손님 동작 전송 발령</span>
                  </button>

                  {/* Token ticket layout graphic */}
                  {simToken && (
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-center animate-bounce">
                      <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase block">🎫 특제 출입토큰 발행됨</span>
                      <span className="text-[6px] font-mono text-emerald-505 text-emerald-400 truncate block w-full">
                        {simToken}
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-12 h-1 bg-slate-800 rounded mx-auto mt-2"></div>
              </div>

              {/* Console log & Flow diagram Column */}
              <div className="md:col-span-7 flex flex-col justify-between gap-2 text-xs">
                {/* Visual glow nodes linking */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-around select-none">
                  {[
                    { id: 'user', label: "📱 폰", active: simActiveFlowStep === 'user-to-lb' || simActiveFlowStep === 'web-to-user' },
                    { id: 'lb', label: "🚦 순경", active: simActiveFlowStep === 'lb-to-web' },
                    { id: 'web', label: "👨‍🍳 셰프", active: simActiveFlowStep === 'registered' || simActiveFlowStep === 'logging-in' },
                    { id: 'db', label: "🏦 창고", active: simActiveFlowStep === 'web-to-db' || simActiveFlowStep === 'db-to-web' },
                    { id: 'redis', label: "⚡ 선반", active: simActiveFlowStep === 'web-to-redis' }
                  ].map(n => (
                    <div
                      key={n.id}
                      className={`px-1.5 py-1 rounded text-[9px] font-bold tracking-tight transition-all border ${
                        n.active
                          ? 'bg-blue-500 text-white border-blue-400 scale-110 shadow-lg shadow-blue-500/25 animate-pulse'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {n.label}
                    </div>
                  ))}
                </div>

                {/* Simulated action descriptions */}
                <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-350 space-y-1.5 min-h-[140px] max-h-[180px] overflow-y-auto leading-normal">
                  {simLogs.length === 0 ? (
                    <span className="text-slate-500 italic block">
                      왼쪽의 가상 폰에서 이메일과 암호를 누르고 테스트 버튼을 치는 순간, 실시간으로 데이터가 보안 터널과 분산 서버를 어떻게 뚫고 지나가는지 화살표 연결과 함께 상세히 중계하기 시작합니다!
                    </span>
                  ) : (
                    simLogs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-relaxed border-l-2 border-slate-800 pl-2">
                        {log}
                      </div>
                    ))
                  )}
                </div>

                <div className="text-[10px] text-slate-500 italic">
                  * 이 시뮬레이션은 서버 내에 주입한 JWT 알고리즘 및 API 통신 순서도를 고대로 연출하여 이해를 극대화해 줍니다.
                </div>
              </div>

            </div>
          </div>

          {/* Blueprint detail displaying card */}
          <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 shadow-lg flex-1 flex flex-col min-h-[200px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850 mb-3">
              <div className="flex items-center gap-1.5">
                <Terminal className="text-purple-400" size={15} />
                <span className="text-xs font-bold text-white uppercase font-sans">
                  {useEasyMode ? "📑 작성된 클라우드 통째 설치 명세서 (IaC Blueprint)" : "Infrastructure as Code Template"}
                </span>
              </div>
              {blueprintCode && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(blueprintCode);
                    onLogTerminal("[인프라 도안기] IaC 완성 설계 코드가 성실히 복사 보존되었습니다.", "info");
                    alert("성공적으로 복사되었습니다!");
                  }}
                  className="text-[10px] text-purple-400 hover:underline cursor-pointer"
                >
                  명세서 전체 복사
                </button>
              )}
            </div>

            <textarea
              readOnly
              value={blueprintCode}
              placeholder="위의 '📐 설계도 도안하기' 단추를 마운트하시면 구글 클라우드를 3초 안에 통째 지을 수 있는 정교한 설정 파일이 한글 해설과 같이 빌딩됩니다."
              className="flex-1 bg-slate-950 p-3 rounded-2xl border border-slate-850 w-full text-[11px] font-mono text-purple-300 focus:outline-none resize-none overflow-y-auto leading-relaxed"
            />
          </div>

        </div>

      </div>

    </div>
  );
}
