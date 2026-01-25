# 🛍️ AI-Powered E-commerce Checkout

Chat naturally with an AI to complete your purchase—no forms, just conversation!

## What Is This?

A modern checkout where you **talk to an AI assistant** instead of filling out forms. Say "I'm ready to checkout" or "Use my Visa" and the AI handles the rest.

**Tech Stack:** Next.js 15 + React 18+ + TypeScript + Groq AI (Llama 3.3) + Stripe Payments

## ✨ Features

- 🤖 **AI Chat** - Natural conversation, understands context
- 💳 **Stripe Integration** - Real payment processing with test cards
- 🔐 **Secure** - 6-digit payment password
- 🛒 **Smart Cart** - Add products, select items, auto-calculate totals

## 🚀 Setup 

**Requirements:**
- Node.js 18+
- Free Groq API key
- Free Stripe test account

**1. Install**
```bash
npm install
```

**2. Get API Keys**

- **Groq:** https://console.groq.com/ → Create API Key (starts with `gsk_`)
- **Stripe:** https://dashboard.stripe.com/register → Developers → API keys
  - Copy Publishable key (`pk_test_...`)
  - Copy Secret key (`sk_test_...`)

**3. Configure `.env` file**
```bash
GROQ_API_KEY=gsk_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

**4. Run**
```bash
npm run dev
```
Open **http://localhost:3001**

## 🎮 How to Use

### 1. Browse Products
- View 8 IT products (keyboards, monitors, laptops, etc.)
- Click "Add to Cart" on items you want

### 2. Go to Checkout
- Click shopping cart icon
- Click "Proceed to Checkout"

### 3. Chat with AI Assistant
Try saying:
- **"Hi"** - Get welcomed
- **"Who are you?"** - Learn about the AI
- **"What's in my cart?"** - See your items
- **"I want to add a card"** - Add payment method
- **"I'm ready to checkout"** - Start payment process

### 4. Add Payment Card

When the AI shows the card form, use these **test cards**:

| Card Number | Brand | Result |
|------------|-------|--------|
| 4242 4242 4242 4242 | Visa | ✅ Success |

1. **Browse & Add to Cart** - Click products you want
2. **Go to Checkout** - Click cart icon
3. **Chat with AI** - Try these:
   - "Hi" / "What's in my cart?"
   - "I want to add a card"
   - "I'm ready to checkout"
4. **Add Card** - Use test card: **4242 4242 4242 4242**
   - Exp: 12/34, CVC: 123, ZIP: 12345
5. **Complete Purchase** - Get quote → Set password → Pay
```

## 🛡️ Security

- ✅ Cards stored with Stripe
- ✅ 6-digit payment password required
- ✅ Encrypted with bcrypt
- ✅ Test mode safe—all transactions free


