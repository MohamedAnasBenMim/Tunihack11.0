import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { quotes, getProduct } from '@/lib/store';
import { AgentIntent, Cart, Quote } from '@/lib/types';

const QUOTE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, intent, cart, uiSelection }: {
      userId: string;
      intent: AgentIntent;
      cart: Cart;
      uiSelection: { mode: 'ALL' | 'SELECTED'; selectedProductIds: string[] };
    } = body;

    if (!userId || !intent || !cart) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine which items to include
    const itemsToProcess = intent.itemsMode === 'SELECTED'
      ? cart.items.filter(item => uiSelection.selectedProductIds.includes(item.productId))
      : cart.items;

    if (itemsToProcess.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 });
    }

    // Calculate totals (SERVER IS SOURCE OF TRUTH)
    const quoteItems = itemsToProcess.map(item => {
      const product = getProduct(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      };
    });

    const subtotal = quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = intent.shippingPreference === 'FASTEST' ? 12 : 5;
    const total = subtotal + shipping;

    const now = Date.now();
    const quote: Quote = {
      id: uuidv4(),
      userId,
      items: quoteItems,
      subtotal,
      shipping,
      total,
      shippingMethod: intent.shippingPreference,
      createdAt: now,
      expiresAt: now + QUOTE_EXPIRY_MS
    };

    quotes.set(quote.id, quote);

    return NextResponse.json({ quote });
  } catch (error: any) {
    console.error('Quote creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create quote',
      details: error.message 
    }, { status: 500 });
  }
}
