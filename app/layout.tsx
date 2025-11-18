// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { NavigationLoader } from '@/components/NavigationLoader';
import { TopLoadingBar } from '@/components/TopLoadingBar';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { RouteLoader } from '@/components/RouteLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Exam Management System',
  description: 'Manage and view exam results',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Top loading bar - appears on every route change */}
        <TopLoadingBar />
        {/* <NavigationLoader  />
        <RouteLoader  /> */}
        
         <ThemeProvider attribute="class">

          <Navbar />

        {children}
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={3000}
          />
          </ThemeProvider>
      </body>
    </html>
  );
}