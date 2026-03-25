import { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Strategy = lazy(() => import('./pages/Strategy'));
const PitchDeck = lazy(() => import('./pages/PitchDeck'));
const MarketBench = lazy(() => import('./pages/MarketBench'));
const InvestorMatch = lazy(() => import('./pages/InvestorMatch'));
const BusinessPlan = lazy(() => import('./pages/BusinessPlan'));
const Valuation = lazy(() => import('./pages/Valuation'));
const InvestorUpdate = lazy(() => import('./pages/InvestorUpdate'));

import PageLoader from './components/PageLoader';

const Loader = PageLoader;

function AppContent() {
  const location = useLocation();
  const app = useApp();
  if (!app.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ y: 16, filter: 'blur(4px)', opacity: 0 }}
        animate={{ y: 0, filter: 'blur(0px)', opacity: 1 }}
        exit={{ y: 16, filter: 'blur(4px)', opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/pitch" element={<PitchDeck />} />
            <Route path="/plan" element={<BusinessPlan />} />
            <Route path="/bench" element={<MarketBench />} />
            <Route path="/investors" element={<InvestorMatch />} />
            <Route path="/valuation" element={<Valuation />} />
            <Route path="/update" element={<InvestorUpdate />} />
            <Route path="*" element={<div className="p-12 text-center flex flex-col items-center justify-center h-full"><h1 className="text-4xl font-black mb-4">404</h1><p className="text-[var(--text-muted)]">Page not found</p></div>} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Layout>
            <AppContent />
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}
