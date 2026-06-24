import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');

  // App States
  const [query, setQuery] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  
  // Server Status State
  const [serverStatus, setServerStatus] = useState('idle'); // idle, waking, awake, error
  
  const fileInputRef = useRef(null);

  // --- WAKE UP SERVER LOGIC ---
  const wakeUpServer = async () => {
    setServerStatus('waking');
    try {
      // Aapke backend mein jo /health endpoint hai, use hit karenge
      const res = await fetch('https://tds-pro-final.onrender.com/health');
      if (res.ok) {
        setServerStatus('awake');
      } else {
        setServerStatus('error');
      }
    } catch (err) {
      setServerStatus('error');
    }
  };

  // --- IMAGE HANDLING ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- QUERY SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() && !imageBase64) return;

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('https://tds-pro-final.onrender.com/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: query,
          image: imageBase64 
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      
      const data = await res.json();
      setResponse(data);
      // Agar server successful response de raha hai, matlab wo awake hai
      setServerStatus('awake'); 
    } catch (err) {
      setError('Failed to connect. Agar server so raha hai, toh "Wake Up" button try karein!');
      setServerStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('home')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'home' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                Assistant
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'about' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                About Project
              </button>
            </div>

            {/* Server Status Indicator & Wake Button */}
            <div className="flex items-center space-x-3">
              {serverStatus === 'idle' && (
                <button 
                  onClick={wakeUpServer}
                  className="text-xs font-medium px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors flex items-center shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                  Wake Up Server
                </button>
              )}
              {serverStatus === 'waking' && (
                <span className="text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full flex items-center border border-blue-100">
                  <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                  Starting... (Takes ~50s)
                </span>
              )}
              {serverStatus === 'awake' && (
                <span className="text-xs font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full flex items-center border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  API Online
                </span>
              )}
              {serverStatus === 'error' && (
                <button 
                  onClick={wakeUpServer}
                  className="text-xs font-medium px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center border border-red-100 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Offline - Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 sm:py-16">
        
        {/* --- TAB: HOME (ASSISTANT) --- */}
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-10"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Teaching Assistant</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Upload context, query engineering documents, or verify concepts instantly powered by our custom RAG engine.
              </p>
            </div>

            {/* Input Form */}
            <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              
              {imagePreview && (
                <div className="mb-4 ml-2 mt-2 relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Context" 
                    className="h-36 w-auto object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-3 -right-3 bg-white text-slate-500 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:text-red-500 hover:bg-red-50 shadow-md border border-slate-100 transition-all"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-3.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Upload image or diagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </button>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={imagePreview ? "Ask about this document..." : "Ask a question (e.g., 'What is docker?')..."}
                  className="flex-1 bg-transparent p-3 outline-none text-slate-800 placeholder-slate-400 text-lg w-full"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || (!query.trim() && !imageBase64)}
                  className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center justify-center min-w-[120px]"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Searching
                    </span>
                  ) : 'Submit'}
                </button>
              </form>
            </div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-start"
                >
                  <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                  {error}
                </motion.div>
              )}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-12"
                >
                  <div className="flex space-x-2 bg-white p-4 rounded-full shadow-sm border border-slate-100">
                    <div className="h-2.5 w-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2.5 w-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2.5 w-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}

              {response && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
                >
                  <div className="p-8 sm:p-10">
                    <div className="prose prose-indigo max-w-none text-slate-700">
                      <p className="whitespace-pre-wrap leading-relaxed text-lg">{response.answer}</p>
                    </div>
                  </div>

                  {response.links && response.links.length > 0 && (
                    <div className="bg-slate-50 p-8 sm:p-10 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Grounding Sources
                      </h3>
                      <div className="grid gap-3">
                        {response.links.map((link, index) => (
                          <a 
                            key={index} 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-indigo-200 group"
                          >
                            <span className="bg-indigo-50 text-indigo-500 p-2 rounded-lg mr-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            </span>
                            <div className="flex-1 min-w-0 mt-0.5">
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {link.text}
                              </p>
                              <p className="text-xs text-slate-400 mt-1.5 truncate">
                                {link.url}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* --- TAB: ABOUT PROJECT --- */}
        {activeTab === 'about' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">About This Project</h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                The <strong>Virtual Teaching Assistant</strong> is an intelligent knowledge retrieval system built to assist students and engineers in quickly finding accurate answers from a vast repository of course materials and discussions.
              </p>
              
              <div className="bg-indigo-50 rounded-2xl p-6 my-8 border border-indigo-100">
                <h3 className="text-indigo-900 font-bold mb-3">How it works</h3>
                <ul className="space-y-2 text-indigo-800 text-base">
                  <li className="flex items-start"><span className="mr-2">🚀</span> Uses <strong>Retrieval-Augmented Generation (RAG)</strong> to fetch exact context from database chunks.</li>
                  <li className="flex items-start"><span className="mr-2">🧠</span> Powered by OpenAI's <strong>GPT-4o-mini</strong> for accurate natural language understanding.</li>
                  <li className="flex items-start"><span className="mr-2">🖼️</span> Supports <strong>Multimodal Inputs</strong>—you can upload diagrams, equations, or screenshots along with your text.</li>
                  <li className="flex items-start"><span className="mr-2">🔗</span> Always cites its sources, providing direct links back to the original documentation or discourse post.</li>
                </ul>
              </div>

              <p>
                <strong>Tech Stack:</strong><br/>
                Frontend: React, Vite, Tailwind CSS, Framer Motion.<br/>
                Backend: FastAPI, SQLite, aiohttp (deployed on Render).
              </p>
            </div>
          </motion.div>
        )}

      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full py-8 mt-auto text-center text-sm text-slate-400">
        <p>Virtual Teaching Assistant • Made with <span className="text-red-500 mx-1">❤️</span> by <span className="font-medium text-slate-600">Rishesh</span></p>
      </footer>
    </div>
  );
}