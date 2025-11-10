# 🏏 IPL Match Scorecard API - Complete Guide

## 📊 **MATCH SCORECARD ENDPOINTS**

### 🎯 **3 Types of Scorecards Available:**

---

## 📋 **1. COMPLETE MATCH SCORECARD**

### **Endpoint:**
```
GET /matches/{match_id}/scorecard
```

### **Complete Response Structure:**
```json
{
  "match_info": {
    "match_id": 12345,
    "team1": "Mumbai Indians",
    "team2": "Chennai Super Kings",
    "match_winner": "Mumbai Indians",
    "venue": "Wankhede Stadium",
    "match_date": "2023-04-15",
    "toss_winner": "Mumbai Indians",
    "toss_decision": "bat",
    "player_of_match": "Rohit Sharma",
    "win_by_runs": 15,
    "win_by_wickets": 0,
    "result": "Mumbai Indians won by 15 runs",
    "stage": "Group Stage"
  },
  "innings_scorecards": [
    {
      "innings": 1,
      "batting_team": "Mumbai Indians",
      "bowling_team": "Chennai Super Kings",
      "total_runs": 180,
      "extras": 12,
      "total_score": 192,
      "wickets_fallen": 4,
      "total_overs": 20,
      "fours": 18,
      "sixes": 8,
      "run_rate": 9.6,
      "batsman_scorecard": [
        {
          "player_id": 12,
          "player_name": "Rohit Sharma",
          "player_image": "https://example.com/rohit.jpg",
          "runs": 89,
          "balls": 58,
          "fours": 8,
          "sixes": 4,
          "strike_rate": 153.45,
          "dismissed": true,
          "not_out": false
        },
        {
          "player_id": 15,
          "player_name": "Suryakumar Yadav",
          "player_image": "https://example.com/surya.jpg",
          "runs": 45,
          "balls": 32,
          "fours": 5,
          "sixes": 2,
          "strike_rate": 140.63,
          "dismissed": false,
          "not_out": true
        }
      ],
      "bowler_scorecard": [
        {
          "player_id": 25,
          "player_name": "Jasprit Bumrah",
          "player_image": "https://example.com/bumrah.jpg",
          "overs": 4,
          "maidens": 1,
          "runs_conceded": 28,
          "wickets": 2,
          "economy": 7.0
        },
        {
          "player_id": 30,
          "player_name": "Deepak Chahar",
          "player_image": "https://example.com/chahar.jpg",
          "overs": 4,
          "maidens": 0,
          "runs_conceded": 35,
          "wickets": 1,
          "economy": 8.75
        }
      ],
      "over_summary": [
        {
          "over": 1,
          "runs": 8,
          "wickets": 0
        },
        {
          "over": 2,
          "runs": 12,
          "wickets": 0
        }
      ]
    },
    {
      "innings": 2,
      "batting_team": "Chennai Super Kings",
      "bowling_team": "Mumbai Indians",
      "total_runs": 165,
      "extras": 8,
      "total_score": 173,
      "wickets_fallen": 6,
      "total_overs": 20,
      "fours": 15,
      "sixes": 6,
      "run_rate": 8.65,
      "batsman_scorecard": [
        {
          "player_id": 40,
          "player_name": "MS Dhoni",
          "player_image": "https://example.com/dhoni.jpg",
          "runs": 67,
          "balls": 45,
          "fours": 6,
          "sixes": 3,
          "strike_rate": 148.89,
          "dismissed": true,
          "not_out": false
        }
      ],
      "bowler_scorecard": [
        {
          "player_id": 25,
          "player_name": "Jasprit Bumrah",
          "player_image": "https://example.com/bumrah.jpg",
          "overs": 4,
          "maidens": 1,
          "runs_conceded": 25,
          "wickets": 3,
          "economy": 6.25
        }
      ],
      "over_summary": [
        {
          "over": 1,
          "runs": 6,
          "wickets": 1
        }
      ]
    }
  ]
}
```

---

