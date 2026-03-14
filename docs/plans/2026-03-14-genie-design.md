# Genie MVP Design

**Goal:** Build a hackathon-ready web app where a voice AI agent calls businesses to gather service price and availability, then shows the best option to the user in a simple dashboard.

## Product Scope

- Real working web app with a Next.js frontend and Express backend.
- Mock business directory data stored locally.
- Live smallest.ai integration for outbound calls and webhook events.
- Real-time dashboard updates from Express to the frontend using Server-Sent Events (SSE).
- Simple in-memory session and result storage for the MVP.

## Architecture

### Frontend

- Next.js app with Tailwind CSS.
- Dashboard page with:
  - service selector
  - start search action
  - system status panel
  - business list with live call states
  - collected results list
  - cheapest completed option highlighted
- Frontend fetches initial data from the backend and subscribes to an SSE stream for real-time updates.

### Backend

- Express server with modular routes and simple service helpers.
- Local mock dataset under `backend/data`.
- Backend responsibilities:
  - search businesses by service
  - create search sessions
  - call smallest.ai outbound call API
  - receive smallest.ai webhooks
  - normalize and store call results
  - push session/result updates over SSE

### Smallest.ai Integration

- Start calls through the live outbound call API.
- Receive lifecycle updates through webhook endpoints.
- Map webhook payloads into normalized app state:
  - call status
  - price
  - availability
  - notes
  - transcript or summary snippets when available

## Data Model

### Mock Business Record

- `id`
- `name`
- `service`
- `phone`
- `location`
- `priceRange`
- `availabilityHint`

### Search Session

- `sessionId`
- `service`
- `status`
- `createdAt`
- `businesses`
- `results`

### Result Record

- `businessId`
- `businessName`
- `phone`
- `status`
- `price`
- `availability`
- `notes`
- `updatedAt`

## API Design

### `GET /api/search-business`

- Query param: `service`
- Returns matching mock businesses for the requested service.

### `POST /api/start-search`

- Body includes selected service.
- Creates a search session, looks up businesses, triggers outbound calls via smallest.ai, and emits live status updates.

### `POST /api/store-result`

- Accepts structured result data and upserts it into the current in-memory store.
- Useful for manual testing and fallback ingestion.

### `GET /api/results`

- Returns all current sessions or the latest session results for the dashboard.

### `GET /api/stream`

- SSE endpoint for live updates.
- Emits status changes, business call progress, and result updates.

### `POST /webhooks/smallest`

- Receives smallest.ai webhook events.
- Validates payload shape lightly, maps call events to sessions, stores updates, and broadcasts them.

## Realtime Flow

1. User selects a service in the dashboard.
2. Frontend posts to `POST /api/start-search`.
3. Backend finds matching mock businesses.
4. Backend emits `searching` and `calling` status events through SSE.
5. Backend starts one smallest.ai outbound call per business.
6. Smallest.ai sends webhook events back to the backend.
7. Backend normalizes results, updates in-memory session state, and broadcasts changes.
8. Frontend updates the UI live and highlights the cheapest valid completed option.

## Error Handling

- If one outbound call fails, mark that business as failed and continue others.
- Unknown or malformed webhook payloads are ignored safely.
- Missing or partial price data does not block other results.
- If no valid prices are available, the UI shows results without a cheapest badge.

## Testing Strategy

- Backend-first TDD for:
  - service filtering
  - result upsert behavior
  - cheapest option calculation
  - webhook payload normalization
- Integration tests for Express routes using local mocks.
- Frontend tests for dashboard rendering and cheapest-option highlight logic.
- Manual verification with live smallest.ai credentials via environment variables.

## MVP Tradeoffs

- In-memory storage keeps local setup simple but resets on restart.
- SSE is enough for one-way live dashboard updates and simpler than WebSockets for this use case.
- Mock business data keeps demos reliable while preserving a real end-to-end app flow.
