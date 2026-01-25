import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'usd', customerId, paymentMethodId, description } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Stripe not configured' 
      }, { status: 500 });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description: description || 'E-commerce purchase',
      metadata: {
        integration: 'ai-checkout'
      }
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      }
    });

  } catch (error: any) {
    console.error('Stripe payment error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Payment failed',
      details: error.message,
      code: error.code
    }, { status: 400 });
  }
}