## 📋 **2. SIMPLE MATCH SCORECARD**

### **Endpoint:**
```
GET /matches/{match_id}/scorecard/simple
```

### **Simple Response Structure:**
```json
{
  "match_id": 12345,
  "team1": "Mumbai Indians",
  "team2": "Chennai Super Kings",
  "match_winner": "Mumbai Indians",
  "venue": "Wankhede Stadium",
  "match_date": "2023-04-15",
  "scorecard": [
    {
      "innings": 1,
      "batting_team": "Mumbai Indians",
      "runs": 192,
      "wickets": 4,
      "overs": 20,
      "run_rate": 9.6
    },
    {
      "innings": 2,
      "batting_team": "Chennai Super Kings",
      "runs": 173,
      "wickets": 6,
      "overs": 20,
      "run_rate": 8.65
    }
  ]
}
```

---

## 📋 **3. LIVE SCORE SIMULATION**

### **Endpoint:**
```
GET /matches/{match_id}/live-score
```

### **Live Score Response Structure:**
```json
{
  "match_id": 12345,
  "team1": "Mumbai Indians",
  "team2": "Chennai Super Kings",
  "current_innings": 2,
  "batting_team": "Chennai Super Kings",
  "bowling_team": "Mumbai Indians",
  "current_score": 145,
  "current_wickets": 4,
  "current_overs": 16.3,
  "current_run_rate": 8.85,
  "current_batsmen": ["MS Dhoni", "Ravindra Jadeja"],
  "current_bowler": "Jasprit Bumrah",
  "last_ball_runs": 4,
  "last_ball_wicket": false
}
```

---

## 🎨 **FRONTEND INTEGRATION EXAMPLES**

