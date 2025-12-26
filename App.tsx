
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
  Zap
} from 'lucide-react';
import { GeneratedPost, WebhookResponse } from './types';

const WEBHOOK_URL = 'https://muhammadahmadme085-n8n.hf.space/webhook/linkinpost';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPost, setCurrentPost] = useState<GeneratedPost | null>(null);
  const [history, setHistory] = useState<GeneratedPost[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showPostGuide, setShowPostGuide] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedHistory = localStorage.getItem('post_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
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
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) throw new Error('Failed to generate post');

      const data: WebhookResponse = await response.json();
      
      const newPost: GeneratedPost = {
        id: crypto.randomUUID(),
        topic: topic,
        postContent: data.postContent,
        dataUrl: data.dataUrl,
        timestamp: Date.now()
      };

      setCurrentPost(newPost);
      setHistory(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Error:', error);
      alert('Generation failed. Please try again.');
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

    // 1. Copy text to clipboard
    await navigator.clipboard.writeText(currentPost.postContent);
    
    // 2. Show the helpful guide
    setShowPostGuide(true);
    
    // 3. Open LinkedIn in a new tab (after a tiny delay so user sees the modal)
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
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'} transition-all duration-300 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col z-20`}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <Linkedin size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">PostGen AI</span>
          </div>
          <button 
            onClick={startNew}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">History</div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-sm">
              Your generated posts will appear here.
            </div>
          ) : (
            history.map((post) => (
              <div 
                key={post.id}
                onClick={() => setCurrentPost(post)}
                className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 relative ${
                  currentPost?.id === post.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="text-sm font-medium truncate pr-8">{post.topic}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(post.timestamp).toLocaleDateString()}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <History size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:ring-2 ring-blue-500/50 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="w-full max-w-5xl space-y-8 pb-20">
            
            {/* Input Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Edit3 className="text-blue-500" size={20} />
                Post Creator
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic: The importance of networking..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && generatePost()}
                />
                <button 
                  onClick={generatePost}
                  disabled={isGenerating || !topic.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={18} />}
                  {isGenerating ? 'Drafting...' : 'Create Post'}
                </button>
              </div>
            </div>

            {currentPost && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Text Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Edit3 size={18} className="text-blue-500" />
                      Content Editor
                    </h3>
                    <button 
                      onClick={() => copyToClipboard(currentPost.postContent)}
                      className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                      {copyFeedback ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                  <textarea 
                    value={currentPost.postContent}
                    onChange={(e) => setCurrentPost({ ...currentPost, postContent: e.target.value })}
                    className="w-full h-[380px] p-5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-normal leading-relaxed text-sm shadow-inner"
                  />
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handlePostToLinkedIn}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-xl shadow-blue-600/30"
                    >
                      <Linkedin size={22} />
                      Post to LinkedIn (Fast)
                    </button>
                    
                    <button 
                      onClick={() => downloadImage(currentPost.dataUrl)}
                      className="w-full py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                      <Download size={20} className="text-blue-500" />
                      Download Image for Post
                    </button>
                  </div>
                </div>

                {/* Media Preview */}
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <ImageIcon size={18} className="text-blue-500" />
                    Visual Component
                  </h3>
                  <div className="aspect-square w-full bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 relative group shadow-lg">
                    <img 
                      src={currentPost.dataUrl} 
                      alt="AI Art" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <button 
                        onClick={() => downloadImage(currentPost.dataUrl)}
                        className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100"
                      >
                        <Download size={18} />
                        Save Image
                      </button>
                    </div>
                  </div>
                  
                  {/* Feed Preview Card */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {currentPost.postContent}
                    </div>
                    <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                       <img src={currentPost.dataUrl} className="w-full h-full object-cover opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!currentPost && !isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 mb-2 rotate-3 shadow-xl">
                  <Linkedin size={48} />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Level up your network.</h1>
                <p className="text-gray-500 dark:text-slate-400 max-w-lg text-lg">
                  Stop struggling with captions. Describe your topic and get high-performing LinkedIn posts with unique AI art in seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Guide Overlay Modal */}
      {showPostGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Check size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Ready to Post!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
              We've copied your text. Here's your final 2 steps on LinkedIn:
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <span className="font-medium">Paste the caption into the post box.</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <span className="font-medium">Upload the image you just downloaded.</span>
              </div>
            </div>

            <button 
              onClick={() => setShowPostGuide(false)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-white/90 dark:bg-slate-900/95 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <Linkedin size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Topic...</h2>
          <p className="text-gray-500 dark:text-slate-400 animate-pulse">Researching current LinkedIn trends.</p>
        </div>
      )}
    </div>
  );
};

export default App;
