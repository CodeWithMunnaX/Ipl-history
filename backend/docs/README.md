# IPL Dashboard API

A comprehensive FastAPI-based dashboard for IPL statistics covering data from 2004-2025. This API provides detailed insights into teams, players, matches, and season-wise statistics.

## Features

- **Team Statistics**: Complete team information, standings, win/loss records
- **Player Statistics**: Individual player performance, batting and bowling stats
- **Season-wise Analysis**: Winners, runners-up, top performers for each season
- **Match Details**: Complete match information and results
- **Image Support**: Team logos and player images included
- **Comprehensive Data**: Covers all IPL seasons with detailed ball-by-ball data

## Installation

1. Install required dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure all CSV files are in the project directory:
   - `teams_data.csv`
   - `ball_by_ball_data.csv`
   - `ipl_matches_data.csv`
   - `players-data-updated.csv`

3. Run the application:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Base Information
- `GET /` - API information and version

### Teams
- `GET /teams` - Get all teams with details and logos
- `GET /teams/{team_id}` - Get specific team details
- `GET /teams/{team_id}/stats` - Get comprehensive team statistics

### Players
- `GET /players` - Get all players with details and images
- `GET /players/{player_id}` - Get specific player details
- `GET /players/{player_id}/stats` - Get comprehensive player statistics

### Seasons
- `GET /seasons` - Get all available seasons
- `GET /seasons/{season}/winners` - Get winner, runner-up for specific season
- `GET /seasons/{season}/top-batsmen` - Get top batsmen by runs for season
- `GET /seasons/{season}/top-bowlers` - Get top bowlers by wickets for season
- `GET /seasons/{season}/matches` - Get all matches for specific season

### Overall Statistics
- `GET /overall/top-batsmen` - Get top batsmen across all seasons
- `GET /overall/top-bowlers` - Get top bowlers across all seasons
- `GET /overall/team-standings` - Get overall team standings

### Comprehensive Statistics (Cricbuzz-style)
- `GET /stats/batsmen/detailed` - Detailed batsman statistics with averages, strike rates, boundaries
- `GET /stats/bowlers/detailed` - Detailed bowler statistics with economy, averages, strike rates
- `GET /stats/teams/comprehensive` - Comprehensive team analytics with NRR, batting/bowling averages
- `GET /stats/matches/recent` - Recent matches with detailed information
- `GET /stats/players/{player_id}/career` - Complete career statistics for any player
- `GET /stats/seasons/{season}/comprehensive` - Complete season analysis with top performers

### Ball-by-Ball Analysis & Charts
- `GET /analysis/ball-by-ball/{match_id}` - Detailed ball-by-ball analysis for any match
- `GET /analysis/over-by-over/{match_id}` - Over-by-over analysis with ball details
- `GET /analysis/player/{player_id}/detailed` - Detailed player analysis (batsman/bowler)
- `GET /charts/pie/team-performance` - Pie chart data for team wins distribution
- `GET /charts/pie/player-runs-distribution` - Pie chart data for top players' runs
- `GET /charts/pie/wicket-types` - Pie chart data for wicket types distribution
- `GET /charts/bar/season-wise-stats` - Bar chart data for season-wise statistics
- `GET /charts/line/player-performance/{player_id}` - Line chart data for player performance over time

## Data Structure

### Teams Data (`teams_data.csv`)
- `team_id`: Unique team identifier
- `team_name`: Full team name
- `team_name_short`: Short team name (e.g., RCB, MI)
- `image_url`: Team logo URL

### Ball-by-Ball Data (`ball_by_ball_data.csv`)
- `season_id`: Season year
- `match_id`: Unique match identifier
- `batter`: Batsman name
- `bowler`: Bowler name
- `team_batting`: Batting team
- `team_bowling`: Bowling team
- `batter_runs`: Runs scored on the ball
- `is_wicket`: Whether wicket was taken
- And many more detailed fields...

### Matches Data (`ipl_matches_data.csv`)
- `match_id`: Unique match identifier
- `season_id`: Season year
- `team1`, `team2`: Playing teams
- `match_winner`: Winning team
- `win_by_runs`: Runs margin of victory
- `win_by_wickets`: Wickets margin of victory
- `player_of_match`: Man of the match
- And venue, date, toss details...

### Players Data (`players-data-updated.csv`)
- `player_id`: Unique player identifier
- `player_name`: Player name
- `player_full_name`: Full player name
- `bat_style`: Batting style
- `bowl_style`: Bowling style
- `player_image`: Player image URL

## Example Usage

### Get all teams:
```bash
curl http://localhost:8000/teams
```

### Get top batsmen for 2023 season:
```bash
curl http://localhost:8000/seasons/2023/top-batsmen?limit=5
```

### Get team statistics for Mumbai Indians:
```bash
curl http://localhost:8000/teams/3/stats
```

### Get player statistics:
```bash
curl http://localhost:8000/players/12/stats
```

## Response Examples

### Team Response:
```json
{
  "team_id": 3,
  "team_name": "Mumbai Indians",
  "team_name_short": "MI",
  "image_url": "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png"
}
```

### Season Winners Response:
```json
{
  "season": 2023,
  "winner": "Chennai Super Kings",
  "runner_up": "Gujarat Titans",
  "final_match_id": 1234567
}
```

### Player Stats Response:
```json
{
  "player_id": 12,
  "player_name": "DA Warner",
  "batting_stats": {
    "total_runs": 5447,
    "total_balls": 3847,
    "total_matches": 162,
    "strike_rate": 141.65
  },
  "bowling_stats": {
    "total_wickets": 0,
    "total_overs": 0,
    "bowling_matches": 0
  }
}
```

## Features Included

✅ **Team Logos**: All team images are included and accessible  
✅ **Player Images**: Player photos are included where available  
✅ **Maximum Runs**: Top run scorers for each season and overall  
✅ **Maximum Wickets**: Top wicket takers for each season and overall  
✅ **Winners & Runners-up**: Complete season-wise championship details  
✅ **Team Statistics**: Win/loss records, performance metrics  
✅ **Player Statistics**: Comprehensive batting and bowling stats  
✅ **Match Details**: Complete match information and results  
✅ **Season-wise Analysis**: Detailed statistics for each IPL season  

## Data Coverage

- **Seasons**: 2004-2025 (All IPL seasons)
- **Teams**: All IPL teams with logos
- **Players**: Complete player database with images
- **Matches**: All IPL matches with detailed results
- **Ball-by-Ball**: Detailed ball-by-ball data for analysis

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation with Swagger UI.

## Error Handling

The API includes comprehensive error handling:
- 404 errors for non-existent resources
- 500 errors for data loading issues
- Proper validation for all endpoints

## Performance

- Data is loaded once at startup for optimal performance
- Efficient pandas operations for data processing
- CORS enabled for web application integration
- Proper NaN handling for JSON serialization
- Modern FastAPI lifespan events (no deprecation warnings)
