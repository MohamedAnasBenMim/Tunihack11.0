// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  specs: string;
  category: string;
}

// Cart types
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

// User types
export interface User {
  id: string;
  passwordHash?: string;
  cards: StoredCard[];
  hasDefaultAddress: boolean;
  defaultAddress?: string;
}

// Card types
export interface StoredCard {
  last4: string;
  brand: string;
  isDefault: boolean;
  adyenToken?: string; // Adyen payment method token if integrated
}

// Agent types
export interface AgentIntent {
  itemsMode: 'ALL' | 'SELECTED';
  shippingPreference: 'CHEAPEST' | 'FASTEST';
  addressChoice: 'DEFAULT' | 'ASK_USER';
  cardChoice: 'DEFAULT' | 'ASK_USER' | { last4: string };
  questions: string[];
  agentMessage: string;
}

export interface AgentPlanRequest {
  userId: string;
  message: string;
  cart: Cart;
  uiSelection: {
    mode: 'ALL' | 'SELECTED';
    selectedProductIds: string[];
  };
  storedCards: StoredCard[];
  hasDefaultAddress: boolean;
}

// Quote types
export interface Quote {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: 'CHEAPEST' | 'FASTEST';
  createdAt: number;
  expiresAt: number;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: 'CHEAPEST' | 'FASTEST';
  cardLast4: string;
  status: 'processing' | 'shipped' | 'delivered';
  createdAt: number;
  deliveryAddress: string;
}
