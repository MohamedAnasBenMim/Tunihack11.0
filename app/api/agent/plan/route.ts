import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { AgentPlanRequest, AgentIntent } from '@/lib/types';
import { getProduct } from '@/lib/store';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export async function POST(req: NextRequest) {
  let hasDefaultAddress = false;
  let storedCards: any[] = [];
  
  try {
    const body: AgentPlanRequest = await req.json();
    const { userId, message, cart, uiSelection } = body;
    hasDefaultAddress = body.hasDefaultAddress;
    storedCards = body.storedCards;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'GROQ_API_KEY not configured. Please add it to your .env file.' 
      }, { status: 500 });
    }

    // Build context for the agent
    const cartItems = cart.items
      .map(item => {
        const product = getProduct(item.productId);
        return product ? `- ${product.name} ($${product.price}) x${item.quantity}` : null;
      })
      .filter(Boolean)
      .join('\n');

    const selectedItemsContext = uiSelection.mode === 'SELECTED'
      ? `Selected items: ${uiSelection.selectedProductIds.join(', ')}`
      : 'All items selected';

    const cardsContext = storedCards.length > 0
      ? `Stored cards: ${storedCards.map(c => `${c.brand} ****${c.last4}${c.isDefault ? ' (default)' : ''}`).join(', ')}`
      : 'No stored cards';

    const addressContext = hasDefaultAddress
      ? 'User has a default address'
      : 'User needs to provide address';

    const systemPrompt = `You are a friendly AI checkout assistant powered by Groq (using Llama 3.3 70B model). Your role is to help users with their shopping experience and complete their purchase when they're ready.

PERSONALITY:
- Be conversational, friendly, and helpful
- Answer questions about yourself, your capabilities, and the checkout process
- Only mention missing requirements (cards, address) when user wants to proceed with checkout
- Don't be pushy - let the user lead the conversation

CONVERSATION GUIDELINES:
- If user asks who you are → Tell them you're an AI assistant powered by Groq's Llama 3.3 70B model, here to help with checkout
- If user asks about the cart → List items and total
- If user asks general questions → Answer naturally without pushing checkout
- If user says "proceed", "checkout", "buy", "pay" → THEN check for missing requirements (card, address)
- If user is just chatting → Be friendly and don't force them to add cards/address

Current context:
Cart items:
${cartItems}

${selectedItemsContext}
${cardsContext}
${addressContext}

RESPONSE FORMAT (JSON):
{
  "itemsMode": "ALL" or "SELECTED",
  "shippingPreference": "CHEAPEST" or "FASTEST",
  "addressChoice": "DEFAULT" or "ASK_USER",
  "cardChoice": "DEFAULT" or "ASK_USER" or {"last4": "1234"},
  "questions": [],
  "agentMessage": "Your conversational response"
}

CRITICAL WIDGET RULES:
- Set cardChoice to "ASK_USER" when:
  * User wants to proceed/checkout/buy AND no cards are stored (${storedCards.length === 0})
  * User explicitly says "add card", "save card", "show form", "where is the form"
- Set addressChoice to "ASK_USER" when:
  * User wants to proceed/checkout AND no default address (${!hasDefaultAddress})
  * User explicitly asks to add/change address
- For general conversation (greetings, questions, weather, etc.) → use "DEFAULT" for both
- Setting these to "ASK_USER" triggers UI widgets - do this when needed for checkout flow!

EXAMPLES:
User: "who are you?" → cardChoice: "DEFAULT", addressChoice: "DEFAULT", agentMessage: "I'm your AI checkout assistant, powered by Groq's Llama 3.3 70B model! 😊"
User: "how is the weather?" → cardChoice: "DEFAULT", addressChoice: "DEFAULT", agentMessage: "I'm not aware of the current weather, as I'm a checkout assistant..."
User: "yes I'm ready" AND no card → cardChoice: "ASK_USER", agentMessage: "Great! Let me help you checkout. First, I'll need you to add a payment card. Please fill out the form that just appeared on the left."
User: "where is the form" AND no card → cardChoice: "ASK_USER", agentMessage: "I've just opened the card form for you! You should see it on the left side. Fill in your card details and I'll help you complete the purchase."
User: "i want to add a credit card" → cardChoice: "ASK_USER", agentMessage: "Perfect! The card form is now visible on the left. Fill in your card details."
User: "proceed with checkout" AND has card → cardChoice: "DEFAULT", agentMessage: "Excellent! You have a card on file. I'll generate a quote for you now!"
User: "hi" → cardChoice: "DEFAULT", addressChoice: "DEFAULT", agentMessage: "Hello! 👋 I'm here to help you. You have ${cart.items.length} item(s) in your cart. Let me know when you're ready to checkout!"

IMPORTANT: Never calculate prices. Show widgets when user wants to checkout and is missing required info!`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const intent: AgentIntent = JSON.parse(responseText);

    // Validate the intent
    if (!intent.itemsMode || !intent.shippingPreference || !intent.agentMessage) {
      throw new Error('Invalid agent response structure');
    }

    return NextResponse.json({
      intent,
      success: true
    });

  } catch (error: any) {
    console.error('Agent error:', error);
    
    return NextResponse.json({
      error: 'Failed to process your request. Please try again.',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}