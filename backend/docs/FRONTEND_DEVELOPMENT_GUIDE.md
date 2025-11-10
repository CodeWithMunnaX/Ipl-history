# 🎨 Frontend Development Guide - IPL Dashboard with ML

## 📋 Table of Contents
1. [Tech Stack Recommendations](#tech-stack)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup)
4. [Component Library](#components)
5. [API Integration](#api-integration)
6. [UI/UX Design Guidelines](#design)
7. [Deployment](#deployment)

---

## 🛠️ Tech Stack Recommendations

### **Option 1: Next.js (Recommended)**
```bash
# Best for: Production-ready, SEO-optimized, full-stack app

Tech Stack:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui (Component Library)
- React Query (Data Fetching)
- Recharts/Chart.js (Visualizations)
- Framer Motion (Animations)
```

### **Option 2: React + Vite**
```bash
# Best for: Fast development, SPA

Tech Stack:
- React 18+
- Vite
- TypeScript
- Tailwind CSS
- Material-UI or Ant Design
- Axios (API calls)
- Chart.js or D3.js
```

### **Option 3: Vue.js**
```bash
# Best for: Simplicity, learning curve

Tech Stack:
- Vue 3 (Composition API)
- Nuxt.js (for SSR)
- TypeScript
- Vuetify or Element Plus
- Pinia (State Management)
- Vue Chart.js
```

---

## 📁 Recommended Project Structure (Next.js)

```
frontend/
├── src/
│   ├── app/
│   │   ├── (routes)/
│   │   │   ├── page.tsx                    # Home
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx               # Teams list
│   │   │   │   └── [id]/page.tsx          # Team detail
│   │   │   ├── players/
│   │   │   │   ├── page.tsx               # Players list
│   │   │   │   └── [id]/page.tsx          # Player detail
│   │   │   ├── matches/
│   │   │   │   ├── page.tsx               # Matches list
│   │   │   │   └── [id]/page.tsx          # Match detail
│   │   │   ├── predictions/
│   │   │   │   ├── page.tsx               # ML Predictions hub
│   │   │   │   ├── match/page.tsx         # Match predictor
│   │   │   │   ├── player/page.tsx        # Player forecast
│   │   │   │   ├── dream11/page.tsx       # Dream11 optimizer
│   │   │   │   └── valuation/page.tsx     # Player valuation
│   │   │   ├── live/
│   │   │   │   └── [matchId]/page.tsx     # Live match
│   │   │   └── stats/
│   │   │       └── page.tsx               # Statistics
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                            # Shadcn components
│   │   ├── charts/
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   └── WinProbabilityMeter.tsx
│   │   ├── ml/
│   │   │   ├── MatchPredictor.tsx
│   │   │   ├── PlayerForecast.tsx
│   │   │   ├── Dream11Optimizer.tsx
│   │   │   ├── WinProbability.tsx
│   │   │   └── PlayerValuation.tsx
│   │   ├── cards/
│   │   │   ├── TeamCard.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   └── MatchCard.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── shared/
│   │       ├── Loading.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── SearchBar.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios/Fetch config
│   │   │   ├── teams.ts
│   │   │   ├── players.ts
│   │   │   ├── matches.ts
│   │   │   └── ml.ts                  # ML endpoints
│   │   ├── hooks/
│   │   │   ├── useTeams.ts
│   │   │   ├── usePlayers.ts
│   │   │   ├── useMatchPrediction.ts
│   │   │   └── useWinProbability.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       └── helpers.ts
│   │
│   ├── types/
│   │   ├── team.ts
│   │   ├── player.ts
│   │   ├── match.ts
│   │   └── ml.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── images/
│   └── icons/
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🚀 Setup Instructions

### **Next.js Setup**

```bash
# 1. Create Next.js project
npx create-next-app@latest ipl-dashboard --typescript --tailwind --app

cd ipl-dashboard

# 2. Install dependencies
npm install axios react-query recharts framer-motion
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install lucide-react class-variance-authority clsx tailwind-merge

# 3. Install Shadcn/ui
npx shadcn-ui@latest init

# 4. Add Shadcn components
npx shadcn-ui@latest add button card input select dialog tabs

# 5. Start development server
npm run dev
```

---

## 🎯 Component Examples

### **1. Match Predictor Component**

```typescript
// src/components/ml/MatchPredictor.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { predictMatch } from '@/lib/api/ml';

interface MatchPredictionResult {
  predicted_winner: string;
  team1_win_probability: number;
  team2_win_probability: number;
  confidence_score: number;
}

export default function MatchPredictor() {
  const [team1, setTeam1] = useState<number | null>(null);
  const [team2, setTeam2] = useState<number | null>(null);
  const [venue, setVenue] = useState<string>('');
  const [prediction, setPrediction] = useState<MatchPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!team1 || !team2 || !venue) return;
    
    setLoading(true);
    try {
      const result = await predictMatch({
        team1_id: team1,
        team2_id: team2,
        venue: venue,
        season: 2024
      });
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          🤖 Match Outcome Prediction
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Team Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team 1</label>
              <Select onValueChange={(value) => setTeam1(Number(value))}>
                {/* Add team options */}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Team 2</label>
              <Select onValueChange={(value) => setTeam2(Number(value))}>
                {/* Add team options */}
              </Select>
            </div>
          </div>
          
          {/* Venue Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Venue</label>
            <Select onValueChange={setVenue}>
              {/* Add venue options */}
            </Select>
          </div>
          
          {/* Predict Button */}
          <Button 
            onClick={handlePredict} 
            disabled={loading || !team1 || !team2 || !venue}
            className="w-full"
          >
            {loading ? 'Predicting...' : 'Predict Winner'}
          </Button>
          
          {/* Results */}
          {prediction && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h3 className="text-xl font-bold mb-4">
                Predicted Winner: {prediction.predicted_winner}
              </h3>
              
              <div className="space-y-3">
                {/* Probability Bars */}
                <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${prediction.team1_win_probability * 100}%` }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white font-bold">
                      {(prediction.team1_win_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div 
                    className="absolute right-0 h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${prediction.team2_win_probability * 100}%` }}
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white font-bold">
                      {(prediction.team2_win_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Confidence Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Score:</span>
                  <span className="text-lg font-bold">
                    {(prediction.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### **2. Player Forecast Component**

```typescript
// src/components/ml/PlayerForecast.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ForecastData {
  player_name: string;
  batting_forecast: {
    predicted_runs: number;
    predicted_strike_rate: number;
    trend: 'improving' | 'declining' | 'stable';
    confidence_interval: { min: number; max: number; avg: number };
    current_season_stats: { runs: number; strike_rate: number; matches: number };
  };
}

export default function PlayerForecast({ playerId }: { playerId: number }) {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/ml/forecast/player/${playerId}`)
      .then(res => res.json())
      .then(data => {
        setForecast(data);
        setLoading(false);
      });
  }, [playerId]);

  if (loading) return <div>Loading forecast...</div>;
  if (!forecast || !forecast.batting_forecast) return <div>No data available</div>;

  const { batting_forecast } = forecast;
  
  const TrendIcon = {
    improving: TrendingUp,
    declining: TrendingDown,
    stable: Minus
  }[batting_forecast.trend];
  
  const trendColor = {
    improving: 'text-green-500',
    declining: 'text-red-500',
    stable: 'text-gray-500'
  }[batting_forecast.trend];

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">{forecast.player_name}</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Season */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Season (2024)</h3>
          <div className="space-y-2">
            <StatRow label="Runs" value={batting_forecast.current_season_stats.runs} />
            <StatRow label="Strike Rate" value={batting_forecast.current_season_stats.strike_rate.toFixed(2)} />
            <StatRow label="Matches" value={batting_forecast.current_season_stats.matches} />
          </div>
        </div>
        
        {/* Next Season Prediction */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Prediction (2025)</h3>
          <div className="space-y-2">
            <StatRow 
              label="Expected Runs" 
              value={batting_forecast.predicted_runs}
              badge={
                <span className={`flex items-center gap-1 ${trendColor}`}>
                  <TrendIcon size={16} />
                  {batting_forecast.trend}
                </span>
              }
            />
            <StatRow 
              label="Strike Rate" 
              value={batting_forecast.predicted_strike_rate.toFixed(2)} 
            />
            <div className="text-sm text-gray-600">
              Range: {batting_forecast.confidence_interval.min} - {batting_forecast.confidence_interval.max}
            </div>
          </div>
        </div>
      </div>
      
      {/* Visualization */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={[
            { season: '2024', runs: batting_forecast.current_season_stats.runs },
            { season: '2025', runs: batting_forecast.predicted_runs }
          ]}>
            <XAxis dataKey="season" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="runs" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StatRow({ label, value, badge }: { label: string; value: any; badge?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-bold">{value}</span>
        {badge}
      </div>
    </div>
  );
}
```

### **3. Dream11 Optimizer Component**

```typescript
// src/components/ml/Dream11Optimizer.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star } from 'lucide-react';

export default function Dream11Optimizer() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  const optimizeTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ml/dream11/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_id: 3,
          team2_id: 1,
          venue: 'Wankhede Stadium',
          budget: 100
        })
      });
      const data = await response.json();
      setTeam(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Dream11 Team Optimizer</h2>
        
        <Button onClick={optimizeTeam} disabled={loading} className="w-full">
          {loading ? 'Optimizing...' : 'Generate Optimal Team'}
        </Button>
      </Card>
      
      {team && (
        <div className="space-y-4">
          {/* Captain & Vice Captain */}
          <div className="grid md:grid-cols-2 gap-4">
            <PlayerCard 
              player={team.captain} 
              badge={<Crown className="text-yellow-500" />}
              label="Captain (2x)"
            />
            <PlayerCard 
              player={team.vice_captain} 
              badge={<Star className="text-silver-500" />}
              label="Vice Captain (1.5x)"
            />
          </div>
          
          {/* Team Sections */}
          <TeamSection title="Wicket Keepers" players={team.wicket_keepers} />
          <TeamSection title="Batsmen" players={team.batsmen} />
          <TeamSection title="All Rounders" players={team.all_rounders} />
          <TeamSection title="Bowlers" players={team.bowlers} />
          
          {/* Stats */}
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{team.total_predicted_points}</div>
                <div className="text-sm text-gray-600">Predicted Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{team.total_cost}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{team.team_balance_score}%</div>
                <div className="text-sm text-gray-600">Balance Score</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TeamSection({ title, players }) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.map(player => (
          <PlayerCard key={player.player_id} player={player} />
        ))}
      </div>
    </Card>
  );
}

function PlayerCard({ player, badge, label }) {
  return (
    <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold">{player.player_name}</div>
          <div className="text-sm text-gray-600">{player.role}</div>
          {label && <div className="text-xs text-blue-600 mt-1">{label}</div>}
        </div>
        {badge}
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span>Points: <strong>{player.predicted_points}</strong></span>
        <span>Cost: <strong>{player.cost}</strong></span>
      </div>
      <div className="mt-1">
        <span className={`text-xs px-2 py-1 rounded ${
          player.recent_form === 'excellent' ? 'bg-green-100 text-green-800' :
          player.recent_form === 'good' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {player.recent_form}
        </span>
      </div>
    </div>
  );
}
```

### **4. Win Probability Live Tracker**

```typescript
// src/components/ml/WinProbabilityTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function WinProbabilityTracker({ matchId }: { matchId: number }) {
  const [probability, setProbability] = useState(null);
  const [matchState, setMatchState] = useState({
    innings: 2,
    over: 15.3,
    score: 142,
    wickets: 4,
    target: 180
  });

  useEffect(() => {
    const fetchProbability = async () => {
      const response = await fetch('http://localhost:8000/ml/win-probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId,
          current_innings: matchState.innings,
          current_over: matchState.over,
          current_score: matchState.score,
          wickets_fallen: matchState.wickets,
          target: matchState.target
        })
      });
      const data = await response.json();
      setProbability(data);
    };

    fetchProbability();
    const interval = setInterval(fetchProbability, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [matchId, matchState]);

  if (!probability) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-red-500 animate-pulse" />
        <h3 className="text-xl font-bold">Live Win Probability</h3>
      </div>
      
      {/* Probability Meter */}
      <div className="relative h-16 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div 
          className="absolute left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
          style={{ width: `${probability.batting_team_win_probability * 100}%` }}
        />
        
        <div className="absolute inset-0 flex items-center justify-between px-4 text-white font-bold">
          <span>{(probability.batting_team_win_probability * 100).toFixed(1)}%</span>
          <span>{(probability.bowling_team_win_probability * 100).toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Match Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox label="Current RR" value={probability.current_run_rate.toFixed(2)} />
        {probability.required_run_rate && (
          <StatBox 
            label="Required RR" 
            value={probability.required_run_rate.toFixed(2)}
            highlight={probability.required_run_rate > probability.current_run_rate}
          />
        )}
        <StatBox 
          label="Momentum" 
          value={`${(probability.momentum_score * 100).toFixed(0)}%`} 
        />
        <StatBox label="Score" value={`${matchState.score}/${matchState.wickets}`} />
      </div>
      
      {/* Key Insights */}
      <div>
        <h4 className="font-semibold mb-2">Key Insights</h4>
        <ul className="space-y-2">
          {probability.key_insights.map((insight, index) => (
            <li key={index} className="text-sm flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  );
}
```

---

## 🎨 UI/UX Design Guidelines

### **Color Scheme**
```css
:root {
  --primary: #1e40af;      /* Blue */
  --secondary: #7c3aed;    /* Purple */
  --success: #10b981;      /* Green */
  --warning: #f59e0b;      /* Orange */
  --danger: #ef4444;       /* Red */
  --background: #ffffff;
  --foreground: #1f2937;
}
```

### **Typography**
```css
font-family: 'Inter', 'Segoe UI', sans-serif;

/* Headings */
h1: 2.5rem, font-weight: 800
h2: 2rem, font-weight: 700
h3: 1.5rem, font-weight: 600

/* Body */
body: 1rem, font-weight: 400
```

### **Responsive Breakpoints**
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
```

---

## 📱 Mobile-First Design

```typescript
// Example responsive component
<div className="
  w-full
  px-4 sm:px-6 lg:px-8
  py-6 sm:py-8 lg:py-12
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 md:gap-6 lg:gap-8
">
  {/* Content */}
</div>
```

---

## 🚀 Deployment

### **Vercel (Recommended for Next.js)**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend.com
```

### **Netlify**
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend.com/:splat"
  status = 200
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)
- [React Query](https://tanstack.com/query/latest)

---

**🎉 Happy Coding! Build an amazing IPL Dashboard!**

