import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, ArrowRight, FileText, Sparkles, 
  User, Bot, Settings, HelpCircle, 
  Plus, Paperclip,
  Lightbulb, UserCheck, Globe, Building, RefreshCw, Trash2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateIdeas, generateProjectDoc, getInvestorFeedback, recommendCompanies, analyzeRequirements } from "@/lib/llm";
import { INVESTORS } from "@/lib/investors";

type Step = 'input' | 'refining-requirements' | 'generating-ideas' | 'select-idea' | 'generating-doc' | 'generating-doc-input' | 'show-doc' | 'investor-chat' | 'recommending-companies' | 'recommending-companies-input';

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
  type?: 'text' | 'ideas' | 'doc' | 'companies' | 'investor-selection';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  step: Step;
  ideas: Idea[];
  doc: string;
  refinementCount: number;
}


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
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [doc, setDoc] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialInput = useRef(false);
  const [refinementCount, setRefinementCount] = useState(0);
  const [activeInvestorId, setActiveInvestorId] = useState<string | null>(null);
  
  // Session Management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const restoreSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    localStorage.setItem('sparkai_current_session_id', session.id);
    setMessages(session.messages);
    setStep(session.step);
    setIdeas(session.ideas);
    setDoc(session.doc);
    setRefinementCount(session.refinementCount);
  };

  // Load sessions from localStorage on mount
  useEffect(() => {
    // Helper to avoid direct state update if already mounted? No, in mount effect it's fine usually, 
    // but let's wrap in a function if needed.
    // Actually, the linter complains about calling setSessions directly in useEffect?
    // It usually warns about setting state that triggers the SAME effect.
    // But here dependency array is empty.
    
    // The warning might be due to strict mode double invocation or just generic warning.
    // Let's proceed.
    const storedSessions = localStorage.getItem('sparkai_sessions');
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions);
        setSessions(parsed);
        
        // Restore last session if available
        const lastSessionId = localStorage.getItem('sparkai_current_session_id');
        if (lastSessionId && parsed.find((s: ChatSession) => s.id === lastSessionId)) {
           // We can't call restoreSession here easily because it depends on state setters
           // and we want to avoid closure staleness if we move it out.
           // But since this is mount, it's fine.
           // Let's manually restore here to avoid linter issues with function hoisting or deps
           const session = parsed.find((s: ChatSession) => s.id === lastSessionId);
           if (session) {
             setCurrentSessionId(session.id);
             setMessages(session.messages);
             setStep(session.step);
             setIdeas(session.ideas);
             setDoc(session.doc);
             setRefinementCount(session.refinementCount);
           }
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever relevant state changes
  // Use a ref to track if we should save to avoid initial render saves if needed,
  // but actually we want to save whenever state changes if we have a current session.
  // The linter warning "Calling setState synchronously within an effect" usually means
  // we are triggering a re-render that might cause this effect to run again?
  // Dependencies: [messages, step, ideas, doc, refinementCount].
  // Inside, we call setSessions. setSessions updates 'sessions'.
  // Does 'sessions' update trigger this effect? No.
  // So why the warning?
  // Maybe it thinks setSessions will trigger a parent re-render?
  // Or maybe it's just being very strict.
  
  // Let's use a ref to hold the latest sessions to avoid `setSessions` if we can, 
  // OR just ignore the warning if we are sure it's safe.
  // But better: Update localStorage directly, and update sessions state only if needed?
  // If we don't update sessions state, the sidebar won't update.
  
  // Let's try to debounce or use a separate handler.
  // Or better: Only update the ONE session that changed in the sessions array.
  
  useEffect(() => {
    if (currentSessionId) {
      const handler = setTimeout(() => {
          setSessions(prev => {
            const newSessions = prev.map(s => {
              if (s.id === currentSessionId) {
                return {
                  ...s,
                  updatedAt: Date.now(),
                  messages,
                  step,
                  ideas,
                  doc,
                  refinementCount,
                  title: s.title === 'New Chat' && messages.length > 0 
                    ? (messages[0].content.slice(0, 20) + (messages[0].content.length > 20 ? '...' : ''))
                    : s.title
                };
              }
              return s;
            });
            localStorage.setItem('sparkai_sessions', JSON.stringify(newSessions));
            return newSessions;
          });
      }, 500); // Debounce slightly
      
      return () => clearTimeout(handler);
    }
  }, [messages, step, ideas, doc, refinementCount, currentSessionId]);

  const createNewSession = useCallback(() => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      step: 'input',
      ideas: [],
      doc: '',
      refinementCount: 0
    };
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      localStorage.setItem('sparkai_sessions', JSON.stringify(updated));
      return updated;
    });
    setCurrentSessionId(newId);
    localStorage.setItem('sparkai_current_session_id', newId);
    
    // Reset state
    setMessages([]);
    setStep('input');
    setIdeas([]);
    setDoc("");
    setRefinementCount(0);
    setInput("");
  }, []);

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('sparkai_sessions', JSON.stringify(updated));
    
    if (currentSessionId === id) {
      // If we deleted current session, create new one or switch to another
      if (updated.length > 0) {
        restoreSession(updated[0]);
      } else {
        createNewSession();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUserSubmit = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;

    // Create session only when user starts actual conversation
    if (!currentSessionId && messages.length === 0) {
      // This is the first message, create a new session
      // eslint-disable-next-line
      const newId = Date.now().toString();
      const title = text.length > 30 ? text.substring(0, 30) + '...' : text;
      const newSession: ChatSession = {
        id: newId,
        title: title,
        // eslint-disable-next-line
        createdAt: Date.now(),
        // eslint-disable-next-line
        updatedAt: Date.now(),
        messages: [{ role: 'user', content: text }],
        step: 'input',
        ideas: [],
        doc: '',
        refinementCount: 0
      };
      
      setSessions(prev => {
        const updated = [newSession, ...prev];
        localStorage.setItem('sparkai_sessions', JSON.stringify(updated));
        return updated;
      });
      setCurrentSessionId(newId);
      localStorage.setItem('sparkai_current_session_id', newId);
    }

    // Add user message immediately
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Routing logic based on current step
    if (step === 'input') {
      // Start the refinement process
      setStep('refining-requirements');
      await handleRequirementRefinement(text, []);
    } else if (step === 'refining-requirements') {
      // Continue refinement
      // We need to pass the history to the LLM
      // Construct history from current messages + the new user message we just added
      // Note: state update is async, so 'messages' here might be old. 
      // We'll reconstruct it carefully.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const history = messages.map(m => ({ role: m.role as any, content: m.content }));
      await handleRequirementRefinement(text, history);
    } else if (step === 'recommending-companies-input') {
       handleRecommendCompanies(text);
    } else if (step === 'generating-doc-input') {
       // User provided input for direct doc generation
       // We treat the input as the "Idea Title/Description" combo for now, 
       // or we could parse it. For simplicity, we pass it as both or just description.
       // Ideally, generateProjectDoc takes title and description.
       setStep('generating-doc');
       try {
         // Assume the input is the idea itself
         const generatedDoc = await generateProjectDoc("Project Idea", text);
         setDoc(generatedDoc);
         setMessages(prev => [...prev, { 
           role: 'ai', 
           content: '项目文档已生成！你可以查看详情，或者点击下方的按钮邀请模拟投资人进行点评。',
           type: 'doc',
           data: generatedDoc
         }]);
         setStep('show-doc');
       } catch {
         setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong generating the document.' }]);
         setStep('input'); // Go back to input on error
       }
    } else if (step === 'investor-chat') {
       // If we have an active investor, chat with them
       if (activeInvestorId) {
         try {
            const feedback = await getInvestorFeedback(activeInvestorId, text);
            const investor = INVESTORS.find(i => i.id === activeInvestorId);
            setMessages(prev => [...prev, { 
              role: 'ai', 
              content: feedback,
              data: { investor }
            }]);
         } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, error getting feedback.' }]);
         }
       } else {
         // User provided input but hasn't selected an investor yet
         // Store the input (it's already in messages) and prompt for selection
         setMessages(prev => [...prev, { 
           role: 'ai', 
           content: '收到你的项目想法。请选择一位投资人智能体进行点评：',
           type: 'investor-selection'
         }]);
       }
    } else {
       // Fallback or other modes
       handleGenerateIdeas(text);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRequirementRefinement = async (currentInput: string, history: any[]) => {
    try {
      const result = await analyzeRequirements(currentInput, history, refinementCount);
      
      if (result.status === 'ask') {
        setRefinementCount(prev => prev + 1);
        setMessages(prev => [...prev, { role: 'ai', content: result.content }]);
      } else {
        // Status is ready
        setMessages(prev => [...prev, { role: 'ai', content: result.content }]); // Show summary/confirmation
        
        // Now generate ideas
        // We need to gather the full context string
        const fullContext = history.map(m => `${m.role}: ${m.content}`).join('\n') + `\nuser: ${currentInput}\nassistant: ${result.content}`;
        
        // Trigger idea generation with full context
        handleGenerateIdeas(fullContext);
      }
    } catch (error) {
      console.error("Refinement error:", error);
      // Fallback to direct generation
      handleGenerateIdeas(currentInput);
    }
  };

  const handleGenerateIdeas = async (contextOrInput: string) => {
    setStep('generating-ideas');

    try {
      const response = await generateIdeas(contextOrInput);
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
      console.error("Error in handleGenerateIdeas:", error);
      // 显示具体的API错误信息，而不是通用消息
      const errorMessage = error instanceof Error && error.message.includes('API_ERROR') 
        ? error.message.replace('API_ERROR: ', '')
        : '抱歉，生成想法时遇到了问题。请检查API密钥和连接状态。';
      
      setMessages(prev => [...prev, { role: 'ai', content: errorMessage }]);
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
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong generating the document.' }]);
      setStep('select-idea');
    }
  };

  const handleRefreshIdeas = () => {
    // Get the context from the last message or reconstruct it?
    // Ideally we should store the 'context' used for generation.
    // For simplicity, let's just grab all messages as context.
    const fullContext = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    handleGenerateIdeas(fullContext);
  };

  const handleInvestorChat = async (investorId: string) => {
    const investor = INVESTORS.find(i => i.id === investorId);
    if (!investor) return;

    // Determine context first
    let context = doc;
    
    // Find the last meaningful user input if no doc
    if (!context) {
       const userMessages = messages.filter(m => m.role === 'user');
       if (userMessages.length > 0) {
         context = userMessages[userMessages.length - 1].content;
       }
    }
    
    // If no context (no doc, no user messages), then we are just selecting the investor
    if (!context) {
       setActiveInvestorId(investorId);
       setMessages(prev => [...prev, { 
         role: 'ai', 
         content: `你选择了 ${investor.name}。请告诉我你的项目想法，我将从${investor.role}的角度进行点评。` 
       }]);
       setStep('investor-chat');
       return;
    }

    setActiveInvestorId(investorId);
    setMessages(prev => [...prev, { role: 'user', content: `我想听听 ${investor.name} 的看法。` }]);
    setStep('investor-chat');

    try {
      const feedback = await getInvestorFeedback(investorId, context);

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: feedback,
        data: { investor }
      }]);
    } catch {
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
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong fetching recommendations.' }]);
      setStep('input');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step]);

  useEffect(() => {
    if (location.state && !hasProcessedInitialInput.current) {
      hasProcessedInitialInput.current = true;
      const { initialInput, investorId } = location.state;
      // Clear state so it doesn't re-trigger
      window.history.replaceState({}, document.title);
      
      if (investorId) {
         const investor = INVESTORS.find(i => i.id === investorId);
         if (investor) {
           setActiveInvestorId(investorId);
           setMessages([{ role: 'ai', content: `你好！我是 ${investor.name} (${investor.role})。${investor.style}。请告诉我你的项目想法，我会用我的投资逻辑为你进行深度点评。` }]);
           setStep('investor-chat');
         }
      } else if (initialInput) {
         // Directly call generate ideas
         handleGenerateIdeas(initialInput);
      }
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
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 bg-[#6C63FF]/10 text-[#6C63FF] hover:bg-[#6C63FF]/20 hover:text-[#6C63FF]"
              onClick={() => {
                // Reset state but don't create session yet
                setMessages([]);
                setStep('input');
                setIdeas([]);
                setDoc('');
                setRefinementCount(0);
                setCurrentSessionId(null);
                setInput("");
              }}
            >
              <Lightbulb className="w-4 h-4" /> 智能点子发散
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => {
                // Reset state but don't create session yet
                setMessages([{ 
                  role: 'ai', 
                  content: '请选择一位投资人智能体，或者先告诉我你的项目想法：',
                  type: 'investor-selection'
                }]);
                setStep('investor-chat');
                setIdeas([]);
                setDoc('');
                setRefinementCount(0);
                setCurrentSessionId(null);
                setInput("");
              }}
            >
              <UserCheck className="w-4 h-4" /> 投资人智能体
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => {
                // Reset state but don't create session yet
                setMessages([{ role: 'ai', content: '请输入你感兴趣的赛道或方向，我将为你推荐 ABCD 轮次的标杆公司：' }]);
                setStep('recommending-companies-input');
                setIdeas([]);
                setDoc('');
                setRefinementCount(0);
                setCurrentSessionId(null);
                setInput("");
              }}
            >
              <Building className="w-4 h-4" /> ABCD 轮次推荐
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => {
                // Reset state but don't create session yet
                setMessages([{ role: 'ai', content: '请告诉我你的项目点子，我将直接为你生成商业计划书 (BP)：' }]);
                setStep('generating-doc-input');
                setIdeas([]);
                setDoc('');
                setRefinementCount(0);
                setCurrentSessionId(null);
                setInput("");
              }}
            >
              <FileText className="w-4 h-4" /> 生成 BP 文档
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
        <div className="max-w-3xl mx-auto text-center space-y-12 mt-20">
          <div className="space-y-6 animate-fade-in">
             <div className="w-20 h-20 bg-white text-black rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-white/20">
                <span className="font-bold text-4xl font-mono">S</span>
             </div>
             <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
               Welcome to SparkAI
             </h1>
             <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
               Get started by asking SparkAI a task and Chat can do the rest. Not sure where to start?
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
            <QuickActionCard 
              icon={<Lightbulb className="w-5 h-5 text-yellow-400" />} 
              title="我想创造一个打卡系统" 
              color="bg-yellow-400/10"
              onClick={() => handleUserSubmit("我想创造一个打卡系统")} 
            />
            <QuickActionCard 
              icon={<Sparkles className="w-5 h-5 text-purple-400" />} 
              title="我想创造一个AI 合照软件" 
              color="bg-purple-400/10"
              onClick={() => handleUserSubmit("我想创造一个AI 合照软件")} 
            />
            <QuickActionCard 
              icon={<UserCheck className="w-5 h-5 text-blue-400" />} 
              title="我想给老年人做一个产品" 
              color="bg-blue-400/10"
              onClick={() => handleUserSubmit("我想给老年人做一个产品")} 
            />
            <QuickActionCard 
              icon={<Building className="w-5 h-5 text-orange-400" />} 
              title="我想做一个宠物社交App" 
              color="bg-orange-400/10"
              onClick={() => handleUserSubmit("我想做一个宠物社交App")} 
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
                    
                    <div className={`p-4 rounded-xl text-sm md:text-base leading-relaxed prose prose-invert prose-sm max-w-none ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-zinc-900 border border-white/10 text-gray-300'}`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {/* Ideas Display */}
                    {msg.type === 'ideas' && msg.data && (
                      <div className="w-full space-y-3 mt-3">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
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
                        {/* Refresh Button */}
                        {idx === messages.length - 1 && step === 'select-idea' && (
                           <div className="flex justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleRefreshIdeas}
                                className="border-white/10 bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800 gap-2"
                              >
                                <RefreshCw className="w-3 h-3" /> 换一批
                              </Button>
                           </div>
                        )}
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

                    {/* Investor Selection Display */}
                    {msg.type === 'investor-selection' && (
                      <div className="mt-3 w-full space-y-3">
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
        onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit()}
        disabled={step === 'generating-ideas' || step === 'generating-doc' || step === 'recommending-companies'}
      />
              
              <div className="flex items-center justify-between px-3 pb-3">
                 <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-white gap-2 bg-white/5 hover:bg-white/10 rounded-full text-xs">
                      <Paperclip className="w-3 h-3" /> Attach
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
                      onClick={() => handleUserSubmit()}
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

      {/* Right Sidebar - History */}
      <aside className="w-72 border-l border-white/10 bg-zinc-950/50 hidden lg:flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-14">
          <span className="font-semibold">Projects ({sessions.length})</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-white"
            onClick={() => {
              // Reset to initial state without creating session
              setMessages([]);
              setStep('input');
              setIdeas([]);
              setDoc('');
              setRefinementCount(0);
              setCurrentSessionId(null);
              setInput("");
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-10">
                还没有项目记录，开始对话后自动创建项目
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</div>
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`group flex items-center p-3 rounded-lg cursor-pointer transition-colors ${currentSessionId === session.id ? 'bg-white/10 text-white border border-white/20' : 'hover:bg-white/5 text-gray-400 border border-transparent'}`}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-400/20 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(e, session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div 
                      className="flex items-center gap-3 flex-1 overflow-hidden"
                      onClick={() => restoreSession(session)}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${currentSessionId === session.id ? 'bg-[#6C63FF]' : 'bg-zinc-800 group-hover:bg-[#6C63FF]'}`} />
                      <div className="text-sm truncate leading-tight">
                        {session.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
