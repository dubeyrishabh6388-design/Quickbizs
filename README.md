# QuickBizs - Micro-POS for Indian Retail Shopkeepers

QuickBizs is a modern, mobile-first, and shopkeeper-first Point of Sale (POS) and inventory ledger application designed for retail micro-merchants (Dairy shops, Kirana stores, Sweet shops, Paan stalls, etc.).

---

## 📁 Project Structure

```
quickbizs/
├── frontend/                 # React 18 + Vite + Tailwind CSS Application
│   ├── src/                  # Application source code
│   │   ├── config/env.ts     # Centralized Environment Configuration
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # State management providers
│   │   └── screens/          # Core POS and Ledger screens
│   ├── public/               # Static web assets & icons
│   ├── package.json          # Frontend dependencies & scripts
│   ├── .env                  # Development environment variables
│   ├── .env.example          # Environment template
│   └── vite.config.ts        # Vite build configuration
│
├── backend/                  # Node.js + Express + Prisma ORM + Socket.IO API
│   ├── src/                  # Backend TypeScript services & controllers
│   │   ├── config/           # Environment & database connections
│   │   ├── controllers/      # API Request Handlers
│   │   ├── services/         # Core Business Logic Services
│   │   └── server.ts         # Server bootstrapper & websocket listener
│   ├── prisma/               # Database Schema & Migrations
│   ├── package.json          # Backend dependencies & scripts
│   ├── .env                  # Development secrets & DB URL
│   ├── .env.example          # Environment template
│   └── tsconfig.json         # TypeScript configuration
└── README.md                 # Project Setup & Operational Manual
```

---

## ⚙️ Environment Setup

### 1. Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=QuickBizs
VITE_APP_ENV=development

# Production URL (enable later)
# VITE_API_URL=https://api.quickbizs.com
```

### 2. Backend Configuration (`backend/.env`)
```env
PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/quickbiz"
JWT_SECRET="quickbiz_jwt_super_secret_key_2026"
FRONTEND_URL=http://localhost:5173

# Production URLs (enable later)
# FRONTEND_URL=https://quickbizs.com
# DATABASE_URL=mysql://production-db-url
```

---

## 🚀 Running locally

### Development URLs
* **Frontend Web App**: `http://localhost:5173`
* **Backend API Service**: `http://localhost:5000`

### Production URLs (Configured for Deployment)
* **Frontend Web App**: `https://quickbizs.com`
* **Backend API Service**: `https://api.quickbizs.com`

---

## 🛠️ Commands

### Frontend Commands (`cd frontend`)
```bash
# Install dependencies
npm install

# Start local dev server (port 5173)
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

# Start backend dev server (port 5000)
npm run dev

# Build TypeScript production code
npm run build

# Start production server
npm run start
```
