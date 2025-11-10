'use client';

import { Card } from './ui/card';

interface AdBannerProps {
  size?: 'small' | 'medium' | 'large' | 'leaderboard' | 'sidebar';
  className?: string;
}

export default function AdBanner({ size = 'medium', className = '' }: AdBannerProps) {
  const sizeClasses = {
    small: 'h-[100px]',
    medium: 'h-[250px]',
    large: 'h-[400px]',
    leaderboard: 'h-[90px] md:h-[90px]',
    sidebar: 'h-[600px]',
  };

  const sizeLabels = {
    small: '320x100',
    medium: '300x250',
    large: '300x600',
    leaderboard: '728x90',
    sidebar: '160x600',
  };

  return (
    <Card className={`${sizeClasses[size]} ${className} relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-muted/30`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Advertisement Space
          </p>
          <p className="text-2xl font-bold text-muted-foreground/60">
            {sizeLabels[size]}
          </p>
          <p className="text-xs text-muted-foreground/80">
            Google AdSense / Display Ad
          </p>
        </div>
        {/* Placeholder for actual ad code */}
        <div className="mt-4 text-xs text-muted-foreground/60">
          {/* Insert AdSense code here */}
        </div>
      </div>
    </Card>
  );
}

