import { useState } from "react";
import { ArrowLeft, ArrowRight, Quote, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const INVESTORS = [
  {
    id: "xu-xiaoping",
    name: "徐小平",
    role: "创始人",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2940&auto=format&fit=crop", // Placeholder
    description: [
      "你好，我是徐小平，生长于江苏泰兴。高考恢复前，我最大的梦想就是能够任意读到海明威的《老人与海》，随时听到贝多芬的《命运交响乐》。这些经典名作带给我流星划过夜空般的心灵触动。",
      "高考恢复后，我考入中央音乐学院，毕业后来到北大担任团委老师，也是在那里，我在一次次文艺节目的组织和汇演中，结识了台上的文艺青年王强，和在台下鼓掌的观众俞敏洪，为之后“中国合伙人”的故事埋下了伏笔。",
      "在加入俞敏洪创办的新东方之前，我曾举家前往加拿大求学、工作，曾踌躇满志回国创业却铩羽而归…我饱尝想创业的人找不到方向的痛苦，以及创业过程的筚路蓝缕。于是，在新东方上市之后，当过去的学生学成归来想找我提供一笔创业的梦想资金时，我感到了久违的流星照亮心灵般的触动，我无比清楚地意识到：在最早阶段支持优秀人才创业，就是我人生下半场的使命。",
      "2011年，我和王强、方爱之成立了专注早期阶段的天使投资机构真格基金，陪伴了上百家创业团队成长。真格基金自成立第一天起就立志于成为对创业者最友好的基金，以及在天使投资阶段最专业的早期基金。",
      "没有对于人才、对于梦想、对于奋斗精神的由衷的热爱是做不好天使投资的，真格基金始终带着对创业者的爱，以及对未来的相信，时刻准备着成为优秀创业者的“垫脚石”。"
    ],
    email: "xu@zhenfund.com",
    color: "from-red-500 to-orange-500"
  },
  {
    id: "wang-qiang",
    name: "王强",
    role: "联合创始人",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop", // Placeholder
    description: [
      "我是王强，真格基金联合创始人。",
      "北京大学本科的人文训练（英语语言文学）给予了我想象力的肌理；纽约州立大学研究生的科学训练（计算机）又植入了理性、逻辑的血脉。",
      "创建真格前，曾联合创建了新东方，当然不是那所颇有名气的同名厨师学校。",
      "投资之余，我喜爱搜集英文珍版书，因为对我而言，每一张真正的书⻚都是一个微缩的精彩世界。",
      "真格于我，就像是一片繁星闪烁的夜空，那无穷无尽的星星就是一次次发现的令我赞叹的年轻创业者，他们用自己的勇气、激情、毅力、洞⻅和勤奋勾勒出一幅幅色彩斑斓的创造力的星座。",
      "如果你决心把自己从一个单纯的阅读世界者，变成一个饥渴的认知世界者，最终用自己创业的行动成⻓为一个改变世界者，真格正是你可以信赖的恣意挥洒人生的第一块调色板。",
      "You never know if you don’t try."
    ],
    email: "wang@zhenfund.com",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "fang-aizhi",
    name: "方爱之",
    role: "创始合伙人",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2788&auto=format&fit=crop", // Placeholder
    description: [
      "我是方爱之，曾在哥大与斯坦福商学院学习。2011年和徐小平、王强两位老师一起创办真格基金是我人生中最重要的时刻之一。我平时在真格负责投资、投资组合管理及基金的整体运营，大家都亲切地叫我ZhenMom。",
      "我特别欣赏那些对世界有着独特看法、对未来有着大胆想象的创业者，比如小红书、逸仙电商等公司的创始人。作为天使投资人，我有幸为他们开出了第一张支票，并成为他们创业路上的坚定支持者。",
      "我很荣幸在2022年被《福布斯》的Midas List评为全球第12位风险投资人（也是排名第1位的女性），并在同年的Midas Seed List中名列第一。我认为这是对真格团队天使投资理念以及我们众多创始人所取得的卓越成就的认可。",
      "如果你认为自己就是我正在寻找的那位创业者，请随时通过anna@zhenfund.com与我取得联系。或者说不定哪天我在公园跑步时，在Space Cycle，或在送孩子上学的时刻，咱们就不期而遇了～"
    ],
    email: "anna@zhenfund.com",
    color: "from-purple-500 to-pink-500"
  }
];

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
                   {currentInvestor.description.map((paragraph, idx) => (
                     <p key={idx} className="text-lg text-gray-300 leading-relaxed">
                       {paragraph}
                     </p>
                   ))}
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
