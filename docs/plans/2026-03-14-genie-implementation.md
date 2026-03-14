# Genie MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a hackathon MVP called Genie with a Next.js dashboard, Express backend, mock business data, live smallest.ai call orchestration, and real-time SSE updates.

**Architecture:** The project uses a split frontend/backend structure inside one repo. The Express backend owns mock business search, smallest.ai API calls, webhook handling, in-memory session storage, and SSE broadcasting. The Next.js frontend renders a simple dashboard that starts searches and listens for live updates.

**Tech Stack:** Next.js, React, Tailwind CSS, Node.js, Express, Vitest, Testing Library

---

### Task 1: Scaffold Repository Structure

**Files:**
- Create: `backend/`
- Create: `frontend/`
- Create: `README.md`
- Create: `.gitignore`

**Step 1: Create the failing test**

Write a minimal repository smoke test for backend utility loading once the backend package exists.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand`
Expected: FAIL because packages and test files do not exist yet.

**Step 3: Write minimal implementation**

- Initialize the repo.
- Create backend and frontend package manifests.
- Add shared README and `.gitignore`.

**Step 4: Run test to verify it passes**

Run: backend test command after scaffolding.
Expected: test runner starts and smoke test passes.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold genie repo"
```

### Task 2: Add Mock Business Search Backend

**Files:**
- Create: `backend/data/businesses.js`
- Create: `backend/src/app.js`
- Create: `backend/src/store.js`
- Create: `backend/src/routes/search.js`
- Create: `backend/tests/search.test.js`

**Step 1: Write the failing test**

Write tests for:
- filtering businesses by exact service match
- returning an empty list for unknown services

**Step 2: Run test to verify it fails**

Run: `npm test -- search.test.js`
Expected: FAIL because the route and data modules do not exist.

**Step 3: Write minimal implementation**

- Add example business data for:
  - dental cleaning
  - oil change
  - plumbing
  - home cleaning
  - haircut
- Implement `GET /api/search-business`.

**Step 4: Run test to verify it passes**

Run: `npm test -- search.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/data/businesses.js backend/src/app.js backend/src/routes/search.js backend/tests/search.test.js
git commit -m "feat: add business search api"
```

### Task 3: Add Result Store and Cheapest Logic

**Files:**
- Modify: `backend/src/store.js`
- Create: `backend/src/routes/results.js`
- Create: `backend/src/utils/getCheapestOption.js`
- Create: `backend/tests/results.test.js`

**Step 1: Write the failing test**

Write tests for:
- storing a new result
- updating an existing result for the same business
- returning the cheapest valid result

**Step 2: Run test to verify it fails**

Run: `npm test -- results.test.js`
Expected: FAIL because the store and helper behavior is missing.

**Step 3: Write minimal implementation**

- Add in-memory session/result store helpers.
- Implement `POST /api/store-result`.
- Implement `GET /api/results`.
- Add cheapest-option helper.

**Step 4: Run test to verify it passes**

Run: `npm test -- results.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/store.js backend/src/routes/results.js backend/src/utils/getCheapestOption.js backend/tests/results.test.js
git commit -m "feat: add results storage and cheapest option logic"
```

### Task 4: Add SSE Broadcast Layer

**Files:**
- Modify: `backend/src/app.js`
- Create: `backend/src/sseBroker.js`
- Create: `backend/tests/sse.test.js`

**Step 1: Write the failing test**

Write tests for:
- registering an SSE client
- broadcasting structured updates when results change

**Step 2: Run test to verify it fails**

Run: `npm test -- sse.test.js`
Expected: FAIL because the SSE broker does not exist.

**Step 3: Write minimal implementation**

- Add `GET /api/stream`.
- Implement a tiny SSE broker for subscribers and event broadcast.
- Wire result writes to emit updates.

**Step 4: Run test to verify it passes**

Run: `npm test -- sse.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/app.js backend/src/sseBroker.js backend/tests/sse.test.js
git commit -m "feat: add realtime updates over sse"
```

### Task 5: Add Smallest.ai Client and Search Orchestration

