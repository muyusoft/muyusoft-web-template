# Developing in the Web base template

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · next-intl · Zustand · Vitest.

## 0. Operating rules — absolute

_Never run git commands that write._ No git commit, add, push, merge, rebase, checkout -b. Output the exact commands and the commit message for the user to run. Reading (git status, git log, git diff) is allowed.

_Never build or start the app._ No npm run dev, next dev, next build, next start. The user runs it and reports errors back.

_Type checking, lint and tests follow the same rule_ unless the user explicitly asks: propose `npm run typecheck`, `npm run lint`, `npm test` (it runs `vitest run`, not watch mode).

_Never install or remove packages_ without being asked. Propose the command.

_Stay in scope._ Change only what was asked. If you spot something worth fixing, mention it in one line — do not do it.

_Ask before guessing._ If the domain, the API shape, the copy, or where something belongs is ambiguous, ask one targeted question.

_Be concise._ Ship the code, not a description of it. Show only changed blocks. Do not re-read files already in the conversation.

## 1. Where code goes — feature-first

```
src/
├── app/[locale]/        Routes only — thin, composition only
│   ├── (protected)/     routes that require a session (see §2)
│   └── orders/page.tsx  imports from features/orders
├── app/                 sitemap.ts · robots.ts · icon.svg · global-error.tsx · api/
├── features/<domain>/   ← all product code (announcements/ is the reference example)
│   ├── components/  hooks/  services/  store/  types/  utils/  __tests__/
│   └── index.ts         public surface — the only thing others import
├── shared/              used by 2+ features (rule of two)
│   ├── components/  layouts/  icons/  hooks/  services/  store/  utils/  types/
├── config/              env · env.server · api-client · api-error · session · auth · seo · logger
├── i18n/                routing · navigation · request
├── design/globals.css   Tailwind theme: palette + semantic colors
├── locales/{en,es}/translation.json
└── proxy.ts             locale detection / redirect
```

_Rule of two._ New code starts inside its feature; it moves to shared/ only when a second feature needs it.

_Import direction._ app → features → shared → config → design. Never feature → feature. A feature is imported only through its index.ts.

_Routes are thin._ `src/app/**` holds page/layout/loading/error files only: fetch or call hooks, compose feature components. No business logic, no markup beyond layout.

_Every route lives under `[locale]`._ Links and redirects use `Link`, `redirect`, `useRouter`, `usePathname` from `@/i18n/navigation`, never from `next/link` or `next/navigation` (except `notFound`).

## 2. Project type — set it up first

This is a template. The first task in a new project is deciding which of these it is. In both cases:
- Delete the example feature: `src/features/announcements/`, `src/app/[locale]/announcements/`, its `announcements` and `home.exampleLink` locale keys, and its entry in `PUBLIC_PATHS`.
- Replace `src/app/icon.svg` with the project logo, add `src/app/[locale]/opengraph-image.png` (1200×630) for social previews, and set the `metadata` locale keys.

_Static site (landing page, marketing, docs)._ No backend, no session.
- Leave `PROTECTED_PATH_PREFIXES` empty in `@/config/auth.config` and delete `src/app/[locale]/(protected)/` and `src/app/api/session/`.
- Leave `API_URL` unset. If the site has no backend at all, also delete `api-client`, `api-error`, `session` and `auth-guard` from `config/`.
- Every page is pre-rendered at build time (SSG). Do not call `cookies()`, `headers()` or `apiClient` without `auth: false`. Any of these makes the page dynamic.
- Deploys to any Node host or Vercel. Pure static hosting (`output: "export"`, S3, GitHub Pages) is _not_ supported as-is: it drops `proxy.ts`, the security headers and locale detection. Ask before switching.

