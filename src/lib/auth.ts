import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';
import { UserProfile, SubscriptionTier, TIER_CONFIGS } from './types';

// Fields a member can edit on their own profile
export interface ProfileFormData {
  fullName: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  homeProvince: string;
  travelStyles: string[];
}

export const TRAVEL_STYLE_OPTIONS = [
  'สายทะเล',
  'สายภูเขา',
  'สายคาเฟ่',
  'สายกิน',
  'สายลุย',
  'สายปาร์ตี้',
  'สายวัฒนธรรม',
  'สายถ่ายรูป',
];

// Columns readable by clients (email is deliberately excluded, see supabase/auth_profiles.sql)
const PROFILE_COLUMNS =
  'id, auth_user_id, full_name, nickname, avatar_url, bio, home_province, travel_styles, tier, monthly_ai_quota_used, trust_score, attendance_rate, trips_completed, trips_cancelled, is_verified, warning_tags';

const DEMO_PROFILE_KEY = 'tripsure_demo_profile';

interface ProfileRow {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  home_province: string | null;
  travel_styles: string[] | null;
  tier: SubscriptionTier;
  monthly_ai_quota_used: number | null;
  trust_score: number | null;
  attendance_rate: number | string | null;
  trips_completed: number | null;
  trips_cancelled: number | null;
  is_verified: boolean | null;
  warning_tags: string[] | null;
}

const rowToProfile = (row: ProfileRow, email: string): UserProfile => ({
  id: row.id,
  email,
  fullName: row.full_name,
  nickname: row.nickname || '',
  avatarUrl: row.avatar_url || '',
  bio: row.bio || '',
  homeProvince: row.home_province || '',
  travelStyles: row.travel_styles || [],
  tier: row.tier,
  monthlyAiQuotaUsed: row.monthly_ai_quota_used ?? 0,
  maxMonthlyQuotas: TIER_CONFIGS[row.tier]?.maxQuotas ?? 2,
  trustScore: row.trust_score ?? 100,
  attendanceRate: Number(row.attendance_rate ?? 100),
  tripsCompleted: row.trips_completed ?? 0,
  tripsCancelled: row.trips_cancelled ?? 0,
  isVerified: row.is_verified ?? true,
  warningTags: row.warning_tags || [],
});

// Brand-new member profile with default trust stats
export const buildNewProfile = (id: string, email: string, form: ProfileFormData): UserProfile => ({
  id,
  email,
  fullName: form.fullName,
  nickname: form.nickname,
  avatarUrl: form.avatarUrl,
  bio: form.bio,
  homeProvince: form.homeProvince,
  travelStyles: form.travelStyles,
  tier: 'FREE',
  monthlyAiQuotaUsed: 0,
  maxMonthlyQuotas: TIER_CONFIGS.FREE.maxQuotas,
  trustScore: 100,
  attendanceRate: 100,
  tripsCompleted: 0,
  tripsCancelled: 0,
  isVerified: true,
  warningTags: ['ยืนยันตัวตนด้วย Google'],
});

// Prefill values for the profile form from the Google account
export const googleDefaults = (user: User): ProfileFormData => ({
  fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
  nickname: '',
  avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
  bio: '',
  homeProvince: '',
  travelStyles: [],
});

export const signInWithGoogle = async (): Promise<string | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return 'ยังไม่ได้ตั้งค่า Supabase';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
  redirectTo: `${window.location.origin}/auth/callback`,
  queryParams: { prompt: 'select_account' },
},
  });
  return error ? error.message : null;
};

export const signOut = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  try {
    localStorage.removeItem(DEMO_PROFILE_KEY);
  } catch (e) {}
};

// Returns null when the signed-in user has not created a profile yet
export const fetchProfile = async (user: User): Promise<UserProfile | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users_profile')
    .select(PROFILE_COLUMNS)
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as ProfileRow, user.email || '');
};

const formToColumns = (form: ProfileFormData) => ({
  full_name: form.fullName.trim(),
  nickname: form.nickname.trim() || null,
  avatar_url: form.avatarUrl || null,
  bio: form.bio.trim() || null,
  home_province: form.homeProvince.trim() || null,
  travel_styles: form.travelStyles,
});

export const createProfile = async (
  user: User,
  form: ProfileFormData
): Promise<{ profile?: UserProfile; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'ยังไม่ได้ตั้งค่า Supabase' };
  const { data, error } = await supabase
    .from('users_profile')
    .insert({ ...formToColumns(form), auth_user_id: user.id, email: user.email })
    .select(PROFILE_COLUMNS)
    .single();
  if (error) return { error: error.message };
  return { profile: rowToProfile(data as ProfileRow, user.email || '') };
};

export const updateProfile = async (
  user: User,
  form: ProfileFormData
): Promise<{ profile?: UserProfile; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'ยังไม่ได้ตั้งค่า Supabase' };
  const { data, error } = await supabase
    .from('users_profile')
    .update({ ...formToColumns(form), updated_at: new Date().toISOString() })
    .eq('auth_user_id', user.id)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) return { error: error.message };
  return { profile: rowToProfile(data as ProfileRow, user.email || '') };
};

// --- Demo mode (no Supabase keys): profile lives in this browser only ---

export const loadDemoProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch (e) {
    return null;
  }
};

export const saveDemoProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {}
};
