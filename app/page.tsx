'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Users, Shield } from 'lucide-react';
import { RouteConstUrls } from '@/lib/constants';

export default function HomePage() {

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Tyro Exam Results Portal
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Secure, Fast, and Easy-to-Use Exam Result Management System
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg border bg-card"
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Easy Upload</h3>
            <p className="text-muted-foreground">
              Upload exam results via Excel files in seconds
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-lg border bg-card"
          >
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Student Access</h3>
            <p className="text-muted-foreground">
              Students can view their results instantly
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-lg border bg-card"
          >
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Secure</h3>
            <p className="text-muted-foreground">
              Enterprise-grade security with Supabase
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <Link href={RouteConstUrls.adminLogin}>
            <Button size="lg">Tyro Admin</Button>
          </Link>
          <Link href={RouteConstUrls.exams}>
            <Button size="lg" variant="outline">
              View Exams
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}