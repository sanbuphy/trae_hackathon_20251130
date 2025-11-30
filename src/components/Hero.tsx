import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import TextType from "@/components/TextType";
import { Search, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      navigate('/chat', { state: { initialInput: input } });
    }
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-black">
       {/* Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
       
       <div className="max-w-4xl mx-auto relative z-10 text-center space-y-12">
         <div className="space-y-6">
           <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-sm text-gray-400 border border-white/10 font-mono">
             <Sparkles className="w-3 h-3 text-yellow-400" />
             <span>Hackathon & Startup Idea Generator</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-tight">
             今天你想<span className="text-[#6C63FF]">创造</span>什么？
           </h1>

           <div className="h-8 md:h-12">
              <TextType 
                text={[
                  "我想做一个解决远程会议效率的工具...",
                  "我想用 AI 改变法律咨询行业...",
                  "我想开发一个去中心化的碳交易平台...",
                  "我想为老年人设计一款智能看护助手..."
                ]}
                typingSpeed={60}
                deletingSpeed={30}
                pauseDuration={2000}
                className="text-lg md:text-2xl text-gray-500 font-mono"
                cursorClassName="bg-[#6C63FF] w-[2px] h-6 inline-block ml-1 align-middle"
              />
           </div>
         </div>

         {/* Chat Input Entry */}
         <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF] to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
           <div className="relative flex items-center bg-zinc-900/90 border border-white/20 rounded-xl p-2 shadow-2xl backdrop-blur-xl">
             <Search className="w-5 h-5 text-gray-400 ml-3 mr-2" />
             <Input 
               className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg text-white placeholder:text-gray-600 h-12"
               placeholder="输入一个点子或痛点..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               autoFocus
             />
             <Button 
               type="submit"
               size="lg" 
               className="bg-white text-black hover:bg-gray-200 rounded-lg px-6 font-medium"
             >
               开始发散 <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
           <p className="text-xs text-gray-600 mt-3 text-left pl-2 font-mono">
             * 支持秘塔 AI 搜索增强，提供实时市场洞察
           </p>
         </form>
       </div>
    </section>
  );
}
