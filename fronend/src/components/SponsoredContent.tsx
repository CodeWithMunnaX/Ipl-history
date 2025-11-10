'use client';

import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface SponsoredItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  sponsor: string;
  cta: string;
}

const sponsoredItems: SponsoredItem[] = [
  {
    id: '1',
    title: 'Dream11: Win Big This IPL Season',
    description: 'Create your fantasy team and win real cash prizes. Join millions of cricket fans!',
    image: '/images/unnamed.png',
    link: 'https://dream11.com',
    sponsor: 'Dream11',
    cta: 'Play Now',
  },
  {
    id: '2',
    title: 'Premium Cricket Gear - Up to 50% OFF',
    description: 'Get professional cricket equipment from top brands. Limited time offer!',
    image: '/images/Picture1.png',
    link: '#',
    sponsor: 'Cricket Store',
    cta: 'Shop Now',
  },
  {
    id: '3',
    title: 'Live IPL Streaming on Hotstar',
    description: 'Watch every ball live in HD. Subscribe now and never miss a match!',
    image: '/images/tata_ipl-logo_brandlogos.net_k2ryd (1).png',
    link: '#',
    sponsor: 'Disney+ Hotstar',
    cta: 'Subscribe',
  },
];

export default function SponsoredContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-bold">Sponsored</h3>
        <Badge variant="secondary" className="text-xs">Ad</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sponsoredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group border-2">
            <CardContent className="p-0">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-20">🏏</div>
                </div>
                <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
                  Sponsored
                </Badge>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    By {item.sponsor}
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => window.open(item.link, '_blank')}
                >
                  {item.cta}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        * Sponsored content helps us keep this platform free for all cricket fans
      </p>
    </div>
  );
}

