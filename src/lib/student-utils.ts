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
    const numericFields = ['hourlyRate'];
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
    const hasNumericFields = numericFields.some((field) => field in data);
    const total = requiredFields.length + arrayFields.length + booleanFields.length + (hasNumericFields ? numericFields.length : 0);

    const isNonEmptyString = (value: unknown) =>
        typeof value === 'string' && value.trim().length > 0;

    const isValidDateValue = (value: unknown) => {
        if (value instanceof Date) {
            return !isNaN(value.getTime());
        }
        if (typeof value === 'string') {
            return !isNaN(Date.parse(value));
        }
        return false;
    };

    requiredFields.forEach(field => {
        const value = data[field];
        if (field === 'dateOfBirth' || field === 'expectedGraduation') {
            if (isValidDateValue(value)) completed++;
            return;
        }
        if (isNonEmptyString(value)) completed++;
    });

    arrayFields.forEach(field => {
        if (
            Array.isArray(data[field]) &&
            (data[field] as unknown[]).some((item) => isNonEmptyString(item))
        ) {
            completed++;
        }
    });

    if (hasNumericFields) {
        numericFields.forEach(field => {
            const value = data[field];
            if (typeof value === 'number' && Number.isFinite(value)) {
                completed++;
            }
        });
    }

    booleanFields.forEach(field => {
        if (data[field] === true) completed++;
    });

    if (total === 0) return 0;

    return Math.min(100, Math.round((completed / total) * 100));
}
