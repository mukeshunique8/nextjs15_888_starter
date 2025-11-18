// app/admin/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { RouteConstUrls, USER_ROLES } from '@/lib/constants';
import { Navbar } from '@/components/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== USER_ROLES) {
        router.replace(RouteConstUrls.adminLogin);
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== USER_ROLES) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  );
}
