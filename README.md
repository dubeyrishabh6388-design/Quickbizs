# QuickBizs - Micro-POS for Indian Retail Shopkeepers

QuickBizs is a modern, mobile-first, and shopkeeper-first Point of Sale (POS) and inventory ledger application designed for retail micro-merchants (Dairy shops, Kirana stores, Sweet shops, Paan stalls, etc.).

---

## 📁 Project Structure

```
quickbizs/
├── frontend/                 # React 19 + Vite + Tailwind CSS Application
│   ├── src/                  # Application source code
│   │   ├── assets/           # UI graphics & icons
│   │   ├── config/           # Centralized Environment & Axios API Configuration
│   │   ├── components/       # Shared UI components & modals
│   │   ├── context/          # Business Context & State Management
│   │   ├── hooks/            # Custom React hooks
│   │   └── screens/          # Core POS and Ledger screens
│   ├── public/               # Static web assets & _redirects SPA rule
│   ├── package.json          # Frontend dependencies & scripts
│   ├── .env.example          # Frontend environment template
│   └── vite.config.ts        # Vite build configuration
│
├── backend/                  # Node.js + Express + Prisma 7 + Socket.IO API
│   ├── src/                  # Backend TypeScript services & controllers
│   │   ├── config/           # Dynamic Database Adapter & Environment
│   │   ├── controllers/      # API Request Handlers
│   │   ├── gateways/         # Socket.IO Real-time notification gateway
│   │   ├── middlewares/      # JWT Authentication & Error Handler
│   │   ├── routes/           # REST API Route definitions
│   │   ├── schedulers/       # Background notification & reminder jobs
│   │   ├── services/         # Core Business Logic Services
│   │   ├── utils/            # Winston/Morgan Logging & Formatters
│   │   ├── app.ts            # Express app, health checks & dynamic CORS
│   │   └── server.ts         # 0.0.0.0 host binding & server lifecycle
│   ├── prisma/               # Database Schema, Migrations & Seeds
│   ├── package.json          # Backend dependencies & scripts
│   ├── .env.example          # Backend environment template
│   └── tsconfig.json         # TypeScript configuration
│
├── render.yaml               # Declarative Blueprint for Render Cloud Deployment
├── .gitignore                # Production git ignore (secrets, dumps, dist)
└── README.md                 # Project Setup & Operational Manual
```

---

## ⚙️ Environment Setup

### 1. Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=QuickBizs
VITE_APP_ENV=development
```

### 2. Backend Configuration (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:@localhost:3307/quickbiz"
JWT_SECRET="quickbiz_jwt_super_secret_key_2026"
FRONTEND_URL=http://localhost:5173,http://localhost:5174
```

---

## 🚀 Running Locally

### Development URLs
* **Frontend Web App**: `http://localhost:5173` (or `http://localhost:5174`)
* **Backend API Service**: `http://localhost:5000`

### Frontend Commands (`cd frontend`)
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

### Backend Commands (`cd backend`)
```bash
# Install dependencies
npm install

# Push database schema & generate Prisma Client
npx prisma db push
npx prisma generate

# Start backend dev server
npm run dev

# Build TypeScript production code (generates client + compiles)
npm run build

# Start production server
npm run start
```

---

## ☁️ Render Deployment

