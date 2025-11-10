# 🔧 ML Features Integration Guide

## Current Situation
- Your `main.py` is already running on port 8000
- ML features are ready but not integrated yet
- Need to add ML endpoints to existing server

## 🚀 Option 1: Quick Integration (Recommended)

### Add these lines to your existing `main.py`:

Find the section where you define your FastAPI app (around line 89), and **AFTER** the existing routes, add:

```python
# ============== ADD THIS SECTION ==============
# ML Predictions Integration
try:
    from app.routes.ml_predictions import router as ml_router
    app.include_router(ml_router)
    print("✓ ML Features loaded successfully!")
except Exception as e:
    print(f"⚠ ML Features not available: {e}")
# ==============================================
```

### That's it! Now restart your server:

```bash
# Stop current server (Ctrl+C in terminal where main.py is running)
# Then start again:
python main.py
```

---

## 🚀 Option 2: Run ML Server Separately (Different Port)

If you want to keep them separate:

```bash
# In terminal 1: Your existing server
python main.py  # Runs on port 8000

# In terminal 2: New ML server  
uvicorn app.main_new:app --port 8001 --reload
```

Then your frontend will call:
- Old endpoints: `http://localhost:8000/...`
- ML endpoints: `http://localhost:8001/ml/...`

---

## ✅ Verify Integration

Run this test:

```bash
python test_ml_api.py
```

You should see:
```
[OK] ML Services Health: {...}
[OK] Match Prediction successful!
[OK] Player Forecast successful!
...
```

---

## 🎨 Frontend Integration Examples

### Example 1: Match Prediction (JavaScript)

```javascript
// Fetch match prediction
async function predictMatch(team1Id, team2Id, venue) {
    const response = await fetch('http://localhost:8000/ml/predict/match', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            team1_id: team1Id,
            team2_id: team2Id,
            venue: venue,
            season: 2024
        })
    });
    
    const data = await response.json();
    console.log('Prediction:', data);
    return data;
}

// Usage
predictMatch(3, 1, 'Wankhede Stadium').then(result => {
    console.log(`Winner: ${result.predicted_winner}`);
    console.log(`Probability: ${result.team1_win_probability * 100}%`);
});
```

### Example 2: Player Forecast (React)

```jsx
// PlayerForecast.jsx
import { useState, useEffect } from 'react';

function PlayerForecast({ playerId }) {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch(`http://localhost:8000/ml/forecast/player/${playerId}`)
            .then(res => res.json())
            .then(data => {
                setForecast(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error:', err);
                setLoading(false);
            });
    }, [playerId]);
    
    if (loading) return <div>Loading...</div>;
    if (!forecast) return <div>No data</div>;
    
    return (
        <div className="forecast-card">
            <h2>{forecast.player_name}</h2>
            {forecast.batting_forecast && (
                <div>
                    <h3>Next Season Prediction</h3>
                    <p>Expected Runs: {forecast.batting_forecast.predicted_runs}</p>
                    <p>Strike Rate: {forecast.batting_forecast.predicted_strike_rate}</p>
                    <p>Trend: {forecast.batting_forecast.trend}</p>
                </div>
            )}
        </div>
    );
}

