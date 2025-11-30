import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ChatPage from "@/pages/ChatPage";
import InvestorPage from "@/pages/InvestorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/investors" element={<InvestorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
