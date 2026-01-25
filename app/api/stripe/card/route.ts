import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// In-memory storage (replace with database in production)
const users = new Map();

export async function POST(req: NextRequest) {
  try {
    const { userId, paymentMethodId } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to .env' 
      }, { status: 500 });
    }

    // Get or create user
    let user = users.get(userId);
    if (!user) {
      user = { 
        id: userId, 
        cart: { items: [] }, 
        cards: [],
        stripeCustomerId: null 
      };
    }

    // Create Stripe customer if doesn't exist
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { userId }
      });
      user.stripeCustomerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Store card info
    const cardInfo = {
      id: paymentMethod.id,
      last4: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
      expMonth: paymentMethod.card?.exp_month,
      expYear: paymentMethod.card?.exp_year,
      isDefault: user.cards.length === 0, // First card is default
      stripePaymentMethodId: paymentMethod.id
    };

    user.cards.push(cardInfo);
    users.set(userId, user);

    return NextResponse.json({
      success: true,
      card: cardInfo,
      message: 'Card added successfully'
    });

  } catch (error: any) {
    console.error('Stripe card storage error:', error);
    return NextResponse.json({
      error: 'Failed to store card',
      details: error.message
    }, { status: 500 });
  }
}

// GET - Retrieve stored cards for a user
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const user = users.get(userId);
    if (!user) {
      return NextResponse.json({ cards: [] });
    }

    return NextResponse.json({
      cards: user.cards || [],
      customerId: user.stripeCustomerId
    });

  } catch (error: any) {
    console.error('Error retrieving cards:', error);
    return NextResponse.json({
      error: 'Failed to retrieve cards',
      details: error.message
    }, { status: 500 });
  }
}
