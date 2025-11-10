# Individual Player & Team Performance Charts API Guide

## 🎯 Overview
This guide provides comprehensive information about the new individual player and team performance chart APIs that show season-wise statistics with real-time data visualization.

## 📊 New API Endpoints

### 1. Individual Player Batting Performance
**Endpoint:** `GET /charts/line/player-batting-seasons/{player_name}`

**Description:** Get detailed batting performance chart for a player across all seasons

**Parameters:**
- `player_name` (string): Player name (e.g., "V Kohli", "MS Dhoni")

**Response:**
```json
{
  "chart_type": "line",
  "title": "V Kohli - Batting Performance Over Seasons",
  "player_name": "V Kohli",
  "seasons": [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  "runs": [165, 246, 307, 557, 364, 639, 359, 505, 973, 308, 530, 464, 471, 405, 341, 639, 741, 657],
  "balls": [168, 225, 216, 473, 333, 471, 301, 395, 655, 257, 385, 332, 402, 347, 306, 473, 497, 466],
  "fours": [18, 22, 26, 55, 33, 65, 23, 35, 84, 23, 52, 46, 24, 43, 32, 65, 62, 66],
  "sixes": [4, 8, 12, 16, 10, 22, 16, 23, 38, 11, 18, 13, 11, 9, 8, 16, 38, 19],
  "strike_rate": [98.21, 109.33, 142.13, 117.76, 109.31, 135.67, 119.27, 127.85, 148.55, 119.84, 137.66, 139.76, 117.16, 116.71, 111.44, 135.1, 149.09, 140.99],
  "average": [13.75, 18.92, 23.62, 34.81, 24.27, 39.94, 25.64, 31.56, 60.81, 30.8, 37.86, 33.14, 31.4, 27.0, 21.31, 45.64, 49.4, 43.8],
  "matches": [12, 13, 13, 16, 15, 16, 14, 16, 16, 10, 14, 14, 15, 15, 16, 14, 15, 15]
}
```

### 2. Individual Player Bowling Performance
**Endpoint:** `GET /charts/line/player-bowling-seasons/{player_name}`

**Description:** Get detailed bowling performance chart for a player across all seasons

**Parameters:**
- `player_name` (string): Player name (e.g., "JJ Bumrah", "R Ashwin")

**Response:**
```json
{
  "chart_type": "line",
  "title": "JJ Bumrah - Bowling Performance Over Seasons",
  "player_name": "JJ Bumrah",
  "seasons": [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2024, 2025],
  "wickets": [3, 6, 3, 18, 23, 17, 23, 30, 22, 16, 21, 21],
  "runs_conceded": [74, 307, 184, 413, 455, 383, 433, 436, 422, 392, 341, 322],
  "overs": [7.5, 41.0, 16.3, 53.7, 62.2, 55.5, 63.7, 64.0, 57.8, 54.5, 54.7, 48.2],
  "economy": [9.87, 7.49, 11.29, 7.69, 7.32, 6.9, 6.8, 6.81, 7.3, 7.19, 6.23, 6.68],
  "average": [24.67, 51.17, 61.33, 22.94, 19.78, 22.53, 18.83, 14.53, 19.18, 24.5, 16.24, 15.33],
  "matches": [2, 11, 4, 14, 16, 14, 16, 15, 14, 14, 13, 12]
}
```

### 3. Team Performance Over Seasons
**Endpoint:** `GET /charts/line/team-performance-seasons/{team_name}`

**Description:** Get team performance chart across all seasons

**Parameters:**
- `team_name` (string): Team name (e.g., "Royal Challengers Bangalore", "Mumbai Indians")

**Response:**
```json
{
  "chart_type": "line",
  "title": "Royal Challengers Bangalore - Performance Over Seasons",
  "team_name": "Royal Challengers Bangalore",
  "seasons": [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  "matches_played": [14, 16, 16, 16, 15, 16, 14, 16, 16, 13, 14, 14, 15, 15, 16, 14, 15, 16],
  "wins": [4, 9, 8, 10, 8, 9, 5, 8, 9, 3, 6, 5, 6, 9, 9, 7, 7, 11],
  "losses": [10, 7, 8, 6, 7, 7, 9, 8, 7, 10, 8, 9, 9, 6, 7, 7, 8, 5],
  "win_percentage": [28.57, 56.25, 50.0, 62.5, 53.33, 56.25, 35.71, 50.0, 56.25, 23.08, 42.86, 35.71, 40.0, 60.0, 56.25, 50.0, 46.67, 68.75],
  "runs_scored": [1983, 2280, 2401, 2469, 2472, 2601, 2093, 2311, 2981, 1845, 2322, 2208, 2289, 2303, 2632, 2502, 2930, 2653],
  "runs_conceded": [2205, 2316, 2511, 2512, 2505, 2482, 2163, 2184, 2711, 2033, 2383, 2307, 2322, 2298, 2614, 2456, 2689, 2345]
}
```

## 🎨 Frontend Integration Examples

### 1. Individual Player Charts Frontend
**File:** `INDIVIDUAL_PLAYER_CHARTS_FRONTEND.html`

**Features:**
- Player search functionality
- Batting performance charts (runs, boundaries, strike rate)
- Bowling performance charts (wickets, economy, average)
- Interactive Chart.js visualizations
- Responsive design
- Real-time data loading

**Usage:**
```html
<!-- Include Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Load player batting data -->
const battingData = await fetch(`${API_BASE}/charts/line/player-batting-seasons/${playerName}`);

<!-- Create line chart for runs -->
new Chart(ctx, {
    type: 'line',
    data: {
        labels: battingData.seasons,
        datasets: [{
            label: 'Runs',
            data: battingData.runs,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    }
});
```

