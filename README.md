# Small Kitchen Field Guide

Self-hosted Next.js application for Coolify. PostgreSQL is the only content, session and generation-job store; Prisma 7 uses the pg adapter. No Supabase, Cloudflare D1 or ChatGPT identity dependency.

## Coolify deployment

Create a Docker Compose application from this repository, branch main, compose file /compose.yaml. Coolify generates SERVICE_PASSWORD_POSTGRES and SERVICE_PASSWORD_64_SETUP. Set OWNER_EMAILS, APP_URL and GEMINI_API_KEY in Coolify, choose an HTTPS website domain, and deploy. APP_URL must exactly match the public origin. The PostgreSQL service has no published port and persists on kitchen-postgres. Do not replace its generated password after initial database startup without an explicit database password migration.

After deployment, visit /admin/setup/ yourself. Copy SERVICE_PASSWORD_64_SETUP from the hosting variables into the setup form, enter your allowed owner email and choose your website password. No default password exists. Setup can create only one owner and is disabled once that account exists. Remove the setup token from the hosting variables after setup. Sign in at /admin/.

Optional separate database: deploy the Dockerfile application and set DATABASE_URL to a dedicated PostgreSQL database on the same private Docker network, APP_URL, OWNER_EMAILS and a random SETUP_TOKEN of at least 32 characters. Do not expose PostgreSQL to the Internet.

The container runs an additive schema bootstrap and inserts missing source records at startup. Existing edited records are never overwritten. A single transaction and advisory lock serialize concurrent first starts. It imports 30 English articles, 34 keywords, 30 affiliate link records and 4 tasks; 20 articles remain drafts. No credential or production backup is included in Git.

## Development and checks

Copy .env.example to .env.local and fill local values. npm ci; npm run db:generate; set DATABASE_URL in the shell before npm run db:init; npm run dev. Next.js reads .env.local but the standalone initialization script reads process environment. npm test checks the content library, rendering, provider constraints and password/token handling. npm run build validates TypeScript and produces the standalone server. /api/health returns 200 only when PostgreSQL responds.

## Operations

Use Coolify scheduled PostgreSQL backups, verify restore to a separate database, and retain the named volume. Before changing schema, back up PostgreSQL. Passwords use salted scrypt, sessions are random opaque tokens whose hashes are stored in PostgreSQL, and cookies are HttpOnly/SameSite with Secure on HTTPS. Owner checks do not trust caller identity headers. Login/setup attempts are limited in PostgreSQL. Content writes use optimistic revisions and an atomic audit entry.

Gemini configuration uses server-only GEMINI_API_KEY and GEMINI_MODEL. The generator consumes supplied research notes and never auto-publishes. Live checks confirmed Gemini 3.1 Flash-Lite returns HTTP 200 with generated text, while Argon returned HTTP 429 (RESOURCE_EXHAUSTED) and Gemini 3.8 Flash timed out. Model listing alone does not prove quota availability.

15 licensed real category photos retain source and license information. They are not claims of exact-model testing. See assets/product-originals/LICENSES.md and data/*photo-catalog.json.

## ASIN article generation

The generator accepts a US ASIN or Amazon.com product URL. AMAZON_CLIENT_ID and AMAZON_CLIENT_SECRET are server-only Amazon Creators API credentials; AMAZON_CREDENTIAL_VERSION selects 3.1 (NA), 3.2 (EU), or 3.3 (FE). AMAZON_PARTNER_TAG defaults to the site's existing public Associates tag. A text API key is separate from Amazon catalog access. No product title, photo or specification is fabricated when catalog access is unavailable.

Official references: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-curl and https://ai.google.dev/api/models. The app imports only the matching ASIN and real primary Amazon photo, attaches them to the draft, and uses a direct /dp/ASIN affiliate link in article pages. Expired product images are refreshed via Amazon; unavailable stale images are replaced with an unavailable notice, not a different product.

Gemini models are discovered with the current server key; The configured available model is preferred; Argon is offered when the key lists it. The dashboard exposes a minimal connection test that verifies actual text generation separately from model listing. Keys are never sent to the browser. Temporary provider failures get one bounded retry, with clear permission, quota, model and timeout errors. On the website container, node scripts/check-provider.mjs performs the same minimal server-side check and prints only model names and status.

Only the ASIN product reference is stored in article records and generation history. Catalog titles, features and image URLs are looked up server-side and cached in process memory for at most one hour; image binaries are never downloaded into the app. Generated editorial text is separate from the Amazon catalog cache.

## Public-page and manual product sources

The default generator source reads the normal public Amazon.com /dp/ASIN page with an identifying application user-agent. It extracts the matching product title, primary photo and listed features. It does not solve browser checks, rotate proxies or retry denied pages through alternate identities. Only a same-ASIN Amazon HTTPS redirect is accepted; HTML is capped at 5 MiB and images must be on Amazon's image CDN.

If a page is unavailable, the generator reveals a manual form for the exact product title, verified notes and real product photo URL. The owner confirms the product/photo match and permission to use it. This path works without Creators API eligibility. Manual and public-page product references retain provenance, source URL and their photo URL; image binaries are not downloaded. API-sourced references retain only the ASIN. Public snapshots are refreshed after a day when available; old snapshots retain their original checked date if the page becomes unavailable. No current price or rating is shown.

On the website container, node scripts/check-product.mjs ASIN tests a public page; append --generate to verify one source-based draft without saving or publishing it.