_App with session._ Pages behind login.
- Public pages go directly under `src/app/[locale]/`. Protected pages go inside `src/app/[locale]/(protected)/`. The group name does not appear in the URL.
- For every top-level folder in `(protected)`, add its path to `PROTECTED_PATH_PREFIXES` (e.g. `(protected)/account/` → `"/account"`). Both are required: `proxy.ts` redirects before rendering, and the `(protected)` layout calls `requireSession()` as a server-side backstop.
- In protected pages, wrap `apiClient` calls with `try/catch` and call `redirectIfUnauthorized(error, locale)` first. It clears the expired cookie and sends the user to login.
- Logout is a Server Action that calls `clearSessionToken()` and redirects.

## 3. Server vs client components

- Components are **server components by default**. Add `"use client"` only when the component needs state, effects, event handlers or browser APIs.
- Push `"use client"` to the leaves. A page stays a server component; the interactive button inside it is the client one.
- Server components fetch data directly (async component or a feature service). Never fetch in a `useEffect` when the data can be loaded on the server.
- Never import server-only code (secrets, `next-intl/server`, `cookies()`) into a client component.
- Every page that uses translations calls `setRequestLocale(locale)` so it can be rendered statically.
- Use `next/image` for images and `next/font` for fonts. Never a raw `<img>`.
- Each page exports `generateMetadata` with translated title and description, plus `alternates: buildAlternates(path, locale)` on public pages (canonical + hreflang). Never set `alternates` in a layout: it would leak to every child page.

_SEO._ Every public page's path goes in `PUBLIC_PATHS` (`@/config/seo.config`) so it lands in the sitemap. Indexing is on only when `NEXT_PUBLIC_ENVIRONMENT=production`; dev and preview deploys are `noindex` and blocked in robots.txt. `NEXT_PUBLIC_SITE_URL` must be the real domain in production.

## 4. Non-negotiable code rules

_Design tokens, always._ Tailwind utility classes only, built from the theme in `src/design/globals.css`. No arbitrary values (`p-[13px]`, `bg-[#0ea5e9]`, `text-[15px]`), no inline `style` for colors or sizes, no hex anywhere outside globals.css.

