import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ExternalLink, Rocket, DollarSign, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function GettingStarted() {
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <Rocket className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Getting Started with Monetization 💰
        </h1>
        <p className="text-xl text-white/90 mb-6">
          Follow these simple steps to start earning ₹1,00,000+ per month from your IPL website
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Badge className="bg-white/20 text-white text-lg px-6 py-2">
            <DollarSign className="h-5 w-5 mr-2" />
            ₹1L+/month potential
          </Badge>
          <Badge className="bg-white/20 text-white text-lg px-6 py-2">
            <Users className="h-5 w-5 mr-2" />
            10,000+ visitors needed
          </Badge>
          <Badge className="bg-white/20 text-white text-lg px-6 py-2">
            <TrendingUp className="h-5 w-5 mr-2" />
            6 months to profit
          </Badge>
        </div>
      </div>

      {/* Priority Steps */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">📋 Step-by-Step Implementation</h2>

        {/* Step 1 */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center">1</span>
              Google AdSense Setup
              <Badge variant="destructive">HIGH PRIORITY</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                💰 Revenue Potential: ₹20,000-50,000/month
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                With 10,000 daily visitors
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold">Implementation Steps:</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold">Sign up for AdSense</p>
                    <p className="text-sm text-muted-foreground">Visit: https://www.google.com/adsense/start/</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold">Add your website URL</p>
                    <p className="text-sm text-muted-foreground">Submit for approval (takes 7-14 days)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold">Get Publisher ID</p>
                    <p className="text-sm text-muted-foreground">Format: ca-pub-XXXXXXXXXXXXXXXXX</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold">Update layout.tsx</p>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      src/app/layout.tsx (line 31)
                    </code>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold">Create Ad Units</p>
                    <p className="text-sm text-muted-foreground">In AdSense dashboard, create different ad sizes</p>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full" asChild>
              <a href="https://www.google.com/adsense/start/" target="_blank">
                Apply for AdSense Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center">2</span>
              Newsletter Setup
              <Badge className="bg-blue-500">MEDIUM PRIORITY</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                📧 Revenue Potential: ₹5,000-10,000/month
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Through email marketing campaigns
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mailchimp</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Free up to 500 subscribers</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://mailchimp.com" target="_blank">
                      Sign Up
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SendGrid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Free 100 emails/day</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://sendgrid.com" target="_blank">
                      Sign Up
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ConvertKit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Free up to 1,000</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://convertkit.com" target="_blank">
                      Sign Up
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center">3</span>
              Affiliate Programs
              <Badge className="bg-purple-500">HIGH PRIORITY</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <p className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                🤝 Revenue Potential: ₹10,000-30,000/month
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                ₹100-500 commission per signup
              </p>
            </div>

            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">Dream11 / MPL Affiliate</h4>
                  <Badge>₹100-500/signup</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Fantasy sports platforms with high conversion rates
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.vcommission.com" target="_blank">
                    Join via VCommission
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">Amazon Associates</h4>
                  <Badge>5-10% commission</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Cricket gear, equipment, and merchandise
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://affiliate.amazon.in" target="_blank">
                    Sign Up Now
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center">4</span>
              Premium Membership
              <Badge className="bg-amber-500">MEDIUM PRIORITY</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
              <p className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                👑 Revenue Potential: ₹50,000-1,00,000/month
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                With 200+ premium subscribers at ₹499/year
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold">Payment Gateway Options:</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-3">
                  <h5 className="font-semibold mb-1">Razorpay</h5>
                  <p className="text-xs text-muted-foreground mb-2">2% fee</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://razorpay.com" target="_blank">
                      Sign Up
                    </a>
                  </Button>
                </div>
                <div className="border rounded-lg p-3">
                  <h5 className="font-semibold mb-1">Instamojo</h5>
                  <p className="text-xs text-muted-foreground mb-2">2% + ₹3</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://instamojo.com" target="_blank">
                      Sign Up
                    </a>
                  </Button>
                </div>
                <div className="border rounded-lg p-3">
                  <h5 className="font-semibold mb-1">Stripe</h5>
                  <p className="text-xs text-muted-foreground mb-2">2.9% + ₹2</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://stripe.com" target="_blank">
                      Sign Up
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="text-2xl">🚀 Quick Actions - Start Today!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
              <Link href="/monetization-demo">
                View All Components
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white" asChild>
              <a href="https://www.google.com/adsense/start/" target="_blank">
                Apply for AdSense Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projection */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Revenue Projection (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-3xl font-bold text-green-600">Month 1-2</p>
                <p className="text-xl font-semibold mt-2">₹10,000-20,000</p>
                <p className="text-sm text-muted-foreground mt-1">Setup & Approval Phase</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">Month 3-4</p>
                <p className="text-xl font-semibold mt-2">₹40,000-80,000</p>
                <p className="text-sm text-muted-foreground mt-1">Growth Phase</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">Month 5-6</p>
                <p className="text-xl font-semibold mt-2">₹1,00,000+</p>
                <p className="text-sm text-muted-foreground mt-1">Profit Phase</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

