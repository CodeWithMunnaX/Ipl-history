import NewsletterSubscription from '@/components/NewsletterSubscription';
import AdBanner from '@/components/AdBanner';
import SocialShare from '@/components/SocialShare';
import SponsoredContent from '@/components/SponsoredContent';
import PremiumBanner from '@/components/PremiumBanner';
import AffiliateSection from '@/components/AffiliateSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MonetizationDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          💰 Monetization Features Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          All the components you need to monetize your IPL website
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <Link href="/getting-started">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
              🚀 Getting Started Guide
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      {/* Premium Banner */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>👑</span> Premium Membership Banner
        </h2>
        <PremiumBanner />
      </section>

      <Separator />

      {/* Newsletter Subscription */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>📧</span> Newsletter Subscription
        </h2>
        <NewsletterSubscription />
      </section>

      <Separator />

      {/* Ad Banners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>📢</span> Advertisement Banners (Google AdSense)
        </h2>
        
        <div className="space-y-6">
          {/* Leaderboard */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Leaderboard (728x90)</h3>
            <AdBanner size="leaderboard" />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Small (320x100)</h3>
              <AdBanner size="small" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Medium (300x250)</h3>
              <AdBanner size="medium" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Large (300x600)</h3>
              <AdBanner size="large" />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Sponsored Content */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🎯</span> Sponsored Content
        </h2>
        <SponsoredContent />
      </section>

      <Separator />

      {/* Affiliate Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🤝</span> Affiliate Marketing
        </h2>
        <AffiliateSection />
      </section>

      <Separator />

      {/* Social Share */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🔗</span> Social Media Share Buttons
        </h2>
        <Card>
          <CardContent className="p-6">
            <SocialShare 
              title="Amazing IPL Stats - Check this out!"
              description="Discover detailed IPL statistics, predictions, and analytics."
            />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Implementation Guide */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>📚</span> Implementation Guide
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>✅ What&apos;s Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Cookie Consent Banner</li>
                <li>✓ Newsletter Subscription</li>
                <li>✓ Google AdSense Placeholders</li>
                <li>✓ Social Media Share Buttons</li>
                <li>✓ Sponsored Content Section</li>
                <li>✓ Premium Membership Banner</li>
                <li>✓ Affiliate Product Cards</li>
                <li>✓ Floating WhatsApp Button</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Monetization Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>🎯 Google AdSense (₹20-50k/month)</li>
                <li>🤝 Affiliate Marketing (Dream11, MPL)</li>
                <li>👑 Premium Subscriptions (₹499/year)</li>
                <li>📧 Email Marketing (Newsletter)</li>
                <li>🎪 Sponsored Posts (₹5-10k/post)</li>
                <li>🏏 Cricket Gear Commissions</li>
                <li>📱 App Downloads (CPA)</li>
                <li>🎬 Video Ads (₹10k+/month)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold mb-2">
            💰 Potential Monthly Revenue: ₹50,000 - ₹2,00,000+
          </h3>
          <p className="text-white/90">
            With 10,000+ daily visitors and proper implementation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

