import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Strategy from "./pages/Strategy";
import PitchDeck from "./pages/PitchDeck";
import MarketBench from "./pages/MarketBench";
import InvestorMatch from "./pages/InvestorMatch";
import BusinessPlan from "./pages/BusinessPlan";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/pitch" element={<PitchDeck />} />
            <Route path="/business-plan" element={<BusinessPlan />} />
            <Route path="/market" element={<MarketBench />} />
            <Route path="/investors" element={<InvestorMatch />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}
