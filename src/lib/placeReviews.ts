import { getSupabaseClient } from './supabase';

// A review carries a 1-5 star rating; a comment is free text only
export type PlaceReviewKind = 'review' | 'comment';

export interface PlaceReview {
  id: string;
  placeKey: string; // "จังหวัด|สถานที่", same key as PLACE_PHOTOS
  kind: PlaceReviewKind;
  rating: number | null;
  body: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}

export interface Reviewer {
  name: string;
  avatarUrl: string;
  authUserId?: string;
}

export interface NewPlaceReview {
  kind: PlaceReviewKind;
  rating: number | null;
  body: string;
}

export const MAX_REVIEW_LENGTH = 500;

const DEMO_REVIEWS_KEY = 'tripsure_place_reviews';

interface ReviewRow {
  id: string;
  place_key: string;
  kind: PlaceReviewKind;
  rating: number | null;
  body: string;
  author_name: string;
  author_avatar: string | null;
  created_at: string;
}

const rowToReview = (row: ReviewRow): PlaceReview => ({
  id: row.id,
  placeKey: row.place_key,
  kind: row.kind,
  rating: row.rating,
  body: row.body,
  authorName: row.author_name,
  authorAvatar: row.author_avatar || '',
  createdAt: row.created_at,
});

// --- Demo mode (no Supabase keys): reviews live in this browser only ---

const loadDemoReviews = (): PlaceReview[] => {
  try {
    const raw = localStorage.getItem(DEMO_REVIEWS_KEY);
    return raw ? (JSON.parse(raw) as PlaceReview[]) : [];
  } catch (e) {
    return [];
  }
};

const saveDemoReviews = (reviews: PlaceReview[]): void => {
  try {
    localStorage.setItem(DEMO_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {}
};

// Newest first
export const fetchPlaceReviews = async (placeKey: string): Promise<PlaceReview[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadDemoReviews()
      .filter((r) => r.placeKey === placeKey)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const { data, error } = await supabase
    .from('place_reviews')
    .select('id, place_key, kind, rating, body, author_name, author_avatar, created_at')
    .eq('place_key', placeKey)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as ReviewRow[]).map(rowToReview);
};

export interface ReviewSummary {
  average: number; // 0 when there are no star reviews
  count: number; // star reviews only
  latest?: PlaceReview; // newest star review, for a quote
}

// Star-rating summary for many places at once (e.g. a region's top-3 list)
export const fetchReviewSummaries = async (placeKeys: string[]): Promise<Record<string, ReviewSummary>> => {
  let reviews: PlaceReview[];
  const supabase = getSupabaseClient();
  if (!supabase) {
    const wanted = new Set(placeKeys);
    reviews = loadDemoReviews().filter((r) => wanted.has(r.placeKey));
  } else {
    const { data, error } = await supabase
      .from('place_reviews')
      .select('id, place_key, kind, rating, body, author_name, author_avatar, created_at')
      .in('place_key', placeKeys)
      .eq('kind', 'review')
      .order('created_at', { ascending: false })
      .limit(1000);
    reviews = error || !data ? [] : (data as ReviewRow[]).map(rowToReview);
  }

  const summaries: Record<string, ReviewSummary> = {};
  for (const r of reviews) {
    if (r.kind !== 'review' || !r.rating) continue;
    if (!summaries[r.placeKey]) summaries[r.placeKey] = { average: 0, count: 0 };
    const s = summaries[r.placeKey];
    s.average = (s.average * s.count + r.rating) / (s.count + 1);
    s.count += 1;
    if (!s.latest || r.createdAt > s.latest.createdAt) s.latest = r;
  }
  return summaries;
};

export const addPlaceReview = async (
  placeKey: string,
  reviewer: Reviewer,
  input: NewPlaceReview
): Promise<{ review?: PlaceReview; error?: string }> => {
  const body = input.body.trim();
  if (!body) return { error: 'กรุณาพิมพ์ข้อความ' };
  if (body.length > MAX_REVIEW_LENGTH) return { error: `ข้อความยาวเกิน ${MAX_REVIEW_LENGTH} ตัวอักษร` };
  const rating = input.kind === 'review' ? input.rating : null;
  if (input.kind === 'review' && (!rating || rating < 1 || rating > 5)) return { error: 'กรุณาให้คะแนน 1-5 ดาว' };

  const supabase = getSupabaseClient();
  if (!supabase) {
    const review: PlaceReview = {
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      placeKey,
      kind: input.kind,
      rating,
      body,
      authorName: reviewer.name,
      authorAvatar: reviewer.avatarUrl,
      createdAt: new Date().toISOString(),
    };
    saveDemoReviews([review, ...loadDemoReviews()]);
    return { review };
  }

  if (!reviewer.authUserId) return { error: 'กรุณาเข้าสู่ระบบด้วย Google ก่อนเขียนรีวิว' };
  const { data, error } = await supabase
    .from('place_reviews')
    .insert({
      place_key: placeKey,
      kind: input.kind,
      rating,
      body,
      author_name: reviewer.name,
      author_avatar: reviewer.avatarUrl || null,
      auth_user_id: reviewer.authUserId,
    })
    .select('id, place_key, kind, rating, body, author_name, author_avatar, created_at')
    .single();
  if (error) return { error: error.message };
  return { review: rowToReview(data as ReviewRow) };
};
