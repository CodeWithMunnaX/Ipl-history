'use client';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Star, TrendingUp, Gift } from 'lucide-react';
import Image from 'next/image';

interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  discount: string;
  rating: number;
  category: string;
  price: string;
}

const affiliateProducts: AffiliateProduct[] = [
  {
    id: '1',
    name: 'Dream11 - Fantasy Cricket',
    description: 'India\'s biggest fantasy sports platform. Get ₹100 bonus on signup!',
    image: '/images/unnamed.png',
    link: 'https://dream11.com',
    discount: '₹100 Bonus',
    rating: 4.5,
    category: 'Fantasy Sports',
    price: 'Free',
  },
  {
    id: '2',
    name: 'MPL - Play Fantasy & Win',
    description: 'Play fantasy cricket and win real cash. Trusted by millions!',
    image: '/images/Picture1.png',
    link: '#',
    discount: '₹50 Cashback',
    rating: 4.3,
    category: 'Fantasy Sports',
    price: 'Free',
  },
  {
    id: '3',
    name: 'Cricket Bat - SS TON',
    description: 'Professional grade English willow cricket bat. Free shipping!',
    image: '/images/Picture1.png',
    link: '#',
    discount: '30% OFF',
    rating: 4.8,
    category: 'Cricket Gear',
    price: '₹12,999',
  },
  {
    id: '4',
    name: 'Cricket Shoes - Adidas',
    description: 'Professional cricket shoes with extra grip and comfort.',
    image: '/images/Picture1.png',
    link: '#',
    discount: '40% OFF',
    rating: 4.6,
    category: 'Cricket Gear',
    price: '₹3,499',
  },
];

export default function AffiliateSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Recommended for You</h2>
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <p className="text-muted-foreground">
          Exclusive deals and offers curated for cricket enthusiasts
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {affiliateProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2">
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl opacity-20">
                    {product.category === 'Fantasy Sports' ? '🎮' : '🏏'}
                  </div>
                </div>
                
                {/* Discount Badge */}
                <Badge className="absolute top-3 right-3 bg-red-500 text-white font-bold">
                  {product.discount}
                </Badge>

                {/* Category Badge */}
                <Badge variant="secondary" className="absolute top-3 left-3">
                  {product.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{product.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (1000+ reviews)
                  </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary">{product.price}</p>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => window.open(product.link, '_blank')}
                  >
                    Get Deal
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">
          * We may earn a commission from purchases made through these links at no extra cost to you. 
          This helps us keep the platform free for all users. 🙏
        </p>
      </div>
    </div>
  );
}

