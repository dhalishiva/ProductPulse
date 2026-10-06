# ProductPulse

A responsive frontend for a personal, multi-product analytics workspace, with a separate public website. Built with React, TypeScript, Vite, React Router, and Lucide icons.

## Run locally

Requires Node.js 22.12+ (Node.js 24 recommended).

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To create and preview the production build:

```bash
npm run build
npm run preview
```

On Windows, run these commands in PowerShell from this repository folder. No environment variables or credentials are required.

## Routes

| Route               | Purpose                                                         |
| ------------------- | --------------------------------------------------------------- |
| `/`                 | Sales homepage, product preview, features, planned plans, FAQ   |
| `/app`              | Portfolio metrics, period/source selectors, CSV export          |
| `/app/traffic`      | **Live** Vercel Web Analytics for six products (passcode-protected) |
| `/app/products`     | Searchable product grid/list and add-product dialog             |
| `/app/products/:id` | Individual metrics, sources, page breakdown, removal            |
| `/app/acquisition`  | Product-filtered acquisition and search performance             |
| `/app/alerts`       | Sample insights, filtering, read status                         |
| `/app/integrations` | Per-product simulated provider connections                      |
| `/app/settings`     | Workspace name, future briefing preferences, demo reset         |
| `/app/billing`      | Current personal preview plan and usage                         |
| `/help`             | Searchable and filterable help center                           |
| `/privacy`          | Draft privacy notice describing the implemented demo            |
| `/terms`            | Draft preview terms                                             |
| `/legal`            | Legal notices, local storage explanation, operator placeholders |

## What is real, and what is demo

- Navigation, date/source/product filters, add/remove products, CSV download, insight read status, preferences, and browser-local persistence work.
- All analytics and insights are **illustrative**. Named products and domains do not imply live access.
- The demo is anchored to September 30, 2026. Daily user/visitor totals are daily sums, not deduplicated people across dates or sites.
- Sample alerts are fixed examples, not a live anomaly engine. Thresholds and briefing options save preferences but do not send messages.
- **Live Vercel data:** `/app/traffic` reads real Vercel Web Analytics through serverless functions in `api/` (see below). Everything else in the app is still demo data.
- The demo pages have **no authentication, database, OAuth, payment processing, or Google access**.
- Adding a product starts with no data. Connecting a demo source enables sample metrics. Disconnecting hides that source's metrics.
- State is stored under `productpulse:demo:v1` on the current browser/device. Invalid saved data falls back to the demo. Storage failures display a notice.
- Do not enter sensitive data or real credentials.

## Architecture and subscription readiness

```text
src/
  domain/types.ts       Workspace, membership, plan, product and connector contracts
  data/demo.ts          Versioned demo repository, deterministic metric fixtures
  state/Workspace.tsx   Workspace state and mutation layer
  components/          Shared app/public layouts, UI primitives, charts
  pages/               Public pages and workspace views
  main.tsx             Route composition and route metadata
  styles.css           Responsive navy/lime design system
```

The domain separates `Workspace`, `Membership`, `Product`, `Connection`, and `Plan`. Products carry `workspaceId`; memberships have roles. Plan definitions and product limits are centralized. `AnalyticsRepository` is the boundary for replacing browser-local fixtures with a server-backed implementation.

These contracts reduce later refactoring; **they do not implement server-side multi-tenancy or authorization**. Client-side limits are UI behavior only and can be bypassed.

### Recommended next backend milestones

1. Add authentication and server-side session handling; resolve workspace membership on every request.
2. Store products, connections, and reports by workspace. Enforce ownership, roles, and data isolation on the server/database, never by trusting a browser-supplied workspace ID.
3. Implement Google authorization and Vercel access, storing credentials encrypted server-side. No provider secret should be put in Vite's `VITE_*` environment variables or browser storage.
4. Replace the demo repository with typed authenticated API calls. Use stored summaries, sync jobs, provider-specific freshness, complete comparison periods, retries, and explicit error states.
5. Fetch provider-appropriate unique-user reports rather than summing daily users when unique people are needed. Do not combine GA4 and Vercel visitor counts.
6. Implement billing separately: plans/entitlements, checkout, signed idempotent webhooks, subscription states, cancellations, and server-side limits. Keep the personal plan available if desired.
7. Add real alert rules and opt-in message delivery. Fixed demo insights must not be shown as live findings.
8. Complete the legal operator/contact details and review production documents against actual data processing and chosen providers before collecting customer data or payments.

For a larger public launch, pre-render or server-render marketing/legal routes for robust SEO. The current SPA provides route-specific browser titles and noindex metadata for demo/legal-draft views, but it is not a server-rendered marketing site.

## Deployment

A Vercel configuration is included for the static Vite build and SPA route fallback. Import this repository into Vercel, use the Vite preset, build with `npm run build`, and serve `dist`. No secrets are needed for this preview. Other static hosts must route extensionless page URLs back to `index.html`.

Deploying this frontend makes the **demo** accessible; `/app` is deliberately not an authenticated private analytics portal. Add real authentication before introducing private data.

## Legal content

Privacy, terms, and notices are marked as **draft preview documents**. They describe the demo rather than claiming unsupported compliance, partnerships, billing features, or security certifications. Operator identity and contact information remain intentionally unspecified.

## Installation and link previews

- Public homepage links to `/app` open a separate tab with `noopener noreferrer`.
- Install ProductPulse is available in the app sidebar and public footer. Android/desktop browsers use the native install prompt when offered. iOS gets Share → Add to Home Screen instructions. Installed apps start at `/app` in standalone mode.
- The production build creates a versioned service worker that precaches only static assets, with network-first page navigation and an offline shell fallback. API/auth responses are not cached. Updates activate after existing app tabs close.
- `public/manifest.webmanifest` includes normal and maskable icons; Apple touch metadata is in `index.html`.
- WhatsApp/Open Graph and Twitter metadata are in static HTML. The 1200×630 generated share image is `public/social-preview-v1.jpg`. Production URLs currently use `https://product-pulse-dun.vercel.app`; update these metadata URLs if the public domain changes.
- Social apps may cache old previews. Sharing a new URL variant such as `/?share=v2` can request a fresh preview, but cache refresh is controlled by the sharing service.

## Live Vercel analytics (`/app/traffic`)

Serverless functions in `api/` call Vercel's Web Analytics API with a token that never reaches the browser, behind a single-owner passcode.

| Variable | Purpose |
| --- | --- |
| `VERCEL_TOKEN` | Vercel access token for your team |
| `VERCEL_TEAM_ID` | Your team id (`team_...`) |
| `PRODUCTPULSE_PASSCODE` | Passcode that unlocks the live page |
| `SESSION_SECRET` | Random secret that signs the session cookie |

Set them in the Vercel project settings (see `.env.example`), then redeploy. The tracked projects live in `api/_lib/config.ts`; add a row there to track another one. To run the API locally use `vercel dev` (plain `npm run dev` serves only the frontend).
