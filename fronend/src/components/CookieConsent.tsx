'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (!hasAccepted) {
      setShowConsent(true);
      // Delay animation for smooth entrance
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
    // Remove from DOM after animation
    setTimeout(() => setShowConsent(false), 300);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    setTimeout(() => setShowConsent(false), 300);
  };

  if (!showConsent) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🍪</span>
                We use cookies
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. Read our{' '}
                <a href="/privacy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" className="underline hover:text-foreground transition-colors">
                  Terms of Service
                </a>{' '}
                to learn more.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <Button
                onClick={declineCookies}
                variant="outline"
                size="default"
                className="min-w-[120px]"
              >
                Decline
              </Button>
              <Button
                onClick={acceptCookies}
                size="default"
                className="min-w-[140px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Accept All Cookies
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

