import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, ArrowRight, FileText, Sparkles, 
  User, Bot, Layout, Settings, HelpCircle, 
  History, Users, FolderOpen, Plus, Paperclip, Mic,
  Lightbulb, UserCheck, Globe, Building
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateIdeas, generateProjectDoc, getInvestorFeedback, recommendCompanies, analyzeRequirements } from "@/lib/llm";

type Step = 'input' | 'refining-requirements' | 'generating-ideas' | 'select-idea' | 'generating-doc' | 'show-doc' | 'investor-chat' | 'recommending-companies';

interface Idea {
  id: string;
  title: string;
  description: string;
}

interface CompanyRecommendation {
  round: string;
  company: string;
  reason: string;
}

interface Message {
  role: 'user' | 'ai' | 'system';
  content: string;
  type?: 'text' | 'ideas' | 'doc' | 'companies';
  data?: any;
}

const INVESTORS = [
  { id: 'elon', name: 'Elon Musk', role: '第一性原理导师', avatar: '🚀', style: '直击本质，物理学思维，关注数量级提升' },
  { id: 'zhenfund', name: '真格基金', role: '天使投资人', avatar: '💸', style: '关注创始团队特质，投人哲学，寻找独角兽' },
  { id: 'linear', name: '线性资本', role: '硬科技投资', avatar: '⚡', style: '关注技术壁垒，数据智能，落地场景' },
  { id: 'ycombinator', name: 'YC Partner', role: '创业导师', avatar: '🔥', style: 'Make something people want，快速迭代，增长黑客' },
];

