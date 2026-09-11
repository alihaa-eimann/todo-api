# FlyRank Auth API

A secure authentication API built with Node.js, Express, and Supabase Auth. Supports user signup, login, logout, and protected routes using JWT verification.

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase values:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_KEY` — your Supabase anon public key

## Run

```bash
node index.js
```

## Endpoints

| Method | Route | Auth Required | Status Codes |
|--------|-------|--------------|-------------|
| POST | /auth/signup | No | 201, 400 |
| POST | /auth/login | No | 200, 400, 401 |
| POST | /auth/logout | Bearer token | 204, 401 |
| GET | /public/info | No | 200 |
| GET | /protected/profile | Bearer token | 200, 401 |
| GET | /protected/dashboard | Bearer token | 200, 401 |

## Swagger UI

Visit `http://localhost:3000/docs` — click **Authorize**, paste your JWT from `/auth/login`, then try any protected route.

![Swagger UI](swagger-screenshot.png)