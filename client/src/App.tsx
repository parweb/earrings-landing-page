
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { 
  Collection, 
  ProductWithCollection, 
  Testimonial
} from '../../server/src/schema';

function App() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<ProductWithCollection[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const loadData = useCallback(async () => {
    try {
      const [collectionsData, productsData, testimonialsData] = await Promise.all([
        trpc.getFeaturedCollections.query({ limit: 4 }),
        trpc.getFeaturedProducts.query({ limit: 8 }),
        trpc.getFeaturedTestimonials.query({ limit: 6 })
      ]);
      
      setCollections(collectionsData);
      setProducts(productsData);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    try {
      await trpc.createNewsletterSubscription.mutate({ email: newsletterEmail });
      setSubscriptionStatus('success');
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setSubscriptionStatus('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 via-amber-50/30 to-stone-100/50"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-rose-300 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-amber-300 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-stone-300 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-40 right-10 w-4 h-4 bg-rose-200 rounded-full animate-pulse delay-300"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-serif text-stone-800 mb-6 leading-tight">
              Adorn Yourself: 
              <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent block mt-2">
                Exquisite Earrings
              </span>
              <span className="text-4xl md:text-5xl block mt-2">for Every Moment</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 mb-8 font-light max-w-2xl mx-auto leading-relaxed">
              Discover Handcrafted Beauty and Timeless Elegance
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              ✨ Shop Now
            </Button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-rose-300 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-amber-300 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-stone-300 rounded-full animate-bounce delay-500"></div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4">
              Featured Collections
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Curated selections that capture the essence of modern elegance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection: Collection) => (
              <Card 
                key={collection.id} 
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={collection.image_url}
                      alt={collection.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {collection.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-rose-500 text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif text-stone-800 mb-2">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all duration-300"
                    >
                      View Collection →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Us / Brand Story */}
      <section className="py-20 px-4 bg-gradient-to-r from-stone-50 to-rose-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif text-stone-800 leading-tight">
                Crafted with 
                <span className="text-rose-500"> Passion</span>,
                <br />
                Worn with <span className="text-amber-500">Pride</span>
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                Every piece in our collection tells a story of meticulous craftsmanship and artistic vision. 
                We believe that jewelry is more than an accessory—it&apos;s a reflection of your unique spirit 
                and a celebration of life&apos;s precious moments.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                From our atelier to your jewelry box, each earring is thoughtfully designed and 
                carefully crafted using premium materials and time-honored techniques, ensuring 
                that every piece becomes a treasured part of your personal collection.
              </p>
              <Button 
                variant="outline" 
                size="lg"
                className="border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300"
              >
                Discover Our Story
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-rose-200 to-amber-200 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="text-6xl mb-4">💎</div>
                  <h3 className="text-2xl font-serif text-stone-800 mb-2">Handcrafted Excellence</h3>
                  <p className="text-stone-600">Every piece is a work of art</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Product Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4">
              Signature Pieces
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Discover our most coveted designs, each one a masterpiece of elegance and style
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: ProductWithCollection) => (
              <Card 
                key={product.id} 
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white/90 backdrop-blur-sm"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.alt_image_url && (
                      <img
                        src={product.alt_image_url}
                        alt={`${product.name} alternative view`}
                        className="absolute inset-0 w-full h-72 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {product.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-amber-500 text-white">
                        ⭐ Featured
                      </Badge>
                    )}
                    {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                      <Badge className="absolute top-4 left-4 bg-rose-500 text-white">
                        Only {product.stock_quantity} left
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-stone-800 group-hover:text-rose-600 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <span className="text-xl font-serif text-amber-600 font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    {product.collection && (
                      <p className="text-sm text-stone-500 mb-2">
                        {product.collection.name}
                      </p>
                    )}
                    {product.material && (
                      <p className="text-xs text-stone-400 mb-4">
                        {product.material}
                      </p>
                    )}
                    <Button 
                      className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white group-hover:shadow-lg transition-all duration-300"
                      disabled={product.stock_quantity === 0}
                    >
                      {product.stock_quantity === 0 ? 'Out of Stock' : '💕 Add to Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-50 to-rose-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-stone-600">
              Stories of love, joy, and unforgettable moments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial: Testimonial) => (
              <Card 
                key={testimonial.id} 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-stone-700 mb-4 italic leading-relaxed">
                    &quot;{testimonial.review_text}&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-amber-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium text-sm">
                        {testimonial.customer_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">
                        {testimonial.customer_name}
                      </p>
                      <p className="text-xs text-stone-500">
                        Verified Buyer
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-gradient-to-r from-rose-500 to-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be the first to discover new collections, exclusive offers, and styling tips
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-white/90 border-0 text-stone-800 placeholder:text-stone-500"
                required
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-white text-rose-500 hover:bg-stone-50 px-8 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubscribing ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </form>
          
          {subscriptionStatus === 'success' && (
            <p className="text-white mt-4 font-medium">
              ✨ Welcome to our community! Check your email for a special welcome gift.
            </p>
          )}
          {subscriptionStatus === 'error' && (
            <p className="text-white/90 mt-4">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-serif mb-4">Adorn Yourself</h3>
              <p className="text-stone-300 mb-6 max-w-md">
                Exquisite earrings crafted with passion and precision. 
                Every piece tells a story of elegance and timeless beauty.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-110">
                  <span className="text-sm">📘</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-110">
                  <span className="text-sm">📷</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-110">
                  <span className="text-sm">🐦</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-stone-300">
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">All Earrings</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Collections</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">New Arrivals</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Sale</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-stone-300">
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">FAQ</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors duration-300">Size Guide</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="bg-stone-700 mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-stone-400 text-sm">
            <p>&copy; 2024 Adorn Yourself. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-rose-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-rose-400 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-rose-400 transition-colors duration-300">Shipping Info</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
