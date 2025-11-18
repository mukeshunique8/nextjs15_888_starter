'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loader when route starts changing
    setIsLoading(true);
    
    // Hide loader after a short delay (simulating route load)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Full page overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {/* Main loader animation */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative mb-8"
              >
                {/* Rotating outer circles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="h-32 w-32 rounded-full border-4 border-transparent border-t-primary border-r-primary/50" />
                </motion.div>

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="h-24 w-24 rounded-full border-4 border-transparent border-b-primary/70 border-l-primary/30" />
                </motion.div>

                {/* Center icon */}
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/50 shadow-lg"
                  />
                </div>
              </motion.div>

              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-2"
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Loading
                </h2>
                <p className="text-muted-foreground">Preparing your page...</p>
              </motion.div>

              {/* Animated progress bar */}
              <motion.div
                initial={{ width: "0%", opacity: 0 }}
                animate={{ width: "60%", opacity: 1 }}
                exit={{ width: "100%", opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full max-w-xs"
              />

              {/* Floating particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    opacity: 0 
                  }}
                  animate={{
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="absolute h-2 w-2 rounded-full bg-primary/30"
                  style={{
                    left: `${50 + Math.random() * 10 - 5}%`,
                    top: `${50 + Math.random() * 10 - 5}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Top progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary z-[101] origin-left"
          />
        </>
      )}
    </AnimatePresence>
  );
}