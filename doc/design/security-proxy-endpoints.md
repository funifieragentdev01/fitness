# Security: AI Proxy Endpoints

## Problem
`CONFIG.OPENAI_KEY` is exposed in the frontend `config.js`, visible to anyone via browser DevTools.
The `coach_session` endpoint returns the raw OpenAI API key in `data.api_key`.

## Solution
1. Create proxy endpoints in Funifier that forward requests to OpenAI with the key server-side
2. Frontend calls Funifier proxy → Funifier calls OpenAI → returns response
3. Remove `OPENAI_KEY` from `config.js` entirely
4. Fix `coach_session` to generate ephemeral key server-side

## Endpoints to Create

### `ai_chat` (POST)
- Input: `{ model, messages, max_tokens }`
- Server adds OpenAI key, calls `/v1/chat/completions`
- Returns OpenAI response

### `ai_vision` (POST)
- Same as `ai_chat` but allows vision models (gpt-4o, gpt-4o-mini with image_url)
- Input: `{ model, messages, max_tokens }`
- Server forwards to OpenAI

### `coach_ephemeral` (POST)
- Input: `{ player_id, instructions, tools, model, voice }`
- Server calls OpenAI `/v1/realtime/client_secrets` with API key
- Returns `{ client_secret }` (NOT the API key)

## Frontend Changes
- `AiService`: all `$http.post(OPENAI_API + '/chat/completions', ...)` → `$http.post(PUB_URL + '/ai_chat', ...)`
- `coach.js`: no longer receives `api_key` from `coach_session`; instead calls `coach_ephemeral` which returns the ephemeral key directly
- `config.js`: remove `OPENAI_KEY` and `OPENAI_API`

## Deployment
Run the curl commands in `deploy-proxy-endpoints.sh` to create the endpoints in Funifier.