export default PlayerForecast;
```

### Example 3: Dream11 Team (Vue.js)

```vue
<template>
    <div class="dream11-optimizer">
        <button @click="optimizeTeam">Generate Dream11 Team</button>
        
        <div v-if="team" class="team-display">
            <h2>Optimal Dream11 Team</h2>
            
            <!-- Captain -->
            <div class="captain">
                <h3>Captain (C)</h3>
                <div class="player-card">
                    {{ team.captain.player_name }}
                    <br>Points: {{ team.captain.predicted_points }}
                </div>
            </div>
            
            <!-- Vice Captain -->
            <div class="vice-captain">
                <h3>Vice Captain (VC)</h3>
                <div class="player-card">
                    {{ team.vice_captain.player_name }}
                    <br>Points: {{ team.vice_captain.predicted_points }}
                </div>
            </div>
            
            <!-- Other players -->
            <div class="team-sections">
                <div v-for="wk in team.wicket_keepers" :key="wk.player_id">
                    {{ wk.player_name }} (WK)
                </div>
                <!-- Add other sections similarly -->
            </div>
            
            <div class="team-stats">
                <p>Total Predicted Points: {{ team.total_predicted_points }}</p>
                <p>Total Cost: {{ team.total_cost }} credits</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            team: null
        }
    },
    methods: {
        async optimizeTeam() {
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
                
                this.team = await response.json();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
}
</script>
```

### Example 4: Win Probability Meter (HTML + CSS)

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .probability-meter {
            width: 100%;
            height: 60px;
            background: #e0e0e0;
            border-radius: 30px;
            overflow: hidden;
            position: relative;
        }
        
        .batting-prob {
            position: absolute;
            left: 0;
            height: 100%;
            background: linear-gradient(90deg, #2196F3, #1976D2);
            transition: width 1s ease;
            display: flex;
            align-items: center;
            padding-left: 20px;
            color: white;
            font-weight: bold;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }
        
        .stat-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="win-probability">
        <h2>Live Win Probability</h2>
        
        <div class="probability-meter">
            <div class="batting-prob" id="battingProb">
                <span id="probText">Loading...</span>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-box">
                <div class="label">Current RR</div>
                <div class="value" id="currentRR">-</div>
            </div>
            <div class="stat-box">
                <div class="label">Required RR</div>
                <div class="value" id="requiredRR">-</div>
            </div>
            <div class="stat-box">
                <div class="label">Momentum</div>
                <div class="value" id="momentum">-</div>
            </div>
        </div>
        
        <div class="insights" id="insights"></div>
    </div>
    
    <script>
        async function updateWinProbability() {
            try {
                const response = await fetch('http://localhost:8000/ml/win-probability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        match_id: 335982,
                        current_innings: 2,
                        current_over: 15.3,
                        current_score: 142,
                        wickets_fallen: 4,
                        target: 180
                    })
                });
                
                const data = await response.json();
                
                // Update probability meter
                const battingProb = data.batting_team_win_probability * 100;
                document.getElementById('battingProb').style.width = battingProb + '%';
                document.getElementById('probText').textContent = battingProb.toFixed(1) + '%';
                
                // Update stats
                document.getElementById('currentRR').textContent = data.current_run_rate.toFixed(2);
                document.getElementById('requiredRR').textContent = data.required_run_rate.toFixed(2);
                document.getElementById('momentum').textContent = (data.momentum_score * 100).toFixed(0) + '%';
                
                // Update insights
                const insightsDiv = document.getElementById('insights');
                insightsDiv.innerHTML = '<h3>Key Insights</h3>';
                data.key_insights.forEach(insight => {
                    insightsDiv.innerHTML += `<p>• ${insight}</p>`;
                });
                
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        // Update every 30 seconds
        setInterval(updateWinProbability, 30000);
        
        // Initial load
        updateWinProbability();
    </script>
</body>
</html>
```

---

## 📦 Complete API Endpoints

### ML Prediction Endpoints:

```
POST   /ml/predict/match          - Match outcome prediction
GET    /ml/forecast/player/{id}   - Player performance forecast
POST   /ml/dream11/optimize       - Dream11 team optimization
POST   /ml/win-probability        - Real-time win probability
GET    /ml/valuation/player/{id}  - Player auction valuation
POST   /ml/train/match-predictor  - Train ML model
GET    /ml/health                 - ML services health check
```

### Request/Response Examples:

**1. Match Prediction:**
```json
// POST /ml/predict/match
{
    "team1_id": 3,
    "team2_id": 1,
    "venue": "Wankhede Stadium",
    "season": 2024
}

// Response
{
    "team1_name": "Mumbai Indians",
    "team2_name": "Chennai Super Kings",
    "predicted_winner": "Mumbai Indians",
    "team1_win_probability": 0.65,
    "team2_win_probability": 0.35,
    "confidence_score": 0.30,
    "key_factors": {
        "venue_impact": 0.15,
        "toss_impact": 0.12,
        "team1_form": 0.62,
        "team2_form": 0.58
    }
}
```

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Solution: Make sure you're in backend directory
cd D:\MUNNA\Data Science\Project\ipl\backend
pip install -r requirements_ml.txt
```

### Error: "Connection refused"
```bash
# Solution: Server not running
python main.py  # or python -m app.main_new
```

### Error: "404 Not Found"
```bash
# Solution: ML routes not registered
# Add the integration code to main.py (see Option 1 above)
```

### CORS Error in Browser
```javascript
// Already handled! But if you still face issues:
// Make sure CORS is enabled in your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎓 Next Steps

1. ✅ Add ML routes to main.py (Option 1)
2. ✅ Restart your server
3. ✅ Run `python test_ml_api.py` to verify
4. ✅ Start building frontend components
5. ✅ Use the JavaScript examples above
6. ✅ Check `FRONTEND_DEVELOPMENT_GUIDE.md` for more

---

**Need help?** Check:
- `ML_FEATURES_GUIDE.md` - Complete ML documentation
- `FRONTEND_DEVELOPMENT_GUIDE.md` - Frontend examples
- `QUICK_START.md` - Quick start guide

**API Docs:** `http://localhost:8000/docs`