const QuickActionCard = ({ icon, title, onClick, color }: { icon: React.ReactNode, title: string, onClick: () => void, color: string }) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer transition-all hover:border-white/20 group"
  >
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="font-medium text-sm text-gray-200 group-hover:text-white">{title}</span>
    <Plus className="w-4 h-4 text-gray-500 ml-auto group-hover:text-white" />
  </div>
);

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<Step>('input');
  const [input, setInput] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // @ts-ignore
  const [ideas, setIdeas] = useState<Idea[]>([]);
  // @ts-ignore
  const [doc, setDoc] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialInput = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGenerateIdeas = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput("");
    setStep('generating-ideas');

    try {
      const response = await generateIdeas(text);
      let newIdeas: Idea[] = [];
      
      try {
        // Attempt to parse JSON from the response
        const jsonMatch = response.match(/\[.*\]/s);
        if (jsonMatch) {
          newIdeas = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if no JSON array found
          newIdeas = [
            { id: '1', title: 'AI Generated Idea 1', description: response.slice(0, 100) + '...' }
          ];
        }
      } catch (e) {
        console.error("Failed to parse ideas JSON:", e);
        newIdeas = [
          { id: '1', title: 'Parse Error', description: 'Could not parse AI response. Please try again.' }
        ];
      }

      setIdeas(newIdeas);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: '基于你的想法，我为你发散了以下几个方向。请选择一个你最感兴趣的，我们将深入探讨并生成项目文档。',
        type: 'ideas',
        data: newIdeas
      }]);
      setStep('select-idea');
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong generating ideas.' }]);
      setStep('input');
    }
  };

  const handleSelectIdea = async (idea: Idea) => {
    setMessages(prev => [...prev, { role: 'user', content: `我选择：${idea.title}` }]);
    setStep('generating-doc');
    
    try {
      const generatedDoc = await generateProjectDoc(idea.title, idea.description);
      setDoc(generatedDoc);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: '项目文档已生成！你可以查看详情，或者点击下方的按钮邀请模拟投资人进行点评。',
        type: 'doc',
        data: generatedDoc
      }]);
      setStep('show-doc');
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong generating the document.' }]);
      setStep('select-idea');
    }
  };

  const handleInvestorChat = async (investorId: string) => {
    const investor = INVESTORS.find(i => i.id === investorId);
    if (!investor) return;

    setMessages(prev => [...prev, { role: 'user', content: `我想听听 ${investor.name} 的看法。` }]);
    setStep('investor-chat');

    try {
      // Use the last generated doc or the last user message as context
      const context = doc || messages[messages.length - 1].content;
      const feedback = await getInvestorFeedback(investorId, context);

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: feedback,
        data: { investor }
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, the investor is currently unavailable.' }]);
    }
  };

  const handleRecommendCompanies = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput("");
    setStep('recommending-companies');

    try {
      const response = await recommendCompanies(text);
      let recommendations: CompanyRecommendation[] = [];

      try {
        const jsonMatch = response.match(/\[.*\]/s);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback
          recommendations = [
            { round: 'Error', company: 'Parse Error', reason: 'Could not parse AI response.' }
          ];
        }
      } catch (e) {
        console.error("Failed to parse recommendations JSON:", e);
        recommendations = [
          { round: 'Error', company: 'Parse Error', reason: 'Could not parse AI response.' }
        ];
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        content: '基于你的项目方向，我为你推荐了以下 ABCD 轮次的标杆公司：',
        type: 'companies',
        data: recommendations
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong fetching recommendations.' }]);
      setStep('input');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step]);

  useEffect(() => {
    if (location.state?.initialInput && !hasProcessedInitialInput.current) {
      hasProcessedInitialInput.current = true;
      const initialInput = location.state.initialInput;
      // Clear state so it doesn't re-trigger
      window.history.replaceState({}, document.title);
      // Directly call generate ideas
      handleGenerateIdeas(initialInput);
    }
  }, []);

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-zinc-950/50">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded font-bold font-mono">S</div>
            <span className="font-bold text-lg tracking-tight">SparkAI</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search" 
              className="pl-9 bg-zinc-900 border-none h-9 text-sm focus-visible:ring-1 ring-white/20"
            />
            <div className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono">⌘K</div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 bg-[#6C63FF]/10 text-[#6C63FF]">
              <Sparkles className="w-4 h-4" /> AI Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5">
              <FolderOpen className="w-4 h-4" /> Projects
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5">
              <Layout className="w-4 h-4" /> Templates
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5">
              <FileText className="w-4 h-4" /> Documents
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5">
              <Users className="w-4 h-4" /> Community
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5">
              <History className="w-4 h-4" /> History
            </Button>
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5">
            <Settings className="w-4 h-4" /> Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5">
            <HelpCircle className="w-4 h-4" /> Help
          </Button>
          <div className="pt-4 flex items-center gap-3 px-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">Hacker</div>
              <div className="text-xs text-gray-500">Pro Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-black relative">
        {/* Top Bar (Mobile only mostly, or breadcrumbs) */}
        <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between shrink-0">
          <div className="font-semibold">AI Chat</div>
          <div className="flex items-center gap-4">
             <Button size="sm" className="bg-[#6C63FF] hover:bg-[#5a52d5] text-white">
               <Sparkles className="w-4 h-4 mr-2" /> Upgrade
             </Button>
          </div>
        </div>

        {messages.length === 0 ? (
          /* Welcome Dashboard */
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold mb-4 text-center">Welcome to SparkAI</h1>
            <p className="text-gray-400 mb-12 text-center max-w-lg">
              Get started by SparkAI a task and Chat can do the rest. Not sure where to start?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
              <QuickActionCard 
                icon={<Lightbulb className="w-5 h-5 text-yellow-400" />} 
                title="智能点子发散" 
                color="bg-yellow-400/10"
                onClick={() => {
                  const text = "帮我发散一个关于远程办公的创业点子";
                  setInput(text);
                  handleGenerateIdeas(text);
                }} 
              />
              <QuickActionCard 
                icon={<UserCheck className="w-5 h-5 text-blue-400" />} 
                title="模拟投资人" 
                color="bg-blue-400/10"
                onClick={() => navigate('/investors')} 
              />
              <QuickActionCard 
                icon={<Building className="w-5 h-5 text-orange-400" />} 
                title="ABCD 轮次推荐" 
                color="bg-orange-400/10"
                onClick={() => {
                   const text = "推荐这个赛道的 ABCD 轮次公司";
                   setInput(text);
                   handleRecommendCompanies(text);
                }} 
              />
              <QuickActionCard 
                icon={<FileText className="w-5 h-5 text-green-400" />} 
                title="生成 BP 文档" 
                color="bg-green-400/10"
                onClick={() => {
                   const text = "为我的项目生成一份商业计划书";
                   setInput(text);
                   handleGenerateIdeas(text);
                }} 
              />
              <QuickActionCard 
                icon={<Globe className="w-5 h-5 text-purple-400" />} 
                title="搜索增强" 
                color="bg-purple-400/10"
                onClick={() => setSearchEnabled(true)} 
              />
            </div>
          </div>
        ) : (
          /* Chat History */
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white text-black' : 'bg-[#6C63FF]/20 text-[#6C63FF]'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : (msg.data?.investor ? <span className="text-lg">{msg.data.investor.avatar}</span> : <Bot className="w-5 h-5" />)}
                  </div>
                  
                  <div className={`space-y-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.data?.investor && <div className="text-xs text-gray-400 font-bold">{msg.data.investor.name} ({msg.data.investor.role})</div>}
                    
                    <div className={`p-4 rounded-xl text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-zinc-900 border border-white/10 text-gray-300'}`}>
                      {msg.content}
                    </div>

                    {/* Ideas Display */}
                    {msg.type === 'ideas' && msg.data && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 w-full">
                        {msg.data.map((idea: Idea) => (
                          <Card 
                            key={idea.id} 
                            className="bg-black border-white/10 hover:border-[#6C63FF] cursor-pointer transition-all group"
                            onClick={() => step === 'select-idea' && handleSelectIdea(idea)}
                          >
                            <CardHeader className="p-4">
                              <CardTitle className="text-white text-base flex justify-between items-center group-hover:text-[#6C63FF] transition-colors">
                                {idea.title}
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </CardTitle>
                              <CardDescription className="text-gray-500 text-xs line-clamp-2">{idea.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Doc Display */}
                    {msg.type === 'doc' && msg.data && (
                      <div className="mt-3 w-full space-y-4">
                        <div className="bg-black border border-white/10 rounded-lg p-6 prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{msg.data}</ReactMarkdown>
                        </div>
                        
                        {/* Investor Triggers */}
                        <div className="space-y-3 pt-2">
                          <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#6C63FF]" />
                            让模拟投资人点评该项目
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {INVESTORS.map(inv => (
                              <button
                                key={inv.id}
                                className="inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-zinc-900/50 shadow-sm h-9 rounded-lg px-4 border-white/10 hover:bg-white/5 hover:text-white hover:border-[#6C63FF]/50 transition-all text-xs gap-2 group"
                                onClick={() => handleInvestorChat(inv.id)}
                              >
                                <span className="text-base group-hover:scale-110 transition-transform">{inv.avatar}</span>
                                <span className="text-gray-300 group-hover:text-white">{inv.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Companies Display */}
                    {msg.type === 'companies' && msg.data && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 w-full">
                        {msg.data.map((item: CompanyRecommendation, i: number) => (
                          <div key={i} className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-mono text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-1 rounded">
                                {item.round} 轮
                              </span>
                              <Building className="w-4 h-4 text-gray-500" />
                            </div>
                            <h3 className="font-bold text-white text-lg mb-2">{item.company}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading States */}
              {(step === 'generating-ideas' || step === 'generating-doc' || step === 'recommending-companies') && (
                 <div className="flex gap-4 animate-pulse">
                   <div className="w-8 h-8 rounded bg-[#6C63FF]/20 flex items-center justify-center shrink-0">
                     <Bot className="w-4 h-4 text-[#6C63FF]" />
                   </div>
                   <div className="text-gray-500 text-sm pt-2">
                     {step === 'generating-ideas' ? '正在连接 Metaso 搜索... 分析市场趋势...' : 
                      step === 'generating-doc' ? '正在撰写项目文档... 构建商业模型...' :
                      '正在分析市场数据... 检索投融资记录...'}
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Sticky Input Area */}
        <div className="p-6 pt-2 max-w-3xl mx-auto w-full">
           <div className="relative bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl focus-within:border-[#6C63FF]/50 transition-colors">
              <Input 
                className="w-full bg-transparent border-none focus-visible:ring-0 text-base text-white placeholder:text-gray-500 p-4 min-h-[60px] resize-none"
                placeholder="Tell me what you want to build..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                disabled={step !== 'input' && step !== 'investor-chat' && messages.length > 0}
              />
              
              <div className="flex items-center justify-between px-3 pb-3">
                 <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-white gap-2 bg-white/5 hover:bg-white/10 rounded-full text-xs">
                      <Paperclip className="w-3 h-3" /> Attach
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-white gap-2 bg-white/5 hover:bg-white/10 rounded-full text-xs">
                      <Mic className="w-3 h-3" /> Voice
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 px-2 gap-2 bg-white/5 hover:bg-white/10 rounded-full text-xs ${searchEnabled ? 'text-[#6C63FF] bg-[#6C63FF]/10' : 'text-gray-500 hover:text-white'}`}
                      onClick={() => setSearchEnabled(!searchEnabled)}
                    >
                      <Globe className="w-3 h-3" /> {searchEnabled ? 'Search On' : 'Search Off'}
                    </Button>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-mono">{input.length}/3000</span>
                    <Button 
                      size="icon" 
                      className={`h-8 w-8 rounded-full ${input.trim() ? 'bg-[#6C63FF] hover:bg-[#5a52d5]' : 'bg-zinc-800 text-gray-500'}`}
                      onClick={() => handleGenerateIdeas()}
                      disabled={!input.trim()}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                 </div>
              </div>
           </div>
           <div className="text-center mt-2 text-[10px] text-gray-600">
             SparkAI may generate inaccurate information about people, places, or facts. Model: DeepSeek Chat
           </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-72 border-l border-white/10 bg-zinc-950/50 hidden xl:flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-14">
          <span className="font-semibold">Projects (7)</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Project</div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">
                ...
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</div>
              {[
                "Learning From 100 Years of...", 
                "Research officiants", 
                "What does a senior lead de...",
                "Write a sweet note to your...",
                "Meet with cake bakers"
              ].map((item, i) => (
                <div key={i} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                  <div className="mt-1 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-[#6C63FF]" />
                  <div className="text-sm text-gray-400 group-hover:text-white line-clamp-2">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
