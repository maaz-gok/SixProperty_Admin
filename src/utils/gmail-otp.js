import 'dotenv/config';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const MESSAGES_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';

async function getAccessToken() {
  const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN environment variables are required to fetch Gmail OTPs.');
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`Failed to refresh Gmail access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function listMessageIds(query, accessToken, maxResults) {
  const response = await fetch(`${MESSAGES_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  return (data.messages || []).map((message) => message.id);
}

async function getMessage(id, accessToken) {
  const response = await fetch(`${MESSAGES_URL}/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await response.json();
  return { snippet: data.snippet || '', internalDate: Number(data.internalDate) };
}

/**
 * Polls Gmail for the newest message matching `query` whose server-assigned
 * `internalDate` is at or after `sentAfterMs`, and returns the first
 * 6-digit code found in its snippet. A real OTP email can only be stamped
 * *after* the moment its send was triggered, never before, so this cutoff
 * needs no backward-looking buffer — it just has to tolerate Gmail's
 * *search index* lagging behind delivery, which the poll/retry loop below
 * already absorbs. Callers should capture `sentAfterMs` (via `Date.now()`)
 * *immediately before* triggering the action that sends the OTP, so a
 * still-searchable older email (e.g. from a previous test run against the
 * same shared inbox) can never be mistaken for this run's code.
 *
 * Without `sentAfterMs`, simply returns the code from the single most
 * recent matching message — fine for ad-hoc/manual use where a human
 * confirms the result, but not precise enough for automated tests.
 */
export async function fetchOtpFromGmail(query, { sentAfterMs, timeoutMs = 30_000, pollIntervalMs = 3_000 } = {}) {
  const accessToken = await getAccessToken();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const ids = await listMessageIds(query, accessToken, 5);
    const messages = await Promise.all(ids.map((id) => getMessage(id, accessToken)));
    const candidates = sentAfterMs === undefined ? messages : messages.filter((message) => message.internalDate >= sentAfterMs);

    if (candidates.length) {
      const newest = candidates.reduce((a, b) => (b.internalDate > a.internalDate ? b : a));
      const match = newest.snippet.match(/\b\d{6}\b/);
      if (match) return match[0];
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Timed out after ${timeoutMs}ms waiting for an OTP email matching: ${query}`);
}
