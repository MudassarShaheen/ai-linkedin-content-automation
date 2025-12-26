
import React, { useState, useEffect, useCallback } from 'react';
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
  ExternalLink,
  Trash2,
  Plus
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load history and theme on mount
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
      alert('Generation failed. Please check the n8n webhook or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentPost) return;
    navigator.clipboard.writeText(currentPost.postContent);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const shareOnLinkedIn = () => {
    // Standard LinkedIn share intent URL (mostly useful for sharing specific web URLs)
    // For manual posting, we provide the copy button.
    const url = encodeURIComponent('https://your-app-domain.com'); // In a real app, this might be a public view of the post
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
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
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'} transition-all duration-300 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col`}>
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
            title="New Post"
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
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
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
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              <ExternalLink size={16} />
              Open LinkedIn
            </a>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-8">
            
            {/* Input Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Edit3 className="text-blue-500" size={20} />
                What's the topic today?
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The future of AI in frontend engineering..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && generatePost()}
                />
                <button 
                  onClick={generatePost}
                  disabled={isGenerating || !topic.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Send size={18} />
                      Generate Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {currentPost && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Edit3 size={18} className="text-blue-500" />
                      Refine Content
                    </h3>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                      {copyFeedback ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  <textarea 
                    value={currentPost.postContent}
                    onChange={(e) => setCurrentPost({ ...currentPost, postContent: e.target.value })}
                    className="w-full h-[400px] p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner font-normal leading-relaxed"
                  />
                  <button 
                    onClick={shareOnLinkedIn}
                    className="w-full py-4 bg-[#0077b5] hover:bg-[#006097] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-blue-600/20"
                  >
                    <Linkedin size={20} />
                    Open Share Dialog
                  </button>
                  <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
                    Note: LinkedIn sharing intent doesn't support auto-pasting content yet. Click "Copy to Clipboard" above first.
                  </p>
                </div>

                {/* Visual Preview */}
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <ImageIcon size={18} className="text-blue-500" />
                    Visual Artwork
                  </h3>
                  <div className="aspect-square w-full bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden relative group shadow-2xl">
                    <img 
                      src={currentPost.dataUrl} 
                      alt="Generated AI art" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = currentPost.dataUrl;
                          link.download = `linkedin-post-${Date.now()}.png`;
                          link.click();
                        }}
                        className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors"
                      >
                        Download Image
                      </button>
                    </div>
                  </div>
                  
                  {/* Real-time Feed Preview */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div>
                        <div className="h-3 w-24 bg-slate-200 rounded mb-1"></div>
                        <div className="h-2 w-16 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                    <div className="text-xs line-clamp-3 mb-3 text-slate-600 dark:text-slate-400">
                      {currentPost.postContent}
                    </div>
                    <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden">
                       <img src={currentPost.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!currentPost && !isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <Linkedin size={40} />
                </div>
                <h1 className="text-3xl font-bold">Ready to dominate LinkedIn?</h1>
                <p className="text-gray-500 dark:text-slate-400 max-w-md">
                  Enter a topic and our AI will research the trend, write the copy, and generate custom visuals just for you.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-white/90 dark:bg-slate-900/95 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-blue-500 rounded-full flex items-center justify-center text-white animate-pulse">
              <Linkedin size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Generating your masterpiece...</h2>
          <p className="text-gray-500 dark:text-slate-400 animate-pulse text-center max-w-sm px-4">
            Our AI is researching your topic and painting a unique visual. This usually takes 30-45 seconds.
          </p>
          <div className="mt-8 flex gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
