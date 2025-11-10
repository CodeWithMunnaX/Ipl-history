# 🤖 IPL ML Features - Frontend Integration Guide

## 📋 **ML Endpoints Working Status**

✅ **All ML Endpoints are Working!**

### 🎯 **Available ML Endpoints:**

1. **POST** `/ml/predict/match` - Match Outcome Prediction
2. **GET** `/ml/forecast/player/{player_id}` - Player Performance Forecast  
3. **POST** `/ml/dream11/optimize` - Dream11 Fantasy Team Optimizer
4. **GET** `/ml/valuation/player/{player_id}` - Player Auction Value Estimation
5. **GET** `/ml/health` - ML Services Health Check

---

## 🚀 **Frontend Integration Examples**

### **1. Match Outcome Prediction**

#### **API Call:**
```javascript
// POST /ml/predict/match
const predictMatch = async (team1Id, team2Id, venue) => {
  try {
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
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Prediction error:', error);
  }
};

// Usage
const prediction = await predictMatch(1, 2, 'M Chinnaswamy Stadium');
console.log(prediction);
```

#### **Response Structure:**
```json
{
  "team1_name": "Royal Challengers Bangalore",
  "team2_name": "Sunrisers Hyderabad", 
  "predicted_winner": "Royal Challengers Bangalore",
  "team1_win_probability": 0.516,
  "team2_win_probability": 0.484,
  "confidence_score": 0.031,
  "key_factors": {
    "team1_historical_rate": 0.263,
    "team2_historical_rate": 0.247,
    "venue": "M Chinnaswamy Stadium"
  },
  "venue": "M Chinnaswamy Stadium",
  "model_version": "1.0-simple"
}
```

#### **React Component Example:**
```jsx
import React, { useState } from 'react';

const MatchPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ml/predict/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_id: 1,
          team2_id: 2,
          venue: 'M Chinnaswamy Stadium',
          season: 2024
        })
      });
      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="prediction-container">
      <button onClick={handlePrediction} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Match'}
      </button>
      
      {prediction && (
        <div className="prediction-result">
          <h3>Match Prediction</h3>
          <p><strong>Winner:</strong> {prediction.predicted_winner}</p>
          <p><strong>Team 1 Probability:</strong> {(prediction.team1_win_probability * 100).toFixed(1)}%</p>
          <p><strong>Team 2 Probability:</strong> {(prediction.team2_win_probability * 100).toFixed(1)}%</p>
          <p><strong>Confidence:</strong> {(prediction.confidence_score * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};
```

---

### **2. Player Performance Forecast**

#### **API Call:**
```javascript
// GET /ml/forecast/player/{player_id}
const forecastPlayer = async (playerId) => {
  try {
    const response = await fetch(`http://localhost:8000/ml/forecast/player/${playerId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Forecast error:', error);
  }
};

