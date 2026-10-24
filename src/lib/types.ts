export type SubscriptionTier = 'FREE' | 'GOLD' | 'PLATINUM';

export interface TierConfig {
  name: SubscriptionTier;
  labelThai: string;
  priceMonthly: number;
  maxQuotas: number; // ignored when unlimitedQuota
  unlimitedQuota: boolean;
  planOptionsPerRequest: number;
  hasDeepOtaComparison: boolean;
  hasPriceAlert: boolean;
  creationFeeDiscountPercent: number; // e.g. 100 for 0% fee waiver
  badgeColor: string;
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  FREE: {
    name: 'FREE',
    labelThai: 'แพ็กเกจ ฟรี (Free Tier)',
    priceMonthly: 0,
    maxQuotas: 2,
    unlimitedQuota: false,
    planOptionsPerRequest: 1,
    hasDeepOtaComparison: false,
    hasPriceAlert: false,
    creationFeeDiscountPercent: 0,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  GOLD: {
    name: 'GOLD',
    labelThai: 'แพ็กเกจ โกลด์ (Gold Tier)',
    priceMonthly: 149,
    maxQuotas: 5,
    unlimitedQuota: false,
    planOptionsPerRequest: 3,
    hasDeepOtaComparison: true,
    hasPriceAlert: false,
    creationFeeDiscountPercent: 50,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  PLATINUM: {
    name: 'PLATINUM',
    labelThai: 'แพ็กเกจ แพลทินัม (Platinum Tier)',
    priceMonthly: 299,
    maxQuotas: 10,
    unlimitedQuota: true,
    planOptionsPerRequest: 5,
    hasDeepOtaComparison: true,
    hasPriceAlert: true,
    creationFeeDiscountPercent: 100, // 0% creation fee waiver
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300',
  },
};

// Single source of truth for AI quota checks and labels (Platinum is unlimited)
export const isQuotaExhausted = (tier: SubscriptionTier, used: number): boolean =>
  !TIER_CONFIGS[tier].unlimitedQuota && used >= TIER_CONFIGS[tier].maxQuotas;

export const quotaLabel = (tier: SubscriptionTier): string =>
  TIER_CONFIGS[tier].unlimitedQuota ? 'ไม่จำกัด' : `${TIER_CONFIGS[tier].maxQuotas} ครั้ง/เดือน`;

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  tier: SubscriptionTier;
  monthlyAiQuotaUsed: number;
  maxMonthlyQuotas: number;
  trustScore: number; // 0 - 100%
  attendanceRate: number; // 0 - 100%
  tripsCompleted: number;
  tripsCancelled: number;
  isVerified: boolean;
  warningTags: string[];
  // Editable profile fields (set by members who sign in)
  nickname?: string;
  bio?: string;
  homeProvince?: string;
  travelStyles?: string[];
}

export interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  rainProbability: number;
  // 24h rainfall forecast (TMD only; TMD does not publish a rain probability)
  rainMm?: number;
  condition: string;
  icon: string;
}

// Traveller needs the planner turns into detailed prompt instructions (see lib/tripPrompt.ts)
export type FoodStyle = 'local' | 'seafood' | 'cafe' | 'vegetarian' | 'halal' | 'not_spicy' | 'famous';
export type Tolerance = 'low' | 'medium' | 'high';
export type TransportMode = 'private_car' | 'rental_car' | 'public';

export interface TripPreferences {
  foodStyles: FoodStyle[];
  sunTolerance: Tolerance;
  rainTolerance: Tolerance;
  elderlyCount: number;
  disabledCount: number; // includes wheelchair users
  transport: TransportMode;
  // Free-text details the user types (age, mobility, vehicle...)
  elderlyNote: string;
  disabledNote: string;
  transportNote: string;
}

// Destination + options sent to the AI planner from elsewhere (nonce changes on every send)
export interface PlannerPreset {
  province: string;
  mustVisit: string[];
  totalBudget?: number;
  travelersCount?: number;
  travelDates?: string;
  travelStyle?: string;
  // Start generating right away instead of only pre-filling the form
  autoGenerate?: boolean;
  // e.g. rental car chosen in the home search bar
  preferences?: Partial<TripPreferences>;
  nonce: number;
}

export type PlannerPresetOptions = Omit<PlannerPreset, 'province' | 'mustVisit' | 'totalBudget' | 'travelersCount' | 'nonce'>;

