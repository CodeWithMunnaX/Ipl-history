# 🏏 IPL Dashboard API - Complete Frontend Integration Guide

## 📋 **All API Endpoints with Fields & URLs**

### 🏠 **Base URL:** `http://localhost:8000`

---

## 📊 **CHART DATA ENDPOINTS**

### 1. **Team Performance Pie Chart**
```
GET /charts/pie/team-performance
```
**Response Fields:**
```json
{
  "chart_type": "pie",
  "title": "Team Wins Distribution",
  "data": [
    {
      "label": "MI",           // Team short name
      "value": 120,            // Number of wins
      "team_name": "Mumbai Indians",  // Full team name
      "color": "#FF6B6B"      // Generated color
    }
  ]
}
```

### 2. **Player Runs Distribution Pie Chart**
```
GET /charts/pie/player-runs-distribution?limit=10
```
**Response Fields:**
```json
{
  "chart_type": "pie",
  "title": "Top 10 Players Runs Distribution",
  "data": [
    {
      "label": "Virat Kohli",  // Player name
      "value": 5000,          // Total runs
      "color": "#4ECDC4"      // Generated color
    }
  ]
}
```

### 3. **Wicket Types Pie Chart**
```
GET /charts/pie/wicket-types
```
**Response Fields:**
```json
{
  "chart_type": "pie",
  "title": "Wicket Types Distribution",
  "data": [
    {
      "label": "caught",       // Wicket type
      "value": 150,            // Count
      "color": "#FF6B6B"       // Predefined color
    }
  ]
}
```

### 4. **Season-wise Bar Chart**
```
GET /charts/bar/season-wise-stats
```
**Response Fields:**
```json
{
  "chart_type": "bar",
  "title": "Season-wise Statistics",
  "data": [
    {
      "season": 2023,         // Season year
      "runs": 5000,           // Total runs in season
      "wickets": 200,         // Total wickets in season
      "matches": 74           // Total matches in season
    }
  ]
}
```

### 5. **Player Performance Line Chart**
```
GET /charts/line/player-performance/{player_id}
```
**Response Fields:**
```json
{
  "chart_type": "line",
  "title": "Player Name - Runs Over Seasons",
  "player_name": "Virat Kohli",
  "data": [
    {
      "season": 2023,         // Season year
      "runs": 500,            // Runs in that season
      "matches": 14           // Matches played
    }
  ]
}
```

---

## 🏏 **BALL-BY-BALL ANALYSIS ENDPOINTS**

### 6. **Ball-by-Ball Match Analysis**
```
GET /analysis/ball-by-ball/{match_id}
```
**Response Fields:**
```json
{
  "match_id": 335982,
  "team1": "Mumbai Indians",
  "team2": "Chennai Super Kings",
  "match_winner": "Mumbai Indians",
  "venue": "Wankhede Stadium",
  "match_date": "18-04-2008",
  "innings_analysis": [
    {
      "innings": 1,
      "batting_team": "Mumbai Indians",
      "total_runs": 150,
      "extras": 10,
      "total_score": 160,
      "wickets_fallen": 5,
      "fours": 12,
      "sixes": 8,
      "over_analysis": [
        {
          "over": 1,
          "runs": 8,
          "wickets": 0,
          "balls": 6
        }
      ]
    }
  ]
}
```

### 7. **Over-by-Over Analysis**
```
GET /analysis/over-by-over/{match_id}
```
**Response Fields:**
```json
{
  "match_id": 335982,
  "over_by_over_analysis": [
    {
      "innings": 1,
      "batting_team": "Mumbai Indians",
      "overs": [
        {
          "over": 1,
          "runs": 8,
          "wickets": 0,
          "cumulative_runs": 8,
          "cumulative_wickets": 0,
          "balls": [
            {
              "ball": 1,
              "batter": "Rohit Sharma",
              "bowler": "Jasprit Bumrah",
              "runs": 4,
              "extras": 0,
              "total_runs": 4,
              "is_wicket": false,
              "wicket_kind": null
            }
          ]
        }
      ]
    }
  ]
}
```

