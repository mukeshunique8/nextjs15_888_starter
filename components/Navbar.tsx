"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "./providers/theme-switcher";
import Image from "next/image";

const menuItems = [
  { name: "Home", path: "/" },
  { name: "TechStack", path: "#TechStack" },
  { name: "Contact", path: "/" },
  { name: "Projects", path: "#projects" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.nav
        initial={{
          backdropFilter: "blur(0px)",
          backgroundColor: "rgba(255, 255, 255, 0)",
        }}
        animate={{
          backdropFilter: isScrolled ? "blur(10px) " : "blur(0px)",
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.1)" // or rgba(0,0,0,0.2) for dark tint
            : "rgba(255, 255, 255, 0)",
        }}
        transition={{ duration: 0.3 }}
        className={`${isScrolled ? "shadow-md" : ""}px-4 py-3 sm:px-6 lg:px-8 backdrop-blur-lg dark:bg-slate-900/20`}
      >
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent" whileHover={{ scale: 1.05 }}>
                <Image alt="888" width={50} height={50} className="rounded-full" src="/core/888.png"></Image>
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link key={item.name} href={item.path} className="relative text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                <motion.span whileHover={{ scale: 1.05 }}>{item.name}</motion.span>
                <motion.div className="absolute -bottom-1 left-0 h-0.5 bg-cyan-400" initial={{ width: 0 }} whileHover={{ width: "100%" }} transition={{ duration: 0.3 }} />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              <ModeToggle />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white focus:outline-none">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-lg mt-2"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="px-3 py-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                    <ModeToggle />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
