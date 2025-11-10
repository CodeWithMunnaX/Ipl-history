'use client';

import { Button } from './ui/button';
import { Share2, Facebook, Twitter, Link2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface SocialShareProps {
  title?: string;
  url?: string;
  description?: string;
}

export default function SocialShare({ 
  title = 'IPL Stats & Analytics', 
  url, 
  description = 'Check out this amazing IPL content!' 
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  // Get current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2] hover:bg-[#1877F2]/90',
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-black hover:bg-black/90',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-[#25D366] hover:bg-[#25D366]/90',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        Share:
      </span>
      
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <Button
            key={social.name}
            variant="default"
            size="sm"
            className={`${social.color} text-white`}
            onClick={() => window.open(social.url, '_blank', 'noopener,noreferrer')}
          >
            <Icon className="h-4 w-4 mr-1" />
            {social.name}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="relative"
      >
        <Link2 className="h-4 w-4 mr-1" />
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
    </div>
  );
}

