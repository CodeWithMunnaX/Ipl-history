'use client';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Crown, Check, Sparkles, Zap } from 'lucide-react';

export default function PremiumBanner() {
  const features = [
    'Ad-Free Experience',
    'Live Match Alerts',
    'Advanced Analytics',
    'Fantasy Tips & Predictions',
    'Exclusive Content',
    'Priority Support',
  ];

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 border-0 shadow-2xl">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <CardContent className="relative p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left Side - Icon & Badge */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl">
                <Crown className="h-20 w-20 text-white animate-bounce" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-200 animate-spin" />
            </div>
          </div>

          {/* Middle - Content */}
          <div className="flex-1 text-white text-center md:text-left">
            <Badge className="mb-3 bg-white/30 text-white border-white/50 backdrop-blur-sm">
              <Zap className="h-3 w-3 mr-1" />
              LIMITED OFFER
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center md:justify-start gap-2">
              Go Premium! 
              <span className="text-yellow-200">⚡</span>
            </h2>
            
            <p className="text-white/90 text-lg mb-4">
              Unlock unlimited access to advanced stats, predictions, and ad-free experience
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-300 flex-shrink-0" />
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-2 justify-center md:justify-start mb-4">
              <span className="text-white/70 line-through text-xl">₹999</span>
              <span className="text-5xl font-bold text-white">₹499</span>
              <span className="text-white/80 text-lg">/year</span>
              <Badge className="bg-green-500 text-white">50% OFF</Badge>
            </div>
          </div>

          {/* Right Side - CTA */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <Button 
              size="lg"
              className="w-full md:w-auto bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-2xl"
            >
              <Crown className="mr-2 h-5 w-5" />
              Upgrade Now
            </Button>
            <p className="text-white/70 text-xs text-center mt-3">
              🔒 Secure Payment • Cancel Anytime
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

