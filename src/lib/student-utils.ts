export const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

/**
 * Calculates the profile completeness percentage for a student.
 * 
 * @param data - The student profile data to evaluate
 * @returns integer percentage (0-100)
 */
export function calculateProfileCompleteness(data: Record<string, unknown>): number {
    const requiredFields = [
        'name', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber',
        'city', 'campus', 'institute', 'programDegree', 'yearOfStudy',
        'expectedGraduation', 'studentIdUrl', 'profilePhotoUrl'
    ];

    const arrayFields = ['languages'];
    const booleanFields = [
        'documentsOwnedConfirmation',
        'verificationConsent',
        'termsAccepted',
        'safetyGuidelinesAccepted',
        'independentGuideAcknowledged',
    ];

    let completed = 0;
    // +1 for availability or general "has updated profile" check could be added, 
    // currently matches the logic in onboarding route
    const total = requiredFields.length + arrayFields.length + booleanFields.length;

    requiredFields.forEach(field => {
        if (data[field]) completed++;
    });

    arrayFields.forEach(field => {
        if (Array.isArray(data[field]) && (data[field] as unknown[]).length > 0) completed++;
    });

    booleanFields.forEach(field => {
        if (data[field] === true) completed++;
    });

    if (total === 0) return 0;

    return Math.min(100, Math.round((completed / total) * 100));
}
