# 🎯 Quick Demo Guide

Follow these steps to experience the complete AI checkout flow:

## Setup (One Time)

1. **Get Gemini API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in and create an API key
   - Copy the key

2. **Configure Environment**
   ```bash
   # Edit .env file and add:
   GEMINI_API_KEY=your_actual_key_here
   ```

3. **Start the App**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Demo Flow

### 1. Shopping (Home Page)
- Browse 8 tech products
- Click "Add" on several items (try 3-4 products)
- See cart count increase
- Click "Cart" button

### 2. Cart Review
- Adjust quantities with +/- buttons
- Remove unwanted items
- Click "Proceed to AI Checkout"

### 3. First-Time Setup (Checkout Page)

**A. Generate Payment Password**
- Modal appears: "Set Up Payment Password"
- Click "Generate Password"
- You'll get a 6-digit code like: **742951**
- **CRITICAL: Copy this password!** You need it to pay
- Check "I have saved this password"
- Click "Continue"

**B. Chat with AI Agent**

Try these conversations:

```
👤 "What's in my cart?"
🤖 [Agent lists your items]

👤 "I want to checkout with fast shipping"
🤖 [Agent confirms fast shipping preference]

👤 "Proceed with payment"
🤖 [Agent asks about card]
```

**C. Add Payment Card**
- When agent prompts, modal opens
- Enter test card:
  - Number: `4242424242424242`
  - Name: `John Doe`
  - Expiry: `12/25`
  - CVV: `123`
- Click "Save Card"

**D. Generate Quote**
- Agent creates quote showing:
  - Items (with prices)
  - Shipping: $12 (FASTEST) or $5 (CHEAPEST)
  - Total
- Review the quote card

**E. Confirm Payment**
- Click "Confirm & Pay" button
- Modal asks for payment password
- Enter your 6-digit password (e.g., `742951`)
- Click "Confirm Payment"
- Wait 800ms (simulated processing)

### 4. Order Confirmation
- Redirected to order page
- See order number, items, total
- View delivery details
- Status: "Processing"

## Advanced Features to Try

### Select Specific Items to Pay
1. In checkout, click "Pay SELECTED" button
2. Uncheck some items
3. Tell agent: "proceed with selected items"
4. Quote only includes checked items

### Try Different Shipping
```
👤 "Ship it cheap"
🤖 [Sets CHEAPEST shipping = $5]

👤 "Actually ship it fast"
🤖 [Sets FASTEST shipping = $12]
```

### Reset Password
```
👤 "I forgot my password, reset it"
🤖 [Agent guides to reset]
```

### Ask Questions
```
👤 "What's my total?"
👤 "Do you ship internationally?"
👤 "What payment methods do you accept?"
```

## Testing Different Scenarios

### Scenario 1: Quick Checkout
1. Add 2 items → Cart → Checkout
2. "proceed to checkout with cheap shipping"
3. Add card → Generate quote → Pay

### Scenario 2: Partial Payment
1. Add 5 items → Cart → Checkout
2. Click "Pay SELECTED"
3. Uncheck 2 items
4. "generate a quote for selected items"
5. Pay

### Scenario 3: Change Preferences
1. Start checkout
2. "ship everything fast"
3. "actually ship it cheap" (change mind)
4. "use my default card"
5. Generate quote → Pay

## Common Issues

### "GEMINI_API_KEY not configured"
- Check .env file exists
- Verify API key is correct
- Restart server

### "Quote has expired"
- Quotes expire after 10 minutes
- Ask agent to create new quote

### "Incorrect payment password"
- Make sure you're using the exact 6-digit password
- Use reset if forgotten

### Cart is empty at checkout
- Add items first
- Don't refresh page (cart is in localStorage)

## Tips for Best Experience

1. **Be natural with the agent**
   - "I'm ready to pay"
   - "What's my total with fast shipping?"
   - "Proceed with everything"

2. **Agent capabilities**
   - ✅ Understands preferences
   - ✅ Remembers conversation
   - ✅ Asks clarifying questions
   - ❌ Does NOT calculate prices (server does)

3. **Security**
   - Password is hashed with bcrypt
   - Only card last4 + brand stored
   - No real payment processing

4. **Data persistence**
   - Server: In-memory (resets on restart)
   - Browser: localStorage (survives refresh)

## What Makes This Special

### AI Agent Features
- **Structured JSON output** from Gemini
- **Intent-based planning** (not just chat)
- **Server-side validation** of AI responses
- **Safety rules** to prevent hallucination

### Security Design
- OTP-style password system
- bcrypt hashing
- Quote expiration
- Payment confirmation required

### User Experience
- Natural language interaction
- Flexible item selection
- Real-time cart updates
- Complete order tracking

---

Enjoy exploring the AI-powered checkout! 🚀
