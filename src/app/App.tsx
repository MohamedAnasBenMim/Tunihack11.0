import { useState } from 'react';
import { ShoppingCart } from '@/app/components/shopping-cart';
import { PromptPayAIChat } from '@/app/components/promptpay-ai-chat';

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [chatStep, setChatStep] = useState<'initial' | 'card-form' | 'password'>('initial');
  const [cartItemCount, setCartItemCount] = useState(0);

  const handleGoToPayment = (itemCount: number) => {
    setCartItemCount(itemCount);
    setShowChat(true);
    setChatStep('initial');
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatStep('initial');
  };

  const handlePaymentMethodSelected = () => {
    setChatStep('card-form');
  };

  const handleCardDetailsSubmitted = () => {
    setChatStep('password');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A2540] via-[#0D3A5F] to-[#14B8A6]">
      <ShoppingCart onGoToPayment={handleGoToPayment} />
      
      {showChat && (
        <PromptPayAIChat
          step={chatStep}
          cartItemCount={cartItemCount}
          onClose={handleCloseChat}
          onPaymentMethodSelected={handlePaymentMethodSelected}
          onCardDetailsSubmitted={handleCardDetailsSubmitted}
        />
      )}
    </div>
  );
}
