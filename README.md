# ⚡ VaultPay — Nigeria's Fastest VTU Platform

A production-ready Next.js 14 fintech application for buying airtime, data bundles, and managing a secure digital wallet in Nigeria.

---

## 📁 Project Structure

```
vaultpay/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout + fonts
│   │   ├── page.tsx                ← Mounts VaultPay component
│   │   ├── globals.css             ← Global styles + Tailwind
│   │   └── api/
│   │       ├── paystack/
│   │       │   └── webhook/route.ts  ← Paystack webhook handler
│   │       └── vtu/
│   │           ├── airtime/route.ts  ← Airtime purchase endpoint
│   │           └── data/route.ts     ← Data bundle endpoint
│   ├── components/
│   │   └── VaultPay.tsx            ← Full app UI (splash → auth → dashboard)
│   ├── lib/
│   │   ├── supabase.ts             ← Supabase client + types
│   │   ├── paystack.ts             ← Paystack signature verification
│   │   └── vtu.ts                  ← VTU.ng API calls
│   └── types/
│       └── index.ts                ← Shared TypeScript types
├── supabase-schema.sql             ← Run once in Supabase SQL Editor
├── .env.example                    ← Copy to .env.local and fill in
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Part 1 — Push to GitHub

### Step 1: Create a GitHub repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `vaultpay`
3. Set to **Private** (this has API keys structure)
4. **Do NOT** tick "Add README" or "Add .gitignore" — you already have them
5. Click **Create repository**

### Step 2: Initialise Git and push

Open your terminal (or Command Prompt / Git Bash on Windows):

```bash
# Navigate to the project folder
cd path/to/vaultpay

# Initialise Git
git init

# Stage all files
git add .

# First commit
git commit -m "feat: initial VaultPay project scaffold"

# Add your GitHub repo as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/vaultpay.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub.

---

## 💻 Part 2 — Open in VSCode

### Option A — Clone directly in VSCode (recommended)

1. Open **VSCode**
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: **Git: Clone**
4. Paste your repo URL: `https://github.com/YOUR_USERNAME/vaultpay.git`
5. Choose a folder on your machine
6. Click **Open** when VSCode asks

### Option B — Open existing folder

If you already have the folder locally:
```
File → Open Folder → select the vaultpay folder
```

---

## ⚙️ Part 3 — Local Setup in VSCode

### Step 1: Open the integrated terminal
```
Terminal → New Terminal  (or Ctrl + `)
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create your environment file
```bash
# Windows
copy .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

Then open `.env.local` in VSCode and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
VTU_API_KEY=your-vtu-ng-key
VTU_BASE_URL=https://api.vtu.ng/v1
VTU_USERNAME=your-username
```

### Step 4: Set up Supabase database
1. Go to [supabase.com](https://supabase.com) → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase-schema.sql` from VSCode, copy everything, paste and **Run**
5. You'll see all tables, functions, and RLS policies created

### Step 5: Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔌 Part 4 — Wire Real APIs (replace mock logic)

The UI is complete. The only thing left is replacing the `sleep()` simulations in `VaultPay.tsx` with real API calls.

### Replace airtime purchase (in `AirtimeModal`):

```typescript
// BEFORE (mock)
await sleep(2200);
const ok = Math.random() > 0.2;

// AFTER (real)
const res = await fetch("/api/vtu/airtime", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: user.id,   // from Supabase auth
    network,
    phone,
    amount: +amount,
  }),
});
const data = await res.json();
const ok = data.success;
```

### Replace wallet funding (in `FundModal`):

```typescript
// AFTER — use real Paystack Popup SDK
// 1. npm install @paystack/inline-js
// 2. Replace handlePay():

import PaystackPop from "@paystack/inline-js";

const handlePay = () => {
  const popup = new PaystackPop();
  popup.newTransaction({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email: user.email,
    amount: +amount * 100,  // kobo
    metadata: { user_id: user.id },
    onSuccess: (transaction) => {
      // Webhook will credit wallet automatically
      addToast("success", "Payment received!", "Wallet will update shortly");
      onClose();
    },
    onCancel: () => addToast("info", "Payment cancelled"),
  });
};
```

---

## 🌐 Part 5 — Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow the prompts)
vercel

# On first deploy it will ask:
# - Link to existing project? No → create new
# - Project name: vaultpay
# - Framework: Next.js (auto-detected)
```

Then add your environment variables in **Vercel Dashboard → Project → Settings → Environment Variables**.

### Add Paystack webhook URL in Paystack Dashboard:
```
https://your-app.vercel.app/api/paystack/webhook
```

---

## 🔐 Security Checklist Before Going Live

- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used in API routes, never in components
- [ ] RLS enabled on all tables (see `supabase-schema.sql`)
- [ ] Paystack webhook signature verified on every request
- [ ] Zod validation on all API route inputs
- [ ] Add rate limiting: `npm install @upstash/ratelimit @upstash/redis`

---

## 🛠️ Recommended VSCode Extensions

Install these for the best experience:

| Extension | Purpose |
|-----------|---------|
| **ES7+ React/Redux/React-Native snippets** | React shorthand snippets |
| **Tailwind CSS IntelliSense** | Tailwind class autocomplete |
| **Prettier** | Auto-format on save |
| **ESLint** | Catch errors as you type |
| **GitLens** | Supercharged Git in VSCode |
| **Thunder Client** | Test your API routes in VSCode |

Install all at once in VSCode terminal:
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension eamodio.gitlens
```

---

## 📱 Responsive Breakpoints

| Screen | Layout |
|--------|--------|
| `< 768px` (mobile) | Bottom nav + slide-in drawer + card list view |
| `≥ 768px` (tablet/desktop) | Collapsible sidebar + table view |

---

## 🔄 Daily Git Workflow (in VSCode)

```bash
# Pull latest changes before starting work
git pull

# After making changes — stage, commit, push
git add .
git commit -m "feat: your change description"
git push
```

Or use VSCode's built-in **Source Control** panel (the branch icon in the left sidebar) — click `+` to stage, type a message, and click the ✓ checkmark to commit and sync.

---

## 📞 VTU Provider Options

| Provider | Website | Notes |
|----------|---------|-------|
| **VTU.ng** | vtu.ng | Most popular, good docs |
| **Clubkonnect** | clubkonnect.com | Competitive rates |
| **Datastationng** | datastationng.com | Reliable uptime |

Sign up → get API key → paste in `.env.local`

---

Built with Next.js 14, Supabase, Paystack & VTU.ng
