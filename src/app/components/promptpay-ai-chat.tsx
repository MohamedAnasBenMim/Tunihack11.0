import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, CreditCard, Lock, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
}

interface PromptPayAIChatProps {
  step: 'initial' | 'card-form' | 'password';
  cartItemCount: number;
  onClose: () => void;
  onPaymentMethodSelected: () => void;
  onCardDetailsSubmitted: () => void;
}

// Get API key from environment variable or use empty string
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export function PromptPayAIChat({
  step,
  cartItemCount,
  onClose,
  onPaymentMethodSelected,
  onCardDetailsSubmitted
}: PromptPayAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: `Hello! I'm your AI shopping assistant. I see you have ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'} in your cart. I can help you with payment, answer questions about products, or chat about anything you'd like. How can I assist you today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step]);

  const callGroqAPI = async (userMessage: string): Promise<string> => {
    if (!GROQ_API_KEY) {
      return "I'd love to help you! However, I need an API key to function properly. Please add your Groq API key to the .env file as VITE_GROQ_API_KEY. You can get a free API key at https://console.groq.com";
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI shopping assistant for an IT store. The customer has ${cartItemCount} items in their cart. You can help with:
- Payment questions and processing
- Product information
- General conversation on any topic
Be friendly, helpful, and conversational. If asked about payment, guide them through the checkout process.`
            },
            ...messages.slice(1).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Groq API error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await callGroqAPI(currentInput);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "I apologize, but I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSubmit = () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: `Card ending in ${cardNumber.slice(-4)}`
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "Perfect! For your security, please enter your payment password to confirm this transaction."
      };
      setMessages(prev => [...prev, aiMessage]);
      onCardDetailsSubmitted();
    }, 800);
  };

  const handlePasswordSubmit = () => {
    if (!password) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: '••••••••'
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }, 800);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiryDate(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2540] to-[#14B8A6] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-white">PromptPay AI</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-teal-100">Secure & Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto p-5 bg-gradient-to-b from-gray-50 to-white space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0A2540] to-[#14B8A6] rounded-xl flex items-center justify-center flex-shrink-0 mr-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.type === 'ai'
                      ? 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      : 'bg-gradient-to-r from-[#0A2540] to-[#14B8A6] text-white shadow-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Card Form */}
            {step === 'card-form' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#0A2540]/5 to-[#14B8A6]/5 rounded-2xl p-5 border-2 border-[#14B8A6]/30"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#0A2540]" />
                  <h3 className="text-[#0A2540]">New Card Details</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={formatCardNumber(cardNumber)}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#14B8A6] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#14B8A6] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => {
                          if (e.target.value.length <= 3 && /^\d*$/.test(e.target.value)) {
                            setCvv(e.target.value);
                          }
                        }}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#14B8A6] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#14B8A6] focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleCardSubmit}
                    disabled={!cardNumber || !expiryDate || !cvv || !cardholderName}
                    className="w-full mt-2 bg-gradient-to-r from-[#0A2540] to-[#14B8A6] text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Password Form */}
            {step === 'password' && !showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#0A2540]/5 to-[#14B8A6]/5 rounded-2xl p-5 border-2 border-[#14B8A6]/30"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-[#0A2540]" />
                  <h3 className="text-[#0A2540]">Payment Password</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#14B8A6] focus:outline-none transition-colors"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handlePasswordSubmit();
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-teal-50 p-3 rounded-lg">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <span>Your payment is protected with 256-bit encryption</span>
                  </div>

                  <button
                    onClick={handlePasswordSubmit}
                    disabled={!password}
                    className="w-full mt-2 bg-gradient-to-r from-[#0A2540] to-[#14B8A6] text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Confirm Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-300 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-green-800 mb-2">Payment Successful!</h3>
                <p className="text-sm text-green-600">Your order has been confirmed.</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#0A2540] to-[#14B8A6] rounded-xl flex items-center justify-center flex-shrink-0 mr-2">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                <Loader2 className="w-5 h-5 text-[#14B8A6] animate-spin" />
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {step === 'initial' && !showSuccess && (
          <div className="p-5 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything or type 'pay' to checkout..."
                className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#14B8A6] focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-r from-[#0A2540] to-[#14B8A6] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
