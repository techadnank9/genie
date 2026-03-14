# Genie

Hackathon MVP for comparing local business options using a live smallest.ai voice agent and mock business data.

## Structure

- `backend` - Express API and smallest.ai integration
- `frontend` - Next.js dashboard
- `docs/plans` - design and implementation docs

## Features

- Mock business dataset for dental cleaning, oil change, plumbing, home cleaning, and haircut searches
- `GET /api/search-business` to find businesses by service
- `POST /api/start-search` to launch live smallest.ai outbound calls
- `POST /api/store-result` and `GET /api/results` for result storage and retrieval
- `POST /webhooks/smallest` to ingest smallest.ai webhook updates
- `GET /api/stream` for real-time SSE dashboard updates
- Next.js dashboard showing status, businesses, live results, and the cheapest option

## Local Setup

### 1. Install dependencies

```bash
cd /Users/adnan/Documents/genie/backend && npm install
cd /Users/adnan/Documents/genie/frontend && npm install
```

### 2. Configure the backend

```bash
cd /Users/adnan/Documents/genie/backend
cp .env.example .env
```

Set these values in `.env`:

- `SMALLEST_API_KEY`
- `SMALLEST_AGENT_ID`
- `PUBLIC_BACKEND_URL`

`PUBLIC_BACKEND_URL` should point to the public URL smallest.ai can reach for webhook delivery. For local demos, use a tunnel such as `ngrok` and set the webhook target to:

```text
https://your-public-url/webhooks/smallest
```

### 3. Run the backend

```bash
cd /Users/adnan/Documents/genie/backend
npm run dev
```

The backend runs on `http://localhost:4000`.

### 4. Run the frontend

```bash
cd /Users/adnan/Documents/genie/frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000 npm run dev
```

The frontend runs on `http://localhost:3000`.

## API Examples

### Search businesses

```bash
curl "http://localhost:4000/api/search-business?service=dental%20cleaning"
```

### Start a live Genie search

```bash
curl -X POST "http://localhost:4000/api/start-search" \
  -H "Content-Type: application/json" \
  -d '{"service":"dental cleaning"}'
```

### Store a manual result

```bash
curl -X POST "http://localhost:4000/api/store-result" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"demo-session",
    "service":"dental cleaning",
    "result":{
      "businessId":"dental-1",
      "businessName":"Bright Smile Dental",
      "phone":"+1-555-0101",
      "status":"completed",
      "price":125,
      "availability":"Tomorrow at 10 AM",
      "notes":"Manual test result"
    }
  }'
```

### Watch live SSE updates

Open:

```text
http://localhost:4000/api/stream
```

## Testing

```bash
cd /Users/adnan/Documents/genie/backend && npm test
cd /Users/adnan/Documents/genie/frontend && npm test
cd /Users/adnan/Documents/genie/frontend && npm run build
```
