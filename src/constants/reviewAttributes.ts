/**
 * Predefined list of review attributes that tourists can select
 * when reviewing a student guide
 */
export const REVIEW_ATTRIBUTES = [
  // Positive attributes
  'friendly',
  'knowledgeable',
  'punctual',
  'professional',
  'flexible',
  'good_communication',
  'local_insights',
  'great_recommendations',
  'patient',
  'enthusiastic',
  'well_prepared',
  'good_english',

  // Areas for improvement
  'late',
  'unprepared',
  'poor_communication',
  'rushed',
  'limited_knowledge',
] as const;

export type ReviewAttribute = typeof REVIEW_ATTRIBUTES[number];

export function isValidAttribute(attribute: string): boolean {
  return REVIEW_ATTRIBUTES.includes(attribute as ReviewAttribute);
}