export interface WeatherForecast {
  province: string;
  latitude: number;
  longitude: number;
  currentTemp: number;
  rainProbability: number;
  season: 'HIGH' | 'LOW' | 'SHOULDER';
  advisory: string;
  sevenDays: WeatherDay[];
  source: 'TMD_API' | 'OPEN_METEO_API' | 'FALLBACK_SYSTEM';
  // 'area' = TMD "ฝนร้อยละ X ของพื้นที่" (rain coverage); default is rain probability
  rainMetric?: 'probability' | 'area';
  // Where currentTemp came from when the forecast itself is TMD's 7-day feed
  currentTempSource?: 'OPEN_METEO' | 'TMD_FORECAST_MAX';
  // Extra current-hour details from TMD
  humidity?: number;
  currentCondition?: string;
  // ISO time the current values refer to
  updatedAt?: string;
}

export interface ActivityItem {
  time: string;
  title: string;
  description: string;
  estimatedCost: number;
  category: 'FOOD' | 'TRANSPORT' | 'ATTRACTION' | 'LODGING' | 'LEISURE';
  location: string;
}

export interface TripDayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  activities: ActivityItem[];
  dailyBudget: number;
}

export interface TripPlanOption {
  id: string;
  title: string;
  tagline: string;
  targetVibe: string;
  days: TripDayPlan[];
  totalEstimatedCost: number;
  estimatedSavings: number;
  savingsTips: string[];
  recommendedTransport: string;
  recommendedLodging: string;
}

export interface OtaComparison {
  id: string;
  provider: 'Agoda' | 'Trip.com' | 'Direct Booking';
  category: 'HOTEL' | 'FLIGHT' | 'TRANSPORT';
  name: string;
  rating: number;
  originalPrice: number;
  discountedPrice: number;
  seasonTrend: string; // e.g. "ถูกกว่าค่าเฉลี่ย High Season 18%"
  savingsPercentage: number;
  isCheapest: boolean;
  affiliateCommissionRate: number; // 4%
  bookingUrl: string;
  badges: string[];
}

export interface AiTripResponse {
  tripId: string;
  province: string;
  travelDates: string;
  travelStyle: string;
  travelersCount: number;
  totalBudget: number;
  season: 'HIGH' | 'LOW' | 'SHOULDER';
  weather: WeatherForecast;
  plans: TripPlanOption[];
  otaComparisons: OtaComparison[];
  quotaRemaining: number;
  tierUsed: SubscriptionTier;
  generatedFrom: 'GEMINI_2.5_FLASH' | 'FALLBACK_SERVICE';
}

export interface TripParticipant {
  id: string;
  userId: string;
  fullName: string;
  nickname?: string;
  avatarUrl: string;
  depositPaid: number;
  escrowStatus: 'HELD' | 'SETTLED' | 'PENALIZED_CANCEL' | 'REFUNDED';
  trustScore: number;
  attendanceRate: number;
  joinedAt: string;
  cancelledAt?: string;
  warningNote?: string;
}

export interface CommunityTrip {
  id: string;
  hostId: string;
  host: UserProfile;
  title: string;
  destination: string;
  travelDates: string;
  totalSlots: number;
  joinedSlots: number;
  costPerPerson: number;
  securityDepositPerPerson: number;
  status: 'OPEN' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  platformCreationFeeRate: number; // 0.035 = 3.5%
  cancellationPenaltyRate: number; // 0.10 = 10%
  tripPoolBalance: number;
  highlights: string[];
  imageUrl: string;
  // Host-uploaded photos (first = cover, same as imageUrl); browser-resized data URLs in demo mode
  gallery?: string[];
  description?: string;
  participants: TripParticipant[];
}

export type EscrowTransactionType =
  | 'DEPOSIT_ESCROW'
  | 'CREATION_FEE_3_5'
  | 'PENALTY_PLATFORM_5'
  | 'PENALTY_POOL_5'
  | 'SUBSCRIPTION_UPGRADE'
  | 'AFFILIATE_COMMISSION';

export interface EscrowTransaction {
  id: string;
  tripId?: string;
  userId?: string;
  userName?: string;
  type: EscrowTransactionType;
  amount: number;
  platformRevenue: number;
  poolAddition?: number;
  description: string;
  timestamp: string;
}

export interface UserReview {
  id: string;
  tripId: string;
  reviewerName: string;
  reviewerAvatar: string;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: 'HOST' | 'PARTICIPANT';
  rating: number; // 1 - 5
  punctualityRating: number;
  honestyRating: number;
  comment: string;
  badges: string[];
  createdAt: string;
}

export interface RevenueMetrics {
  totalRevenue: number;
  subscriptionRevenue: number;
  affiliateRevenue: number;
  creationFeeRevenue: number;
  penaltyTaxRevenue: number;
  escrowPoolSubsidiesGiven: number;
  activeTransactionsCount: number;
}
