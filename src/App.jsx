import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";

const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Strategy     = lazy(() => import("./pages/Strategy"));
const PitchDeck    = lazy(() => import("./pages/PitchDeck"));
const MarketBench  = lazy(() => import("./pages/MarketBench"));
const InvestorMatch = lazy(() => import("./pages/InvestorMatch"));
const BusinessPlan = lazy(() => import("./pages/BusinessPlan"));

const Loader = () => (
  <div style={{ padding: 40, color: "#8798b0", fontWeight: 700 }}>Loading module…</div>
);

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/"                element={<Dashboard />} />
              <Route path="/strategy"        element={<Strategy />} />
              <Route path="/pitch"           element={<PitchDeck />} />
              <Route path="/business-plan"   element={<BusinessPlan />} />
              <Route path="/market"          element={<MarketBench />} />
              <Route path="/investors"       element={<InvestorMatch />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AppProvider>
  );
}
