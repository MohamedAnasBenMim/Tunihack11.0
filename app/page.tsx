'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/store';
import { Cart, CartItem } from '@/lib/types';

export default function HomePage() {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Initialize user and load cart from localStorage
    const initUser = async () => {
      // Check server session to detect restarts
      const sessionResponse = await fetch('/api/session');
      const sessionData = await sessionResponse.json();
      const currentServerSession = sessionData.sessionId;
      const storedServerSession = localStorage.getItem('serverSession');

      // If server restarted, clear all data
      if (storedServerSession && storedServerSession !== currentServerSession) {
        localStorage.clear();
        setCart({ items: [] });
      }
      
      // Store current server session
      localStorage.setItem('serverSession', currentServerSession);

      const storedUserId = localStorage.getItem('userId');
      const storedCart = localStorage.getItem('cart');

      const response = await fetch('/api/user/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: storedUserId })
      });

      const data = await response.json();
      setUserId(data.userId);
      localStorage.setItem('userId', data.userId);

      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    };

    initUser();
  }, []);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.productId === productId);
      let newItems: CartItem[];

      if (existingItem) {
        newItems = prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev.items, { productId, quantity: 1 }];
      }

      const newCart = { items: newItems };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">IT Store</h1>
            <p className="text-teal-300 text-lg">AI-Powered Checkout Experience</p>
          </div>
          
          <Link
            href="/cart"
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart ({cartItemCount})</span>
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PRODUCTS.map(product => (
            <div
              key={product.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <div className="relative w-full h-48 bg-gray-800">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-white text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-300 mb-3">{product.specs}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-teal-400">${product.price}</p>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
