
import React, { useState, useEffect } from 'react';
import { 
  Send, 
  History, 
  Moon, 
  Sun, 
  Linkedin, 
  Copy, 
  Check, 
  Image as ImageIcon,
  Edit3,
  Trash2,
  Plus,
  Download,
  Zap,
  X,
  Menu
} from 'lucide-react';
import { GeneratedPost, WebhookResponse } from './types.ts';

// Updated to the production webhook URL
const WEBHOOK_URL = 'https://muhammadahmadme085-n8n.hf.space/webhook/linkinpost';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPost, setCurrentPost] = useState<GeneratedPost | null>(null);
  const [history, setHistory] = useState<GeneratedPost[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showPostGuide, setShowPostGuide] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('post_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }

    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('post_history', JSON.stringify(history));
  }, [history]);

  const generatePost = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    if (window.innerWidth < 1024) setSidebarOpen(false);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || 'No response body'}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format: Expected JSON from webhook.");
      }

      const data: WebhookResponse = await response.json();
      
      if (!data.postContent || !data.dataUrl) {
        throw new Error("Missing data in response: Check if n8n is sending 'postContent' and 'dataUrl'.");
      }

      const newPost: GeneratedPost = {
        id: crypto.randomUUID(),
        topic: topic,
        postContent: data.postContent,
        dataUrl: data.dataUrl,
        timestamp: Date.now()
      };

      setCurrentPost(newPost);
      setHistory(prev => [newPost, ...prev]);
    } catch (error: any) {
      console.error('Generation Error:', error);
      alert(`Generation failed: ${error.message}\n\nPlease ensure your n8n workflow is active and the webhook URL is correct.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `linkedin-post-${Date.now()}.png`;
    link.click();
  };

  const handlePostToLinkedIn = async () => {
    if (!currentPost) return;
    await navigator.clipboard.writeText(currentPost.postContent);
    setShowPostGuide(true);
    setTimeout(() => {
      window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
    }, 1200);
  };

  const deletePost = (id: string) => {
    setHistory(prev => prev.filter(p => p.id !== id));
    if (currentPost?.id === id) setCurrentPost(null);
  };

  const startNew = () => {
    setCurrentPost(null);
    setTopic('');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative">
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-800 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white shrink-0">
                <Linkedin size={18} />
              </div>
              <span className="font-bold text-lg tracking-tight">PostGen AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={startNew}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="New Post"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">History</div>
            {history.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-sm text-gray-400 dark:text-slate-500">No posts generated yet.</p>
              </div>
            ) : (
              history.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => {
                    setCurrentPost(post);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 relative ${
                    currentPost?.id === post.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="text-sm font-medium truncate pr-6">{post.topic}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 lg:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg hidden lg:block"
            >
              <History size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:ring-2 ring-blue-500/50 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 md:p-10 flex flex-col items-center">
          <div className="w-full max-w-6xl space-y-8 pb-24">
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                <Edit3 className="text-blue-500" size={18} />
                What's on your mind?
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Benefits of Remote Work..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                  onKeyDown={(e) => e.key === 'Enter' && generatePost()}
                />
                <button 
                  onClick={generatePost}
                  disabled={isGenerating || !topic.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 shrink-0"
                >
                  {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={18} />}
                  <span className="hidden sm:inline">{isGenerating ? 'Working...' : 'Create Post'}</span>
                  <span className="sm:hidden">{isGenerating ? '...' : 'Create'}</span>
                </button>
              </div>
            </div>

            {currentPost && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                      <Edit3 size={16} className="text-blue-500" />
                      Draft
                    </h3>
                    <button 
                      onClick={() => copyToClipboard(currentPost.postContent)}
                      className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                      {copyFeedback ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <textarea 
                    value={currentPost.postContent}
                    onChange={(e) => setCurrentPost({ ...currentPost, postContent: e.target.value })}
                    className="w-full h-80 sm:h-[400px] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-normal leading-relaxed text-sm shadow-inner"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-2">
                    <button 
                      onClick={handlePostToLinkedIn}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-blue-600/30 text-sm sm:text-base"
                    >
                      <Linkedin size={20} />
                      Post to LinkedIn
                    </button>
                    
                    <button 
                      onClick={() => downloadImage(currentPost.dataUrl)}
                      className="w-full py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:hover:bg-slate-700 transition-all text-sm sm:text-base"
                    >
                      <Download size={18} className="text-blue-500" />
                      Download Visual
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <ImageIcon size={16} className="text-blue-500" />
                    Preview
                  </h3>
                  <div className="aspect-square w-full bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 relative group shadow-md max-w-md mx-auto lg:max-w-none">
                    <img 
                      src={currentPost.dataUrl} 
                      alt="Post Visual" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                        onClick={() => downloadImage(currentPost.dataUrl)}
                        className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 transform scale-90 group-hover:scale-100 transition-transform"
                      >
                        <Download size={18} />
                        Save Image
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hidden sm:block max-w-md mx-auto lg:max-w-none">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="h-1.5 w-12 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {currentPost.postContent}
                    </div>
                    <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-50 dark:border-slate-800">
                       <img src={currentPost.dataUrl} className="w-full h-full object-cover opacity-90" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!currentPost && !isGenerating && (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 mb-6 rotate-3 shadow-xl">
                  <Linkedin size={40} className="sm:w-12 sm:h-12" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">Master your LinkedIn presence.</h1>
                <p className="text-gray-500 dark:text-slate-400 max-w-md text-sm sm:text-lg">
                  AI-powered content and visuals designed to engage your network. Start by typing a topic above.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showPostGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Check size={28} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">Ready to Shine!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8">
              Text copied. Follow these quick steps to finish your post:
            </p>
            
            <div className="space-y-3 mb-8">
              {[
                "Paste your caption in the post box.",
                "Upload the visual from your downloads."
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</div>
                  <span className="font-medium text-sm">{step}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowPostGuide(false)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
            >
              Got it, let's go!
            </button>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/98 flex flex-col items-center justify-center backdrop-blur-md px-6 text-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8">
            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Linkedin size={28} />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Generating Masterpiece...</h2>
          <p className="text-gray-500 dark:text-slate-400 animate-pulse text-sm sm:text-base">This usually takes about 30 seconds.</p>
        </div>
      )}
    </div>
  );
};

export default App;
