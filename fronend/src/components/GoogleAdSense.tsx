'use client';

import { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
}

export default function GoogleAdSense({ 
  adSlot, 
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = ''
}: GoogleAdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX" // Replace with your AdSense Publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

/*
HOW TO USE:
==========

1. Sign up at: https://www.google.com/adsense/start/
2. Add your website and wait for approval (7-14 days)
3. Get your Publisher ID (ca-pub-XXXXXXXXXXXXXXXXX)
4. Replace the data-ad-client above
5. Create ad units in AdSense dashboard
6. Get ad slot IDs for each unit
7. Use component like this:

EXAMPLE USAGE:
<GoogleAdSense 
  adSlot="1234567890"
  adFormat="auto"
  className="my-4"
/>

AD FORMATS:
- auto: Responsive ads (recommended)
- rectangle: 300x250, 336x280
- vertical: 120x600, 160x600, 300x600
- horizontal: 728x90, 970x90

BEST PLACEMENT:
- Header: 728x90 leaderboard
- Sidebar: 300x600 vertical
- Between content: 300x250 rectangle
- Mobile: auto format
*/

