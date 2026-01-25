'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Package, Truck, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/lib/types';

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/order/get?orderId=${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <p className="text-white text-xl mb-4">Order not found</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const statusIcon = {
    processing: Package,
    shipped: Truck,
    delivered: Home
  }[order.status];

  const StatusIcon = statusIcon || Package;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-300 text-lg">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/20">
            <div>
              <p className="text-gray-400 text-sm">Order Number</p>
              <p className="text-white font-mono font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-500/50">
              <StatusIcon className="w-5 h-5 text-teal-400" />
              <span className="text-teal-300 font-semibold capitalize">{order.status}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-white font-bold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-teal-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-6 pb-6 border-b border-white/20">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Shipping ({order.shippingMethod}):</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total:</span>
              <span className="text-teal-400">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Delivery Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Payment Method</p>
              <p className="text-white font-semibold">Card ending in {order.cardLast4}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Delivery Address</p>
              <p className="text-white font-semibold">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 bg-white/10 text-white py-4 rounded-xl hover:bg-white/20 transition-all font-semibold text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