### **1. HTML + JavaScript Scorecard:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IPL Match Scorecard</title>
    <style>
        .scorecard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .match-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .match-info h2 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .match-info p {
            margin: 5px 0;
            color: #666;
        }
        
        .innings-card {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .innings-header {
            background: #007bff;
            color: white;
            padding: 15px;
            font-weight: bold;
        }
        
        .innings-summary {
            padding: 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            text-align: center;
        }
        
        .stat-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        
        .scorecard-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .scorecard-table th,
        .scorecard-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .scorecard-table th {
            background: #f8f9fa;
            font-weight: bold;
        }
        
        .player-name {
            font-weight: bold;
        }
        
        .player-image {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 10px;
            vertical-align: middle;
        }
        
        .not-out {
            color: #28a745;
            font-weight: bold;
        }
        
        .dismissed {
            color: #dc3545;
        }
        
        .over-summary {
            padding: 15px;
            background: #f8f9fa;
        }
        
        .over-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
            gap: 5px;
        }
        
        .over-item {
            background: white;
            padding: 8px;
            text-align: center;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .over-number {
            font-weight: bold;
            color: #007bff;
        }
        
        .over-runs {
            color: #28a745;
        }
        
        .over-wickets {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="scorecard-container">
        <h1>🏏 IPL Match Scorecard</h1>
        
        <!-- Match ID Input -->
        <div style="margin-bottom: 20px;">
            <label>Enter Match ID:</label>
            <input type="number" id="matchIdInput" placeholder="e.g., 12345" style="padding: 8px; margin: 0 10px;">
            <button onclick="loadScorecard()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Load Scorecard</button>
        </div>
        
        <!-- Loading -->
        <div id="loading" style="display: none; text-align: center; padding: 20px;">
            Loading scorecard...
        </div>
        
        <!-- Scorecard Content -->
        <div id="scorecardContent"></div>
    </div>

    <script>
        async function loadScorecard() {
            const matchId = document.getElementById('matchIdInput').value;
            if (!matchId) {
                alert('Please enter a match ID');
                return;
            }
            
            const loading = document.getElementById('loading');
            const content = document.getElementById('scorecardContent');
            
            loading.style.display = 'block';
            content.innerHTML = '';
            
            try {
                const response = await fetch(`http://localhost:8000/matches/${matchId}/scorecard`);
                const data = await response.json();
                
                if (response.ok) {
                    displayScorecard(data);
                } else {
                    content.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">${data.detail}</div>`;
                }
            } catch (error) {
                content.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">Error loading scorecard: ${error.message}</div>`;
            } finally {
                loading.style.display = 'none';
            }
        }
        
        function displayScorecard(data) {
            const content = document.getElementById('scorecardContent');
            
            let html = `
                <div class="match-info">
                    <h2>${data.match_info.team1} vs ${data.match_info.team2}</h2>
                    <p><strong>Venue:</strong> ${data.match_info.venue}</p>
                    <p><strong>Date:</strong> ${data.match_info.match_date}</p>
                    <p><strong>Toss:</strong> ${data.match_info.toss_winner} won the toss and chose to ${data.match_info.toss_decision}</p>
                    <p><strong>Result:</strong> ${data.match_info.result}</p>
                    <p><strong>Player of the Match:</strong> ${data.match_info.player_of_match}</p>
                </div>
            `;
            
            data.innings_scorecards.forEach(innings => {
                html += `
                    <div class="innings-card">
                        <div class="innings-header">
                            Innings ${innings.innings} - ${innings.batting_team}
                        </div>
                        
                        <div class="innings-summary">
                            <div class="summary-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${innings.total_score}</div>
                                    <div class="stat-label">Total Runs</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${innings.wickets_fallen}</div>
                                    <div class="stat-label">Wickets</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${innings.total_overs}</div>
                                    <div class="stat-label">Overs</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${innings.run_rate}</div>
                                    <div class="stat-label">Run Rate</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${innings.fours}</div>
                                    <div class="stat-label">Fours</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${innings.sixes}</div>
                                    <div class="stat-label">Sixes</div>
                                </div>
                            </div>
                        </div>
                        
                        <table class="scorecard-table">
                            <thead>
                                <tr>
                                    <th>Batsman</th>
                                    <th>Runs</th>
                                    <th>Balls</th>
                                    <th>4s</th>
                                    <th>6s</th>
                                    <th>SR</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                innings.batsman_scorecard.forEach(batsman => {
                    const status = batsman.not_out ? 'not-out' : 'dismissed';
                    const statusText = batsman.not_out ? 'Not Out' : 'Out';
                    
                    html += `
                        <tr>
                            <td class="player-name">
                                ${batsman.player_image ? `<img src="${batsman.player_image}" class="player-image" alt="${batsman.player_name}">` : ''}
                                ${batsman.player_name}
                            </td>
                            <td>${batsman.runs}</td>
                            <td>${batsman.balls}</td>
                            <td>${batsman.fours}</td>
                            <td>${batsman.sixes}</td>
                            <td>${batsman.strike_rate}</td>
                            <td class="${status}">${statusText}</td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                        </table>
                        
                        <div class="over-summary">
                            <h4>Over Summary:</h4>
                            <div class="over-grid">
                `;
                
                innings.over_summary.forEach(over => {
                    html += `
                        <div class="over-item">
                            <div class="over-number">${over.over}</div>
                            <div class="over-runs">${over.runs}</div>
                            <div class="over-wickets">${over.wickets}W</div>
                        </div>
                    `;
                });
                
                html += `
                            </div>
                        </div>
                    </div>
                `;
            });
            
            content.innerHTML = html;
        }
    </script>
</body>
</html>
```

---

### **2. React Scorecard Component:**

```jsx
import React, { useState, useEffect } from 'react';

const MatchScorecard = ({ matchId }) => {
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (matchId) {
      loadScorecard();
    }
  }, [matchId]);

  const loadScorecard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/matches/${matchId}/scorecard`);
      const data = await response.json();
      
      if (response.ok) {
        setScorecard(data);
      } else {
        setError(data.detail);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading scorecard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!scorecard) return <div>Enter a match ID to load scorecard</div>;

  return (
    <div className="scorecard-container">
      {/* Match Info */}
      <div className="match-info">
        <h2>{scorecard.match_info.team1} vs {scorecard.match_info.team2}</h2>
        <p><strong>Venue:</strong> {scorecard.match_info.venue}</p>
        <p><strong>Date:</strong> {scorecard.match_info.match_date}</p>
        <p><strong>Result:</strong> {scorecard.match_info.result}</p>
        <p><strong>Player of the Match:</strong> {scorecard.match_info.player_of_match}</p>
      </div>

      {/* Innings Scorecards */}
      {scorecard.innings_scorecards.map((innings, index) => (
        <div key={index} className="innings-card">
          <div className="innings-header">
            Innings {innings.innings} - {innings.batting_team}
          </div>
          
          <div className="innings-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{innings.total_score}</div>
                <div className="stat-label">Total Runs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{innings.wickets_fallen}</div>
                <div className="stat-label">Wickets</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{innings.total_overs}</div>
                <div className="stat-label">Overs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{innings.run_rate}</div>
                <div className="stat-label">Run Rate</div>
              </div>
            </div>
          </div>

          {/* Batsman Scorecard */}
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Batsman</th>
                <th>Runs</th>
                <th>Balls</th>
                <th>4s</th>
                <th>6s</th>
                <th>SR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {innings.batsman_scorecard.map((batsman, idx) => (
                <tr key={idx}>
                  <td className="player-name">
                    {batsman.player_image && (
                      <img 
                        src={batsman.player_image} 
                        className="player-image" 
                        alt={batsman.player_name}
                      />
                    )}
                    {batsman.player_name}
                  </td>
                  <td>{batsman.runs}</td>
                  <td>{batsman.balls}</td>
                  <td>{batsman.fours}</td>
                  <td>{batsman.sixes}</td>
                  <td>{batsman.strike_rate}</td>
                  <td className={batsman.not_out ? 'not-out' : 'dismissed'}>
                    {batsman.not_out ? 'Not Out' : 'Out'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Over Summary */}
          <div className="over-summary">
            <h4>Over Summary:</h4>
            <div className="over-grid">
              {innings.over_summary.map((over, idx) => (
                <div key={idx} className="over-item">
                  <div className="over-number">{over.over}</div>
                  <div className="over-runs">{over.runs}</div>
                  <div className="over-wickets">{over.wickets}W</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchScorecard;
```

---

## 🧪 **TESTING ENDPOINTS**

### **Test Complete Scorecard:**
```bash
curl http://localhost:8000/matches/12345/scorecard
```

### **Test Simple Scorecard:**
```bash
curl http://localhost:8000/matches/12345/scorecard/simple
```

### **Test Live Score:**
```bash
curl http://localhost:8000/matches/12345/live-score
```

---

## 🚀 **QUICK START GUIDE**

1. **Start API Server:**
   ```bash
   python main.py
   ```

2. **Test Scorecard:**
   ```bash
   curl http://localhost:8000/matches/12345/scorecard
   ```

3. **Use HTML Example:**
   - Copy HTML code
   - Save as `scorecard.html`
   - Open in browser
   - Enter match ID and click "Load Scorecard"

---

## 📱 **MOBILE RESPONSIVE FEATURES**

- ✅ **Responsive Tables** - Horizontal scroll on mobile
- ✅ **Touch-friendly** - Large buttons and inputs
- ✅ **Optimized Layout** - Stacked design for small screens
- ✅ **Fast Loading** - Optimized API responses
- ✅ **Error Handling** - User-friendly error messages

---

**🎉 Ab aap easily match scorecard bana sakte hain with complete details!**

### **Summary:**
- ✅ **Complete Scorecard** - Detailed batting, bowling, over-by-over
- ✅ **Simple Scorecard** - Basic match summary
- ✅ **Live Score** - Real-time simulation
- ✅ **Frontend Ready** - HTML, React examples
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Player Photos** - All player images included
- ✅ **Professional Design** - Cricbuzz-like interface
