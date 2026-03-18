import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Strategy = lazy(() => import('./pages/Strategy'));
const PitchDeck = lazy(() => import('./pages/PitchDeck'));
const MarketBench = lazy(() => import('./pages/MarketBench'));
const InvestorMatch = lazy(() => import('./pages/InvestorMatch'));
const BusinessPlan = lazy(() => import('./pages/BusinessPlan'));

const Loader = () => (
  <div className="p-10 text-[var(--text-muted)] font-black text-xl">Loading module…</div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router> 
          <Layout>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/strategy" element={<Strategy />} />
                <Route path="/pitch" element={<PitchDeck />} />
                <Route path="/business-plan" element={<BusinessPlan />} />
                <Route path="/market" element={<MarketBench />} />
                <Route path="/investors" element={<InvestorMatch />} />
                <Route path="*" element={<div className="p-12 text-center"><h1 className="text-4xl font-black mb-4">404</h1><p className="text-[var(--text-muted)]">Page not found</p></div>} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}
