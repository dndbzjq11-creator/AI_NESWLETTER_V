import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  Copy, 
  Check, 
  BookOpen, 
  TrendingUp, 
  Lightbulb, 
  Briefcase,
  UserCheck,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NewsletterPreview, NewsletterDetail } from "./types";
import { generatePreviews, generateDetail } from "./services/geminiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CACHE_KEY = "ai_newsletter_v_previews";

export default function App() {
  const [previews, setPreviews] = useState<NewsletterPreview[]>([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterPreview | null>(null);
  const [detail, setDetail] = useState<NewsletterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setPreviews(JSON.parse(cached));
    }
    fetchPreviews();
  }, []);

  const fetchPreviews = async (query?: string) => {
    setLoading(true);
    try {
      const data = await generatePreviews(query);
      setPreviews(data);
      if (!query) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to fetch previews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchPreviews(searchQuery);
    }
  };

  const handleSelect = async (preview: NewsletterPreview) => {
    setSelectedNewsletter(preview);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await generateDetail(preview);
      setDetail(data);
    } catch (error) {
      console.error("Failed to fetch detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCopy = () => {
    if (!detail) return;

    const text = `
[${detail.headline}]

■ 핵심 요약 (3-Line Summary)
${detail.summary3Line}

■ 왜 지금 중요할까요?
${detail.whyNow}

■ 상세 내용
${detail.sections.map(s => `${s.header}\n${s.content.replace(/<[^>]*>/g, "")}`).join("\n\n")}

■ AI 실무 적용 시나리오
${detail.useCases.map((u, i) => `${i + 1}. ${u.title}: ${u.description}`).join("\n")}

■ 전문가의 생각
${detail.expertThought}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => {
              setSelectedNewsletter(null);
              setDetail(null);
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <TrendingUp size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">AI_NEWSLETTER_V</span>
          </button>
          
          {selectedNewsletter && (
            <button 
              onClick={() => {
                setSelectedNewsletter(null);
                setDetail(null);
              }}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <ChevronLeft size={18} />
              목록으로 돌아가기
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedNewsletter ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <section className="text-center space-y-6 py-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  실무자를 위한 <span className="text-indigo-600">가장 전문적인</span><br />
                  AI 비즈니스 인사이트
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  복잡한 기술을 실무의 언어로 번역합니다. <br />
                  지금 바로 당신의 업무를 혁신할 AI 트렌드를 확인하세요.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
                  <input
                    type="text"
                    placeholder="궁금한 AI 주제를 입력하세요 (예: 마케팅 자동화, 엑셀 AI)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 focus:border-indigo-500 focus:ring-0 outline-none transition-all text-lg"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    검색
                  </button>
                </form>
              </section>

              {/* Recommendations */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" />
                    오늘의 추천 뉴스레터
                  </h2>
                  <button 
                    onClick={() => fetchPreviews()}
                    disabled={loading}
                    className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                    새로운 추천 받기
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading && previews.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-1/4" />
                        <div className="h-6 bg-slate-200 rounded w-3/4" />
                        <div className="h-20 bg-slate-200 rounded" />
                      </div>
                    ))
                  ) : (
                    previews.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ y: -5 }}
                        onClick={() => handleSelect(item)}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all text-left flex flex-col h-full group"
                      >
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">{item.category}</span>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">{item.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{item.summary}</p>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{item.benefit}</span>
                          <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-12 pb-24"
              ref={detailRef}
            >
              {detailLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-slate-800">전문 에디터가 뉴스레터를 작성 중입니다...</p>
                    <p className="text-slate-500">잠시만 기다려 주세요. 실무 인사이트를 가득 담고 있습니다.</p>
                  </div>
                </div>
              ) : detail && (
                <>
                  {/* Detail Header */}
                  <div className="space-y-8 text-center">
                    <div className="flex justify-center">
                      <button 
                        onClick={handleCopy}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-md",
                          copied ? "bg-emerald-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "복사 완료!" : "전체 텍스트 복사"}
                      </button>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                      {detail.headline}
                    </h1>

                    {/* 3-Line Summary */}
                    <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-2xl text-left">
                      <h3 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
                        <Lightbulb size={20} />
                        핵심 요약 (3-Line Summary)
                      </h3>
                      <div className="text-indigo-800 leading-relaxed whitespace-pre-wrap font-medium newsletter-content">
                        <span dangerouslySetInnerHTML={{ __html: detail.summary3Line }} />
                      </div>
                    </div>
                  </div>

                  {/* Why Now */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="text-indigo-600" />
                      왜 지금 중요할까요?
                    </h2>
                    <div className="text-lg text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-100 shadow-sm newsletter-content">
                      <span dangerouslySetInnerHTML={{ __html: detail.whyNow }} />
                    </div>
                  </section>

                  {/* Detailed Content - Editorial Style */}
                  <section className="space-y-8">
                    {detail.sections.map((section, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                      >
                        <h3 className="text-3xl font-black text-slate-900 border-b-4 border-indigo-100 pb-2 inline-block">
                          {section.header.replace(/^###\s*/, "")}
                        </h3>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600" />
                          <div className="prose prose-slate max-w-none prose-p:text-xl prose-p:leading-relaxed prose-p:text-slate-700 prose-strong:text-slate-900">
                            <div 
                              dangerouslySetInnerHTML={{ __html: section.content }} 
                              className="newsletter-content"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </section>

                  {/* AI Business Use Cases */}
                  <section className="space-y-8">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Briefcase className="text-indigo-600" />
                      AI 실무 적용 시나리오
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {detail.useCases.map((useCase, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-indigo-600 font-bold mb-4">
                            {idx + 1}
                          </div>
                          <h4 className="font-bold text-slate-900 mb-2">{useCase.title}</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">{useCase.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Expert Thought */}
                  <section className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <UserCheck size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
                        <UserCheck />
                        전문가의 생각
                      </h2>
                      <div className="text-xl leading-relaxed text-slate-300 italic newsletter-content">
                        "<span dangerouslySetInnerHTML={{ __html: detail.expertThought }} />"
                      </div>
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
            <TrendingUp size={20} />
            AI_NEWSLETTER_V
          </div>
          <p className="text-slate-400 text-sm">
            © 2024 AI_NEWSLETTER_V. All rights reserved. <br />
            실무자를 위한 가장 전문적인 AI 비즈니스 인사이트
          </p>
        </div>
      </footer>

      {/* Custom Styles for Newsletter Content */}
      <style>{`
        .newsletter-content p {
          margin-bottom: 1.5rem;
        }
        .newsletter-content b, .newsletter-content strong {
          font-weight: 800;
          color: #1e293b;
        }
        .newsletter-content span[style*="color: #e11d48"] {
          display: inline-block;
          padding: 0 2px;
        }
        .newsletter-content span[style*="background-color: #fef08a"] {
          padding: 0 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
