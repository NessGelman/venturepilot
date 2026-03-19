import { Suspense, lazy } from 'react';
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

import PageLoader from './components/PageLoader';

const Loader = PageLoader;

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
                <Route path="/plan" element={<BusinessPlan />} />
                <Route path="/bench" element={<MarketBench />} />
                <Route path="/investors" element={<InvestorMatch />} />
                <Route path="*" element={<div className="p-12 text-center flex flex-col items-center justify-center h-full"><h1 className="text-4xl font-black mb-4">404</h1><p className="text-[var(--text-muted)]">Page not found</p></div>} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}
