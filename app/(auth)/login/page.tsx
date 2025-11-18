// app/(auth)/login/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { RouteConstUrls, USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    // If still loading user or profile, do nothing
    if (authLoading || profile === null) return;

    // If no user, stay here
    if (!user) return;

    // If on the login page
    if (pathname === RouteConstUrls.adminLogin) {
      // Admin redirect
      if (profile.role === USER_ROLES) {
        toast.success('Welcome back!', {
          description: 'Redirecting to admin dashboard...',
        });
        router.replace(RouteConstUrls.adminDashboard);
      } 
      // Normal user redirect
      else {
        toast.success('Login successful!', {
          description: 'Redirecting to home page...',
        });
        router.replace(RouteConstUrls.home);
      }
    }
  }, [user, profile, authLoading, pathname, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Success toast will be shown in useEffect after profile loads
      toast.loading('Signing in...', { id: 'login-toast' });
      
    } catch (err: any) {
      toast.error('Authentication failed', {
        description: err?.message ?? 'Please check your credentials and try again.',
      });
    } finally {
      setLoading(false);
      toast.dismiss('login-toast');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to manage exams and upload results</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}