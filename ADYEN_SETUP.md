# Adyen Integration Setup

## Overview
This project now supports **Adyen** for secure card tokenization and payment processing.

## Features
- ✅ **Card Tokenization**: Securely tokenize cards via Adyen API
- ✅ **Automatic Detection**: Detects card brand (Visa, Mastercard, Amex)
- ✅ **Fallback Mode**: Works without Adyen (simulation mode)
- ✅ **Test Environment**: Uses Adyen test environment for safe testing

## Setup Instructions

### 1. Get Adyen Test Account
1. Go to https://www.adyen.com/
2. Sign up for a **test account** (free)
3. Navigate to **Developers** → **API credentials**
4. Create or select an API credential
5. Copy your **API key**
6. Note your **Merchant Account** name

### 2. Configure Environment Variables
Edit your `.env` file:

```bash
# Gemini API Key
GEMINI_API_KEY='your_gemini_key_here'

# Adyen Test Credentials
ADYEN_API_KEY=your_adyen_api_key_here
ADYEN_MERCHANT_ACCOUNT=your_merchant_account_here
```

### 3. Restart the Server
```bash
npm run dev
```

## Testing

### Test Cards (Adyen Test Environment)
Use these test cards in the checkout flow:

| Card Number | Brand | 3DS | Result |
|------------|-------|-----|--------|
| `4111 1111 1111 1111` | Visa | No | ✅ Success |
| `5500 0000 0000 0004` | Mastercard | No | ✅ Success |
| `3700 0000 0000 002` | Amex | No | ✅ Success |
| `4000 0200 0000 0000` | Visa | Yes | ✅ Success with 3DS |
| `4000 3000 0000 0003` | Visa | No | ❌ Decline |

- **Expiry**: Any future date (e.g., `03/30`)
- **CVV**: Any 3 digits (e.g., `737`)
- **Cardholder**: Any name

### How It Works

#### Without Adyen (Simulation Mode - DEFAULT)
If `ADYEN_API_KEY` is not configured or is the placeholder value:
- Card is stored locally with last4 and brand
- No external API calls
- Perfect for quick testing
- **Currently active mode**

#### With Adyen (Production-Ready)
If valid Adyen credentials are configured:
1. Frontend sends full card details to `/api/payment/card/store`
2. Backend calls Adyen tokenization API (`/paymentMethods/store`)
3. Adyen returns a secure stored payment method token
4. Token is stored with card metadata
5. Original card number is never stored

## API Flow

### Card Storage Request
```javascript
POST /api/payment/card/store
{
  "userId": "user-uuid",
  "cardNumber": "4111111111111111",
  "cardHolder": "John Doe",
  "expiry": "03/30",
  "cvv": "737"
}
```

### Response (with Adyen)
```javascript
{
  "success": true,
  "card": {
    "last4": "1111",
    "brand": "Visa",
    "isDefault": true
  },
  "tokenized": true,
  "adyenToken": "8415736485721234"
}
```

### Response (without Adyen - Current)
```javascript
{
  "success": true,
  "card": {
    "last4": "1111",
    "brand": "Visa",
    "isDefault": true
  }
}
```

## Security Notes

### ✅ Best Practices Implemented
- Card numbers are **never stored** on the server
- Only last4 and brand are persisted
- Adyen tokens are stored for payment processing
- All communication happens over HTTPS in production
- CVV is **never stored** (sent only for tokenization)

### ⚠️ Important
- **Never commit** API keys to Git
- `.env` is in `.gitignore` by default
- Use **test credentials** for development
- Use **live credentials** only in production environment

## Troubleshooting

### Error: "Adyen tokenization failed"
- Check your `ADYEN_API_KEY` in `.env`
- Ensure you're using **test** API credentials
- Verify `ADYEN_MERCHANT_ACCOUNT` is correct
- Check card number format (remove spaces in code)
- Verify expiry format is correct (`MM/YY`)

### Cards Not Tokenizing
- Confirm `.env` file is loaded (restart server)
- Check terminal logs for Adyen API errors
- Try with test card `4111 1111 1111 1111`
- Verify API credentials have correct permissions

### "User not found" Error
- This is due to dev server restart clearing in-memory data
- Refresh the page to create a new session
- For production, use a database (MongoDB, PostgreSQL)

## Adyen API Endpoint Used

```
POST https://checkout-test.adyen.com/v71/paymentMethods/store
```

This endpoint tokenizes and stores payment methods for later use.

## Next Steps

### For Production Deployment
1. Get **live** Adyen API credentials
2. Update `.env` with live credentials
3. Change API endpoint to `https://checkout-live.adyen.com`
4. Add database for user/card persistence
5. Enable webhook notifications from Adyen
6. Implement 3D Secure authentication flow

### Optional Enhancements
- Add support for recurring payments
- Implement 3D Secure 2.0
- Add card verification (CVV re-entry)
- Support for alternative payment methods (Apple Pay, Google Pay, PayPal)
- Add support for multiple currencies
- Implement refunds and chargebacks

## Current Status

**Mode**: Simulation (Adyen integration ready but not configured)

To enable Adyen:
1. Get test credentials from Adyen
2. Update `.env` file
3. Restart server
4. Cards will automatically be tokenized via Adyen

To keep using simulation mode:
- Do nothing! The app works perfectly without Adyen
- Great for demos and testing

## Resources
- [Adyen Documentation](https://docs.adyen.com/)
- [Adyen Test Cards](https://docs.adyen.com/development-resources/testing/test-card-numbers)
- [API Reference](https://docs.adyen.com/api-explorer/)
- [Tokenization Guide](https://docs.adyen.com/online-payments/tokenization)

---

**Status**: ✅ Ready to use (Simulation mode active)
**Cost**: Free for testing
**Security**: PCI-compliant tokenization when enabled
