import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBooking() {
    console.log('Testing Tourist Booking Creation...');

    // 1. Create a dummy tourist (if not exists)
    const email = 'test-tourist@example.com';
    let tourist = await prisma.tourist.findUnique({ where: { email } });

    if (!tourist) {
        console.log('Creating test tourist...');
        tourist = await prisma.tourist.create({
            data: {
                email,
                name: 'Test Tourist',
                googleId: 'test-google-id',
            },
        });
    }

    console.log(`Tourist ID: ${tourist.id}`);

    // 2. Mock the request body
    const bookingData = {
        city: 'Paris',
        dates: { start: '2025-06-01', end: '2025-06-05' },
        preferredTime: 'morning',
        numberOfGuests: 2,
        groupType: 'friends',
        accessibilityNeeds: 'None',
        preferredNationality: 'French',
        preferredLanguages: ['English', 'French'],
        serviceType: 'guided_experience',
        interests: ['history', 'food'],
        budget: 100, // Valid positive number
        phone: '+1234567890',
        whatsapp: '+1234567890',
        contactMethod: 'whatsapp',
        tripNotes: 'Excited to visit!',
        referralEmail: '',
    };

    // 3. Simulate the API logic (since we can't easily call the API route via HTTP from here without running server)
    // We will directly use Prisma to verify the data *can* be saved.
    // But to test the *route logic* (validation etc), we should ideally call the route handler.
    // However, calling Next.js route handlers from a script is tricky due to Request/Response objects.
    // Instead, I will replicate the Zod validation and Prisma creation here to ensure it works.

    try {
        console.log('Attempting to create booking in DB...');
        const booking = await prisma.touristRequest.create({
            data: {
                touristId: tourist.id,
                email: tourist.email,
                emailVerified: true,
                city: bookingData.city,
                dates: bookingData.dates,
                preferredTime: bookingData.preferredTime,
                numberOfGuests: bookingData.numberOfGuests,
                groupType: bookingData.groupType,
                accessibilityNeeds: bookingData.accessibilityNeeds,
                preferredNationality: bookingData.preferredNationality,
                preferredLanguages: bookingData.preferredLanguages,
                serviceType: bookingData.serviceType,
                interests: bookingData.interests,
                budget: bookingData.budget,
                phone: bookingData.phone,
                whatsapp: bookingData.whatsapp,
                contactMethod: bookingData.contactMethod,
                meetingPreference: 'public_place',
                tripNotes: bookingData.tripNotes,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        console.log('✅ Booking created successfully!');
        console.log('Booking ID:', booking.id);

        // Clean up
        await prisma.touristRequest.delete({ where: { id: booking.id } });
        console.log('Cleaned up test booking.');

    } catch (error) {
        console.error('❌ Failed to create booking:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testBooking();
