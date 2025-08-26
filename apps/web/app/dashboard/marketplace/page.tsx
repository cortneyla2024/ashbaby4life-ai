'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  tags: string[];
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: CartItem[];
  trackingNumber?: string;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'toys', name: 'Toys & Games', icon: '🎮' },
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 89.99,
      originalPrice: 129.99,
      image: '/products/headphones.jpg',
      category: 'electronics',
      rating: 4.5,
      reviews: 234,
      inStock: true,
      tags: ['wireless', 'bluetooth', 'noise-cancelling'],
      seller: {
        name: 'TechGear Pro',
        rating: 4.8,
        verified: true,
      },
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable organic cotton t-shirt available in multiple colors and sizes.',
      price: 24.99,
      image: '/products/tshirt.jpg',
      category: 'clothing',
      rating: 4.2,
      reviews: 156,
      inStock: true,
      tags: ['organic', 'cotton', 'sustainable'],
      seller: {
        name: 'EcoFashion',
        rating: 4.6,
        verified: true,
      },
    },
    {
      id: '3',
      name: 'Programming Fundamentals Book',
      description: 'Comprehensive guide to programming fundamentals with practical examples.',
      price: 39.99,
      originalPrice: 49.99,
      image: '/products/book.jpg',
      category: 'books',
      rating: 4.7,
      reviews: 89,
      inStock: true,
      tags: ['programming', 'education', 'beginner'],
      seller: {
        name: 'TechBooks Inc',
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: '4',
      name: 'Smart Home Security Camera',
      description: '1080p HD security camera with night vision and motion detection.',
      price: 149.99,
      image: '/products/camera.jpg',
      category: 'electronics',
      rating: 4.3,
      reviews: 312,
      inStock: false,
      tags: ['security', 'smart-home', '1080p'],
      seller: {
        name: 'SecureHome',
        rating: 4.4,
        verified: true,
      },
    },
    {
      id: '5',
      name: 'Yoga Mat Premium',
      description: 'Non-slip yoga mat made from eco-friendly materials with carrying strap.',
      price: 34.99,
      image: '/products/yoga-mat.jpg',
      category: 'sports',
      rating: 4.6,
      reviews: 178,
      inStock: true,
      tags: ['yoga', 'fitness', 'eco-friendly'],
      seller: {
        name: 'FitLife Store',
        rating: 4.7,
        verified: true,
      },
    },
    {
      id: '6',
      name: 'Natural Face Cream',
      description: 'Hydrating face cream with natural ingredients for all skin types.',
      price: 19.99,
      originalPrice: 29.99,
      image: '/products/face-cream.jpg',
      category: 'beauty',
      rating: 4.4,
      reviews: 203,
      inStock: true,
      tags: ['natural', 'hydrating', 'skincare'],
      seller: {
        name: 'Natural Beauty Co',
        rating: 4.5,
        verified: true,
      },
    },
  ];

  const orders: Order[] = [
    {
      id: 'ORD-001',
      date: '2024-01-10',
      status: 'delivered',
      total: 89.99,
      items: [{ product: products[0], quantity: 1 }],
      trackingNumber: 'TRK123456789',
    },
    {
      id: 'ORD-002',
      date: '2024-01-08',
      status: 'shipped',
      total: 64.98,
      items: [
        { product: products[1], quantity: 1 },
        { product: products[5], quantity: 1 },
      ],
      trackingNumber: 'TRK987654321',
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'processing',
      total: 39.99,
      items: [{ product: products[2], quantity: 1 }],
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-600">Discover and shop from our community marketplace</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCart(!showCart)}>
            🛒 Cart ({cartItemCount})
          </Button>
          <Button>My Orders</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Products Grid */}
        <div className={`${showCart ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  {product.originalPrice && (
                    <Badge variant="secondary" className="absolute top-2 left-2">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="text-right">
                      <p className="text-lg font-bold">${product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">${product.originalPrice}</p>
                      )}
                    </div>
                  </div>
                  <CardDescription className="mb-3">{product.description}</CardDescription>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{product.seller.name}</span>
                      {product.seller.verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!product.inStock}
                    onClick={() => addToCart(product)}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Shopping Cart */}
        {showCart && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>{cartItemCount} items in cart</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🛒</div>
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">${item.product.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium">Total:</span>
                        <span className="text-2xl font-bold">${cartTotal.toFixed(2)}</span>
                      </div>
                      <Button className="w-full">Proceed to Checkout</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{order.id}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <CardDescription>{order.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <p className="text-xs text-gray-500 mt-2">
                      Tracking: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold">$1,247</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Orders This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Wishlist Items</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="text-2xl">❤️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rewards Points</p>
                <p className="text-2xl font-bold">2,450</p>
              </div>
              <div className="text-2xl">🎁</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
