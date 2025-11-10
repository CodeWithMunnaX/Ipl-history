'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export default function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    // Simulate API call - Replace with actual API endpoint
    setTimeout(() => {
      setStatus('success');
      setMessage('🎉 Successfully subscribed! Check your email for confirmation.');
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }, 1500);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon & Text */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Get IPL Updates! 🏏
              </h3>
            </div>
            <p className="text-white/90 text-sm md:text-base">
              Subscribe to our newsletter for exclusive match predictions, fantasy tips, 
              player stats, and breaking cricket news delivered to your inbox!
            </p>
          </div>

          {/* Form */}
          <div className="w-full md:w-auto md:min-w-[400px]">
            {status === 'success' ? (
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-white text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/95 border-white/20 text-gray-900 placeholder:text-gray-500 h-12"
                    disabled={status === 'loading'}
                  />
                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-white text-purple-600 hover:bg-white/90 h-12 px-8 font-semibold shadow-lg"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </div>
                {status === 'error' && (
                  <p className="text-yellow-200 text-sm font-medium">{message}</p>
                )}
                <p className="text-white/70 text-xs">
                  We respect your privacy. Unsubscribe at any time. 🔒
                </p>
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

