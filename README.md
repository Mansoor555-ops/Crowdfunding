# FundRise Crowdfunding Platform

FundRise is a premium, production-grade crowdfunding platform built on the MERN stack (MongoDB, Express, React, Node.js). Rather than a generic marketplace aesthetic, FundRise applies a warm-linen, violet-dispatch editorial design system using Framer Motion animations, Recharts analytics, and real-time live connections.

---

## 🎨 UI/UX Design System — "Warm-Linen Violet Dispatch"

We follow a strict editorial layout philosophy:
* **Background Linen**: `#FAF5F1` (90%+ dominant page color, never pure white/stark grey)
* **Surface Cards**: `#FFFFFF` (32px card radius, drop-shadow profiles)
* **Near-Black Ink**: `#1A182B` (used for all body copy and primary button fills)
* **Accent Violet**: `#6E47FF` (used for key interactive highlights)
* **Accent Peach**: `#FFBB98` (used in radial gradients and progress meters)
* **Display Headlines**: Styled with tight grotesque spacing (`-0.06em` tracking, `1.1` line height)
* **Pill Geometry**: Primary, secondary, and navbar buttons are geometrically distinct full-pills (`9999px` radius).

---

## 🚀 Key Features

1. **User Authentication**: Secure email registration and sign-in utilizing hashed passwords (`bcryptjs`) and JWT access tokens (15m expiration) + rotation-based refresh tokens (7d expiration).
2. **Dynamic Role Toggles**: Seamless registration focus selection supporting Campaign Creators and Backers.
3. **Campaign CRUD Builder**: Multi-step project launcher wizard creating categories, funding goal milestones, dates, and cover images with automated URL slugification.
4. **Interactive discovery Grid**: Clean listing browser equipped with text searches, category tags, and newest/trending/ending-soon sort triggers.
5. **Real-time Live Feeds**: Connected Socket.io room connections (`join-campaign`) that instantly push successful backing events onto details pages and trigger confetti blasts.
6. **Simulated Escrow Payouts**: Creators can request mock funds withdrawals which process through compliance checkers and settle to checking accounts.
7. **Compliance Admin Moderation**: Administrators can access the `/admin` moderation center to approve draft campaigns or cancel/flag inappropriate listings.

---

## 🛠️ Tech Stack & Directory Structure

### **Backend (`/backend`)**
* **Runtime**: Node.js & Express.js
* **Database**: MongoDB & Mongoose
* **Middlewares**: `helmet` (header security), `cors` (credentials support), `express-rate-limit` (auth security rate limiter)
* **Realtime**: Socket.io

### **Frontend (`/frontend`)**
* **Tooling**: React (Vite)
* **Styling**: Tailwind CSS v4 & Framer Motion
* **Analytics**: Recharts
* **Forms & Schema**: Zod & React Hook Form
* **Animations**: Canvas Confetti

---

## 💻 Local Quickstart

### **1. Install Dependencies**
Install packages in both workspace folders:
```bash
# In backend workspace
cd backend
npm install

# In frontend workspace
cd ../frontend
npm install
```

### **2. Setup Environment Keys**

Create a `.env` file in the `/backend` folder:
```env
PORT=5000
# Connect to local MongoDB instance or MongoDB Atlas Cloud cluster
MONGO_URI=mongodb://127.0.0.1:27017/fundrise
# Example Atlas Cloud URI:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fundrise?retryWrites=true&w=majority

JWT_ACCESS_SECRET=super_secret_access_token_key_123456
JWT_REFRESH_SECRET=super_secret_refresh_token_key_123456
CLOUDINARY_CLOUD_NAME=mock_cloud_name
CLOUDINARY_API_KEY=mock_api_key
CLOUDINARY_API_SECRET=mock_api_secret
STRIPE_SECRET_KEY=sk_test_mock_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file in the `/frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### **3. Launch Real MongoDB & Development Servers**

* **Option A — Local MongoDB**: Ensure `mongod` service is running locally on port `27017` (`net start MongoDB` or `mongod`).
* **Option B — MongoDB Atlas**: Paste your cloud connection string into `MONGO_URI` in `backend/.env`.

Run the backend Express server:
```bash
cd backend
npm run dev
```

Run the frontend Vite client:
```bash
cd ../frontend
npm run dev
```

Access `http://localhost:5173` in your browser.

---

## 🔌 API Endpoints Reference

### **Authentication (`/api/auth`)**
* `POST /register` — Create account with role toggle (`creator` or `donor`)
* `POST /login` — Validate credentials and receive JWT access/refresh tokens
* `POST /refresh` — Rotate expired access tokens
* `POST /logout` — Wipes refresh token session
* `GET /profile` — Fetch authenticated profile metadata

### **Campaigns (`/api/campaigns`)**
* `POST /` — Create campaign (Requires auth)
* `GET /` — Browse campaigns (supports `?search=`, `?category=`, `?sort=`, `?page=`)
* `GET /:slug` — Resolve single campaign details by slug
* `PUT /:id` — Update campaign details (Requires creator auth)
* `POST /:id/updates` — Publish text/image progress updates (Requires creator auth)
* `GET /:id/updates` — Retrieve campaign updates timeline

### **Donations (`/api/donations`)**
* `POST /intent` — Initiate Checkout PaymentIntent (Stripe connection or mock fallback)
* `POST /webhook` — Stripe webhook receiver for transaction statuses
* `POST /mock-confirm` — Simulate Stripe hook transaction completion in development
* `GET /my-donations` — Fetch backing history ledger (Requires auth)
* `GET /campaign/:id` — Fetch donor backing list for specific campaign