QuickBizs is architected for zero-friction cloud deployment on [Render](https://render.com) using:
1. **Managed/External MySQL Database** (Render External Database, Aiven, PlanetScale, or Railway)
2. **Backend Web Service** (`backend/` Node.js runtime)
3. **Frontend Static Site** (`frontend/` React/Vite SPA)

You can either deploy using the automated `render.yaml` Blueprint or configure services manually in the Render Dashboard following the steps below.

---

### Step 1: Create & Configure the MySQL Database

1. Sign up or log into [Render](https://dashboard.render.com).
2. Provision a MySQL Database:
   * **Option A (Aiven for MySQL - Recommended for Free Tier)**: Create a free MySQL database on [Aiven.io](https://aiven.io), obtain your Service URI:
     ```
     mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED
     ```
   * **Option B (Railway MySQL / External MySQL)**: Create a MySQL database and copy the `MYSQL_URL` connection string.
3. Import the QuickBizs initial schema by running the following locally with your cloud connection string:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

---

### Step 2: Deploy the Backend Web Service

1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository (`Quickbizs`).
3. Configure the following service settings:
   * **Name**: `quickbizs-backend`
   * **Region**: Choose the region closest to your database (e.g., `Oregon` or `Frankfurt`).
   * **Branch**: `main`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
   * **Health Check Path**: `/health`
4. Configure **Environment Variables** under the service's **Environment** tab:

   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations & combined access logs |
   | `PORT` | `5000` | Port listened to by the Express server (bound to `0.0.0.0`) |
   | `DATABASE_URL` | `mysql://user:pass@host:port/dbname` | Full MySQL connection URI with SSL query parameters |
   | `JWT_SECRET` | *(Click "Generate" or enter 64-char string)* | Private key for signing authentication tokens |
   | `FRONTEND_URL` | `https://quickbizs-frontend.onrender.com` | Deployed Frontend URL for CORS & Socket.IO whitelist |
   | `GEMINI_API_KEY` | *(Optional)* | Google Gemini API Key for merchant AI assistant |
   | `GEMINI_MODEL` | `gemini-3.6-flash` | Gemini model variant |

5. Click **Create Web Service**. Wait for the build and deployment to complete.
6. Verify deployment by visiting `https://quickbizs-backend.onrender.com/health` in your browser. You should receive:
   ```json
   { "status": "ok", "database": "connected", "environment": "production" }
   ```

---

### Step 3: Deploy the Frontend Static Site

1. In Render Dashboard, click **New +** > **Static Site**.
2. Connect the same GitHub repository (`Quickbizs`).
3. Configure the static site settings:
   * **Name**: `quickbizs-frontend`
   * **Branch**: `main`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm install && npm run build`
   * **Publish Directory**: `dist`
4. Configure **Environment Variables**:

   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://quickbizs-backend.onrender.com` | Live backend URL (**no trailing slash**) |
   | `VITE_APP_NAME` | `QuickBizs` | Brand header title |
   | `VITE_APP_ENV` | `production` | Runtime mode |

5. **React Router & SPA Rewrite Verification**:
   The repository includes [`frontend/public/_redirects`](./frontend/public/_redirects) (`/* /index.html 200`). Render automatically detects this file in the `dist` publish directory, ensuring deep URLs and page refreshes never return 404s. Alternatively, you can verify Render's **Redirects/Rewrites** tab has:
   * **Type**: `Rewrite`
   * **Source**: `/*`
   * **Destination**: `/index.html`
6. Click **Create Static Site**.

---

### Step 4: Finalize CORS Configuration

1. Copy your live Frontend URL (e.g., `https://quickbizs-frontend.onrender.com`).
2. Go back to your **Backend Web Service** > **Environment**.
3. Update `FRONTEND_URL` to match your live frontend URL:
   ```
   FRONTEND_URL=https://quickbizs-frontend.onrender.com
   ```
4. Render will automatically redeploy the backend with the new CORS origin active.

---

### 📂 File Upload Considerations

QuickBizs stores all product information, customer profiles, barcodes, and ledger transactions directly inside MySQL database records (and handles images via secure CDN/external image URLs).
* **Render Ephemeral Filesystem**: Render Web Services run on ephemeral disks, meaning files written directly to local folders would be lost on service restarts or scale events.
* **Production Recommendation**: Because QuickBizs avoids local filesystem file storage, you do not need third-party S3 or Cloudinary buckets for core operations. If user avatar uploads or invoice PDF uploads are introduced in the future, use AWS S3, Cloudinary, or Supabase Storage with presigned upload URLs.

---

### 🔄 Automatic Redeployment After GitHub Push

Both the Frontend and Backend services have `autoDeploy: true` enabled by default:
1. When you commit and push to `main` (`git push origin main`):
   * Render detects the push via GitHub Webhooks.
   * If files in `backend/` changed, Render triggers a backend container build.
   * If files in `frontend/` changed, Render triggers a static site build.
2. Zero downtime: Render starts the new version in the background, waits for the `/health` check to pass, and gracefully swaps traffic before shutting down the old container.

---

### 🛠️ Troubleshooting Common Render Errors

#### 1. Backend Port Binding (`Port Scan Timeout`)
* **Symptom**: Render logs show `Timed out waiting for port 5000 to be open`.
* **Fix**: Ensure `server.listen(PORT, "0.0.0.0")` is used. QuickBizs is already configured to bind to `0.0.0.0`.

#### 2. CORS Blocked (`Access-Control-Allow-Origin Missing`)
* **Symptom**: Browser console shows `CORS error: No 'Access-Control-Allow-Origin' header is present`.
* **Fix**: Check `FRONTEND_URL` in the backend environment variables. Ensure it matches your exact frontend URL without a trailing slash (e.g., `https://quickbizs-frontend.onrender.com`).

#### 3. Database Connection Failure on Startup (`ETIMEDOUT` / `ECONNREFUSED`)
* **Symptom**: Backend crashes on boot with `PrismaClientInitializationError`.
* **Fix**:
  * Verify `DATABASE_URL` is configured in the Backend Environment Variables on Render.
  * Ensure the database host allows connections from all IP addresses (`0.0.0.0/0`) or has public network access enabled in your cloud database provider settings.
  * If using SSL, verify that `?ssl={"rejectUnauthorized":false}` or `?ssl-mode=REQUIRED` is appended to the connection string.

#### 4. Frontend Blank Screen / API 404
* **Symptom**: Frontend loads but queries fail or return 404.
* **Fix**: Verify `VITE_API_URL` was set **before** building the frontend (Vite bakes environment variables into JavaScript bundle during the build step). If you change `VITE_API_URL`, trigger a **Manual Deploy > Clear build cache & deploy** on the frontend static site.