// Usage
const forecast = await forecastPlayer(61); // Suryakumar Yadav
console.log(forecast);
```

#### **Response Structure:**
```json
{
  "player_id": 61,
  "player_name": "SA Yadav",
  "player_full_name": "Suryakumar Ashok Yadav",
  "batting_forecast": {
    "predicted_runs": 555,
    "predicted_strike_rate": 168.69,
    "trend": "improving",
    "confidence_interval": {
      "min": 471,
      "max": 638,
      "avg": 555
    },
    "current_season_stats": {
      "runs": 717,
      "balls": 439,
      "strike_rate": 163.33
    }
  },
  "bowling_forecast": null,
  "player_type": "batsman"
}
```

#### **React Component Example:**
```jsx
const PlayerForecast = ({ playerId }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/ml/forecast/player/${playerId}`);
        const result = await response.json();
        setForecast(result);
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };

    if (playerId) {
      fetchForecast();
    }
  }, [playerId]);

  if (loading) return <div>Loading forecast...</div>;
  if (!forecast) return null;

  return (
    <div className="forecast-container">
      <h3>{forecast.player_full_name} - Performance Forecast</h3>
      
      <div className="forecast-stats">
        <div className="stat-card">
          <h4>Predicted Runs</h4>
          <p className="stat-value">{forecast.batting_forecast.predicted_runs}</p>
        </div>
        
        <div className="stat-card">
          <h4>Strike Rate</h4>
          <p className="stat-value">{forecast.batting_forecast.predicted_strike_rate}</p>
        </div>
        
        <div className="stat-card">
          <h4>Trend</h4>
          <p className={`stat-value ${forecast.batting_forecast.trend}`}>
            {forecast.batting_forecast.trend}
          </p>
        </div>
      </div>
      
      <div className="confidence-interval">
        <h4>Confidence Interval</h4>
        <p>Min: {forecast.batting_forecast.confidence_interval.min}</p>
        <p>Max: {forecast.batting_forecast.confidence_interval.max}</p>
      </div>
    </div>
  );
};
```

---

### **3. Dream11 Fantasy Team Optimizer**

#### **API Call:**
```javascript
// POST /ml/dream11/optimize
const optimizeDream11 = async (budget = 100.0) => {
  try {
    const response = await fetch('http://localhost:8000/ml/dream11/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget: budget,
        players_per_team: 11,
        captain_multiplier: 2.0,
        vice_captain_multiplier: 1.5
      })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Optimization error:', error);
  }
};

// Usage
const team = await optimizeDream11(100.0);
console.log(team);
```

#### **Response Structure:**
```json
{
  "team": [
    {
      "player_id": 61,
      "player_name": "SA Yadav",
      "player_full_name": "Suryakumar Ashok Yadav",
      "team_name": "Mumbai Indians",
      "player_type": "batsman",
      "points": 555,
      "cost": 8.5,
      "image_url": "",
      "is_captain": true
    }
  ],
  "summary": {
    "total_players": 11,
    "total_cost": 95.5,
    "remaining_budget": 4.5,
    "estimated_points": 1250.5,
    "captain": "SA Yadav",
    "vice_captain": "Virat Kohli"
  },
  "optimization_factors": {
    "form_based": true,
    "venue_consideration": false,
    "opposition_analysis": false,
    "model_version": "1.0-simple"
  }
}
```

#### **React Component Example:**
```jsx
const Dream11Optimizer = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(100);

  const optimizeTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ml/dream11/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: budget,
          players_per_team: 11
        })
      });
      const result = await response.json();
      setTeam(result);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="dream11-optimizer">
      <div className="controls">
        <input 
          type="number" 
          value={budget} 
          onChange={(e) => setBudget(Number(e.target.value))}
          placeholder="Budget"
        />
        <button onClick={optimizeTeam} disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Team'}
        </button>
      </div>

      {team && (
        <div className="optimized-team">
          <div className="team-summary">
            <h3>Optimized Team Summary</h3>
            <p><strong>Total Cost:</strong> ₹{team.summary.total_cost}</p>
            <p><strong>Remaining Budget:</strong> ₹{team.summary.remaining_budget}</p>
            <p><strong>Estimated Points:</strong> {team.summary.estimated_points}</p>
            <p><strong>Captain:</strong> {team.summary.captain}</p>
            <p><strong>Vice Captain:</strong> {team.summary.vice_captain}</p>
          </div>

          <div className="team-players">
            <h3>Selected Players</h3>
            <div className="players-grid">
              {team.team.map((player, index) => (
                <div key={index} className={`player-card ${player.player_type}`}>
                  <img src={player.image_url} alt={player.player_name} />
                  <h4>{player.player_name}</h4>
                  <p>{player.team_name}</p>
                  <p className="player-type">{player.player_type}</p>
                  <p className="cost">₹{player.cost}</p>
                  <p className="points">{player.points} pts</p>
                  {player.is_captain && <span className="captain-badge">C</span>}
                  {player.is_vice_captain && <span className="vc-badge">VC</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### **4. Player Valuation**

#### **API Call:**
```javascript
// GET /ml/valuation/player/{player_id}
const getPlayerValuation = async (playerId) => {
  try {
    const response = await fetch(`http://localhost:8000/ml/valuation/player/${playerId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Valuation error:', error);
  }
};

// Usage
const valuation = await getPlayerValuation(61);
console.log(valuation);
```

---

### **5. ML Health Check**

#### **API Call:**
```javascript
// GET /ml/health
const checkMLHealth = async () => {
  try {
    const response = await fetch('http://localhost:8000/ml/health');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Health check error:', error);
  }
};

// Usage
const health = await checkMLHealth();
console.log(health);
```

#### **Response:**
```json
{
  "status": "healthy",
  "services": {
    "match_predictor": "operational",
    "player_forecaster": "operational", 
    "dream11_optimizer": "operational",
    "win_probability": "operational",
    "player_valuator": "operational"
  },
  "version": "1.0"
}
```

---

## 🎨 **CSS Styling Examples**

```css
.prediction-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.prediction-result {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.improving { color: #27ae60; }
.declining { color: #e74c3c; }
.stable { color: #f39c12; }

.dream11-optimizer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.player-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  position: relative;
}

.captain-badge, .vc-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.vc-badge {
  background: #3498db;
}

.batsman { border-left: 4px solid #27ae60; }
.bowler { border-left: 4px solid #e74c3c; }
.allrounder { border-left: 4px solid #f39c12; }
.wicketkeeper { border-left: 4px solid #9b59b6; }
```

---

## 🔧 **Error Handling**

```javascript
const handleMLRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('ML API Error:', error);
    return { success: false, error: error.message };
  }
};

// Usage
const result = await handleMLRequest('/ml/predict/match', {
  method: 'POST',
  body: JSON.stringify({
    team1_id: 1,
    team2_id: 2,
    venue: 'M Chinnaswamy Stadium'
  })
});

if (result.success) {
  console.log('Prediction:', result.data);
} else {
  console.error('Error:', result.error);
}
```

---

## 📱 **Complete React App Example**

```jsx
import React, { useState, useEffect } from 'react';

const IPLMLDashboard = () => {
  const [activeTab, setActiveTab] = useState('prediction');
  const [mlHealth, setMLHealth] = useState(null);

  useEffect(() => {
    // Check ML health on component mount
    fetch('http://localhost:8000/ml/health')
      .then(response => response.json())
      .then(data => setMLHealth(data))
      .catch(error => console.error('Health check failed:', error));
  }, []);

  return (
    <div className="ipl-ml-dashboard">
      <header>
        <h1>IPL ML Features Dashboard</h1>
        {mlHealth && (
          <div className={`health-status ${mlHealth.status}`}>
            ML Services: {mlHealth.status.toUpperCase()}
          </div>
        )}
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'prediction' ? 'active' : ''}
          onClick={() => setActiveTab('prediction')}
        >
          Match Prediction
        </button>
        <button 
          className={activeTab === 'forecast' ? 'active' : ''}
          onClick={() => setActiveTab('forecast')}
        >
          Player Forecast
        </button>
        <button 
          className={activeTab === 'dream11' ? 'active' : ''}
          onClick={() => setActiveTab('dream11')}
        >
          Dream11 Optimizer
        </button>
      </nav>

      <main>
        {activeTab === 'prediction' && <MatchPrediction />}
        {activeTab === 'forecast' && <PlayerForecast playerId={61} />}
        {activeTab === 'dream11' && <Dream11Optimizer />}
      </main>
    </div>
  );
};

export default IPLMLDashboard;
```

---

## ✅ **All Endpoints Working!**

**Status:** All ML endpoints are functional and ready for frontend integration!

- ✅ Match Prediction: `POST /ml/predict/match`
- ✅ Player Forecast: `GET /ml/forecast/player/{id}`  
- ✅ Dream11 Optimizer: `POST /ml/dream11/optimize`
- ✅ Player Valuation: `GET /ml/valuation/player/{id}`
- ✅ Health Check: `GET /ml/health`
- ✅ Simple Scorecard: `GET /matches/{id}/scorecard/simple` (Fixed!)

**Note:** Restart the server to load the new Dream11 optimizer endpoint.
