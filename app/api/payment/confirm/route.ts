import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { users, quotes, orders } from '@/lib/store';
import { Order } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { userId, quoteId, password } = await req.json();

    if (!userId || !quoteId || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user exists
    const user = users.get(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json({ error: 'No payment password set' }, { status: 400 });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: 'Incorrect payment password' }, { status: 401 });
    }

    // Verify quote exists and not expired
    const quote = quotes.get(quoteId);
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (Date.now() > quote.expiresAt) {
      quotes.delete(quoteId);
      return NextResponse.json({ error: 'Quote has expired. Please create a new quote.' }, { status: 400 });
    }

    if (quote.userId !== userId) {
      return NextResponse.json({ error: 'Quote does not belong to this user' }, { status: 403 });
    }

    // Verify user has stored card
    if (user.cards.length === 0) {
      return NextResponse.json({ error: 'No payment method on file' }, { status: 400 });
    }

    const defaultCard = user.cards.find(c => c.isDefault) || user.cards[0];

    // Process payment with Stripe
    let paymentIntent;
    if (process.env.STRIPE_SECRET_KEY && user.stripeCustomerId && defaultCard.stripePaymentMethodId) {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(quote.total * 100), // Convert to cents
          currency: 'usd',
          customer: user.stripeCustomerId,
          payment_method: defaultCard.stripePaymentMethodId,
          off_session: true,
          confirm: true,
          description: `Order for ${quote.items.length} item(s)`,
          metadata: {
            userId,
            quoteId,
            orderId: 'pending',
      stripePaymentIntentId: paymentIntent?.id
          }
        });

        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json({ 
            error: 'Payment processing failed',
            details: paymentIntent.status
          }, { status: 400 });
        }
      } catch (stripeError: any) {
        console.error('Stripe payment error:', stripeError);
        return NextResponse.json({ 
          error: 'Payment failed',
          details: stripeError.message 
        }, { status: 400 });
      }
    } else {
      // Simulation mode (for testing without Stripe)
      console.log('⚠️  Stripe not configured - simulating payment');
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Create order
    const order: Order = {
      id: uuidv4(),
      userId,
      items: quote.items,
      subtotal: quote.subtotal,
      shipping: quote.shipping,
      total: quote.total,
      shippingMethod: quote.shippingMethod,
      cardLast4: defaultCard.last4,
      status: 'processing',
      createdAt: Date.now(),
      deliveryAddress: user.defaultAddress || '123 Main St, City, State 12345'
    };

    orders.set(order.id, order);

    // Clean up quote
    quotes.delete(quoteId);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paidAmount: order.total,
      cardLast4: order.cardLast4,
      shipping: order.shippingMethod,
      items: order.items,
      deliveryAddress: order.deliveryAddress
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    }, { status: 500 });
  }
}
