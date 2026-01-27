/**
 * JARVIS AI Chat Component
 * Production-ready React component with animated loading states and source cards
 * Connects to Python Flask backend at /ask-jarvis endpoint
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Search, Loader2, ExternalLink, AlertCircle, Sparkles, Globe, CheckCircle } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api/jarvis/ask'; // Node.js proxy endpoint

const LOADING_MESSAGES = [
  { icon: <Globe className="w-4 h-4" />, text: 'Searching 2026 web...' },
  { icon: <Loader2 className="w-4 h-4 animate-spin" />, text: 'Scraping content...' },
  { icon: <CheckCircle className="w-4 h-4" />, text: 'Verifying sources...' },
  { icon: <Sparkles className="w-4 h-4" />, text: 'JARVIS is thinking...' }
];

const JarvisChat = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Cycle through loading messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000); // Change message every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingMessageIndex(0);

    // Add user query to chat history
    const userMessage = { type: 'user', content: query, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const result = await axios.post(BACKEND_URL, 
        { query: query.trim() },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 second timeout
        }
      );

      if (result.data.success) {
        const aiMessage = {
          type: 'jarvis',
          content: result.data.response,
          sources: result.data.sources || [],
          metadata: {
            verified_sources: result.data.verified_sources_count || 0,
            context_length: result.data.context_length || 0,
            model: result.data.model || 'llama-3.3-70b-versatile'
          },
          timestamp: new Date()
        };
        
        setChatHistory(prev => [...prev, aiMessage]);
        setResponse(aiMessage);
      } else {
        throw new Error(result.data.error || 'Unknown error occurred');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'JARVIS is having a quick power nap! Try again.';
      setError(errorMessage);
      
      const errorMsg = {
        type: 'error',
        content: errorMessage,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-gray-900/80 border-b border-blue-500/30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse"></div>
              <Sparkles className="w-8 h-8 text-blue-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                JARVIS AI Assistant
              </h1>
              <p className="text-sm text-gray-400">Powered by Real-Time 2026 Web Research</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Message */}
          {chatHistory.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-blue-500/10 rounded-full mb-4">
                <Sparkles className="w-16 h-16 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Hello, I'm JARVIS</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Ask me anything! I'll search the 2026 web, verify sources, and give you accurate answers with citations.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <SuggestedQuery 
                  query="Latest AI trends in 2026" 
                  onClick={setQuery}
                />
                <SuggestedQuery 
                  query="Python programming updates" 
                  onClick={setQuery}
                />
                <SuggestedQuery 
                  query="Tamil Nadu tech news" 
                  onClick={setQuery}
                />
              </div>
            </div>
          )}

          {/* Chat History */}
          {chatHistory.map((message, index) => (
            <div key={index}>
              {message.type === 'user' && (
                <UserMessage content={message.content} timestamp={message.timestamp} />
              )}
              {message.type === 'jarvis' && (
                <JarvisMessage 
                  content={message.content} 
                  sources={message.sources}
                  metadata={message.metadata}
                  timestamp={message.timestamp}
                />
              )}
              {message.type === 'error' && (
                <ErrorMessage content={message.content} />
              )}
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center gap-3 text-blue-400">
                  {LOADING_MESSAGES[loadingMessageIndex].icon}
                  <span className="font-medium animate-pulse">
                    {LOADING_MESSAGES[loadingMessageIndex].text}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-blue-500/30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-2xl border border-blue-500/30 focus-within:border-blue-500 transition-all p-2">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask JARVIS anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 px-2 py-3"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Researching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Ask</span>
                  </>
                )}
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-500 text-center mt-2">
            JARVIS uses real-time web research • {chatHistory.filter(m => m.type === 'jarvis').length} conversations
          </p>
        </div>
      </div>
    </div>
  );
};

// User Message Component
const UserMessage = ({ content, timestamp }) => (
  <div className="flex items-start gap-4 justify-end">
    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl px-6 py-4 max-w-2xl shadow-lg">
      <p className="text-white">{content}</p>
      <p className="text-xs text-blue-100 mt-2">{formatTime(timestamp)}</p>
    </div>
    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-bold">You</span>
    </div>
  </div>
);

// JARVIS Message Component with Source Cards
const JarvisMessage = ({ content, sources, metadata, timestamp }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/50">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 space-y-4">
      {/* Answer Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-gray-200 leading-relaxed mb-3">{children}</p>,
              strong: ({ children }) => <strong className="text-blue-400 font-semibold">{children}</strong>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                  {children}
                </a>
              ),
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-gray-200">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-gray-200">{children}</ol>,
              code: ({ children }) => (
                <code className="bg-gray-900 text-cyan-400 px-2 py-1 rounded text-sm">{children}</code>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        
        {/* Metadata */}
        {metadata && (
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-4 text-xs text-gray-400">
            <span>✓ {metadata.verified_sources} verified sources</span>
            <span>• {metadata.context_length} chars analyzed</span>
            <span>• {metadata.model}</span>
            <span>• {formatTime(timestamp)}</span>
          </div>
        )}
      </div>

      {/* Source Cards */}
      {sources && sources.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Sources ({sources.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((source, index) => (
              <SourceCard key={index} source={source} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Source Card Component (Perplexity Style)
const SourceCard = ({ source, index }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group bg-gray-800/30 hover:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
  >
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
        <span className="text-blue-400 font-bold text-sm">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
          {source.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          {new URL(source.url).hostname}
        </p>
      </div>
    </div>
  </a>
);

// Error Message Component
const ErrorMessage = ({ content }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
      <AlertCircle className="w-5 h-5 text-red-400" />
    </div>
    <div className="flex-1 bg-red-900/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
      <p className="text-red-300">{content}</p>
    </div>
  </div>
);

// Suggested Query Component
const SuggestedQuery = ({ query, onClick }) => (
  <button
    onClick={() => onClick(query)}
    className="bg-gray-800/50 hover:bg-gray-800 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-200 text-left group"
  >
    <p className="text-sm text-gray-300 group-hover:text-blue-400 transition-colors">{query}</p>
  </button>
);

// Utility Functions
const formatTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

export default JarvisChat;
