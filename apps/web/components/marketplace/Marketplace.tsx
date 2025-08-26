'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Heart, 
  Star, 

  Filter,
  Search,
  Grid,
  List,
  ChevronDown,
  Plus,
  Minus,
  X,
  CreditCard,
  Truck,
  Shield,
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  User,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  ShoppingCart as CartIcon,
  CheckCircle,
  AlertCircle,
  Package,
  Tag,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// import { useMarketplace } from '@/hooks/useMarketplace';
// import { useCart } from '@/hooks/useCart';
// import { useAIService } from '@/hooks/useAIService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
// Define types inline since @/types/marketplace doesn't exist
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  discount: number;
  seller?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  icon: any;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
}

interface Order {
  id: string;
  status: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  products: Product[];
}

interface MarketplaceProps {
  className?: string;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ className }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'rating' | 'newest'>('popularity');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  // Mock data - in a real app, these would come from hooks
  const products: Product[] = [];
  const categories: Category[] = [];
  const bundles: Bundle[] = [];
  const reviews: Review[] = [];
  const cart = { items: [] as CartItem[], total: 0 };
  
  // Mock functions
  const getProducts = async (params?: any) => {};
  const getProductDetails = async (id: string) => products.find(p => p.id === id);
  const getRecommendations = async () => {};
  const searchProducts = async (query: string) => [];
  const getBundles = async () => {};
  const addReview = async () => {};
  const getSellerInfo = async () => {};
  const addToCart = async (item?: any) => {};
  const removeFromCart = async (id?: any) => {};
  const updateQuantity = async (id?: any, quantity?: any) => {};
  const clearCart = async () => {};
  const getCartTotal = () => 0;
  const getCartCount = () => 0;
  const generateRecommendations = async (userId?: any) => {};
  const analyzePreferences = async () => {};
  const suggestBundles = async () => {};

  // Load products and recommendations
  useEffect(() => {
    getProducts({ category: selectedCategory, sortBy, priceRange });
    if (user) {
      generateRecommendations(user.id);
    }
  }, [selectedCategory, sortBy, priceRange, user, getProducts, generateRecommendations]);

  // Handle product selection
  const handleProductSelect = useCallback(async (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    
    // Get detailed product info
    const details = await getProductDetails(product.id);
    setSelectedProduct(details);
  }, [getProductDetails]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      await addToCart({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image
      });
      
      // Show success feedback
      // TODO: Add toast notification
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }, [addToCart]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      const results = await searchProducts(query);
      // Update products list with search results
    }
  }, [searchProducts]);

  // Handle bundle selection
  const handleBundleSelect = useCallback(async (bundle: Bundle) => {
    setSelectedBundle(bundle);
    setShowBundleModal(true);
  }, []);

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    if (cart.items.length === 0) return;
    
    setShowCheckout(true);
    setShowCart(false);
  }, [cart.items.length]);

  // Get product rating
  const getProductRating = (product: Product) => {
    const productReviews = reviews.filter(r => r.productId === product.id);
    if (productReviews.length === 0) return 0;
    
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / productReviews.length;
  };

  // Get review count
  const getReviewCount = (product: Product) => {
    return reviews.filter(r => r.productId === product.id).length;
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < Math.floor(rating) ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
      </span>
    ));
  };

  // Available categories
  const availableCategories = [
    { id: 'all', name: 'All Products', icon: ShoppingBag },
    { id: 'wellness', name: 'Wellness', icon: Heart },
    { id: 'fitness', name: 'Fitness', icon: TrendingUp },
    { id: 'mental-health', name: 'Mental Health', icon: Heart },
    { id: 'nutrition', name: 'Nutrition', icon: Heart },
    { id: 'supplements', name: 'Supplements', icon: Heart },
    { id: 'equipment', name: 'Equipment', icon: Package },
    { id: 'books', name: 'Books & Guides', icon: Package }
  ];

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <ShoppingBag className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Wellness Marketplace
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCart(true)}
            className="relative"
          >
            <CartIcon className="w-4 h-4 mr-2" />
            Cart
            {getCartCount() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                {getCartCount()}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm"
          >
            <option value="popularity">Most Popular</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {availableCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="flex-1 overflow-y-auto p-4">
            <div className={cn(
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            )}>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'group cursor-pointer',
                    viewMode === 'list' && 'flex space-x-4'
                  )}
                >
                  <Card 
                    className={cn(
                      'h-full hover:shadow-lg transition-all duration-200',
                      viewMode === 'list' && 'flex-1'
                    )}
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardContent className="p-4">
                      <div className={cn(
                        'relative',
                        viewMode === 'list' && 'flex space-x-4'
                      )}>
                        {/* Product Image */}
                        <div className={cn(
                          'relative overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800',
                          viewMode === 'grid' ? 'aspect-square mb-4' : 'w-24 h-24 flex-shrink-0'
                        )}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {product.isNew && (
                            <Badge className="absolute top-2 left-2 bg-green-500">
                              New
                            </Badge>
                          )}
                          {product.discount > 0 && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className={cn(
                          'flex-1',
                          viewMode === 'list' && 'flex flex-col justify-between'
                        )}>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-1 mt-2">
                              {renderStars(getProductRating(product))}
                              <span className="text-xs text-slate-500">
                                ({getReviewCount(product)})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-lg font-bold text-slate-900 dark:text-white">
                                ${product.price.toFixed(2)}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-slate-500 line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Seller */}
                            <div className="flex items-center space-x-2 mt-2">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={product.seller?.avatar} />
                                <AvatarFallback>{product.seller?.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {product.seller?.name}
                              </span>
                              {product.seller?.verified && (
                                <Shield className="w-3 h-3 text-blue-500" />
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className="flex-1 mr-2"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Add to wishlist
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bundles" className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle) => (
                <Card key={bundle.id} className="cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="relative">
                      <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 mb-4 overflow-hidden">
                        <img
                          src={bundle.image}
                          alt={bundle.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2 bg-purple-500">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Bundle
                        </Badge>
                      </div>
                      
                      <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                        {bundle.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {bundle.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {bundle.products.slice(0, 3).map((product) => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {product.name}
                            </span>
                          </div>
                        ))}
                        {bundle.products.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{bundle.products.length - 3} more items
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            ${bundle.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-slate-500 line-through ml-2">
                            ${bundle.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleBundleSelect(bundle)}
                        >
                          View Bundle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    AI-Powered Recommendations
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Based on your preferences, health goals, and past purchases
                </p>
              </div>
              
              {/* Personalized recommendations would go here */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Similar to products grid but with AI indicators */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Order history would go here */}
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No orders yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Start shopping to see your order history here.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product details would go here */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedProduct.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProductModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Product content would go here */}
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedProduct.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 z-40"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Shopping Cart
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCart(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {cart.items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      Your cart is empty
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Add some products to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {item.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart.items.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
