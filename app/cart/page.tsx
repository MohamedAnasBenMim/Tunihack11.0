'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Cart, Product } from '@/lib/types';
import { getProduct } from '@/lib/store';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [products, setProducts] = useState<Map<string, Product>>(new Map());

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart: Cart = JSON.parse(storedCart);
      setCart(parsedCart);

      // Load product details
      const productMap = new Map<string, Product>();
      parsedCart.items.forEach(item => {
        const product = getProduct(item.productId);
        if (product) {
          productMap.set(product.id, product);
        }
      });
      setProducts(productMap);
    }
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      const newCart = { items: newItems };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeItem = (productId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.productId !== productId);
      const newCart = { items: newItems };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const total = cart.items.reduce((sum, item) => {
    const product = products.get(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-teal-300 hover:text-teal-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
            <p className="text-gray-300">{cart.items.length} items</p>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/20">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cart.items.map(item => {
                const product = products.get(item.productId);
                if (!product) return null;

                return (
                  <div
                    key={item.productId}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/20"
                  >
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-300 mb-2">{product.specs}</p>
                      <p className="text-lg font-bold text-teal-400">${product.price}</p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-8 h-8 rounded-md bg-white/10 hover:bg-teal-500 transition-all flex items-center justify-center text-white"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-white font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-8 h-8 rounded-md bg-white/10 hover:bg-teal-500 transition-all flex items-center justify-center text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout Summary */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl text-white font-bold">Subtotal</span>
                <span className="text-2xl text-teal-400 font-bold">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
              >
                Proceed to AI Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
