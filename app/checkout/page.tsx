'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, CreditCard, Lock, Check, Copy, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cart, Product, StoredCard, AgentIntent, Quote } from '@/lib/types';
import { getProduct } from '@/lib/store';
import { StripeCardForm } from '../components/stripe-card-form';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State management
  const [userId, setUserId] = useState<string>('');
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [selectionMode, setSelectionMode] = useState<'ALL' | 'SELECTED'>('ALL');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  
  // User state
  const [hasPassword, setHasPassword] = useState(false);
  const [storedCards, setStoredCards] = useState<StoredCard[]>([]);
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Quote
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  
  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  
  // Password setup
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  
  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Payment
  const [paymentPassword, setPaymentPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const storedCart = localStorage.getItem('cart');

        if (!storedCart || JSON.parse(storedCart).items.length === 0) {
          router.push('/cart');
          return;
        }

        // Try to reuse existing user ID, or create new one
        const storedUserId = localStorage.getItem('userId');
        
        const response = await fetch('/api/user/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: storedUserId })
        });

        if (!response.ok) {
          throw new Error('Failed to initialize user');
        }

        const data = await response.json();
        
        if (!mounted) return;

        setUserId(data.userId);
        localStorage.setItem('userId', data.userId);
        setHasPassword(data.hasPassword);
        setStoredCards([]); // Start with empty cards

        // Load cart and products
        const parsedCart: Cart = JSON.parse(storedCart);
        setCart(parsedCart);

        const productMap = new Map<string, Product>();
        parsedCart.items.forEach(item => {
          const product = getProduct(item.productId);
          if (product) {
            productMap.set(product.id, product);
          }
        });
        setProducts(productMap);

        // Initialize selected items
        setSelectedProductIds(new Set(parsedCart.items.map(item => item.productId)));

        // Welcome message
        setMessages([{
          role: 'agent',
          content: `Hello! I'm your AI checkout assistant. I can see you have ${parsedCart.items.length} items in your cart. I'll help you complete your purchase. Just tell me what you'd like to do!`
        }]);

        // Only show password setup if user doesn't have password AND hasn't dismissed it before
        const hasSetupPassword = localStorage.getItem('hasSetupPassword');
        if (!data.hasPassword && !hasSetupPassword) {
          setShowPasswordSetup(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      // Call agent
      const response = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: currentInput,
          cart,
          uiSelection: {
            mode: selectionMode,
            selectedProductIds: Array.from(selectedProductIds)
          },
          storedCards,
          hasDefaultAddress: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to get agent response';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const intent: AgentIntent = data.intent;

      // Add agent message
      setMessages(prev => [...prev, {
        role: 'agent',
        content: intent.agentMessage
      }]);

      // Handle intent actions
      if (intent.cardChoice === 'ASK_USER' && storedCards.length === 0) {
        setShowCardModal(true);
      } else if (currentInput.toLowerCase().includes('quote') || 
                 currentInput.toLowerCase().includes('proceed') ||
                 currentInput.toLowerCase().includes('checkout')) {
        // Generate quote
        await createQuote(intent);
      }

    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Sorry, I encountered an error: ${error.message}`
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const createQuote = async (intent: AgentIntent) => {
    try {
      const response = await fetch('/api/quote/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          intent,
          cart,
          uiSelection: {
            mode: selectionMode,
            selectedProductIds: Array.from(selectedProductIds)
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quote');
      }

      setCurrentQuote(data.quote);
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Great! I've prepared a quote for you. Please review the details below and click "Confirm & Pay" when you're ready.`
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Sorry, I couldn't create a quote: ${error.message}`
      }]);
    }
  };

  const handleGeneratePassword = async () => {
    try {
      if (!userId) {
        throw new Error('Please refresh the page and try again');
      }

      const response = await fetch('/api/security/password/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        // If user not found, try to reinitialize
        if (data.error === 'User not found') {
          window.location.reload();
          return;
        }
        throw new Error(data.error || 'Failed to generate password');
      }

      setGeneratedPassword(data.password);
      setHasPassword(true);
      // Mark that password has been set up
      localStorage.setItem('hasSetupPassword', 'true');
    } catch (error: any) {
      console.error('Password generation error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      alert('Please fill in all fields');
      return;
    }

    if (!userId) {
      alert('Please refresh the page and try again');
      return;
    }

    const last4 = cardNumber.slice(-4);
    const brand = cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';

    try {
      const response = await fetch('/api/payment/card/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          cardNumber,
          cardHolder,
          expiry,
          cvv
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // If user not found, try to reinitialize
        if (data.error === 'User not found') {
          window.location.reload();
          return;
        }
        throw new Error(data.error || 'Failed to store card');
      }

      localStorage.setItem('storedCardLast4', last4);
      setStoredCards([...storedCards, data.card]);
      setShowCardModal(false);

      const tokenMessage = data.tokenized ? ' and tokenized with Adyen' : '';
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Great! I've saved your ${brand} ending in ${last4}${tokenMessage}. You're all set!`
      }]);

      // Reset form
      setCardNumber('');
      setCardHolder('');
      setExpiry('');
      setCvv('');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentQuote) return;

    if (!paymentPassword) {
      alert('Please enter your payment password');
      return;
    }

    setIsProcessing(true);

    try {
      // First, ensure user is initialized (in case server restarted)
      const initResponse = await fetch('/api/user/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          cart,
          passwordHash: hasPassword ? 'exists' : undefined,
          cards: storedCards
        })
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize user session');
      }

      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          quoteId: currentQuote.id,
          password: paymentPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Clear cart
      localStorage.removeItem('cart');

      // Show success and redirect
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `🎉 Payment successful! Order #${data.orderId} confirmed.\n\nTotal paid: $${data.paidAmount}\nCard: ****${data.cardLast4}\nShipping: ${data.shipping}\nDelivery to: ${data.deliveryAddress}\n\nRedirecting to your order...`
      }]);

      setTimeout(() => {
        router.push(`/order/${data.orderId}`);
      }, 2000);
    } catch (error: any) {
      alert(`Payment failed: ${error.message}`);
      setPaymentPassword('');
    } finally {
      setIsProcessing(false);
      setShowPasswordPrompt(false);
    }
  };

  const selectedTotal = Array.from(selectedProductIds).reduce((sum, productId) => {
    const cartItem = cart.items.find(item => item.productId === productId);
    const product = products.get(productId);
    if (!cartItem || !product) return sum;
    return sum + (product.price * cartItem.quantity);
  }, 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="text-teal-300 hover:text-teal-200 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">AI Checkout</h1>
            <p className="text-gray-300">Ask the agent anything about your order</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h2 className="text-white font-bold mb-4">Cart Summary</h2>
              
              {/* Selection Mode */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setSelectionMode('ALL');
                    setSelectedProductIds(new Set(cart.items.map(i => i.productId)));
                  }}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    selectionMode === 'ALL'
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Pay ALL
                </button>
                <button
                  onClick={() => setSelectionMode('SELECTED')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    selectionMode === 'SELECTED'
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Pay SELECTED
                </button>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {cart.items.map(item => {
                  const product = products.get(item.productId);
                  if (!product) return null;

                  const isSelected = selectedProductIds.has(item.productId);

                  return (
                    <div key={item.productId} className="flex items-center gap-2">
                      {selectionMode === 'SELECTED' && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSet = new Set(selectedProductIds);
                            if (e.target.checked) {
                              newSet.add(item.productId);
                            } else {
                              newSet.delete(item.productId);
                            }
                            setSelectedProductIds(newSet);
                          }}
                          className="w-4 h-4"
                        />
                      )}
                      <div className="flex-1 text-sm">
                        <div className="text-white font-semibold">{product.name}</div>
                        <div className="text-gray-300">
                          ${product.price} x {item.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Selected Total:</span>
                  <span className="text-teal-400">${selectedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quote Display */}
            {currentQuote && (
              <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-teal-500/50">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  Quote Ready
                </h3>
                <div className="space-y-2 text-sm">
                  {currentQuote.items.map(item => (
                    <div key={item.productId} className="flex justify-between text-gray-200">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/20 pt-2 mt-2">
                    <div className="flex justify-between text-gray-200">
                      <span>Subtotal:</span>
                      <span>${currentQuote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span>Shipping ({currentQuote.shippingMethod}):</span>
                      <span>${currentQuote.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg mt-2">
                      <span>Total:</span>
                      <span className="text-teal-400">${currentQuote.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordPrompt(true)}
                  className="w-full mt-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  Confirm & Pay
                </button>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden flex flex-col" style={{ height: '600px' }}>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">AI Assistant</h3>
                    <p className="text-teal-100 text-sm">Powered by Gemini</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.role === 'agent'
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 px-4 py-3 rounded-2xl border border-white/30">
                      <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white/5 border-t border-white/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything or say 'proceed with checkout'..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                    disabled={isThinking}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isThinking}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-teal-500/50">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-teal-400" />
              <h3 className="text-white font-bold text-lg">Set Up Payment Password</h3>
            </div>
            <p className="text-gray-300 mb-6">
              For your security, we'll generate a one-time payment password. Save it carefully!
            </p>

            {!generatedPassword ? (
              <button
                onClick={handleGeneratePassword}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Generate Password
              </button>
            ) : (
              <div>
                <div className="bg-white/10 p-4 rounded-xl mb-4 border border-teal-500/50">
                  <div className="text-center">
                    <p className="text-gray-300 text-sm mb-2">Your Payment Password:</p>
                    <div className="text-3xl font-mono font-bold text-teal-400 mb-2">
                      {generatedPassword}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        alert('Password copied!');
                      }}
                      className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
                    >
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-gray-300 mb-4">
                  <input
                    type="checkbox"
                    checked={passwordSaved}
                    onChange={(e) => setPasswordSaved(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>I have saved this password securely</span>
                </label>

                <button
                  onClick={() => setShowPasswordSetup(false)}
                  disabled={!passwordSaved}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-semibold"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <StripeCardForm
            userId={userId}
            onSuccess={(card) => {
              setStoredCards([...storedCards, card]);
              setShowCardModal(false);
              setMessages(prev => [...prev, {
                role: 'agent',
                content: `Perfect! I've saved your ${card.brand} card ending in ${card.last4}. You're all set to proceed with checkout! 🎉`
              }]);
            }}
            onCancel={() => setShowCardModal(false)}
          />
        </div>
      )}

      {/* Payment Password Prompt */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-teal-500/50">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-teal-400" />
              <h3 className="text-white font-bold text-lg">Enter Payment Password</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Please enter your 6-digit payment password to confirm this transaction.
            </p>

            <input
              type="password"
              value={paymentPassword}
              onChange={(e) => setPaymentPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 mb-4"
              maxLength={6}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordPrompt(false)}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl hover:bg-white/20 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing || paymentPassword.length !== 6}
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-semibold flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
