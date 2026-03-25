import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({ label = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 mb-6 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#06b6d4] flex items-center justify-center shadow-glow"
      >
        <Loader2 className="w-6 h-6 text-white" />
      </motion.div>
      <div className="space-y-1">
        <h2 className="text-2xl font-black bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
          {label}
        </h2>
        <p className="text-[var(--text-muted)] text-sm">Loading module...</p>
      </div>
    </div>
  );
}

