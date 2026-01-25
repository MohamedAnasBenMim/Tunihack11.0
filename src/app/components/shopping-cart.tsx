import { ShoppingBag, Minus, Plus, Trash2, ShoppingCart as CartIcon } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  specs: string;
  category: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  specs: string;
  category: string;
}

interface ShoppingCartProps {
  onGoToPayment: (itemCount: number) => void;
}

const AVAILABLE_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1675668409245-955188b96bf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMG1hY2Jvb2t8ZW58MXx8fHwxNzY5MjQwNzU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    specs: 'M3 Pro • 18GB RAM • 512GB SSD',
    category: 'Laptop'
  },
  {
    id: 2,
    name: 'Dell UltraSharp 27" 4K',
    price: 649,
    image: 'https://images.unsplash.com/photo-1761954090578-f440c37ac4eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtb25pdG9yJTIwZGlzcGxheXxlbnwxfHx8fDE3NjkyMTUxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    specs: '4K UHD • IPS • 60Hz • USB-C Hub',
    category: 'Monitor'
  },
  {
    id: 3,
    name: 'Keychron K2 Mechanical',
    price: 89,
    image: 'https://images.unsplash.com/photo-1558050032-160f36233a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MXx8fHwxNzY5MTg0OTcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    specs: 'Wireless • RGB • Brown Switches',
    category: 'Keyboard'
  },
  {
    id: 4,
    name: 'Logitech MX Master 3S',
    price: 99,
    image: 'https://images.unsplash.com/photo-1660491083562-d91a64d6ea9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMG1vdXNlfGVufDF8fHx8MTc2OTI2OTIwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    specs: 'Wireless • 8K DPI • Ergonomic',
    category: 'Mouse'
  },
  {
    id: 5,
    name: 'iPad Pro 12.9"',
    price: 1099,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJsZXQlMjBpcGFkfGVufDF8fHx8MTc2OTI0MDc1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    specs: 'M2 Chip • 128GB • Wi-Fi',
    category: 'Tablet'
  },
  {
    id: 6,
    name: 'AirPods Pro',
    price: 249,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb2RzfGVufDF8fHx8MTc2OTI0MDc1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    specs: 'Active Noise Cancellation • Wireless Charging',
    category: 'Audio'
  },
  {
    id: 7,
    name: 'Samsung SSD 1TB',
    price: 129,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzc2R8ZW58MXx8fHwxNzY5MjQwNzU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    specs: '1TB • NVMe • 7000 MB/s Read',
    category: 'Storage'
  },
  {
    id: 8,
    name: 'Webcam 4K Pro',
    price: 199,
    image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJjYW18ZW58MXx8fHwxNzY5MjQwNzU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    specs: '4K 60fps • Auto Focus • HDR',
    category: 'Camera'
  }
];

export function ShoppingCart({ onGoToPayment }: ShoppingCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, change: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      {/* Fixed Cart Button */}
      <button
        onClick={() => setShowCart(!showCart)}
        className="fixed top-6 right-6 bg-gradient-to-r from-[#0A2540] to-[#14B8A6] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50"
      >
        <div className="relative">
          <CartIcon className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">IT Store</h1>
          <p className="text-teal-100 text-lg">Browse our premium tech products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {AVAILABLE_PRODUCTS.map(product => (
            <div
              key={product.id}
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="w-full h-48 overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">{product.category}</span>
                </div>
                <h3 className="text-[#0A2540] text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.specs}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-[#14B8A6]">${product.price}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-r from-[#0A2540] to-[#14B8A6] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowCart(false)}>
          <div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-[#0A2540] to-[#14B8A6] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-bold">Your Cart</h2>
                    <p className="text-teal-100 text-sm">{totalItems} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some products to get started!</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-2xl p-4 flex gap-4 border border-teal-100/50 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow-md">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#0A2540] font-semibold text-sm mb-1">{item.name}</h3>
                      <p className="text-lg font-bold text-[#14B8A6]">${item.price}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-[#14B8A6] hover:text-white transition-all flex items-center justify-center text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-[#0A2540] font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-[#14B8A6] hover:text-white transition-all flex items-center justify-center text-gray-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 h-fit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total and Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-teal-50/20 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="text-[#0A2540] font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
                  <span className="text-gray-700">Shipping</span>
                  <span className="text-[#14B8A6] font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl text-[#0A2540] font-bold">Total</span>
                  <span className="text-2xl text-[#0A2540] font-bold">${total.toFixed(2)}</span>
                </div>

                {/* Go to Payment Button */}
                <button
                  onClick={() => {
                    setShowCart(false);
                    onGoToPayment(totalItems);
                  }}
                  className="w-full bg-gradient-to-r from-[#0A2540] to-[#14B8A6] text-white py-4 rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>Go to Payment</span>
                    <span className="text-2xl animate-pulse">✨</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0A2540] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
