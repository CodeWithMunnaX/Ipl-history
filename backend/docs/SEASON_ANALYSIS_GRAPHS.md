# 🏏 IPL Dashboard API - Season-wise Analysis & 3 Types Graphs

## 📊 **SEASON-WISE DETAILED ANALYSIS**

### 🎯 **Main Season Analysis Endpoint:**
```
GET /analysis/seasons/{season}/detailed
```

**Complete Response Fields:**
```json
{
  "season": 2023,
  "season_summary": {
    "total_matches": 74,
    "total_runs": 25000,
    "total_wickets": 800,
    "total_fours": 1200,
    "total_sixes": 300,
    "average_runs_per_match": 337.84
  },
  "top_batsmen": [
    {
      "player_id": 12,
      "player_name": "Virat Kohli",
      "player_image": "https://example.com/image.jpg",
      "total_runs": 500,
      "total_balls": 350,
      "total_matches": 14,
      "dismissals": 12,
      "fours": 50,
      "sixes": 15,
      "strike_rate": 142.86,
      "average": 41.67,
      "highest_score": 89
    }
  ],
  "top_bowlers": [
    {
      "player_id": 25,
      "player_name": "Jasprit Bumrah",
      "player_image": "https://example.com/image.jpg",
      "total_wickets": 25,
      "total_matches": 14,
      "total_overs": 56,
      "runs_conceded": 448,
      "economy": 8.0,
      "bowling_average": 17.92,
      "best_figures": "5/10"
    }
  ],
  "team_standings": [
    {
      "team_name": "Mumbai Indians",
      "matches": 14,
      "wins": 10,
      "losses": 4,
      "win_percentage": 71.43,
      "runs_scored": 2500,
      "runs_conceded": 2300,
      "wickets_taken": 80,
      "net_run_rate": 14.29
    }
  ]
}
```

---

## 📊 **3 TYPES OF GRAPHS FOR FRONTEND**

### 🥧 **TYPE 1: PIE CHARTS (2 Types)**

#### **1.1 Team Performance Pie Chart**
```
GET /charts/season/{season}/team-performance-pie
```
**Response Fields:**
```json
{
  "chart_type": "pie",
  "title": "Team Wins Distribution - Season 2023",
  "season": 2023,
  "data": [
    {
      "label": "MI",                    // Team short name
      "value": 10,                      // Number of wins
      "team_name": "Mumbai Indians",    // Full team name
      "color": "#FF6B6B",              // Generated color
      "image_url": "https://example.com/mi-logo.png"  // Team logo
    }
  ]
}
```

#### **1.2 Runs Distribution Pie Chart**
```
GET /charts/season/{season}/runs-distribution-pie
```
**Response Fields:**
```json
{
  "chart_type": "pie",
  "title": "Runs Distribution - Season 2023",
  "season": 2023,
  "data": [
    {
      "label": "Dots (0)",             // Run type
      "value": 5000,                   // Count
      "runs": 0,                       // Run value
      "color": "#E8E8E8"              // Predefined color
    },
    {
      "label": "Fours (4)",
      "value": 1200,
      "runs": 4,
      "color": "#96CEB4"
    },
    {
      "label": "Sixes (6)",
      "value": 300,
      "runs": 6,
      "color": "#FFEAA7"
    }
  ]
}
```

### 📊 **TYPE 2: BAR CHARTS (2 Types)**

#### **2.1 Batsman Runs Bar Chart**
```
GET /charts/season/{season}/batsman-runs-bar?limit=15
```
**Response Fields:**
```json
{
  "chart_type": "bar",
  "title": "Top 15 Batsmen Runs - Season 2023",
  "season": 2023,
  "data": [
    {
      "label": "Virat Kohli",          // Player name
      "value": 500,                    // Total runs
      "color": "#FF6B6B",             // Generated color
      "player_image": "https://example.com/image.jpg"  // Player photo
    }
  ]
}
```

#### **2.2 Bowler Wickets Bar Chart**
```
GET /charts/season/{season}/bowler-wickets-bar?limit=15
```
**Response Fields:**
```json
{
  "chart_type": "bar",
  "title": "Top 15 Bowlers Wickets - Season 2023",
  "season": 2023,
  "data": [
    {
      "label": "Jasprit Bumrah",       // Player name
      "value": 25,                     // Total wickets
      "color": "#4ECDC4",             // Generated color
      "player_image": "https://example.com/image.jpg"  // Player photo
    }
  ]
}
```

### 📈 **TYPE 3: LINE CHARTS (1 Type)**

#### **3.1 Player Performance Line Chart**
```
GET /charts/line/player-performance/{player_id}
```
**Response Fields:**
```json
{
  "chart_type": "line",
  "title": "Virat Kohli - Runs Over Seasons",
  "player_name": "Virat Kohli",
  "data": [
    {
      "season": 2020,                  // Season year
      "runs": 400,                     // Runs in that season
      "matches": 14                    // Matches played
    },
    {
      "season": 2021,
      "runs": 450,
      "matches": 15
    }
  ]
}
```

---

## 🎨 **FRONTEND INTEGRATION EXAMPLES**

### **Chart.js Integration:**

