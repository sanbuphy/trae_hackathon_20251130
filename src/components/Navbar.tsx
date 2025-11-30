import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded font-bold font-mono">S</div>
        <div className="text-xl font-bold text-white tracking-tight">SparkAI</div>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        <a href="/#features" className="text-gray-400 hover:text-white transition-colors hidden md:block">功能特性</a>
        <div 
          className="text-gray-400 hover:text-white transition-colors hidden md:block cursor-pointer"
          onClick={() => navigate('/investors')}
        >
          模拟投资人
        </div>
        <Button 
          className="bg-white text-black hover:bg-gray-200 font-mono" 
          onClick={() => navigate('/chat')}
        >
          <Terminal className="w-4 h-4 mr-2" />
          开始创造
        </Button>
      </div>
    </nav>
  );
}
