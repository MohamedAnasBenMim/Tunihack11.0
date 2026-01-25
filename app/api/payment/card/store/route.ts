import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/store';

// Detect card brand from card number
function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s+/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  return 'Unknown';
}

export async function POST(req: NextRequest) {
  try {
    const { userId, cardNumber, cardHolder, expiry, cvv } = await req.json();

    if (!userId || !cardNumber || !cardHolder || !expiry || !cvv) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = users.get(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if Adyen is configured
    const adyenApiKey = process.env.ADYEN_API_KEY;
    const adyenMerchant = process.env.ADYEN_MERCHANT_ACCOUNT;
    const useAdyen = adyenApiKey && adyenApiKey !== 'your_adyen_api_key_here' && adyenMerchant;

    let paymentMethodToken = null;
    const last4 = cardNumber.replace(/\s+/g, '').slice(-4);
    const brand = detectCardBrand(cardNumber);

    if (useAdyen) {
      // Integrate with Adyen to tokenize the card
      const [expiryMonth, expiryYear] = expiry.split('/');
      
      try {
        const response = await fetch('https://checkout-test.adyen.com/v71/paymentMethods/store', {
          method: 'POST',
          headers: {
            'X-API-Key': adyenApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            merchantAccount: adyenMerchant,
            paymentMethod: {
              type: 'scheme',
              number: cardNumber.replace(/\s+/g, ''),
              expiryMonth: expiryMonth.padStart(2, '0'),
              expiryYear: '20' + expiryYear,
              holderName: cardHolder,
              cvc: cvv
            },
            shopperReference: userId
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Adyen error:', error);
          return NextResponse.json({ 
            error: 'Adyen tokenization failed',
            details: error.message || 'Unknown error'
          }, { status: 400 });
        }

        const data = await response.json();
        paymentMethodToken = data.storedPaymentMethodId;

        console.log('✅ Adyen token created:', paymentMethodToken);
      } catch (error: any) {
        console.error('Adyen error:', error);
        return NextResponse.json({ 
          error: 'Failed to tokenize card with Adyen',
          details: error.message 
        }, { status: 500 });
      }
    }

    // Store card info (mark as default if it's the first card)
    const isDefault = user.cards.length === 0;
    user.cards.push({
      last4,
      brand,
      isDefault,
      ...(paymentMethodToken && { adyenToken: paymentMethodToken })
    });

    users.set(userId, user);

    return NextResponse.json({
      success: true,
      card: { last4, brand, isDefault },
      ...(paymentMethodToken && { tokenized: true, adyenToken: paymentMethodToken })
    });
  } catch (error: any) {
    console.error('Card storage error:', error);
    return NextResponse.json({ 
      error: 'Failed to store card',
      details: error.message 
    }, { status: 500 });
  }
}
