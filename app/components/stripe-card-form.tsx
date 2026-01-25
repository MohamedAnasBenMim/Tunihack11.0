'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface StripeCardFormProps {
  userId: string;
  onSuccess: (card: any) => void;
  onCancel: () => void;
}

export function StripeCardForm({ userId, onSuccess, onCancel }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Save to backend
      const response = await fetch('/api/stripe/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paymentMethodId: paymentMethod.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save card');
      }

      const { card } = await response.json();
      onSuccess(card);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#fff',
        '::placeholder': {
          color: '#888',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-teal-500/50">
      <h3 className="text-lg font-semibold text-white mb-4">Add Payment Card</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <CardElement options={cardElementOptions} />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="text-xs text-slate-400 space-y-1">
          <p>💳 Test Card: 4242 4242 4242 4242</p>
          <p>📅 Any future date (e.g., 12/34)</p>
          <p>🔒 Any CVC (e.g., 123)</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Card'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-slate-600 text-white py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
