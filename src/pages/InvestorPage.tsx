import { useState } from "react";
import { ArrowLeft, ArrowRight, Quote, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { INVESTORS } from "@/lib/investors";

export default function InvestorPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    setCurrentIndex((prev) => (prev + 1) % INVESTORS.length);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    setCurrentIndex((prev) => (prev - 1 + INVESTORS.length) % INVESTORS.length);
  };

  const currentInvestor = INVESTORS[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentInvestor.color} opacity-10 blur-[100px] transition-all duration-1000`} />
        
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Image & Controls */}
          <div className="relative group">
             <div className={`absolute inset-0 bg-gradient-to-br ${currentInvestor.color} rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
             <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src={currentInvestor.image} 
                  alt={currentInvestor.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ${isAnimating ? 'scale-110 blur-sm' : 'scale-100'}`}
                />
                
                {/* Navigation Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold">{currentInvestor.name}</h2>
                    <p className="text-gray-300 font-mono">{currentInvestor.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 hover:bg-white/20 hover:text-white" onClick={handlePrev}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 hover:bg-white/20 hover:text-white" onClick={handleNext}>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
             </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-8 h-[600px] overflow-y-auto pr-4 scrollbar-hide">
             <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
               <div className="flex items-start gap-4">
                 <Quote className="w-12 h-12 text-gray-600 shrink-0" />
                 <div className="space-y-6">
                   <p className="text-lg text-gray-300 leading-relaxed">
                     {currentInvestor.description}
                   </p>
                 </div>
               </div>

               <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                  <Button 
                    className="bg-[#6C63FF] hover:bg-[#5a52d5] rounded-full px-6"
                    onClick={() => navigate('/chat', { state: { initialInput: `我想听听${currentInvestor.name}对我的项目的看法` } })}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    请求{currentInvestor.name}点评
                  </Button>
                  
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-gray-400">
                    <Mail className="w-4 h-4" />
                    {currentInvestor.email}
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {INVESTORS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} 
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
