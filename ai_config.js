// AI 문제 생성 공통 설정
// 중계 서버(Cloudflare Worker) 주소를 넣으면 모든 기기에서 API 키 입력 없이 AI 기능을 씁니다.
// 비어 있으면 각 기기 브라우저에 저장된 키(뉴스 읽기 훈련에서 입력한 키)를 씁니다.
var AI_PROXY_URL = 'https://365-cognitive.l01097459705.workers.dev';
