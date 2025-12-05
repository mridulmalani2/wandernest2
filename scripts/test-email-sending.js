const { Resend } = require('resend');
require('dotenv').config();

async function testEmail() {
    console.log('--- Email Configuration Test ---');

    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM;
    const toAddress = process.env.CONTACT_EMAIL || 'tourwiseco@gmail.com'; // Default to their gmail if not set

    console.log(`API Key present: ${!!apiKey}`);
    if (apiKey) console.log(`API Key prefix: ${apiKey.substring(0, 4)}...`);
    console.log(`From Address: ${fromAddress}`);
    console.log(`To Address: ${toAddress}`);

    if (!apiKey) {
        console.error('❌ ERROR: RESEND_API_KEY is missing in .env file');
        return;
    }

    if (!fromAddress) {
        console.error('❌ ERROR: EMAIL_FROM is missing in .env file');
        return;
    }

    const resend = new Resend(apiKey);

    console.log('\nAttempting to send test email...');

    try {
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: toAddress,
            subject: 'Test Email from TourWise Debugger',
            html: '<strong>It works!</strong> This is a test email to verify your Resend configuration.',
        });

        if (error) {
            console.error('❌ FAILED to send email.');
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Full Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ SUCCESS! Email sent.');
            console.log('Message ID:', data.id);
        }
    } catch (err) {
        console.error('❌ EXCEPTION occurred during sending:');
        console.error(err);
    }
}

testEmail();
