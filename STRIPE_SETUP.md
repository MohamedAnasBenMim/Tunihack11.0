# Stripe Integration Setup Guide

## Step 1: Create Stripe Account & Get API Keys

1. **Sign Up**
   - Go to: https://dashboard.stripe.com/register
   - Create a free Stripe account (no credit card required for test mode)

2. **Get Your Test API Keys**
   - After logging in, click **Developers** in the left sidebar
   - Click **API keys**
   - You'll see two test keys:
     - **Publishable key**: `pk_test_...` (safe to use in frontend)
     - **Secret key**: `sk_test_...` (keep secure, backend only)
   - Click "Reveal test key" to see the secret key

3. **Add Keys to `.env` File**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

## Step 2: Test Cards

Stripe provides test cards for development. Use these:

| Card Number | Brand | Use Case |
|------------|-------|----------|
| 4242 4242 4242 4242 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 3782 822463 10005 | American Express | Success |
| 4000 0000 0000 9995 | Visa | Decline (insufficient funds) |
| 4000 0000 0000 0002 | Visa | Decline (card declined) |

**For all test cards:**
- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

## Step 3: How It Works

### Card Storage Flow
1. User enters card details in Stripe Elements (secure widget)
2. Stripe tokenizes the card → returns `PaymentMethod` ID
3. We save the PaymentMethod to Stripe Customer
4. Store only: Customer ID, PaymentMethod ID, last4, brand

### Payment Flow
1. User selects a stored card (or adds new one)
2. AI identifies which card to use based on conversation
3. Backend creates PaymentIntent with Stripe
4. Payment confirmed → Order complete

## Step 4: Features

✅ **Secure Card Storage** - Cards stored in Stripe, not our database
✅ **Multiple Cards** - Store unlimited cards per customer
✅ **Card Selection** - AI understands "use my Visa" or "use ending in 4242"
✅ **PCI Compliance** - Stripe handles all sensitive data
✅ **Test Mode** - Free testing with test cards
✅ **Production Ready** - Switch to live keys when ready

## Step 5: Going Live (Future)

When ready for production:
1. Complete Stripe account verification
2. Get live API keys (pk_live_... and sk_live_...)
3. Update `.env` with live keys
4. Test with real cards
5. Enable production mode

## Useful Links

- Stripe Dashboard: https://dashboard.stripe.com/
- Test Cards: https://stripe.com/docs/testing
- API Docs: https://stripe.com/docs/api
- Payment Methods: https://stripe.com/docs/payments/payment-methods
- Customer Management: https://stripe.com/docs/api/customers
