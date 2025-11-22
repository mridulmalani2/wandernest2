/**
 * Centralized constants for static reference data
 * These can be cached and reused throughout the application
 */

export const CITIES = [
  { value: 'paris', label: 'Paris, France' },
  { value: 'london', label: 'London, United Kingdom' },
  { value: 'tokyo', label: 'Tokyo, Japan' },
  { value: 'new-york', label: 'New York, USA' },
  { value: 'barcelona', label: 'Barcelona, Spain' },
  { value: 'rome', label: 'Rome, Italy' },
  { value: 'amsterdam', label: 'Amsterdam, Netherlands' },
  { value: 'dubai', label: 'Dubai, UAE' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'istanbul', label: 'Istanbul, Turkey' },
  { value: 'bangkok', label: 'Bangkok, Thailand' },
  { value: 'sydney', label: 'Sydney, Australia' },
] as const;

export const CITY_NAMES = CITIES.map(c => c.label.split(',')[0]);

export const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'arabic', label: 'Arabic' },
] as const;

export const COMMON_LANGUAGES = [
  'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese',
  'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Bengali', 'Russian', 'Turkish'
] as const;

export const INTERESTS = [
  { value: 'food', label: '🍕 Food & Dining' },
  { value: 'culture', label: '🎭 Culture & Arts' },
  { value: 'history', label: '🏛️ History' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'nightlife', label: '🌃 Nightlife' },
  { value: 'adventure', label: '🏔️ Adventure' },
  { value: 'nature', label: '🌳 Nature' },
  { value: 'photography', label: '📸 Photography' },
] as const;

export const CAMPUSES = {
  Paris: ['Sorbonne University', 'Sciences Po', 'HEC Paris', 'ESSEC', 'Panthéon-Sorbonne', 'Paris-Saclay', 'Other'],
  London: ['UCL', 'Imperial College', 'LSE', 'King\'s College', 'Queen Mary', 'City University', 'Other'],
} as const;

export const YEAR_OF_STUDY_OPTIONS = [
  '1st year Undergrad',
  '2nd year Undergrad',
  '3rd year Undergrad',
  '4th year Undergrad',
  '1st year MSc',
  '2nd year MSc',
  'PhD 1st year',
  'PhD 2nd year',
  'PhD 3rd year+',
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const GENDER_PREFERENCE_OPTIONS = [
  { value: 'no_preference', label: 'No Preference' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

export const SERVICE_TYPES = [
  {
    value: 'itinerary_help',
    label: 'Itinerary Planning Help',
    description: 'Get personalized recommendations and help planning your trip',
  },
  {
    value: 'guided_experience',
    label: 'Full Guided Experience',
    description: 'Have a local guide accompany you throughout your trip',
  },
] as const;

/**
 * Base hourly rates by city (in EUR)
 * Used for price suggestions in matching algorithm
 */
export const CITY_RATES: Record<string, { min: number; max: number }> = {
  'Paris': { min: 20, max: 35 },
  'London': { min: 20, max: 40 },
  'Barcelona': { min: 15, max: 30 },
  'Berlin': { min: 15, max: 28 },
  'Amsterdam': { min: 18, max: 32 },
  'Rome': { min: 15, max: 30 },
  'Prague': { min: 12, max: 25 },
  'Vienna': { min: 15, max: 28 },
  'default': { min: 15, max: 30 },
} as const;

/**
 * Cache TTL values (in seconds)
 */
export const CACHE_TTL = {
  STATIC_DATA: 86400, // 24 hours - for cities, languages, etc.
  ANALYTICS: 600, // 10 minutes - for admin analytics
  STUDENT_METRICS: 1800, // 30 minutes - for student ratings/reviews
  MATCHES: 300, // 5 minutes - for matching results
  DASHBOARD: 180, // 3 minutes - for user dashboard data
  APPROVED_STUDENTS: 900, // 15 minutes - for approved students list
  REVIEWS: 600, // 10 minutes - for reviews
} as const;

/**
 * Type exports for better TypeScript support
 */
export type City = typeof CITIES[number]['value'];
export type Language = typeof LANGUAGES[number]['value'];
export type Interest = typeof INTERESTS[number]['value'];
export type ServiceType = typeof SERVICE_TYPES[number]['value'];
export type YearOfStudy = typeof YEAR_OF_STUDY_OPTIONS[number];
