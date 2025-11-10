# 🏏 IPL Dashboard API

A comprehensive FastAPI-based backend for IPL statistics covering data from 2004-2025. This API provides detailed insights into teams, players, matches, and includes advanced ML features for predictions and fantasy team optimization.

## 🚀 Features

### Core Statistics
- **Team Statistics**: Complete team information, standings, win/loss records
- **Player Statistics**: Individual player performance, batting and bowling stats
- **Season-wise Analysis**: Winners, runners-up, top performers for each season
- **Match Details**: Complete match information and results
- **Ball-by-Ball Analysis**: Detailed over-by-over and ball-by-ball data

### Machine Learning Features
- **Match Outcome Prediction**: Predict match winners with confidence scores
- **Player Performance Forecasting**: Forecast player performance for next season
- **Player Valuation**: Estimate player's IPL auction value
- **Dream11 Team Optimizer**: Create optimal fantasy teams
- **Team Creation**: Create balanced teams with automatic player categorization

### Data Coverage
- **16 Teams**: All IPL teams with logos and details
- **772 Players**: Complete player database with images
- **1,169 Matches**: All IPL matches from 2004-2025
- **278,205 Ball-by-Ball Records**: Detailed match data

## 📁 Project Structure

```
ipl-backend/
├── app/                    # Application modules
│   ├── models/            # Data models and schemas
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── docs/                  # Documentation
├── frontend_examples/     # Frontend integration examples
├── scripts/               # Utility scripts
├── tests/                 # Test files
├── player_images/         # Player images
├── main.py               # Main application file
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ipl-backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Core Statistics
- `GET /teams` - Get all teams
- `GET /players` - Get all players
- `GET /seasons` - Get all seasons
- `GET /matches/{match_id}/scorecard/complete` - Complete match scorecard

#### Machine Learning Features
- `POST /ml/predict/match` - Predict match outcome
- `GET /ml/forecast/player/{player_id}` - Forecast player performance
- `GET /ml/valuation/player/{player_id}` - Estimate player value
- `POST /ml/dream11/optimize` - Optimize Dream11 team
- `POST /ml/create-teams` - Create two balanced teams
- `POST /ml/dream11-from-teams` - Create Dream11 from teams
- `GET /ml/health` - ML services health check

## 🎯 Usage Examples

### Create Teams and Dream11
```python
import requests

# Create two teams
teams = requests.post('http://localhost:8000/ml/create-teams', json={
    'team1_name': 'Mumbai Indians',
    'team2_name': 'Chennai Super Kings',
    'venue': 'Wankhede Stadium'
})

# Create Dream11 team from the teams
dream11 = requests.post('http://localhost:8000/ml/dream11-from-teams', json={
    'team1_name': 'Mumbai Indians',
    'team2_name': 'Chennai Super Kings',
    'venue': 'Wankhede Stadium'
})
```

### Predict Match Outcome
```python
prediction = requests.post('http://localhost:8000/ml/predict/match', json={
    'team1_id': 1,
    'team2_id': 2,
    'venue': 'M Chinnaswamy Stadium',
    'season': 2024
})
```

## 🎨 Frontend Integration

Complete frontend integration examples are available in the `frontend_examples/` directory:

- **React Components**: Ready-to-use React components for all features
- **CSS Styling**: Complete styling for beautiful UI
- **API Integration**: JavaScript examples for all endpoints
- **Responsive Design**: Mobile and desktop optimized

## 🧪 Testing

Run tests using:
```bash
python -m pytest tests/
```

## 📊 Database

The application uses SQLite database (`ipl_data.db`) with the following tables:
- `teams` - Team information
- `players` - Player details and statistics
- `matches` - Match information
- `ball_by_ball` - Detailed ball-by-ball data

## 🔧 Configuration

- **Database**: SQLite (`ipl_data.db`)
- **Port**: 8000 (configurable via PORT environment variable)
- **CORS**: Enabled for all origins
- **Logging**: Comprehensive request logging

## 📈 Performance

- **Response Time**: < 100ms for most endpoints
- **Concurrent Requests**: Handles multiple simultaneous requests
- **Memory Usage**: Optimized for efficient data processing
- **Database Queries**: Optimized SQL queries with proper indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in `docs/` directory
- Review frontend examples in `frontend_examples/`
- Open an issue for bugs or feature requests

---

**Built with ❤️ for IPL fans and cricket enthusiasts!** 🏏
