# Field Guide Studio

Sign in at /admin/ using the owner account created at /admin/setup/. OWNER_EMAILS restricts account access on the server. PostgreSQL stores password hashes, opaque session hashes, content, revisions, audit events and generation jobs. Caller-supplied identity headers grant no access.

Articles support drafts, publication, reversible archiving, source references, FAQs, SEO metadata and licensed category photos. A draft preview requires your owner session and excludes indexing. Keyword priorities are qualitative editorial estimates, not invented SEO volumes. Affiliate search links use khalidwahbi-20. Tasks and optional business contacts remain private to the owner. JSON/CSV export supports backups, and archiving retains records.

All five collections come from PostgreSQL through Prisma. Initial records are inserted only if missing, and future deploys preserve saved edits. Saving content does not require rebuilding the website. Optimistic revisions reject stale edits; a successful edit and audit entry commit together. Public pages and sitemap include only published articles.

The generator at /admin/generator/ requires server-side provider configuration and verified research notes. It creates reviewable drafts, never automatic publication. Sales, commissions, analytics and live keyword volumes are not integrated; statistics count real workspace records.
