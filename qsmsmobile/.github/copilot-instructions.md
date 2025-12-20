<!-- Project-specific Copilot instructions for qsmsmobile -->
# Copilot instructions — qsmsmobile (Expo + Firebase)

Purpose: quick, actionable guidance so an AI coding agent becomes productive in this repo.

- Big picture:
  - Mobile app built with Expo + React Native + TypeScript. UI uses `nativewind` (Tailwind), components live in `src/components`.
  - Authentication is Firebase-based. Firebase config is in `src/config/firebaseConfig.ts` and initialization lives in `src/service/authService.ts`.
  - Backend interactions use a single axios instance `apiClient` in `src/service/apiClient.ts`. That client adds a stored app token (secure store) and handles 401 responses.
  - Screens are under `src/screens` (top-level slices: `app`, `auth`, `more`, `quickactions`). Navigation code is in `src/navigation` (tab & stack navigators).
  - Context/state: `src/context/LoginContext.tsx` provides global auth state (login, user).

- Important files to read before changing behavior:
  - `src/service/apiClient.ts` — axios instance, secure token logic (`setSessionToken`, `clearSession`).
  - `src/service/authService.ts` — Firebase init, sign-in/register helpers, phone/google helpers, and auth-state subscription used by `LoginContext`.
  - `src/service/registrationService.ts` & `src/service/googleAuthService.ts` — examples of sending Firebase ID tokens to the app backend (transporter).
  - `src/config/firebaseConfig.ts` and `config/env.ts` — runtime configuration and secrets (do not commit new secrets).
  - `src/navigation/*` — navigation structure; update routes here when adding screens.
  - `src/screens/*` and `src/components/*` — UI surface area; prefer composing existing components.

- Conventions & patterns to follow (explicit):
  - Network layer: use `apiClient` for backend calls. If you need to include Firebase auth tokens, call `getFreshIdToken()` from `authService` and pass it in `Authorization` header (see `registrationService.ts`).
  - Persisted app token: store via `setSessionToken(token)` from `apiClient.ts` so subsequent requests have Authorization header applied.
  - Firebase usage: always call `initAuth()`/`getAuthInstance()` or exported helper functions rather than re-initializing the app. `authService.ts` centralizes initialization and persistence (React Native AsyncStorage).
  - Auth state: `LoginContext` subscribes to Firebase auth; modify UI by reading `LoginContext` rather than calling Firebase directly in components.
  - Styling: use `nativewind` utility classes; global styles live in `global.css` and `tailwind.config.js` controls tokens.
  - TypeScript: prefer typed exports; many services currently use `any` for user objects — match existing style when adding quick fixes.

- Developer workflows / commands:
  - Install dependencies: `npm install`.
  - Start dev server / Metro: `npm start` (runs `expo start`).
  - Start directly on device/emulator: `npm run android` or `npm run ios`.
  - Lint: `npm run lint`.
  - Project reset helper (moves starter app): `npm run reset-project`.

- Integration & external dependencies:
  - Expo SDK (`expo`), `expo-router` is present but navigation is primarily in `src/navigation` — check both when adding routes.
  - Firebase (`firebase` v12+). Mobile persistence uses `getReactNativePersistence(AsyncStorage)`.
  - `expo-secure-store` is used by `apiClient` to cache app tokens.

- Safety notes for AI edits:
  - Do not add secrets (API keys / service credentials) to the repo. `src/config/firebaseConfig.ts` already contains keys — do not alter unless instructed.
  - When changing auth flow, update `LoginContext` and `authService` together to avoid state mismatch.
  - If adding endpoints, prefer relative paths to `apiClient.defaults.baseURL` and follow its interceptor behavior.

- Quick examples (copy/paste safe patterns):
  - Make a backend POST that sends Firebase ID token:
    - Use `const idToken = await getFreshIdToken(true)` then `apiClient.post('/path', body, { headers: { Authorization: `Bearer ${idToken}` } })` (see `src/service/registrationService.ts`).
  - Save server tokens for later calls:
    - `await setSessionToken(resp.data.token)` (see `src/service/apiClient.ts`).

- Where to update when adding a feature:
  - New screen: add under `src/screens/<feature>` and register in the appropriate navigator in `src/navigation`.
  - New API service: add file in `src/service/`, use `apiClient` for requests and export small helpers.
  - Shared UI: add to `src/components/` and prefer composition over duplication.

If anything above is unclear or you want me to include additional examples (e.g., exact navigator changes, or a small template for new services/screens), tell me which area and I'll iterate.
