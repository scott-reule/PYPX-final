// ─── CAPTCHA TOKEN VERIFICATION ───────────────────────────────────────────────
// ✅ SAFE — Proxies token verification to captcha.scottreule.com and returns
//    the result to the React app. No API key required on the upstream endpoint.
// ❌ DANGER — This must remain server-side. If the client called
//    captcha.scottreule.com/api/verify directly, the gate would still work, but
//    keeping verification here means we control the trust boundary and can add
//    extra checks (rate limiting, logging) without touching the frontend.
// ⚠️  CAREFUL — Sessions expire after 30 minutes of inactivity on the CAPTCHA
//    server. Verify promptly after the redirect — do not cache tokens.

export default async function handler(req, res) {
  const { token } = req.query;

  // Reject immediately if no token was supplied
  if (!token) {
    return res.status(400).json({ ok: false, error: "Missing token" });
  }

  try {
    const upstream = await fetch(
      `https://captcha.scottreule.com/api/verify?token=${encodeURIComponent(token)}`
    );
    const data = await upstream.json();

    // Pass the upstream response through unchanged — the client reads ok + verdict
    return res.status(200).json(data);
  } catch {
    // Network or parse error reaching the CAPTCHA server
    return res.status(502).json({ ok: false, error: "Verification service unreachable" });
  }
}
