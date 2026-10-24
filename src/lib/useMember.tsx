'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthModal } from '@/components/AuthModal';
import { ProfileModal } from '@/components/ProfileModal';
import type { NavbarMember } from '@/components/Navbar';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  ProfileFormData,
  signInWithGoogle,
  signOut,
  fetchProfile,
  createProfile,
  updateProfile,
  googleDefaults,
  buildNewProfile,
  loadDemoProfile,
  saveDemoProfile,
} from '@/lib/auth';
import { UserProfile } from '@/lib/types';

const DEMO_EMAIL = 'demo.member@tripsure.ai';
const EMPTY_FORM: ProfileFormData = { fullName: '', nickname: '', avatarUrl: '', bio: '', homeProvince: '', travelStyles: [] };

interface ProfileModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  email: string;
  initialData: ProfileFormData;
  // Set when the member was sent here because joining a trip needs a profile
  requiredForJoin?: boolean;
}

const profileToForm = (p: UserProfile): ProfileFormData => ({
  fullName: p.fullName,
  nickname: p.nickname || '',
  avatarUrl: p.avatarUrl,
  bio: p.bio || '',
  homeProvince: p.homeProvince || '',
  travelStyles: p.travelStyles || [],
});

// Sign-in state shared by every page: Supabase Google sign-in, or a browser-only demo profile.
// Both persist in the browser, so signing in on one page carries over to the others.
export const useMember = () => {
  const supabaseReady = isSupabaseConfigured();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [memberProfile, setMemberProfile] = useState<UserProfile | null>(null);
  const [isDemoMember, setIsDemoMember] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [profileModal, setProfileModal] = useState<ProfileModalState>({ isOpen: false, mode: 'create', email: '', initialData: EMPTY_FORM });
  const loadedProfileForUser = useRef<string | null>(null);

  // Restore session
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const demo = loadDemoProfile();
      if (demo) {
        setMemberProfile(demo);
        setIsDemoMember(true);
      }
      return;
    }
    supabase.auth.getSession().then(({ data }) => setAuthUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setAuthUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load the member profile after Google sign-in; first-time members are asked to create one
  useEffect(() => {
    if (!authUser) {
      loadedProfileForUser.current = null;
      return;
    }
    if (loadedProfileForUser.current === authUser.id) return;
    loadedProfileForUser.current = authUser.id;
    fetchProfile(authUser).then((profile) => {
      setMemberProfile(profile);
      if (!profile) setProfileModal({ isOpen: true, mode: 'create', email: authUser.email || '', initialData: googleDefaults(authUser) });
    });
  }, [authUser]);

  const openSignIn = () => setIsAuthOpen(true);

  const demoSignIn = () => {
    setIsAuthOpen(false);
    setProfileModal({ isOpen: true, mode: 'create', email: DEMO_EMAIL, initialData: EMPTY_FORM });
  };

  const openProfile = () => {
    if (memberProfile) setProfileModal({ isOpen: true, mode: 'edit', email: memberProfile.email, initialData: profileToForm(memberProfile) });
    else if (authUser) setProfileModal({ isOpen: true, mode: 'create', email: authUser.email || '', initialData: googleDefaults(authUser) });
  };

  // Joining a trip needs a profile: open the right dialog and report whether the member is ready
  const requireProfile = (): boolean => {
    if (memberProfile) return true;
    if (authUser) {
      setProfileModal({ isOpen: true, mode: 'create', email: authUser.email || '', initialData: googleDefaults(authUser), requiredForJoin: true });
    } else {
      setIsAuthOpen(true);
    }
    return false;
  };

  const saveProfile = async (form: ProfileFormData): Promise<string | null> => {
    if (authUser) {
      const result = memberProfile ? await updateProfile(authUser, form) : await createProfile(authUser, form);
      if (result.error || !result.profile) return result.error || 'บันทึกไม่สำเร็จ';
      setMemberProfile(result.profile);
    } else {
      const profile = memberProfile ? { ...memberProfile, ...form } : buildNewProfile(`usr_demo_${Date.now()}`, DEMO_EMAIL, form);
      saveDemoProfile(profile);
      setMemberProfile(profile);
      setIsDemoMember(true);
    }
    setProfileModal((prev) => ({ ...prev, isOpen: false }));
    return null;
  };

  const doSignOut = async () => {
    await signOut();
    setAuthUser(null);
    setMemberProfile(null);
    setIsDemoMember(false);
  };

  const member: NavbarMember | null = authUser
    ? {
        displayName: memberProfile?.nickname || memberProfile?.fullName || googleDefaults(authUser).fullName,
        email: authUser.email || '',
        avatarUrl: memberProfile?.avatarUrl || googleDefaults(authUser).avatarUrl,
        hasProfile: !!memberProfile,
        isDemo: false,
      }
    : isDemoMember && memberProfile
    ? {
        displayName: memberProfile.nickname || memberProfile.fullName,
        email: memberProfile.email,
        avatarUrl: memberProfile.avatarUrl,
        hasProfile: true,
        isDemo: true,
      }
    : null;

  const dialogs = (
    <>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} isSupabaseReady={supabaseReady} onGoogleSignIn={signInWithGoogle} onDemoSignIn={demoSignIn} />
      <ProfileModal
        isOpen={profileModal.isOpen}
        mode={profileModal.mode}
        email={profileModal.email}
        initialData={profileModal.initialData}
        requiredForJoin={profileModal.requiredForJoin}
        profile={memberProfile}
        onClose={() => setProfileModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={saveProfile}
      />
    </>
  );

  return { authUser, memberProfile, member, openSignIn, openProfile, requireProfile, signOut: doSignOut, dialogs };
};