**Files:**
- Create: `backend/src/config.js`
- Create: `backend/src/clients/smallest.js`
- Create: `backend/src/routes/startSearch.js`
- Create: `backend/tests/startSearch.test.js`

**Step 1: Write the failing test**

Write tests for:
- creating a session from a selected service
- triggering one outbound call per matching business
- marking failed call attempts without aborting the whole session

**Step 2: Run test to verify it fails**

Run: `npm test -- startSearch.test.js`
Expected: FAIL because orchestration and client modules do not exist.

**Step 3: Write minimal implementation**

- Add env-based smallest.ai config.
- Implement the outbound call client wrapper.
- Add `POST /api/start-search`.
- Broadcast `searching` and `calling` events.

**Step 4: Run test to verify it passes**

Run: `npm test -- startSearch.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/config.js backend/src/clients/smallest.js backend/src/routes/startSearch.js backend/tests/startSearch.test.js
git commit -m "feat: add smallest ai search orchestration"
```

### Task 6: Add Smallest.ai Webhook Ingestion

**Files:**
- Create: `backend/src/routes/webhooks.js`
- Create: `backend/src/utils/normalizeWebhook.js`
- Create: `backend/tests/webhooks.test.js`

**Step 1: Write the failing test**

Write tests for:
- mapping webhook payloads into result updates
- ignoring unknown session references
- preserving partial data safely

**Step 2: Run test to verify it fails**

Run: `npm test -- webhooks.test.js`
Expected: FAIL because the webhook route and normalizer do not exist.

**Step 3: Write minimal implementation**

- Implement `POST /webhooks/smallest`.
- Normalize webhook payloads into store updates.
- Broadcast changes over SSE.

**Step 4: Run test to verify it passes**

Run: `npm test -- webhooks.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/routes/webhooks.js backend/src/utils/normalizeWebhook.js backend/tests/webhooks.test.js
git commit -m "feat: add smallest ai webhook ingestion"
```

### Task 7: Build the Dashboard UI

**Files:**
- Create: `frontend/app/page.tsx`
- Create: `frontend/app/globals.css`
- Create: `frontend/components/dashboard.tsx`
- Create: `frontend/components/status-panel.tsx`
- Create: `frontend/components/business-list.tsx`
- Create: `frontend/components/results-list.tsx`
- Create: `frontend/lib/api.ts`
- Create: `frontend/lib/types.ts`
- Create: `frontend/tests/dashboard.test.tsx`

**Step 1: Write the failing test**

Write tests for:
- rendering the service selector and status panel
- showing businesses and results from API data
- highlighting the cheapest option

**Step 2: Run test to verify it fails**

Run: `npm test -- dashboard.test.tsx`
Expected: FAIL because the dashboard components do not exist.

**Step 3: Write minimal implementation**

- Build a simple Tailwind dashboard.
- Fetch backend data.
- Subscribe to the SSE stream on the client.
- Highlight the cheapest completed option.

**Step 4: Run test to verify it passes**

Run: `npm test -- dashboard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/app frontend/components frontend/lib frontend/tests/dashboard.test.tsx
git commit -m "feat: add genie dashboard"
```

### Task 8: Add Local Run Instructions and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `backend/package.json`
- Modify: `frontend/package.json`
- Create: `backend/.env.example`

**Step 1: Write the failing test**

Write a final verification checklist covering:
- backend tests
- frontend tests
- local startup commands

**Step 2: Run test to verify it fails**

Run the verification commands before docs are complete.
Expected: missing setup docs or missing scripts.

**Step 3: Write minimal implementation**

- Add run scripts for backend and frontend.
- Document smallest.ai environment variables.
- Document how to run locally and how webhook testing works.

**Step 4: Run test to verify it passes**

Run:
- `npm test` in `backend`
- `npm test` in `frontend`
- `npm run build` in `frontend`

Expected: PASS

**Step 5: Commit**

```bash
git add README.md backend/.env.example backend/package.json frontend/package.json
git commit -m "docs: add local setup instructions"
```
