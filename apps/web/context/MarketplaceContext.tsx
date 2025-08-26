import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface MarketplaceContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  createOrder: (items: CartItem[]) => Promise<Order>;
  getOrders: () => Promise<Order[]>;
  searchProducts: (query: string, filters?: any) => Promise<Product[]>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

interface MarketplaceProviderProps {
  children: ReactNode;
}

export const MarketplaceProvider: React.FC<MarketplaceProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { id: `cart-${Date.now()}`, productId: product.id, quantity, product }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const createOrder = useCallback(async (items: CartItem[]): Promise<Order> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        userId: 'current-user-id',
        items,
        total,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setOrders(prev => [...prev, newOrder]);
      clearCart();
      return newOrder;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearCart]);

  const getOrders = useCallback(async (): Promise<Order[]> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return orders;
    } catch (error) {
      console.error('Failed to get orders:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [orders]);

  const searchProducts = useCallback(async (query: string, filters?: any): Promise<Product[]> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Sample Product',
          description: 'A sample product for testing',
          price: 29.99,
          currency: 'USD',
          category: 'electronics',
          tags: ['sample', 'test'],
          images: ['/sample-image.jpg'],
          rating: 4.5,
          reviewCount: 10,
          seller: {
            id: 'seller-1',
            name: 'Sample Seller',
            rating: 4.8,
          },
          inStock: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      return mockProducts;
    } catch (error) {
      console.error('Failed to search products:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: MarketplaceContextType = {
    products,
    setProducts,
    cart,
    setCart,
    orders,
    setOrders,
    isLoading,
    setIsLoading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    createOrder,
    getOrders,
    searchProducts,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
