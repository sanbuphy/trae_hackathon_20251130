import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TextType from "@/components/TextType";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="z-10 text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          SparkAI
        </h1>
        
        <div className="h-8 md:h-12">
          <TextType 
            text={[
              "要参赛？点我就行",
              "想创业，先问我",
              "想Idea，点我一下",
              "想Hack，就现在",
              "没点子？问我！"
            ]}
            typingSpeed={100}
            deletingSpeed={50}
            pauseDuration={1500}
            className="text-xl md:text-2xl text-muted-foreground font-mono"
            cursorClassName="bg-green-500 w-[2px] h-6 md:h-8 inline-block ml-1 align-middle"
            cursorCharacter=""
          />
        </div>

        <div className="pt-8">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 rounded-none border border-white/20 transition-all duration-300 hover:scale-105"
            onClick={() => navigate('/chat')}
          >
            START ENGINE
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 text-xs text-white/30 font-mono">
        POWERED BY METASO & TRAE
      </div>
    </div>
  );
}
