import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStudentOnboarding() {
    // Safety Check: Prevent running in production
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Error: This script is unsafe for production environments.');
        process.exit(1);
    }

    console.log('Testing Student Onboarding...');

    // 1. Create a dummy student (if not exists)
    const email = 'test-student@university.edu';

    // Check if student already exists to avoid overwriting real data
    const existingStudent = await prisma.student.findUnique({ where: { email } });

    if (existingStudent) {
        console.log('⚠️  Test student already exists. Skipping creation to avoid data loss.');
        // In a real test suite, you might want to use a unique random email to ensure isolation.
        return;
    }

    let createdStudentId: string | null = null;

    try {
        console.log('Creating unique test student...');
        const student = await prisma.student.create({
            data: {
                email,
                emailVerified: true, // Explicitly trusted for TEST environment only
                status: 'PENDING_APPROVAL',
            },
        });
        createdStudentId = student.id;
        console.log(`Student ID: ${student.id}`);

        // 2. Mock the onboarding data
        const onboardingData = {
            // Personal Details
            name: 'Test Student',
            dateOfBirth: new Date('2000-01-01'),
            gender: 'female',
            nationality: 'German',
            phoneNumber: '+49123456789',
            city: 'Berlin',
            campus: 'Main Campus',

            // Academic Details
            institute: 'Technical University of Berlin',
            programDegree: 'MSc Computer Science',
            yearOfStudy: '1st year',
            expectedGraduation: '2026',

            // Identity Verification (URLs would come from upload API)
            studentIdUrl: 'https://example.com/student-id.jpg',
            governmentIdUrl: 'https://example.com/passport.jpg',
            selfieUrl: 'https://example.com/selfie.jpg',
            profilePhotoUrl: 'https://example.com/profile.jpg',
            verificationConsent: true,
            documentsOwnedConfirmation: true,

            // Profile
            bio: 'I love showing people around my city!',
            skills: ['history', 'foodie'],
            preferredGuideStyle: 'friendly',
            languages: ['German', 'English'],
            interests: ['history', 'architecture'],

            // Service Preferences
            servicesOffered: ['walk-around', 'recommendations'],
            hourlyRate: 25,
            onlineServicesAvailable: true,
            timezone: 'Europe/Berlin',

            // Safety
            termsAccepted: true,
            safetyGuidelinesAccepted: true,
            independentGuideAcknowledged: true,
            emergencyContactName: 'Parent Name',
            emergencyContactPhone: '+49987654321',
        };

        console.log('Attempting to update student profile with onboarding data...');
        const updatedStudent = await prisma.student.update({
            where: { id: student.id },
            data: {
                ...onboardingData,
                status: 'PENDING_APPROVAL', // Should remain pending until admin approves
                profileCompleteness: 100,
            },
        });

        console.log('✅ Student onboarding data saved successfully!');
        console.log('Student Name:', updatedStudent.name);

    } catch (error) {
        console.error('❌ Failed to save student onboarding data:', error);
    } finally {
        // Clean up ONLY if we created the student
        if (createdStudentId) {
            await prisma.student.delete({ where: { id: createdStudentId } });
            console.log('Cleaned up test student.');
        }
        await prisma.$disconnect();
    }
}

testStudentOnboarding();
