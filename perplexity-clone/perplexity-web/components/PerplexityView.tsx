'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ChevronRight, ExternalLink, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface Source {
  id: number;
  title: string;
  url: string;
  domain: string;
  relevance: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PerplexityView = () => {
    const [activeCitation, setActiveCitation] = useState<number | null>(null);
    const sidebarRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'JARVIS Online. **Search-First** Protocol activated. What can I verify for you?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sources, setSources] = useState<Source[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('https://ai-tutor-jarvis.onrender.com/api/perplexity-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage.content })
            });

            const data = await response.json();

            if (data.success) {
                // Update sources
                if (data.sources && data.sources.length > 0) {
                    const formattedSources = data.sources.map((src: any, idx: number) => ({
                        id: idx + 1,
                        title: src.title || 'Source',
                        url: src.url || src.link || '#',
                        domain: src.domain || new URL(src.url || src.link || 'https://example.com').hostname,
                        relevance: src.relevance || 85
                    }));
                    setSources(formattedSources);
                }

                // Add assistant response
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.answer
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '⚠️ Search failed. Please try again or check if the backend is running.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const citationId = parseInt(entry.target.getAttribute('data-citation') || '0');
                        if(citationId > 0) setActiveCitation(citationId);
                    }
                });
            },
            { threshold: 0.5, rootMargin: "-10% 0px -50% 0px" }
        );

        setTimeout(() => {
            document.querySelectorAll('.citation-anchor').forEach((el) => observer.observe(el));
        }, 1000);

        return () => observer.disconnect();
    }, [messages]);

    const scrollToCitation = (id: number) => {
        const element = sidebarRefs.current[id];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setActiveCitation(id);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#0A0C10] text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
            
            <main className="w-full md:w-3/4 h-full flex flex-col items-center border-r border-gray-800/50 relative">
                <div className="w-full max-w-3xl flex flex-col h-full pt-8 px-6">
                    
                    <div className="flex items-center gap-3 mb-6 opacity-80">
                        <div className="p-2 bg-blue-600/20 rounded-lg backdrop-blur-sm border border-blue-500/10">
                            <Cpu className="text-blue-400 w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-semibold tracking-tight text-gray-300">JARVIS <span className="text-blue-500 text-xs uppercase tracking-wider ml-2">Search</span></h1>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-8 pb-40 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pr-4">
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[95%] ${
                                    m.role === 'assistant' 
                                    ? 'text-lg leading-relaxed text-gray-300' 
                                    : 'bg-[#1F2937] border border-gray-700 px-5 py-3 rounded-2xl text-sm text-white'
                                }`}>
                                    {m.role === 'assistant' ? (
                                        <div 
                                            className="prose prose-invert max-w-none prose-p:leading-loose prose-a:text-blue-400"
                                            dangerouslySetInnerHTML={{ 
                                                __html: m.content.replace(
                                                    /\[(\d+)\]/g, 
                                                    '<span class="citation-anchor inline-flex items-center justify-center w-5 h-5 ml-1 text-[10px] bg-blue-500/20 text-blue-400 rounded-full cursor-pointer hover:bg-blue-500 hover:text-white transition-colors" data-citation="$1">$1</span>'
                                                ) 
                                            }} 
                                        />
                                    ) : m.content}
                                </div>
                            </motion.div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex gap-3 items-center text-blue-400/80 pl-2 animate-pulse">
                                <Search className="w-4 h-4" />
                                <span className="text-sm font-mono">Searching the web...</span>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-20">
                        <form onSubmit={handleSubmit} className="relative group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything..."
                                className="w-full bg-[#16191E]/90 backdrop-blur-xl border border-gray-700/50 rounded-full py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-2xl"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed p-2.5 rounded-full transition-all text-white shadow-lg"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <aside className="hidden md:flex w-1/4 h-full bg-[#0D0F14] flex-col border-l border-gray-800/30">
                <div className="p-5 border-b border-gray-800/50 bg-[#0D0F14]/50 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Globe className="w-3 h-3" />
                        <span>Source Matrix</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
                    {sources.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-8">
                            Sources will appear here after your search
                        </div>
                    ) : (
                        <AnimatePresence>
                            {sources.map((source) => (
                                <motion.div
                                    key={source.id}
                                    ref={(el: HTMLDivElement | null) => { if(el) sidebarRefs.current[source.id] = el; }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ 
                                        opacity: 1, x: 0,
                                        borderColor: activeCitation === source.id ? 'rgba(59, 130, 246, 0.4)' : 'rgba(31, 41, 55, 0.4)',
                                        backgroundColor: activeCitation === source.id ? 'rgba(59, 130, 246, 0.05)' : 'rgba(22, 25, 30, 0.4)'
                                    }}
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                    className="p-3 rounded-lg border cursor-pointer relative group transition-all"
                                    onClick={() => window.open(source.url, '_blank')}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <img 
                                                src={`https://www.google.com/s2/favicons?sz=64&domain=${source.domain}`} 
                                                alt="favicon"
                                                className="w-4 h-4 rounded-sm opacity-70 group-hover:opacity-100 transition-opacity" 
                                            />
                                            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">{source.domain}</span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    
                                    <h4 className="text-sm font-medium leading-snug text-gray-300 group-hover:text-blue-100 transition-colors line-clamp-2">
                                        {source.title}
                                    </h4>

                                    <div className="mt-3 w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            style={{ width: `${source.relevance}%` }} 
                                            className="h-full bg-blue-500/70 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800/50">
                    <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 flex gap-3 text-[10px] text-yellow-500/70 leading-relaxed">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Live verification active. Citations are grounded in real-time scraped data.</span>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default PerplexityView;
