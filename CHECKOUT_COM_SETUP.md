# Checkout.com Integration Setup

## Overview
This project now supports **Checkout.com** for secure card tokenization in their sandbox environment.

## Features
- ✅ **Card Tokenization**: Securely tokenize cards via Checkout.com API
- ✅ **Automatic Detection**: Detects card brand (Visa, Mastercard, Amex)
- ✅ **Fallback Mode**: Works without Checkout.com (simulation mode)
- ✅ **Sandbox Testing**: Uses Checkout.com sandbox for testing

## Setup Instructions

### 1. Get Checkout.com Sandbox Account
1. Go to https://www.checkout.com/
2. Sign up for a **sandbox account** (free)
3. Navigate to **Settings** → **API Keys**
4. Copy your **Secret Key** (starts with `sk_sbox_...`)
5. Copy your **Public Key** (starts with `pk_sbox_...`)

### 2. Configure Environment Variables
Edit your `.env` file:

```bash
# Gemini API Key
GEMINI_API_KEY='your_gemini_key_here'

# Checkout.com Sandbox Keys
CHECKOUT_SECRET_KEY=sk_sbox_your_secret_key_here
CHECKOUT_PUBLIC_KEY=pk_sbox_your_public_key_here
```

### 3. Restart the Server
```bash
npm run dev
```

## Testing

### Test Cards (Checkout.com Sandbox)
Use these test cards in the checkout flow:

| Card Number | Brand | Result |
|------------|-------|--------|
| `4242 4242 4242 4242` | Visa | ✅ Success |
| `5436 0310 3060 6378` | Mastercard | ✅ Success |
| `3782 822463 10005` | Amex | ✅ Success |
| `4917 4800 0000 0000` | Visa | ❌ Decline |

- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Cardholder**: Any name

### How It Works

#### Without Checkout.com (Simulation Mode)
If `CHECKOUT_SECRET_KEY` is not configured or is the placeholder value:
- Card is stored locally with last4 and brand
- No external API calls
- Perfect for quick testing

#### With Checkout.com (Production-Ready)
If valid Checkout.com keys are configured:
1. Frontend sends full card details to `/api/payment/card/store`
2. Backend calls Checkout.com tokenization API
3. Checkout.com returns a secure token
4. Token is stored with card metadata
5. Original card number is never stored

## API Flow

### Card Storage Request
```javascript
POST /api/payment/card/store
{
  "userId": "user-uuid",
  "cardNumber": "4242424242424242",
  "cardHolder": "John Doe",
  "expiry": "12/25",
  "cvv": "123"
}
```

### Response (with Checkout.com)
```javascript
{
  "success": true,
  "card": {
    "last4": "4242",
    "brand": "Visa",
    "isDefault": true
  },
  "tokenized": true,
  "checkoutToken": "tok_xxxxxxxxxxxxx"
}
```

### Response (without Checkout.com)
```javascript
{
  "success": true,
  "card": {
    "last4": "4242",
    "brand": "Visa",
    "isDefault": true
  }
}
```

## Security Notes

### ✅ Best Practices Implemented
- Card numbers are **never stored** on the server
- Only last4 and brand are persisted
- Checkout.com tokens are stored for payment processing
- All communication happens over HTTPS in production
- CVV is **never stored** (sent only for tokenization)

### ⚠️ Important
- **Never commit** API keys to Git
- `.env` is in `.gitignore` by default
- Use **sandbox keys** for development
- Use **production keys** only in production environment

## Troubleshooting

### Error: "Checkout.com tokenization failed"
- Check your `CHECKOUT_SECRET_KEY` in `.env`
- Ensure you're using **sandbox** keys (start with `sk_sbox_`)
- Verify card number format (remove spaces)
- Check expiry format is correct (`MM/YY`)

### Cards Not Tokenizing
- Confirm `.env` file is loaded (restart server)
- Check terminal logs for Checkout.com API errors
- Try with test card `4242 4242 4242 4242`

### "User not found" Error
- This is due to dev server restart clearing in-memory data
- Refresh the page to create a new session
- For production, use a database (MongoDB, PostgreSQL)

## Next Steps

### For Production Deployment
1. Get **production** Checkout.com keys
2. Update `.env` with production keys
3. Add database for user/card persistence
4. Enable webhook notifications from Checkout.com
5. Implement 3D Secure for card verification

### Optional Enhancements
- Add support for saved payment methods
- Implement recurring payments
- Add card verification (CVV re-entry)
- Support for alternative payment methods (Apple Pay, Google Pay)

## Resources
- [Checkout.com Documentation](https://docs.checkout.com/)
- [Checkout.com Sandbox](https://www.checkout.com/sandbox)
- [Test Card Numbers](https://docs.checkout.com/testing/test-card-numbers)
- [API Reference](https://api-reference.checkout.com/)

---

**Status**: ✅ Ready to use with Checkout.com sandbox
**Cost**: Free for sandbox testing
**Security**: PCI-compliant tokenization
