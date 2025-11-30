import { Twitter, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 border-t border-white/10 text-sm font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-lg font-bold">SparkAI</div>
          <p className="text-gray-500">Built for Hackathons & Startups.</p>
        </div>

        <div className="flex gap-8 text-gray-400">
          <a href="#" className="hover:text-[#6C63FF] transition-colors">关于我们</a>
          <a href="#" className="hover:text-[#6C63FF] transition-colors">API 文档</a>
          <a href="#" className="hover:text-[#6C63FF] transition-colors">加入社区</a>
        </div>

        <div className="flex gap-4">
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#6C63FF] transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#6C63FF] transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#6C63FF] transition-colors">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
        © 2025 SparkAI. Powered by Metaso & Trae.
      </div>
    </footer>
  );
}
