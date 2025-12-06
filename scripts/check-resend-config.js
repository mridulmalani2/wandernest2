const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();
dotenv.config({ path: '.env.local' });

const key = process.env.RESEND_API_KEY;

console.log('\n--- Resend Configuration Check ---');
if (key) {
    if (key.startsWith('re_')) {
        console.log('✅ RESEND_API_KEY is set and looks valid (starts with "re_").');
        console.log('   Key type: ' + (key.startsWith('re_test_') ? 'Test Key (Sandbox)' : 'Live Key'));
    } else {
        console.log('⚠️  RESEND_API_KEY is set but does not start with "re_". It might be invalid.');
    }
} else {
    console.log('❌ RESEND_API_KEY is NOT set in process.env.');
    console.log('   Checking file existence:');
    console.log('   - .env: ' + (fs.existsSync('.env') ? 'Exists' : 'Missing'));
    console.log('   - .env.local: ' + (fs.existsSync('.env.local') ? 'Exists' : 'Missing'));
}
console.log('----------------------------------\n');
