'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RouteConstUrls, USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Logged out successfully', {
        description: 'See you next time!'
      });
      router.push(RouteConstUrls.adminLogin);
    } catch (error: any) {
      toast.error('Logout failed', {
        description: error?.message ?? 'Please try again'
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const isActive = (route: string) => pathname === route;
  const isAdmin = profile?.role === USER_ROLES;

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            Tyro Exams
          </Link>

          <div className="flex items-center gap-4">
            {/* HOME BUTTON */}
            <Link
              href={isAdmin ? RouteConstUrls.adminDashboard : RouteConstUrls.home}
            >
              <Button
                className="cursor-pointer"
                variant={
                  isActive(isAdmin ? RouteConstUrls.adminDashboard : RouteConstUrls.home)
                    ? "default"
                    : "ghost"
                }
              >
                Home
              </Button>
            </Link>

            {/* ADMIN ONLY BUTTONS */}
            {user && isAdmin && (
              <>
                <Link href={RouteConstUrls.adminUploadExcel}>
                  <Button
                    className="cursor-pointer"
                    variant={isActive(RouteConstUrls.adminUploadExcel) ? "default" : "ghost"}
                  >
                    Upload Excel
                  </Button>
                </Link>

                <Link href={RouteConstUrls.adminExams}>
                  <Button
                    className="cursor-pointer"
                    variant={isActive(RouteConstUrls.adminExams) ? "default" : "ghost"}
                  >
                    Exam List
                  </Button>
                </Link>
              </>
            )}

            {/* USER INFO + LOGOUT */}
            {user && (
              <>
                <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-muted/50">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline font-medium">{user.email}</span>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogoutClick}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* THEME TOGGLE */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {mounted && (
                <span className="relative inline-flex">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}