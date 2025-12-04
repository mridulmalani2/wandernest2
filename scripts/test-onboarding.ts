import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStudentOnboarding() {
    console.log('Testing Student Onboarding...');

    // 1. Create a dummy student (if not exists)
    const email = 'test-student@university.edu';
    let student = await prisma.student.findUnique({ where: { email } });

    if (!student) {
        console.log('Creating test student...');
        student = await prisma.student.create({
            data: {
                email,
                emailVerified: true,
                status: 'PENDING_APPROVAL',
            },
        });
    }

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

    try {
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

        // Clean up
        await prisma.student.delete({ where: { id: student.id } });
        console.log('Cleaned up test student.');

    } catch (error) {
        console.error('❌ Failed to save student onboarding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testStudentOnboarding();
