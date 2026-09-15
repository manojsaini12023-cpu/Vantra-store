# VANTA — Premium Streetwear Web Application

This project is separated into two dedicated directories:
- **`client/`**: React + Vite frontend user interface
- **`server/`**: Node.js + Express backend API and persistent database

---

## 📁 Project Structure

```text
├── client/                     # Frontend
│   ├── public/                 # Static assets & product images
│   ├── src/                    # React components, pages & styles
│   ├── index.html              # Frontend entry HTML
│   ├── vite.config.js          # Vite configuration with API proxy
│   ├── .oxlintrc.json          # Oxlint linter rules
│   └── package.json            # Frontend dependencies (React 19, Vite, etc.)
│
├── server/                     # Backend
│   ├── data/                   # Persistent JSON storage & initial seeds
│   ├── src/                    # Express app, routes, auth & db controllers
│   │   ├── app.js              # Express app setup & route mounting
│   │   ├── db/                 # Database handlers (JSON store & MongoDB)
│   │   ├── routes/             # API routes (products, orders, payments, admin, etc.)
│   │   └── utils/              # Auth & token utilities
│   ├── server.js               # Backend entry point (starts on port 5000)
│   ├── test-suite.js           # Automated backend test suite
│   ├── .env                    # Server secrets & API keys
│   └── package.json            # Backend dependencies (Express, Cors, Mongoose, Dotenv)
│
├── package.json                # Root package coordinator (workspaces)
└── README.md
```

---

## 🚀 Quick Start

### 1. Install All Dependencies

From the project root:
```bash
npm install
```
*(Or install separately inside `client` and `server`)*

---

### 2. Running the Project

You can run both or either service from the root:

#### Run Both Frontend & Backend Concurrently:
```bash
npm run dev
```

#### Run Frontend Only:
```bash
npm run client
# Or: cd client && npm run dev
# Running on http://localhost:5173
```

#### Run Backend Only:
```bash
npm run server
# Or: cd server && npm run dev
# Running on http://localhost:5000
```

---

### 3. Build & Test Commands

- **Build Frontend**:
  ```bash
  npm run build
  # Or: cd client && npm run build
  ```

- **Run Automated Backend API Tests**:
  ```bash
  npm run test:api
  # Or: cd server && npm test
  ```

- **Run Linter**:
  ```bash
  npm run lint
  ```

---

## 🌐 Deployment

### Option 1: Full-Stack on Render (Single Free Web Service)
1. Push repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service** connected to your repo.
3. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables from `.env` (`NODE_ENV=production`, `MONGODB_URI`, payment keys, etc.).

### Option 2: Frontend on Vercel + Backend on Render
1. **Deploy Backend on Render**:
   - Create a Web Service for `server/` on Render.
   - Note your backend URL (e.g. `https://vanta-streetwear.onrender.com`).
2. **Deploy Frontend on Vercel**:
   - In `client/vercel.json`, replace `REPLACE_WITH_YOUR_RENDER_BACKEND_URL` with your Render backend URL.
   - Go to [Vercel](https://vercel.com) $\rightarrow$ Add New Project $\rightarrow$ Import your repo.
   - In **Project Settings**, set **Root Directory** to `client`.
   - Framework preset: `Vite`
   - Click **Deploy**.

