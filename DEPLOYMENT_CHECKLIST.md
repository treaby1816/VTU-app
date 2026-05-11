# 🚀 Production Deployment Checklist: VaultPay

This document outlines the necessary infrastructure settings and environment variables required for a successful production launch of the VaultPay platform with its new observability and AI integrations.

## 1. Cloudflare DNS & Proxy Settings
- [ ] **SSL/TLS**: Ensure "Full (Strict)" mode is enabled in Cloudflare.
- [ ] **Proxy**: Ensure the `NEXT_PUBLIC_APP_URL` domain is proxied (Orange Cloud) to allow Cloudflare's security features and headers (like `x-forwarded-for` for rate limiting) to work correctly.
- [ ] **WAF Rules**: If using strict WAF rules, ensure they don't block `/api/debug/*` or `/monitoring` (Sentry tunnel).

## 2. Environment Variables (Production)
Configure these in your production environment (e.g., Vercel, Railway, or AWS).

### Supabase (Existing)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Keep secure!)

### PostHog (Analytics)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY`: Get from PostHog Project Settings.
- [ ] `NEXT_PUBLIC_POSTHOG_HOST`: Set to `https://app.posthog.com` (or your self-hosted URL).

### Upstash (Rate Limiting)
- [ ] `UPSTASH_REDIS_REST_URL`: From Upstash Console.
- [ ] `UPSTASH_REDIS_REST_TOKEN`: From Upstash Console.

### Sentry (Monitoring)
- [ ] `SENTRY_AUTH_TOKEN`: For uploading source maps during build.
- [ ] `NEXT_PUBLIC_SENTRY_DSN`: From Sentry Project Settings.

## 3. Database Setup (Supabase)
- [ ] **Enable pgvector**: Run the contents of `supabase-vector-schema.sql` in the Supabase SQL Editor.
- [ ] **Embeddings API**: Once you have an OpenAI API key, update `src/lib/vector.ts` to replace the placeholder function with the real API call.

## 4. Build & Verification
- [ ] **Production Build**: Run `npm run build` locally first to verify Sentry source maps upload correctly.
- [ ] **Rate Limit Test**: Hit `/api/debug/rate-limit` repeatedly to ensure the 429 response is triggered.
- [ ] **Analytics Test**: Visit `/debug/analytics` to verify PostHog events are appearing in your dashboard.

## 5. Security Checklist
- [ ] **CORS**: Ensure Supabase and Upstash CORS settings allow requests only from your production domain.
- [ ] **Service Keys**: Triple-check that `SUPABASE_SERVICE_ROLE_KEY` and `SENTRY_AUTH_TOKEN` are NOT prefixed with `NEXT_PUBLIC_`.