Prefer _semantic_ colors so dark mode resolves automatically: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`, `bg-divider`, `bg-overlay`, `outline-ring`. Use a palette token (`bg-error-600`) only when the color means the same in both themes.

Variants are a `const` map of class strings, merged with `cn()` from `@/shared/utils`. Never build class names with string interpolation (`bg-${color}-500`) — Tailwind cannot detect them.

_Icons come from `@/shared/icons` — only._ `<Icon name="user" size="md" />`. Never import `lucide-react` (ESLint blocks it), never inline an SVG, never use an emoji as an icon. Need a new one: import it in `icon-registry.ts` and add it under its kebab-case name. `IconName` derives from the registry, so an invalid name is a compile error. Decorative icons are `aria-hidden`; pass `label` only when the icon is the only content of a control.

_i18n, always._ Every user-visible string — errors, placeholders, toasts, `aria-label`, `alt`, page titles — goes through `t()`, and every new key goes into _both_ `en` and `es` in the same change. Messages are typed from `es/translation.json`: a missing key is a compile error.

```tsx
const t = useTranslations("orders");         // server or client component
const t = await getTranslations("orders");   // async server component / generateMetadata
t("greeting", { name: user.name });          // interpolate, never concatenate
t("count", { count: n });                    // ICU plural, never a ternary
```

Format dates, numbers and currency through `@/shared/utils` (`formatDate`, `formatNumber`, `formatCurrency`) passing `useLocale()` / `getLocale()`. Never by hand, never inside a translation string.

_Imports use `@/`._ Never `../`.

_TypeScript._ No `any`, no `@ts-ignore`. `strict` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Type every props interface and public signature. Derive types from data (`as const` → union).

_React._ Never define a component inside a render body. Stable `key` from an id, never the index. Hooks at top level; complete dependency arrays.

_HTTP — the backend is called only from the server._ `apiClient` from `@/config/api-client` (`get/post/put/patch/delete`, paths relative to `/api/v1`, `{ data }` unwrapped). It is `server-only`: use it in server components, Server Actions and Route Handlers. A client component that needs to read or write calls a Server Action; it never calls the backend. Services are React-free, typed, and let `ApiError` propagate. Branch on `error.code` (the backend `error_code`), never on `message`. Options: `auth: false` for public routes, `idempotent: true` on create/payment POSTs, `unwrap: false` for paginated bodies, `revalidate`/`tags` to cache public data only.

_Logging._ `logger` from `@/config/logger`. Never `console.*` (ESLint blocks it). Never swallow an error.

_State._ Server data stays on the server or in the screen. `useState` for local UI state. A Zustand store only when two or more screens share client state. URL state (filters, tabs, pagination) goes in search params, not in a store. Never store a derived value.

_Secrets and auth._ The backend returns a Bearer access token (no refresh token). After login, a Server Action stores it with `setSessionToken()` in an httpOnly cookie; `apiClient` reads it with `getSessionToken()`. Logout and a 401 call `clearSessionToken()` — only possible in a Server Action or Route Handler. Never send the token to the client, never store it in `localStorage`, `sessionStorage` or a JS-readable cookie. Server config lives in `serverEnv` (`@/config/env.server`); only `NEXT_PUBLIC_*` reaches the browser — never put a secret or the API URL in one. Every new variable goes in `.env.example` and is validated in `env.validation.ts`.

## 5. Clean Code & SOLID — hard limits

| Unit                         | Limit       | When exceeded                   |
| ---------------------------- | ----------- | ------------------------------- |
| File                         | 200 lines   | Split by responsibility         |
| Component file               | 150 lines   | Extract subcomponents or a hook |
| Function                     | 20 lines    | It does more than one thing     |
| Function parameters          | 3           | Pass an options object          |
| Component props              | 7           | The component does too much     |
| Nesting depth                | 3           | Use early returns               |
| Exported components per file | 1           | One component, one file         |
| Hook                         | one concern | Split into several hooks        |

A component that both fetches/derives and renders is two units: logic in `use<Thing>.ts` (client) or in the page/service (server), the component stays presentational.

- No magic numbers — a named constant or a theme class.
- Early returns over nested `if`.
- Utils are pure. If it needs a mock to test, it is a service.
- Comments explain why, never what. Delete dead code.
- SOLID: one reason to change per unit; extend via props; specific prop interfaces; depend on abstractions (`apiClient`, not fetch or axios).

## 6. Naming

| Thing                           | Pattern                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Route folder                    | kebab-case/ with page.tsx, layout.tsx, loading.tsx, error.tsx                |
| Component                       | PascalCase.tsx                                                               |
| Hook                            | use-kebab-case.ts / useCamelCase                                             |
| Store · Service · Utils · Types | <name>.store.ts · <domain>.service.ts · <topic>.utils.ts · <domain>.types.ts |
| Constant                        | SCREAMING_SNAKE_CASE                                                         |
| Boolean                         | is / has / should / can prefix                                               |
| Handler · handler prop          | handleX · onX                                                                |

## 7. Tests

Vitest, co-located in `__tests__/`, named `<source>.test.ts` (`.test.tsx` for components). New logic ships with a test; a bug fix ships with the test that reproduces it. `src/features/announcements/__tests__/` shows a service test and a component test.

- _Utils_ — pure, no mocks. Happy path, boundaries (0, negative, empty), invalid input.
- _Stores_ — reset with `setState` in `beforeEach`. Assert through `getState()`.
- _Services_ — `vi.mock("@/config/api-client")`. Always test the failure path (`ApiError`).
- _Components_ — Testing Library. Query by role and accessible name (`getByRole("heading", { name })`), never by class or test id. Cover the empty and error variants. `next-intl` is mocked globally: `t()` returns the key and the locale is `"en"`, so assert on keys, not copy.
- `server-only` is mocked globally in `vitest.setup.ts`. Tests that use `fetch`/`Response` start with `// @vitest-environment node`.

Name tests as behavior sentences.

## 8. A page is not done until

