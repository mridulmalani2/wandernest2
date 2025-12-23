const { Resend } = require('resend');
require('dotenv').config();

async function testEmail() {
    console.log('--- Email Configuration Test ---');

    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM;
    const toAddress = process.env.CONTACT_EMAIL;

    console.log(`API Key present: ${!!apiKey}`);
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

    if (!toAddress) {
        console.error('❌ ERROR: CONTACT_EMAIL is missing in .env file');
        return;
    }

    const resend = new Resend(apiKey);

    console.log('\nAttempting to send test email...');

    try {
        const response = await resend.emails.send({
            from: fromAddress,
            to: toAddress,
            subject: 'Test Email from TourWise Debugger',
            html: '<strong>It works!</strong> This is a test email to verify your Resend configuration.',
        });

        if (response && response.error) {
            console.error('❌ FAILED to send email.');
            console.error('Error Name:', response.error.name);
            console.error('Error Message:', response.error.message);
        } else {
            console.log('✅ SUCCESS! Email sent.');
            const messageId = response && response.data ? response.data.id : response.id;
            if (messageId) {
                console.log('Message ID:', messageId);
            }
        }
    } catch (err) {
        console.error('❌ EXCEPTION occurred during sending:');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(message);
    }
}

testEmail();
