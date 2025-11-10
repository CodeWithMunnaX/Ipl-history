"""
Pydantic models for request/response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

# ============= ML Prediction Models =============

class MatchPredictionRequest(BaseModel):
    """Request model for match outcome prediction"""
    team1_id: int
    team2_id: int
    venue: str
    toss_winner: Optional[int] = None
    toss_decision: Optional[str] = None
    season: int = Field(default=2024)

class MatchPredictionResponse(BaseModel):
    """Response model for match prediction"""
    team1_name: str
    team2_name: str
    predicted_winner: str
    team1_win_probability: float
    team2_win_probability: float
    confidence_score: float
    key_factors: Dict[str, float]
    venue: str
    model_version: str

class PlayerPerformanceForecast(BaseModel):
    """Player performance forecast for next season"""
    player_id: int
    player_name: str
    current_season_stats: Dict
    predicted_runs: Optional[int] = None
    predicted_wickets: Optional[int] = None
    predicted_strike_rate: Optional[float] = None
    predicted_economy: Optional[float] = None
    confidence_interval: Dict[str, float]
    trend: str  # "improving", "declining", "stable"

class Dream11Player(BaseModel):
    """Dream11 player suggestion"""
    player_id: int
    player_name: str
    role: str  # "batsman", "bowler", "all-rounder", "wicket-keeper"
    predicted_points: float
    selection_priority: int
    recent_form: str
    cost: Optional[float] = None

class Dream11TeamRequest(BaseModel):
    """Request for Dream11 team suggestion"""
    team1_id: int
    team2_id: int
    venue: str
    budget: Optional[float] = 100.0
    season: int = Field(default=2024)

class Dream11TeamResponse(BaseModel):
    """Dream11 optimal team suggestion"""
    captain: Dream11Player
    vice_captain: Dream11Player
    wicket_keepers: List[Dream11Player]
    batsmen: List[Dream11Player]
    all_rounders: List[Dream11Player]
    bowlers: List[Dream11Player]
    total_predicted_points: float
    total_cost: float
    team_balance_score: float

class WinProbabilityRequest(BaseModel):
    """Real-time win probability request"""
    match_id: int
    current_innings: int
    current_over: float
    current_score: int
    wickets_fallen: int
    target: Optional[int] = None

class WinProbabilityResponse(BaseModel):
    """Real-time win probability"""
    batting_team_win_probability: float
    bowling_team_win_probability: float
    required_run_rate: Optional[float] = None
    current_run_rate: float
    momentum_score: float
    key_insights: List[str]

class PlayerValuationResponse(BaseModel):
    """Player auction value estimation"""
    player_id: int
    player_name: str
    estimated_value_inr: float
    estimated_value_range: Dict[str, float]  # min, max
    value_factors: Dict[str, float]
    past_auction_history: Optional[List[Dict]] = None
    market_trend: str
    recommendation: str

# ============= Existing Models =============

class TeamStats(BaseModel):
    """Team statistics model"""
    team_id: int
    team_name: str
    total_matches: int
    wins: int
    losses: int
    win_percentage: float

class PlayerStats(BaseModel):
    """Player statistics model"""
    player_id: int
    player_name: str
    total_runs: int
    total_wickets: int
    matches: int
    strike_rate: Optional[float] = None
    economy: Optional[float] = None