- _Loading, error and empty states exist._ `loading.tsx` / `<Suspense>`, `error.tsx` or `<ErrorState />`, `<EmptyState />`.
- Errors are logged through `logger` and shown as a translated message.
- It is wrapped in a layout from `@/shared/layouts`.
- It has translated `generateMetadata`; if public, `buildAlternates` and an entry in `PUBLIC_PATHS`.
- Semantic HTML: one `<h1>`, `<nav>`, `<button>` for actions, `<a>`/`Link` for navigation, `<label>` for every input. Never a clickable `<div>`.
- Keyboard works: visible focus (`focus-visible:`), logical tab order, no focus traps.
- Responsive: mobile-first, checked at 360px wide. Touch targets at least 44×44.
- No fixed heights on containers holding translated text — Spanish runs 20–30% longer.

## 9. Known gaps in this template

- _No login page._ The method differs per project (OTP, password, SSO), so each project builds it at `LOGIN_PATH`. Until then, protected routes redirect to a 404. The login Server Action must call `setSessionToken()` and redirect to `toSafeRedirectPath(searchParams.next)` — never to the raw `next` value.
- _Session cookie lifetime is a guess_ (7 days) until the backend token TTL is confirmed.
- _CSP allows `'unsafe-inline'` scripts._ Moving to nonces requires dynamic rendering; do it only if a project needs a strict CSP. Any new external origin (fonts, analytics, maps, images) must be added to the CSP in `next.config.ts` or it will be blocked.
- _Logger does not report to a service in production._ Sentry hookup is a `TODO`.
- _next-intl 4.15 deprecates `setRequestLocale` / `requestLocale`_ in favor of `next/root-params`. They still work; migrate when the template is next updated.
- _Favicon is a placeholder_ and there is no default social preview image (see §2).
- _No theme toggle._ Dark mode follows the OS; `data-theme="light|dark"` on `<html>` forces it, but nothing sets it yet.
- _Husky hooks_ are installed by `npm install` (`prepare`) only inside a git repo.

If a task depends on one of these, say so before writing code.

## 10. Building a new feature

Produce in this order and stop at anything ambiguous to ask:

1. `src/features/<domain>/types/` — the data contract
2. `services/` — HTTP through `apiClient`, typed (server-only)
3. `store/` — only if two or more screens share client state
4. `hooks/` — client logic, one concern per hook
5. `components/` — presentation, typed props, theme classes only; `"use client"` only where needed
6. `src/app/[locale]/<route>/page.tsx` (+ `loading.tsx` / `error.tsx`) — thin, in a layout, with metadata
7. Locale keys in _both_ files
8. `__tests__/` for services, stores and utils
9. `index.ts` exposing the public surface

Then output, without running it: `npm run typecheck`, `npm run lint`, `npm test`, and a Conventional Commit message `<type>(<scope>): <imperative subject>`.

## 11. When the user reports an error

1. Ask for the full message — stack trace, file, line. Note whether it is a server (terminal) or browser (console) error.
2. Read the file before proposing anything.
3. One hypothesis, one fix.
4. Check §9 first. Hydration errors usually mean server and client render different output (dates, `window`, random values).
5. If unclear, ask for one specific diagnostic.

## 12. Self-check before replying

Hex color, arbitrary Tailwind value or hardcoded string? Icon from outside `@/shared/icons`? `next/link` instead of `@/i18n/navigation`? `"use client"` higher than needed? Fetch in `useEffect` that belongs on the server? Backend called from a client component? Token sent to the client or stored in localStorage? Secret in a `NEXT_PUBLIC_` var? New env var missing from `.env.example` or validation? New external origin missing from the CSP? `any`? Relative import? Key missing in one locale? Logic in `src/app/`? Protected route missing from `PROTECTED_PATH_PREFIXES`? Static page made dynamic by `cookies()` or an authenticated call? Feature importing another feature? Over a §5 limit? New logic without a test? Loading/error/empty states and metadata? Did you run, build, commit or install something you were not asked to?
