import { BrainCircuit, Globe, UserCheck, Lightbulb, Trophy, Search } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Lightbulb className="w-6 h-6 text-[#6C63FF]" />,
      title: "智能点子发散",
      description: "输入一个模糊的想法，AI 自动生成 3-5 个具体的创业方向或黑客松 Idea，并为每个方向命名。"
    },
    {
      icon: <Search className="w-6 h-6 text-[#6C63FF]" />,
      title: "搜索增强 (Metaso)",
      description: "集成秘塔 AI 搜索接口，结合实时研报和市场动态，确保生成的 Idea 不仅仅是空想，而是基于现实需求。"
    },
    {
      icon: <UserCheck className="w-6 h-6 text-[#6C63FF]" />,
      title: "模拟投资人评估",
      description: "与模拟的马斯克、真格基金合伙人对话，从“第一性原理”或“投人哲学”角度获得毒辣点评。"
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-[#6C63FF]" />,
      title: "深度文档生成",
      description: "一键生成包含产品定义、技术架构、商业模式的详细 Markdown 项目文档，直接用于 BP 或 README。"
    },
    {
      icon: <Globe className="w-6 h-6 text-[#6C63FF]" />,
      title: "全球视野",
      description: "分析全球类似竞品，寻找差异化竞争优势，适合出海项目或国际化黑客松。"
    },
    {
      icon: <Trophy className="w-6 h-6 text-[#6C63FF]" />,
      title: "大厂黑客松实战检验",
      description: "核心方法论源自 Google、Microsoft、字节跳动等顶级科技公司内部黑客松的获胜项目经验沉淀。"
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">从 Idea 到 BP，只需几分钟</h2>
          <p className="text-xl text-gray-400 font-mono">Hackathon Assistant / Startup Co-pilot</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-[#6C63FF]/50 hover:bg-zinc-900 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#6C63FF] transition-colors">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
