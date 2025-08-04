"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Github, Twitter, Linkedin, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background/80 backdrop-blur-md border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="space-y-4">
              <Link href="/" className="flex items-center gap-2 group">
                <Image alt="Logo" width={40} height={40} className="rounded-lg group-hover:rotate-6 transition-transform duration-300" src="/core/888.png" />
                <motion.span
                  className="text-xl font-semibold bg-[length:200%_200%] bg-clip-text text-transparent"
                  initial={{
                    backgroundImage: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
                  }}
                  animate={{
                    backgroundImage: [
                      "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
                      "linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6)",
                      "linear-gradient(90deg, #ec4899, #f59e0b, #ec4899)",
                      "linear-gradient(90deg, #f59e0b, #3b82f6, #f59e0b)",
                      "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 },
                  }}
                >
                  mukesh888
                </motion.span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-md">Crafting exceptional digital experiences with modern web technologies.</p>
            </motion.div>

            {/* Social links */}
            <motion.div className="mt-6 flex gap-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
              <SocialIcon href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialIcon href="#" icon={<Github className="w-5 h-5" />} />
              <SocialIcon href="#" icon={<MessageSquare className="w-5 h-5" />} />
              <SocialIcon href="#" icon={<Linkedin className="w-5 h-5" />} />
            </motion.div>
          </div>

          {/* Links columns */}
          <FooterColumn
            title="Explore"
            links={[
              { name: "Features", href: "#" },
              { name: "Documentation", href: "#" },
              { name: "Pricing", href: "#" },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { name: "About", href: "#" },
              { name: "Blog", href: "#" },
              { name: "Careers", href: "#" },
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              { name: "Privacy", href: "#" },
              { name: "Terms", href: "#" },
              { name: "Cookies", href: "#" },
            ]}
          />
        </div>

        {/* Bottom copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} YourBrand. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

// Reusable components
function FooterColumn({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }} className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
      {icon}
    </motion.a>
  );
}
