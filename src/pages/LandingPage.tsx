import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import InvestorAgents from "@/components/InvestorAgents";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-[#6C63FF] selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <InvestorAgents />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