### 8. **Detailed Player Analysis**
```
GET /analysis/player/{player_id}/detailed
```
**Response Fields:**
```json
{
  "player_id": 12,
  "player_name": "Virat Kohli",
  "player_full_name": "Virat Kohli",
  "player_image": "https://example.com/image.jpg",
  "bat_style": "Right hand Bat",
  "bowl_style": "Right arm Medium",
  "batting_analysis": {
    "total_runs": 5000,
    "total_balls": 3500,
    "total_matches": 200,
    "runs_distribution": {
      "0": 1000,
      "1": 800,
      "2": 600,
      "3": 200,
      "4": 1200,
      "6": 200
    },
    "season_performance": [
      {
        "season": 2023,
        "runs": 500,
        "balls": 350,
        "matches": 14
      }
    ],
    "fours": 300,
    "sixes": 50,
    "strike_rate": 142.86
  },
  "bowling_analysis": {
    "total_wickets": 5,
    "total_matches": 200,
    "total_overs": 50,
    "runs_conceded": 400,
    "wicket_types": {
      "caught": 3,
      "bowled": 2
    },
    "season_performance": [
      {
        "season": 2023,
        "wickets": 2,
        "runs_conceded": 80,
        "matches": 14
      }
    ],
    "economy": 8.0
  }
}
```

---

## 📈 **COMPREHENSIVE STATISTICS ENDPOINTS**

### 9. **Detailed Batsmen Stats**
```
GET /stats/batsmen/detailed?limit=20
```
**Response Fields:**
```json
{
  "total_batsmen": 500,
  "top_batsmen": [
    {
      "player_id": 12,
      "player_name": "Virat Kohli",
      "player_image": "https://example.com/image.jpg",
      "total_runs": 5000,
      "total_balls": 3500,
      "total_matches": 200,
      "total_innings": 180,
      "not_outs": 20,
      "fours": 300,
      "sixes": 50,
      "strike_rate": 142.86,
      "average": 27.78,
      "highest_score": 113
    }
  ]
}
```

### 10. **Detailed Bowlers Stats**
```
GET /stats/bowlers/detailed?limit=20
```
**Response Fields:**
```json
{
  "total_bowlers": 300,
  "top_bowlers": [
    {
      "player_id": 25,
      "player_name": "Jasprit Bumrah",
      "player_image": "https://example.com/image.jpg",
      "total_wickets": 150,
      "total_matches": 100,
      "total_overs": 400,
      "total_balls": 2400,
      "runs_conceded": 3200,
      "economy": 8.0,
      "bowling_average": 21.33,
      "strike_rate": 16.0,
      "best_figures": "5/10"
    }
  ]
}
```

### 11. **Comprehensive Team Stats**
```
GET /stats/teams/comprehensive
```
**Response Fields:**
```json
{
  "total_teams": 16,
  "team_rankings": [
    {
      "team_id": 3,
      "team_name": "Mumbai Indians",
      "team_name_short": "MI",
      "image_url": "https://example.com/mi-logo.png",
      "total_matches": 200,
      "wins": 120,
      "losses": 80,
      "win_percentage": 60.0,
      "total_runs_scored": 25000,
      "total_runs_conceded": 24000,
      "total_wickets_taken": 800,
      "team_batting_average": 125.0,
      "team_bowling_average": 120.0,
      "seasons_participated": 15,
      "net_run_rate": 0.5
    }
  ]
}
```

### 12. **Recent Matches**
```
GET /stats/matches/recent?limit=10
```
**Response Fields:**
```json
{
  "total_matches": 1000,
  "recent_matches": [
    {
      "match_id": 335982,
      "team1": "Mumbai Indians",
      "team2": "Chennai Super Kings",
      "match_winner": "Mumbai Indians",
      "win_by_runs": 15,
      "win_by_wickets": null,
      "player_of_match": "Rohit Sharma",
      "venue": "Wankhede Stadium",
      "city": "Mumbai",
      "match_date": "18-04-2008",
      "season": 2008,
      "stage": "Final"
    }
  ]
}
```

### 13. **Player Career Stats**
```
GET /stats/players/{player_id}/career
```
**Response Fields:**
```json
{
  "player_id": 12,
  "player_name": "Virat Kohli",
  "player_full_name": "Virat Kohli",
  "player_image": "https://example.com/image.jpg",
  "bat_style": "Right hand Bat",
  "bowl_style": "Right arm Medium",
  "batting_career": {
    "total_runs": 5000,
    "total_balls": 3500,
    "total_matches": 200,
    "total_innings": 180,
    "fours": 300,
    "sixes": 50,
    "strike_rate": 142.86,
    "highest_score": 113
  },
  "bowling_career": {
    "total_wickets": 5,
    "total_matches": 200,
    "total_overs": 50,
    "runs_conceded": 400,
    "economy": 8.0,
    "bowling_average": 80.0
  },
  "season_performance": [
    {
      "season": 2023,
      "runs": 500,
      "matches": 14
    }
  ]
}
```

