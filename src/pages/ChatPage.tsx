import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, ArrowRight, FileText, Sparkles, Cpu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

type Step = 'input' | 'generating-ideas' | 'select-idea' | 'generating-doc' | 'show-doc';

interface Idea {
  id: string;
  title: string;
  description: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [input, setInput] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [doc, setDoc] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [step, ideas, doc]);

  const handleGenerateIdeas = async () => {
    if (!input.trim()) return;
    setStep('generating-ideas');
    
    // Simulate API call
    setTimeout(() => {
      setIdeas([
        { id: '1', title: 'NeuroSync', description: 'A BCI-based productivity tool that adapts UI based on cognitive load.' },
        { id: '2', title: 'GreenChain', description: 'Decentralized carbon credit verification using IoT sensors and blockchain.' },
        { id: '3', title: 'UrbanHarvest', description: 'AI-optimized vertical farming distribution network for hyper-local produce.' },
        { id: '4', title: 'DataVault', description: 'Privacy-first personal data monetization platform with zero-knowledge proofs.' },
      ]);
      setStep('select-idea');
    }, 2000);
  };

  const handleSelectIdea = (idea: Idea) => {
    setStep('generating-doc');
    // Simulate API call
    setTimeout(() => {
      setDoc(`# ${idea.title}\n\n## 1. Executive Summary\n${idea.description}\n\n## 2. Problem Statement\nCurrent solutions lack...\n\n## 3. Solution Architecture\n- **Frontend**: React Native\n- **Backend**: Node.js + GraphQL\n- **AI Engine**: PyTorch\n\n## 4. Market Analysis\nTarget market size is estimated at...\n\n## 5. Roadmap\n- Q1: MVP\n- Q2: Beta Launch\n`);
      setStep('show-doc');
    }, 2500);
  };

  const reset = () => {
    setStep('input');
    setInput("");
    setIdeas([]);
    setDoc("");
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center px-6 justify-between bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Sparkles className="w-5 h-5 text-white" />
          <span className="font-bold text-white tracking-tight">SparkAI</span>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-white">
             New Session
           </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-8 pb-20">
            
            {/* Initial Prompt */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-lg text-white">What do you want to build today? Tell me a pain point or a rough idea.</p>
              </div>
            </div>

            {/* User Input Display (History) */}
            {step !== 'input' && (
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center shrink-0">
                  <div className="w-5 h-5 bg-black rounded-full" />
                </div>
                <div className="bg-white/10 p-4 rounded-lg max-w-[80%]">
                  <p className="text-white">{input}</p>
                  {searchEnabled && (
                     <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                       <Search className="w-3 h-3" />
                       <span>Search Enhanced</span>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* Generating Ideas Loading */}
            {step === 'generating-ideas' && (
              <div className="flex gap-4 animate-pulse">
                 <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Analyzing market trends... Brainstorming directions...</p>
                </div>
              </div>
            )}

            {/* Ideas Selection */}
            {(step === 'select-idea' || step === 'generating-doc' || step === 'show-doc') && (
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-4 w-full">
                  <p className="text-white">Here are a few directions we could explore:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideas.map((idea) => (
                      <Card 
                        key={idea.id} 
                        className={`bg-black border-white/10 hover:border-white/30 transition-all cursor-pointer group ${step !== 'select-idea' ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => handleSelectIdea(idea)}
                      >
                        <CardHeader>
                          <CardTitle className="text-white flex justify-between items-center">
                            {idea.title}
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                          <CardDescription className="text-gray-400">{idea.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

             {/* Generating Doc Loading */}
             {step === 'generating-doc' && (
              <div className="flex gap-4 animate-pulse">
                 <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Drafting project documentation... Calculating business model...</p>
                </div>
              </div>
            )}

            {/* Final Doc */}
            {step === 'show-doc' && (
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="w-full bg-white/5 border border-white/10 rounded-lg p-8 prose prose-invert max-w-none">
                  <ReactMarkdown>{doc}</ReactMarkdown>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        {step === 'input' && (
          <div className="mt-4">
             <div className="relative flex gap-2 items-end bg-white/5 p-2 rounded-xl border border-white/10 focus-within:border-white/30 transition-colors">
                <div className="pb-2 pl-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full w-8 h-8 ${searchEnabled ? 'text-green-400 bg-green-400/10' : 'text-muted-foreground'}`}
                    onClick={() => setSearchEnabled(!searchEnabled)}
                    title="Toggle Search Enhancement"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <Input 
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50 h-14"
                  placeholder="e.g., I want to fix the inefficiency in remote team meetings..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                />
                <div className="pb-2 pr-2">
                  <Button size="icon" onClick={handleGenerateIdeas} disabled={!input.trim()} className="rounded-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
             </div>
             <div className="mt-2 text-center">
                <span className="text-xs text-muted-foreground">
                  {searchEnabled ? "Search Enhanced Mode: Active (Powered by Metaso)" : "Standard Ideation Mode"}
                </span>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
