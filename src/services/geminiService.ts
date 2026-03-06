import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { NewsletterPreview, NewsletterDetail } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const generatePreviews = async (topic?: string): Promise<NewsletterPreview[]> => {
  const prompt = topic 
    ? `'${topic}' 주제와 관련된 기업용 AI 트렌드 및 업무 자동화 뉴스레터 요약본 6개를 생성해주세요.`
    : "최신 기업용 AI 트렌드 및 업무 자동화 뉴스레터 요약본 6개를 생성해주세요.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: "호기심을 자극하는 매력적인 제목" },
            category: { type: Type.STRING, description: "인사, 마케팅, 재무, 개발 등" },
            summary: { type: Type.STRING, description: "핵심 요약" },
            benefit: { type: Type.STRING, description: "실질적 이득" },
          },
          required: ["id", "title", "category", "summary", "benefit"],
        },
      },
      systemInstruction: "당신은 전문 AI 뉴스레터 에디터입니다. 실무자들에게 실질적인 인사이트를 주는 전문적인 내용을 작성하세요. 제목은 클릭을 유도하는 카피라이팅 기법을 사용하세요.",
    },
  });

  return JSON.parse(response.text || "[]");
};

export const generateDetail = async (preview: NewsletterPreview): Promise<NewsletterDetail> => {
  const prompt = `제목: "${preview.title}"에 대한 상세 뉴스레터 본문을 작성해주세요. 
  
  [상세 내용 구성 지침]
  1. 핵심 가치의 심층 구현: 제목에서 제시한 핵심 가치를 깊이 있게 서술하세요.
  2. 유기적 스토리텔링: 문장 간의 연결성을 확보하여 유기적인 문단으로 구성하세요.
  3. 가독성 최적화: 중요도에 따라 섹션을 명확히 나누고 적절한 공백을 사용하세요.
  4. 강조 스타일 가이드: 
     - 매우 중요한 키워드: **굵게**
     - 핵심 인사이트: <span style="color: #e11d48; font-weight: 800;">빨간색 굵은 글씨</span>
     - 시각적 강조: <span style="background-color: #fef08a; text-decoration: underline; text-decoration-color: #facc15; text-underline-offset: 4px; text-decoration-thickness: 2px;">노란색 밑줄 스타일</span>
  5. 코드 블록(예: \`\`\`)은 절대 사용하지 마세요.
  6. AI 실무 적용 시나리오 6가지를 포함하세요.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          summary3Line: { type: Type.STRING, description: "바쁜 직장인을 위한 3줄 요약" },
          whyNow: { type: Type.STRING, description: "지금 이 기술이 왜 중요한지 설명" },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING, description: "### 섹션 소제목 (번호 없이)" },
                content: { type: Type.STRING, description: "강조 스타일이 적용된 상세 본문 내용" },
              },
              required: ["header", "content"],
            },
          },
          useCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
            description: "AI 실무 적용 시나리오 6가지",
          },
          expertThought: { type: Type.STRING, description: "전문가의 생각 (통찰력 있는 전망)" },
        },
        required: ["headline", "summary3Line", "whyNow", "sections", "useCases", "expertThought"],
      },
      systemInstruction: "당신은 전환율을 극대화하는 전문 웹 카피라이터이자 AI 뉴스레터 에디터입니다. 실무자의 언어로 기술을 번역하여 전달하는 친절하지만 권위 있는 전문가의 말투를 사용하세요. HTML 태그를 활용한 강조 스타일 가이드를 엄격히 준수하세요.",
    },
  });

  return JSON.parse(response.text || "{}");
};
