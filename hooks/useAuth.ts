// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // ---------------- SESSION LOADER ----------------
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      setSessionLoading(false);

      // Only load profile if user exists
      if (currentUser?.id) loadProfile(currentUser.id);
      else setProfile(null);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u?.id) loadProfile(u.id);
      else setProfile(null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------------- PROFILE LOADER ----------------
  const loadProfile = async (uid: string) => {
    setProfileLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', uid)
      .maybeSingle(); // ✨ prevents throwing when profile doesn't exist

    if (error || !data) {
      setProfile(null);
    } else {
      setProfile(data);
    }

    setProfileLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading: sessionLoading || profileLoading, // ✨ clean loading flag
    signOut,
  };
}
