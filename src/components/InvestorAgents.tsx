import { useNavigate } from "react-router-dom";
import { INVESTORS } from "@/lib/investors";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function InvestorAgents() {
  const navigate = useNavigate();

  const handleChat = (investorId: string, investorName: string) => {
    navigate('/chat', { 
      state: { 
        investorId: investorId,
        initialInput: `你好，我是创业者，我想听听${investorName}对我的项目的看法。`
      } 
    });
  };

  return (
    <section className="py-24 px-6 bg-black border-t border-white/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">投资人智能体</h2>
          <p className="text-xl text-gray-400 font-mono">
            与顶级 VC 的 AI 分身直接对话，获取“第一性原理”或“赛道思维”的毒辣点评
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INVESTORS.map((investor) => (
            <div 
              key={investor.id} 
              className="group relative rounded-2xl bg-zinc-900/50 border border-white/10 overflow-hidden hover:border-[#6C63FF]/50 transition-all duration-500"
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${investor.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="flex flex-col h-full">
                {/* Header with Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/90 z-10`} />
                  <img 
                    src={investor.image} 
                    alt={investor.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-4 left-6 z-20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{investor.avatar}</span>
                      <h3 className="text-2xl font-bold text-white">{investor.name}</h3>
                    </div>
                    <p className="text-[#6C63FF] font-mono text-sm">{investor.role} · {investor.company}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6 flex-1">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10">
                        {investor.style}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed italic">
                      {investor.description}
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-white/5 hover:bg-[#6C63FF] text-white border border-white/10 hover:border-transparent group-hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all duration-300"
                    onClick={() => handleChat(investor.id, investor.name)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    请求点评
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