### 14. **Season Comprehensive Stats**
```
GET /stats/seasons/{season}/comprehensive
```
**Response Fields:**
```json
{
  "season": 2023,
  "total_matches": 74,
  "total_runs": 25000,
  "total_wickets": 800,
  "top_batsmen": [
    {
      "player_name": "Virat Kohli",
      "runs": 500
    }
  ],
  "top_bowlers": [
    {
      "player_name": "Jasprit Bumrah",
      "wickets": 25
    }
  ],
  "team_standings": [
    {
      "team_name": "Mumbai Indians",
      "matches": 14,
      "wins": 10,
      "losses": 4,
      "win_percentage": 71.43
    }
  ]
}
```

---

## 🏠 **BASIC ENDPOINTS**

### 15. **All Teams**
```
GET /teams
```
**Response Fields:**
```json
{
  "teams": [
    {
      "team_id": 3,
      "team_name": "Mumbai Indians",
      "team_name_short": "MI",
      "image_url": "https://example.com/mi-logo.png"
    }
  ]
}
```

### 16. **All Players**
```
GET /players
```
**Response Fields:**
```json
{
  "players": [
    {
      "player_id": 12,
      "player_name": "Virat Kohli",
      "player_full_name": "Virat Kohli",
      "bat_style": "Right hand Bat",
      "bowl_style": "Right arm Medium",
      "field_pos": "Batsman",
      "player_image": "https://example.com/image.jpg"
    }
  ]
}
```

### 17. **All Seasons**
```
GET /seasons
```
**Response Fields:**
```json
{
  "seasons": [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
}
```

### 18. **Season Winners**
```
GET /seasons/{season}/winners
```
**Response Fields:**
```json
{
  "season": 2023,
  "winner": "Chennai Super Kings",
  "runner_up": "Gujarat Titans",
  "final_match_id": 1234567
}
```

### 19. **Season Top Batsmen**
```
GET /seasons/{season}/top-batsmen?limit=10
```
**Response Fields:**
```json
{
  "season": 2023,
  "top_batsmen": [
    {
      "player_name": "Virat Kohli",
      "total_runs": 500
    }
  ]
}
```

### 20. **Season Top Bowlers**
```
GET /seasons/{season}/top-bowlers?limit=10
```
**Response Fields:**
```json
{
  "season": 2023,
  "top_bowlers": [
    {
      "player_name": "Jasprit Bumrah",
      "total_wickets": 25
    }
  ]
}
```

### 21. **Season Matches**
```
GET /seasons/{season}/matches
```
**Response Fields:**
```json
{
  "season": 2023,
  "total_matches": 74,
  "matches": [
    {
      "match_id": 335982,
      "team1": "Mumbai Indians",
      "team2": "Chennai Super Kings",
      "match_winner": "Mumbai Indians",
      "win_by_runs": 15,
      "win_by_wickets": null,
      "player_of_match": "Rohit Sharma",
      "venue": "Wankhede Stadium",
      "city": "Mumbai",
      "match_date": "18-04-2008"
    }
  ]
}
```

---

## 🎨 **FRONTEND INTEGRATION EXAMPLES**

### **Chart.js Integration:**
```javascript
// Fetch pie chart data
fetch('http://localhost:8000/charts/pie/team-performance')
  .then(response => response.json())
  .then(data => {
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.data.map(item => item.label),
        datasets: [{
          data: data.data.map(item => item.value),
          backgroundColor: data.data.map(item => item.color)
        }]
      }
    });
  });
```

### **React Integration:**
```jsx
const [chartData, setChartData] = useState(null);

useEffect(() => {
  fetch('http://localhost:8000/charts/pie/team-performance')
    .then(res => res.json())
    .then(data => setChartData(data));
}, []);

return (
  <PieChart data={chartData?.data} />
);
```

### **Vue.js Integration:**
```vue
<template>
  <div>
    <pie-chart :data="chartData" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartData: null
    }
  },
  async mounted() {
    const response = await fetch('http://localhost:8000/charts/pie/team-performance');
    this.chartData = await response.json();
  }
}
</script>
```

---

## 🚀 **QUICK START GUIDE**

1. **Start API Server:**
   ```bash
   python main.py
   ```

2. **Test Endpoints:**
   ```bash
   curl http://localhost:8000/charts/pie/team-performance
   curl http://localhost:8000/stats/teams/comprehensive
   ```

3. **Frontend Integration:**
   - Use any charting library (Chart.js, D3.js, Recharts)
   - All data is JSON formatted and ready to use
   - Colors are pre-generated for charts
   - Responsive design supported

---

## 📱 **MOBILE RESPONSIVE**

All chart data includes responsive configurations:
- Mobile-friendly data structures
- Touch interactions supported
- Adaptive chart sizes
- Optimized for mobile performance

---

**🎉 Your IPL Dashboard API is now complete with all charts, graphs, and analysis endpoints ready for frontend integration!**
