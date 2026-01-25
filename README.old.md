
# AI-Powered E-Commerce Checkout Demo

A complete working demonstration of an **AI-driven checkout experience** using Groq as the intelligent agent. This project showcases agentic AI in e-commerce, allowing customers to interact naturally with an AI assistant to complete their purchases.

## 🌟 Features

### Core Functionality
- ✅ **Product Browsing**: Browse and add items to cart
- ✅ **Agentic Checkout**: Natural language interaction with AI agent
- ✅ **Smart Quote Generation**: AI plans order based on user preferences
- ✅ **OTP Payment Password**: Secure one-time password system
- ✅ **Card Management**: Simulated card storage with Checkout.com-style widget
- ✅ **Order Tracking**: Complete order confirmation and status pages

### AI Agent Capabilities
The Gemini-powered agent can:
- Understand natural language requests
- Plan checkout flow based on user preferences
- Determine shipping preferences (cheapest vs fastest)
- Select payment methods
- Handle cart selection (all items vs selected items)
- Answer questions about the order
- **Never calculates prices** (server is source of truth)

### Security Features
- 6-digit OTP-style payment password
- Password generated once and hashed with bcrypt
- Password reset functionality
- Simulated secure card storage (only last4 + brand stored)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A free Google Gemini API key

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Demo Walkthrough

### Step 1: Browse Products
- View the IT store product catalog
- Add items to your cart (MacBook, Monitor, Keyboard, etc.)
- See cart count update in real-time

### Step 2: View Cart
- Navigate to `/cart` to review items
- Adjust quantities or remove items
- Click "Proceed to AI Checkout"

### Step 3: Set Up Payment Password (First Time Only)
- On first checkout visit, you'll be prompted to generate a payment password
- Click "Generate Password"
- **SAVE THIS PASSWORD!** You'll need it to complete payments
- Example password: `742951`

### Step 4: Interact with AI Agent
The AI agent understands various requests:

**Example Conversations:**
```
You: "What's in my cart?"
Agent: Lists your items and asks how to proceed

You: "Proceed with checkout, ship it fast"
Agent: Sets shipping to FASTEST and prepares quote

You: "I want to pay for everything"
Agent: Confirms all items selected

You: "Generate a quote"
Agent: Creates quote with totals (calculated by server)
```

### Step 5: Add Payment Card (If Not Saved)
- Agent will prompt if no card is saved
- Enter card details:
  - Card Number: `4242424242424242` (test Visa)
  - Name: Your name
  - Expiry: `12/25`
  - CVV: `123`

### Step 6: Review Quote & Pay
- Agent generates quote with:
  - Selected items
  - Shipping method (CHEAPEST: $5, FASTEST: $12)
  - Total amount
- Click "Confirm & Pay"
- Enter your 6-digit payment password
- Payment processes and order is created

### Step 7: Order Confirmation
- View order details
- See order status (Processing → Shipped → Delivered)
- Get order number and delivery information

## 🏗️ Project Structure

```
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── user/
│   │   │   ├── init/          # Initialize user session
│   │   │   └── state/         # Get user state
│   │   ├── security/
│   │   │   └── password/
│   │   │       ├── generate/  # Generate payment password
│   │   │       └── reset/     # Reset password
│   │   ├── agent/
│   │   │   └── plan/          # Gemini agent planning
│   │   ├── quote/
│   │   │   └── create/        # Create price quote
│   │   ├── payment/
│   │   │   ├── card/store/    # Store card
│   │   │   └── confirm/       # Confirm payment
│   │   └── order/
│   │       └── get/           # Get order details
│   ├── page.tsx               # Home page (products)
│   ├── cart/page.tsx          # Shopping cart
│   ├── checkout/page.tsx      # AI checkout interface
│   ├── order/[id]/page.tsx    # Order confirmation
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── lib/
│   ├── types.ts               # TypeScript type definitions
│   └── store.ts               # In-memory data stores
├── .env                       # Environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS config
└── package.json               # Dependencies
```

## 🎯 Key Implementation Details

### Gemini Integration
- Uses `@google/generative-ai` package
- Model: `gemini-1.5-flash`
- **Structured JSON output** via `responseMimeType: 'application/json'`
- Agent returns strict JSON schema with intent, preferences, and messages

### Data Persistence
- **Server-side**: In-memory `Map` objects for runtime state
  - Users, quotes, orders stored in memory
  - Quotes expire after 10 minutes
- **Client-side**: `localStorage` for resilience
  - User ID
  - Cart state
  - Saved card indicator

### Security Model
- Payment passwords hashed with bcrypt (10 rounds)
- Only card last4 + brand stored (no full card numbers)
- Quote IDs prevent replay attacks
- Password required for payment confirmation

### Agent Rules
The AI agent follows strict rules:
1. **Never calculates totals** - server computes all prices
2. **Validates cart items** - only works with actual cart contents
3. **Respects UI selection** - honors ALL vs SELECTED mode
4. **Requires card before proceeding** - enforces payment method
5. **Asks for missing information** - interactive gathering

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY
# Paste your API key when prompted
# Select Production

# Redeploy with env var
vercel --prod
```

## 🔧 Troubleshooting

### "GEMINI_API_KEY not configured"
- Make sure you created a `.env` file
- Verify the API key is correct
- Restart the dev server after adding the key

### Agent not responding
- Check browser console for errors
- Verify Gemini API key is valid
- Check network tab for failed requests

### Quote expired error
- Quotes expire after 10 minutes
- Ask agent to create a new quote

### Wrong password error
- Use the exact 6-digit password you saved
- If lost, click "Forgot password? Reset" in chat

## 🧪 Testing

### Test Cards
Use these card numbers for testing:
- Visa: `4242424242424242`
- Mastercard: `5555555555554444`

### Test Scenarios

1. **Full checkout flow**
   - Add items → Cart → Checkout → Generate password → Add card → Create quote → Pay

2. **Partial cart payment**
   - Add multiple items → Checkout → Switch to "Pay SELECTED" → Uncheck items → Proceed

3. **Shipping preferences**
   - Try "ship it cheap" vs "ship it fast"
   - Verify pricing: CHEAPEST=$5, FASTEST=$12

4. **Password reset**
   - Complete one order
   - Try to reset password
   - Verify old password no longer works

## 💡 Tips for Best Experience

1. **Be conversational with the agent**
   - "I want to checkout"
   - "Ship everything to me as fast as possible"
   - "What's my total?"

2. **Save your payment password**
   - Write it down or save in password manager
   - You need it for every purchase

3. **Check quote details**
   - Review items, shipping, and total before confirming

4. **Try different scenarios**
   - Pay for all items vs selected items
   - Different shipping speeds
   - Multiple cards (add another card)

## 📝 License

This is a demo project for educational purposes. Feel free to use and modify.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Next.js for the framework
- Tailwind CSS for styling

---

**Built with ❤️ as a demonstration of AI in e-commerce checkout flows**
