'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from './ui/button';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Your WhatsApp number (with country code, no + or spaces)
  const whatsappNumber = '919876543210'; // Replace with your number
  const message = 'Hi! I need help with IPL stats and predictions.';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
        {/* Tooltip */}
        {!isOpen && (
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border animate-bounce">
            <p className="text-sm font-medium">Need help? Chat with us! 💬</p>
          </div>
        )}

        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsAppClick}
          size="lg"
          className="h-16 w-16 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 shadow-2xl flex items-center justify-center group relative overflow-hidden"
        >
          {/* Ripple Effect */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
          
          <MessageCircle className="h-8 w-8 text-white relative z-10 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    </>
  );
}