### 2. Team Performance Charts Frontend
**File:** `TEAM_PERFORMANCE_CHARTS_FRONTEND.html`

**Features:**
- Team selection dropdown
- Win/Loss charts
- Runs scored vs conceded
- Win percentage trends
- Matches played over seasons
- Comprehensive team statistics

**Usage:**
```html
<!-- Load team performance data -->
const teamData = await fetch(`${API_BASE}/charts/line/team-performance-seasons/${teamName}`);

<!-- Create win/loss bar chart -->
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: teamData.seasons,
        datasets: [
            {
                label: 'Wins',
                data: teamData.wins,
                backgroundColor: 'rgba(46, 204, 113, 0.8)'
            },
            {
                label: 'Losses',
                data: teamData.losses,
                backgroundColor: 'rgba(231, 76, 60, 0.8)'
            }
        ]
    }
});
```

## 🔧 Chart Types Available

### 1. Line Charts
- **Player Runs Over Seasons**: Shows batting performance trends
- **Player Wickets Over Seasons**: Shows bowling performance trends
- **Team Win Percentage**: Shows team success over time
- **Runs Scored vs Conceded**: Shows team batting/bowling balance

### 2. Bar Charts
- **Wins vs Losses**: Team performance comparison
- **Boundaries (4s & 6s)**: Player batting statistics
- **Economy & Average**: Bowling performance metrics
- **Matches Played**: Team participation over seasons

### 3. Combined Charts
- **Multiple Datasets**: Show different metrics on same chart
- **Dual Y-Axes**: Different scales for different metrics
- **Interactive Legends**: Toggle datasets on/off

## 📱 Responsive Design Features

### Mobile Optimization
- Responsive grid layouts
- Touch-friendly interactions
- Optimized chart sizes
- Collapsible sections

### Desktop Features
- Hover effects
- Detailed tooltips
- Multiple chart views
- Export functionality

## 🚀 Performance Optimizations

### API Optimizations
- Memory-efficient data loading
- Optimized pandas operations
- Cached responses
- Error handling

### Frontend Optimizations
- Lazy loading
- Chart.js performance
- Responsive images
- Efficient DOM manipulation

## 🎯 Use Cases

### 1. Player Analysis
- Career performance tracking
- Season-wise comparisons
- Batting vs bowling analysis
- Performance trends

### 2. Team Analysis
- Historical performance
- Win/loss patterns
- Runs scored/conceded trends
- Season participation

### 3. Fantasy Cricket
- Player selection insights
- Performance predictions
- Historical data analysis
- Statistical comparisons

## 🔍 Data Fields Explained

### Batting Fields
- **runs**: Total runs scored in season
- **balls**: Total balls faced
- **fours**: Number of 4s hit
- **sixes**: Number of 6s hit
- **strike_rate**: Runs per 100 balls
- **average**: Runs per dismissal
- **matches**: Matches played

### Bowling Fields
- **wickets**: Total wickets taken
- **runs_conceded**: Total runs given away
- **overs**: Overs bowled
- **economy**: Runs per over
- **average**: Runs per wicket
- **matches**: Matches played

### Team Fields
- **matches_played**: Total matches in season
- **wins**: Matches won
- **losses**: Matches lost
- **win_percentage**: Success rate
- **runs_scored**: Total runs scored
- **runs_conceded**: Total runs conceded

## 🛠️ Error Handling

### API Errors
- 404: Player/Team not found
- 500: Server error
- 400: Invalid parameters

### Frontend Errors
- Network connectivity issues
- Data parsing errors
- Chart rendering failures
- User input validation

## 📊 Sample Data

### Top Players for Testing
- **V Kohli**: Royal Challengers Bangalore
- **MS Dhoni**: Chennai Super Kings
- **JJ Bumrah**: Mumbai Indians
- **R Ashwin**: Various teams
- **AB de Villiers**: Royal Challengers Bangalore

### Top Teams for Testing
- **Royal Challengers Bangalore**
- **Mumbai Indians**
- **Chennai Super Kings**
- **Kolkata Knight Riders**
- **Delhi Capitals**

## 🎨 Customization Options

### Chart Styling
- Color schemes
- Font sizes
- Border styles
- Background colors

### Layout Options
- Grid arrangements
- Card designs
- Responsive breakpoints
- Animation effects

## 🔗 Integration with Existing APIs

### Compatible Endpoints
- `/teams`: Get team list
- `/players`: Get player list
- `/seasons`: Get available seasons
- `/stats/batsmen/detailed`: Detailed batting stats
- `/stats/bowlers/detailed`: Detailed bowling stats

### Data Consistency
- Same player names across endpoints
- Consistent season formats
- Unified team names
- Standardized statistics

## 🚀 Getting Started

### 1. Start the API Server
```bash
python main.py
```

### 2. Open Frontend Files
- `INDIVIDUAL_PLAYER_CHARTS_FRONTEND.html`
- `TEAM_PERFORMANCE_CHARTS_FRONTEND.html`

### 3. Test the APIs
```bash
# Test player batting
curl "http://localhost:8000/charts/line/player-batting-seasons/V%20Kohli"

# Test team performance
curl "http://localhost:8000/charts/line/team-performance-seasons/Royal%20Challengers%20Bangalore"
```

## 📈 Future Enhancements

### Planned Features
- Player comparison charts
- Team head-to-head analysis
- Performance predictions
- Advanced filtering options
- Export functionality
- Real-time updates

### Technical Improvements
- Caching mechanisms
- Performance optimizations
- Error recovery
- Data validation
- API versioning

---

**Note:** All APIs are optimized for performance and provide real-time data visualization capabilities. The frontend examples demonstrate best practices for integrating these charts into web applications.
