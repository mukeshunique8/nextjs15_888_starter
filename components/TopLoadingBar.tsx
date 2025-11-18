'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function TopLoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 origin-left shadow-lg"
          style={{
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
          }}
        />
      )}
    </AnimatePresence>
  );
}