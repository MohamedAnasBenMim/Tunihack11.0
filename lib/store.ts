import { User, Quote, Order, Product } from './types';

// In-memory data stores
export const users = new Map<string, User>();
export const quotes = new Map<string, Quote>();
export const orders = new Map<string, Order>();

// Product catalog (static data)
export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'MacBook Pro 16"',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    specs: 'M3 Pro • 18GB RAM • 512GB SSD',
    category: 'Laptop'
  },
  {
    id: 'p2',
    name: 'Dell UltraSharp 27" 4K',
    price: 649,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
    specs: '4K UHD • IPS • 60Hz • USB-C Hub',
    category: 'Monitor'
  },
  {
    id: 'p3',
    name: 'Keychron K2 Mechanical',
    price: 89,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    specs: 'Wireless • RGB • Brown Switches',
    category: 'Keyboard'
  },
  {
    id: 'p4',
    name: 'Logitech MX Master 3S',
    price: 99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
    specs: 'Wireless • 8K DPI • Ergonomic',
    category: 'Mouse'
  },
  {
    id: 'p5',
    name: 'iPad Pro 12.9"',
    price: 1099,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    specs: 'M2 Chip • 128GB • Wi-Fi',
    category: 'Tablet'
  },
  {
    id: 'p6',
    name: 'AirPods Pro',
    price: 249,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
    specs: 'Active Noise Cancellation • Wireless Charging',
    category: 'Audio'
  },
  {
    id: 'p7',
    name: 'Samsung SSD 1TB',
    price: 129,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
    specs: '1TB • NVMe • 7000 MB/s Read',
    category: 'Storage'
  },
  {
    id: 'p8',
    name: 'Webcam 4K Pro',
    price: 199,
    image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800',
    specs: '4K 60fps • Auto Focus • HDR',
    category: 'Camera'
  }
];

// Helper to get product by ID
export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}
