import { fetchOtpFromGmail } from '../src/utils/gmail-otp.js';

const email = process.argv[2];

if (!email) {
  throw new Error('Usage: node scripts/fetch-otp.js <email>\n(Run this after triggering a "send code" request — it returns the most recent OTP.)');
}

const query = `to:${email}`;
const log = (...args) => console.log('[fetch-otp]', ...args);

log(`Fetching the most recent OTP sent to ${email}...`);

fetchOtpFromGmail(query, { timeoutMs: 60_000, pollIntervalMs: 4_000 })
  .then((otp) => log('OTP:', otp))
  .catch((error) => {
    console.error('[fetch-otp] Error:', error.message || error);
    process.exit(1);
  });