#### **Pie Chart Example:**
```javascript
// Team Performance Pie Chart
fetch('http://localhost:8000/charts/season/2023/team-performance-pie')
  .then(response => response.json())
  .then(data => {
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.data.map(item => item.label),
        datasets: [{
          data: data.data.map(item => item.value),
          backgroundColor: data.data.map(item => item.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: data.title },
          legend: { position: 'bottom' }
        }
      }
    });
  });
```

#### **Bar Chart Example:**
```javascript
// Batsman Runs Bar Chart
fetch('http://localhost:8000/charts/season/2023/batsman-runs-bar?limit=10')
  .then(response => response.json())
  .then(data => {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.data.map(item => item.label),
        datasets: [{
          label: 'Runs',
          data: data.data.map(item => item.value),
          backgroundColor: data.data.map(item => item.color),
          borderColor: data.data.map(item => item.color),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { title: { display: true, text: data.title } }
      }
    });
  });
```

#### **Line Chart Example:**
```javascript
// Player Performance Line Chart
fetch('http://localhost:8000/charts/line/player-performance/12')
  .then(response => response.json())
  .then(data => {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.data.map(item => `Season ${item.season}`),
        datasets: [{
          label: 'Runs',
          data: data.data.map(item => item.runs),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { title: { display: true, text: data.title } }
      }
    });
  });
```

### **React Integration:**

#### **Pie Chart Component:**
```jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SeasonTeamPieChart = ({ season }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/charts/season/${season}/team-performance-pie`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [season]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h3>{data.title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data.data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
```

#### **Bar Chart Component:**
```jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SeasonBatsmanBarChart = ({ season }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/charts/season/${season}/batsman-runs-bar?limit=10`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [season]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h3>{data.title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## 🚀 **COMPLETE SEASON ANALYSIS EXAMPLE**

### **Get Complete Season Data:**
```javascript
// Get detailed season analysis
fetch('http://localhost:8000/analysis/seasons/2023/detailed')
  .then(response => response.json())
  .then(data => {
    console.log('Season Summary:', data.season_summary);
    console.log('Top Batsmen:', data.top_batsmen);
    console.log('Top Bowlers:', data.top_bowlers);
    console.log('Team Standings:', data.team_standings);
  });
```

### **Display Season Summary:**
```jsx
const SeasonSummary = ({ season }) => {
  const [seasonData, setSeasonData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/analysis/seasons/${season}/detailed`)
      .then(res => res.json())
      .then(data => setSeasonData(data));
  }, [season]);

  if (!seasonData) return <div>Loading...</div>;

  return (
    <div className="season-summary">
      <h2>Season {season} Summary</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Matches</h3>
          <p>{seasonData.season_summary.total_matches}</p>
        </div>
        <div className="stat-card">
          <h3>Total Runs</h3>
          <p>{seasonData.season_summary.total_runs.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Wickets</h3>
          <p>{seasonData.season_summary.total_wickets}</p>
        </div>
        <div className="stat-card">
          <h3>Total Fours</h3>
          <p>{seasonData.season_summary.total_fours}</p>
        </div>
        <div className="stat-card">
          <h3>Total Sixes</h3>
          <p>{seasonData.season_summary.total_sixes}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Runs/Match</h3>
          <p>{seasonData.season_summary.average_runs_per_match}</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 📱 **MOBILE RESPONSIVE DESIGN**

### **CSS for Mobile:**
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.stat-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.stat-card p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card p {
    font-size: 1.2rem;
  }
}
```

---

## 🧪 **TESTING ENDPOINTS**

### **Test All Season Endpoints:**
```bash
# Season detailed analysis
curl http://localhost:8000/analysis/seasons/2023/detailed

# Team performance pie chart
curl http://localhost:8000/charts/season/2023/team-performance-pie

# Runs distribution pie chart
curl http://localhost:8000/charts/season/2023/runs-distribution-pie

# Batsman runs bar chart
curl http://localhost:8000/charts/season/2023/batsman-runs-bar?limit=10

# Bowler wickets bar chart
curl http://localhost:8000/charts/season/2023/bowler-wickets-bar?limit=10

# Player performance line chart
curl http://localhost:8000/charts/line/player-performance/12
```

---

## 🎯 **QUICK START GUIDE**

1. **Start API Server:**
   ```bash
   python main.py
   ```

2. **Test Season Analysis:**
   ```bash
   curl http://localhost:8000/analysis/seasons/2023/detailed
   ```

3. **Get Chart Data:**
   ```bash
   curl http://localhost:8000/charts/season/2023/team-performance-pie
   ```

4. **Frontend Integration:**
   - Use Chart.js, Recharts, or D3.js
   - All data is JSON formatted
   - Colors are pre-generated
   - Mobile responsive ready

---

**🎉 Your IPL Dashboard API now has complete season-wise analysis with 3 types of graphs ready for frontend integration!**

### **Summary of What You Have:**
- ✅ **Complete Season Analysis** - Detailed stats for any season
- ✅ **3 Types of Graphs** - Pie charts, bar charts, line charts
- ✅ **Player Photos** - All player images included
- ✅ **Team Logos** - All team logos included
- ✅ **Frontend Ready** - Chart.js, React, Vue examples
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Real-time Data** - Live API integration
