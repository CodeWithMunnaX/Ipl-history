from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, FileResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
import os
from contextlib import asynccontextmanager
import re
import sqlite3
import requests
import aiofiles
from PIL import Image
import uuid
from urllib.parse import urlparse

# Global database connection
db_connection = None

# Resolve absolute path to SQLite DB so deploys don't create a blank file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'ipl_data.db')

# Image upload configuration
UPLOAD_DIR = "player_images"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Database connection and query functions
def get_db_connection():
    """Get database connection"""
    global db_connection
    if db_connection is None:
        db_connection = sqlite3.connect(DB_PATH, check_same_thread=False)
        db_connection.row_factory = sqlite3.Row  # Enable column access by name
    return db_connection

def execute_query(query, params=None):
    """Execute a database query and return results as pandas DataFrame"""
    conn = get_db_connection()
    if params:
        return pd.read_sql_query(query, conn, params=params)
    else:
        return pd.read_sql_query(query, conn)

def load_data():
    """Initialize database connection"""
    try:
        print("Connecting to database...")
        conn = get_db_connection()
        
        # Test connection with a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM teams")
        teams_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM players")
        players_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM matches")
        matches_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM ball_by_ball")
        ball_count = cursor.fetchone()[0]
        
        print(f"Database connected successfully!")
        print(f"Teams: {teams_count} records")
        print(f"Players: {players_count} records")
        print(f"Matches: {matches_count} records")
        print(f"Ball by ball: {ball_count} records")
        
        return True
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if not load_data():
        raise Exception("Failed to connect to database")
    yield
    # Shutdown
    global db_connection
    if db_connection:
        db_connection.close()

app = FastAPI(title="IPL Dashboard API", version="1.0.0", description="Comprehensive IPL Statistics API", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve player images statically
app.mount(f"/{UPLOAD_DIR}", StaticFiles(directory=UPLOAD_DIR), name="player_images")

# ----------------------------
# Helpers
# ----------------------------
def _normalize_season_value(value) -> int | None:
    """Convert season labels like '2020', '2020/21', '2019-20' to an int year.
    Strategy: extract all 4-digit or 2-digit year parts and return the max 4-digit year if present,
    else expand 2-digit part to plausible 2000+ and take max.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        # Direct numeric
        return int(value)
    except Exception:
        s = str(value).strip()
        # Find 4-digit years
        years4 = re.findall(r"(19|20)\d{2}", s)
        if years4:
            # years4 contains tuples ('20', '20') per group; re-find as full
            years4_full = re.findall(r"((?:19|20)\d{2})", s)
            years4_int = [int(y) for y in years4_full]
            return max(years4_int) if years4_int else None
        # Find 2-digit year parts like '/21'
        years2 = re.findall(r"[^\d](\d{2})(?:[^\d]|$)", s)
        years2_int = []
        for y2 in years2:
            y = int(y2)
            if y >= 0 and y <= 99:
                years2_int.append(2000 + y)
        if years2_int:
            return max(years2_int)
        # Last resort: digits sequence
        digits = re.findall(r"\d+", s)
        if digits:
            try:
                return int(digits[-1])
            except Exception:
                return None
        return None

def _normalized_equals(series: pd.Series, target_year: int) -> pd.Series:
    """Compare a season-like pandas Series to target_year after normalization."""
    return series.apply(_normalize_season_value) == int(target_year)

@app.get("/")
async def root():
    return {"message": "IPL Dashboard API", "version": "1.0.0"}

@app.get("/teams")
async def get_teams():
    """Get all teams with their details"""
    try:
        teams_df = execute_query("SELECT * FROM teams ORDER BY team_id")
        
        teams = []
        for _, team in teams_df.iterrows():
            teams.append({
                "team_id": int(team["team_id"]),
                "team_name": str(team["team_name"]),
                "team_name_short": str(team["team_name_short"]),
                "image_url": str(team["image_url"]) if pd.notna(team["image_url"]) else None
            })
        
        return {"teams": teams}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/teams/{team_id}")
async def get_team_details(team_id: int):
    """Get specific team details"""
    try:
        team_df = execute_query("SELECT * FROM teams WHERE team_id = ?", (team_id,))
        
        if team_df.empty:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team_data = team_df.iloc[0]
        return {
            "team_id": int(team_data["team_id"]),
            "team_name": str(team_data["team_name"]),
            "team_name_short": str(team_data["team_name_short"]),
            "image_url": str(team_data["image_url"]) if pd.notna(team_data["image_url"]) else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/players")
async def get_players():
    """Get all players with their details"""
    try:
        players_df = execute_query("SELECT * FROM players ORDER BY player_id")
        
        players = []
        for _, player in players_df.iterrows():
            player_id = int(player["player_id"]) if pd.notna(player["player_id"]) else None
            players.append({
                "player_id": player_id,
                "player_name": str(player["player_name"]) if pd.notna(player["player_name"]) else "",
                "player_full_name": str(player["player_full_name"]) if pd.notna(player["player_full_name"]) else "",
                "bat_style": str(player["bat_style"]) if pd.notna(player["bat_style"]) else "",
                "bowl_style": str(player["bowl_style"]) if pd.notna(player["bowl_style"]) else "",
                "field_pos": str(player["field_pos"]) if pd.notna(player["field_pos"]) else "",
                "player_image": str(player["player_image"]) if pd.notna(player["player_image"]) else "",
                "avatar_url": f"/players/{player_id}/avatar" if player_id else ""
            })
        
        return {"players": players}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/players/{player_id}")
async def get_player_details(player_id: int):
    """Get specific player details"""
    try:
        player_df = execute_query("SELECT * FROM players WHERE player_id = ?", (player_id,))
        
        if player_df.empty:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player_data = player_df.iloc[0]
        return {
            "player_id": int(player_data["player_id"]) if pd.notna(player_data["player_id"]) else None,
            "player_name": str(player_data["player_name"]) if pd.notna(player_data["player_name"]) else "",
            "player_full_name": str(player_data["player_full_name"]) if pd.notna(player_data["player_full_name"]) else "",
            "bat_style": str(player_data["bat_style"]) if pd.notna(player_data["bat_style"]) else "",
            "bowl_style": str(player_data["bowl_style"]) if pd.notna(player_data["bowl_style"]) else "",
            "field_pos": str(player_data["field_pos"]) if pd.notna(player_data["field_pos"]) else "",
            "player_image": str(player_data["player_image"]) if pd.notna(player_data["player_image"]) else ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def validate_image_file(file: UploadFile) -> bool:
    """Validate uploaded image file"""
    if not file.filename:
        return False
    
    # Check file extension
    file_ext = os.path.splitext(file.filename.lower())[1]
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    return True

def validate_image_url(url: str) -> bool:
    """Validate image URL"""
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False
        
        # Check if URL ends with image extension
        path = parsed.path.lower()
        return any(path.endswith(ext) for ext in ALLOWED_EXTENSIONS)
    except:
        return False

async def download_image_from_url(url: str, filename: str) -> bool:
    """Download image from URL and save to local directory"""
    try:
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        
        # Check content type
        content_type = response.headers.get('content-type', '').lower()
        if not content_type.startswith('image/'):
            return False
        
        # Save file
        file_path = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    await f.write(chunk)
        
        # Validate saved image
        try:
            with Image.open(file_path) as img:
                img.verify()
            return True
        except:
            # Remove invalid image file
            if os.path.exists(file_path):
                os.remove(file_path)
            return False
            
    except Exception as e:
        print(f"Error downloading image from URL: {e}")
        return False

@app.post("/players/{player_id}/upload-image")
async def upload_player_image(
    player_id: int,
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None)
):
    """Upload player image from device or URL"""
    try:
        # Check if player exists
        player_df = execute_query("SELECT * FROM players WHERE player_id = ?", (player_id,))
        if player_df.empty:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Clean up image_url if it's empty or default value
        if image_url and (not image_url.strip() or image_url == "string"):
            image_url = None
        
        # Clean up file if it's empty
        if file and (not file.filename or file.filename.strip() == ""):
            file = None
        
        # Validate input
        if not file and not image_url:
            raise HTTPException(status_code=400, detail="Either file or image_url must be provided")
        
        # Check if both are provided but prioritize file over URL
        if file and image_url:
            raise HTTPException(status_code=400, detail="Provide either file or image_url, not both")
        
        # Generate unique filename
        file_extension = ""
        if file:
            file_extension = os.path.splitext(file.filename)[1].lower()
        elif image_url:
            parsed_url = urlparse(image_url)
            file_extension = os.path.splitext(parsed_url.path)[1].lower()
            if not file_extension:
                file_extension = ".jpg"  # Default extension
        
        filename = f"player_{player_id}_{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Handle file upload
        if file:
            # Validate file
            if not validate_image_file(file):
                raise HTTPException(status_code=400, detail="Invalid image file format")
            
            # Check file size
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File size too large (max 5MB)")
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            # Validate saved image
            try:
                with Image.open(file_path) as img:
                    img.verify()
            except:
                if os.path.exists(file_path):
                    os.remove(file_path)
                raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Handle URL download
        elif image_url:
            if not validate_image_url(image_url):
                raise HTTPException(status_code=400, detail="Invalid image URL")
            
            success = await download_image_from_url(image_url, filename)
            if not success:
                raise HTTPException(status_code=400, detail="Failed to download image from URL")
        
        # Update database with image path
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE players SET player_image = ? WHERE player_id = ?",
            (filename, player_id)
        )
        conn.commit()
        
        return {
            "message": "Image uploaded successfully",
            "player_id": player_id,
            "image_filename": filename,
            "image_path": f"/{UPLOAD_DIR}/{filename}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@app.get("/seasons")
async def get_seasons():
    """Get all available seasons (normalized) from matches and ball_by_ball."""
    try:
        # Get seasons from matches data
        matches_df = execute_query("SELECT DISTINCT season, season_id FROM matches WHERE season IS NOT NULL OR season_id IS NOT NULL")
        seasons_set = set()
        
        for _, row in matches_df.iterrows():
            if pd.notna(row['season']):
                normalized = _normalize_season_value(row['season'])
                if normalized is not None:
                    seasons_set.add(normalized)
            if pd.notna(row['season_id']):
                normalized = _normalize_season_value(row['season_id'])
                if normalized is not None:
                    seasons_set.add(normalized)
        
        # Get seasons from ball by ball data
        ball_df = execute_query("SELECT DISTINCT season_id FROM ball_by_ball WHERE season_id IS NOT NULL")
        for _, row in ball_df.iterrows():
            if pd.notna(row['season_id']):
                seasons_set.add(int(row['season_id']))
        
        seasons = sorted(seasons_set)
        return {"seasons": seasons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/seasons/{season}/winners")
async def get_season_winners(season: int):
    """Get winner and runner-up for a specific season."""
    try:
        # DYNAMIC: Get last match of season for final results
        # Manual mapping removed - using database match date logic
        known_finals = {
            2008: {"winner": "Rajasthan Royals", "runner_up": "Chennai Super Kings", "final_match_id": 335982},
            2009: {"winner": "Deccan Chargers", "runner_up": "Royal Challengers Bangalore", "final_match_id": 335984},
            2010: {"winner": "Chennai Super Kings", "runner_up": "Mumbai Indians", "final_match_id": 335986},
            2011: {"winner": "Chennai Super Kings", "runner_up": "Royal Challengers Bangalore", "final_match_id": 335988},
            2012: {"winner": "Kolkata Knight Riders", "runner_up": "Chennai Super Kings", "final_match_id": 335990},
            2013: {"winner": "Mumbai Indians", "runner_up": "Chennai Super Kings", "final_match_id": 335992},
            2014: {"winner": "Kolkata Knight Riders", "runner_up": "Kings XI Punjab", "final_match_id": 335994},
            2015: {"winner": "Mumbai Indians", "runner_up": "Chennai Super Kings", "final_match_id": 335996},
            2016: {"winner": "Sunrisers Hyderabad", "runner_up": "Royal Challengers Bangalore", "final_match_id": 981019},
            2017: {"winner": "Mumbai Indians", "runner_up": "Rising Pune Supergiant", "final_match_id": 1082631},
            2018: {"winner": "Chennai Super Kings", "runner_up": "Sunrisers Hyderabad", "final_match_id": 1136601},
            2019: {"winner": "Mumbai Indians", "runner_up": "Chennai Super Kings", "final_match_id": 1184109},
            2020: {"winner": "Mumbai Indians", "runner_up": "Delhi Capitals", "final_match_id": 1216506},
            2021: {"winner": "Chennai Super Kings", "runner_up": "Kolkata Knight Riders", "final_match_id": 1241118},
            2022: {"winner": "Gujarat Titans", "runner_up": "Rajasthan Royals", "final_match_id": 1270069},
            2023: {"winner": "Chennai Super Kings", "runner_up": "Gujarat Titans", "final_match_id": 1303618},
            2024: {"winner": "Kolkata Knight Riders", "runner_up": "Sunrisers Hyderabad", "final_match_id": 1358302},
            2025: {"winner": "Mumbai Indians", "runner_up": "Gujarat Titans", "final_match_id": 1473509}
        }
        
        # Skip manual mapping - use database logic for all seasons
        # if season in known_finals:
        #     return known_finals data...
        
        # Fallback: Try to determine from database
        query = """
        SELECT match_id, team1, team2, match_winner, match_date, stage, event_name
        FROM matches 
        WHERE season = ? OR season_id = ?
        ORDER BY SUBSTR(match_date, 7, 4) || '-' || SUBSTR(match_date, 4, 2) || '-' || SUBSTR(match_date, 1, 2) DESC
        LIMIT 1
        """
        
        final_match_df = execute_query(query, (season, season))
        
        if not final_match_df.empty:
            final_match = final_match_df.iloc[0]
            winner = str(final_match['match_winner']) if pd.notna(final_match['match_winner']) else None
            team1 = str(final_match['team1']) if pd.notna(final_match['team1']) else None
            team2 = str(final_match['team2']) if pd.notna(final_match['team2']) else None
            
            # Logic: Jinne match jeeta hai wo champion, jo hara hai wo runner-up
            runner_up = team2 if team1 == winner else team1 if winner else None
            
            return {
                "season": season,
                "winner": winner,
                "runner_up": runner_up,
                "final_match_id": int(final_match['match_id']) if pd.notna(final_match['match_id']) else None
            }
        
        # Fallback: check if season exists in ball_by_ball
        bb_query = """
        SELECT COUNT(*) as count
        FROM ball_by_ball 
        WHERE season_id = ?
        """
        bb_count = execute_query(bb_query, (season,))
        
        if bb_count.iloc[0]['count'] > 0:
            # Season exists in ball_by_ball but no final match found
            # This is a fallback case - we can't easily determine winner from ball_by_ball alone
            pass
        
        raise HTTPException(status_code=404, detail="Season not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/seasons/{season}/top-batsmen")
async def get_season_top_batsmen(season: int, limit: int = 10):
    """Get top batsmen by runs for a specific season"""
    try:
        # Get top batsmen for the season
        query = """
        SELECT batter, SUM(batter_runs) as total_runs
        FROM ball_by_ball 
        WHERE season_id = ?
        GROUP BY batter
        ORDER BY total_runs DESC
        LIMIT ?
        """
        
        batsmen_df = execute_query(query, (season, limit))
        
        if batsmen_df.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        top_batsmen = []
        for _, batsman in batsmen_df.iterrows():
            top_batsmen.append({
                "player_name": str(batsman["batter"]),
                "total_runs": int(batsman["total_runs"])
            })
        
        return {
            "season": season,
            "top_batsmen": top_batsmen
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/seasons/{season}/top-bowlers")
async def get_season_top_bowlers(season: int, limit: int = 10):
    """Get top bowlers by wickets for a specific season"""
    try:
        # Get top bowlers for the season
        query = """
        SELECT bowler, SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets
        FROM ball_by_ball 
        WHERE season_id = ?
        GROUP BY bowler
        HAVING total_wickets > 0
        ORDER BY total_wickets DESC
        LIMIT ?
        """
        
        bowlers_df = execute_query(query, (season, limit))
        
        if bowlers_df.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        top_bowlers = []
        for _, bowler in bowlers_df.iterrows():
            top_bowlers.append({
                "player_name": str(bowler["bowler"]),
                "total_wickets": int(bowler["total_wickets"])
            })
        
        return {
            "season": season,
            "top_bowlers": top_bowlers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/players/{player_id}/stats")
async def get_player_stats(player_id: int):
    """Get comprehensive stats for a specific player"""
    try:
        # Get player info
        player_df = execute_query("SELECT * FROM players WHERE player_id = ?", (player_id,))
        if player_df.empty:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player_name = str(player_df.iloc[0]["player_name"])
        
        # Get batting stats
        batting_query = """
        SELECT SUM(batter_runs) as total_runs,
               COUNT(*) as total_balls,
               COUNT(DISTINCT match_id) as total_matches
        FROM ball_by_ball 
        WHERE batter = ?
        """
        batting_stats = execute_query(batting_query, (player_name,))
        
        # Get bowling stats
        bowling_query = """
        SELECT SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets,
               COUNT(*) as total_balls,
               COUNT(DISTINCT match_id) as bowling_matches
        FROM ball_by_ball 
        WHERE bowler = ?
        """
        bowling_stats = execute_query(bowling_query, (player_name,))
        
        batting_runs = int(batting_stats.iloc[0]['total_runs']) if pd.notna(batting_stats.iloc[0]['total_runs']) else 0
        batting_balls = int(batting_stats.iloc[0]['total_balls']) if pd.notna(batting_stats.iloc[0]['total_balls']) else 0
        batting_matches = int(batting_stats.iloc[0]['total_matches']) if pd.notna(batting_stats.iloc[0]['total_matches']) else 0
        
        bowling_wickets = int(bowling_stats.iloc[0]['total_wickets']) if pd.notna(bowling_stats.iloc[0]['total_wickets']) else 0
        bowling_balls = int(bowling_stats.iloc[0]['total_balls']) if pd.notna(bowling_stats.iloc[0]['total_balls']) else 0
        bowling_matches = int(bowling_stats.iloc[0]['bowling_matches']) if pd.notna(bowling_stats.iloc[0]['bowling_matches']) else 0
        
        return {
            "player_id": player_id,
            "player_name": player_name,
            "batting_stats": {
                "total_runs": batting_runs,
                "total_balls": batting_balls,
                "total_matches": batting_matches,
                "strike_rate": round((batting_runs / batting_balls * 100) if batting_balls > 0 else 0, 2)
            },
            "bowling_stats": {
                "total_wickets": bowling_wickets,
                "total_overs": round(bowling_balls / 6, 1),
                "bowling_matches": bowling_matches
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/teams/{team_id}/stats")
async def get_team_stats(team_id: int):
    """Get comprehensive stats for a specific team"""
    try:
        # Get team info
        team_df = execute_query("SELECT * FROM teams WHERE team_id = ?", (team_id,))
        if team_df.empty:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team_name = str(team_df.iloc[0]["team_name"])
        
        # Get team matches
        matches_query = """
        SELECT COUNT(*) as total_matches,
               SUM(CASE WHEN match_winner = ? THEN 1 ELSE 0 END) as wins
        FROM matches 
        WHERE team1 = ? OR team2 = ?
        """
        match_stats = execute_query(matches_query, (team_name, team_name, team_name))
        
        # Get team batting stats
        batting_query = """
        SELECT SUM(batter_runs) as total_runs
        FROM ball_by_ball 
        WHERE team_batting = ?
        """
        batting_stats = execute_query(batting_query, (team_name,))
        
        # Get team bowling stats
        bowling_query = """
        SELECT SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets
        FROM ball_by_ball 
        WHERE team_bowling = ?
        """
        bowling_stats = execute_query(bowling_query, (team_name,))
        
        total_matches = int(match_stats.iloc[0]['total_matches']) if pd.notna(match_stats.iloc[0]['total_matches']) else 0
        wins = int(match_stats.iloc[0]['wins']) if pd.notna(match_stats.iloc[0]['wins']) else 0
        total_runs = int(batting_stats.iloc[0]['total_runs']) if pd.notna(batting_stats.iloc[0]['total_runs']) else 0
        total_wickets = int(bowling_stats.iloc[0]['total_wickets']) if pd.notna(bowling_stats.iloc[0]['total_wickets']) else 0
        
        return {
            "team_id": team_id,
            "team_name": team_name,
            "total_matches": total_matches,
            "wins": wins,
            "losses": total_matches - wins,
            "win_percentage": round((wins / total_matches * 100) if total_matches > 0 else 0, 2),
            "total_runs": total_runs,
            "total_wickets": total_wickets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/overall/top-batsmen")
async def get_overall_top_batsmen(limit: int = 10):
    """Get top batsmen across all seasons"""
    try:
        query = """
        SELECT batter, SUM(batter_runs) as total_runs
        FROM ball_by_ball 
        WHERE batter IS NOT NULL
        GROUP BY batter
        ORDER BY total_runs DESC
        LIMIT ?
        """
        
        batsmen_df = execute_query(query, (limit,))
        
        top_batsmen = []
        for _, batsman in batsmen_df.iterrows():
            top_batsmen.append({
                "player_name": str(batsman["batter"]),
                "total_runs": int(batsman["total_runs"])
            })
        
        return {"top_batsmen": top_batsmen}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/overall/top-bowlers")
async def get_overall_top_bowlers(limit: int = 10):
    """Get top bowlers across all seasons"""
    try:
        query = """
        SELECT bowler, SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets
        FROM ball_by_ball 
        WHERE bowler IS NOT NULL
        GROUP BY bowler
        HAVING total_wickets > 0
        ORDER BY total_wickets DESC
        LIMIT ?
        """
        
        bowlers_df = execute_query(query, (limit,))
        
        top_bowlers = []
        for _, bowler in bowlers_df.iterrows():
            top_bowlers.append({
                "player_name": str(bowler["bowler"]),
                "total_wickets": int(bowler["total_wickets"])
            })
        
        return {"top_bowlers": top_bowlers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/overall/team-standings")
async def get_overall_team_standings():
    """Get overall team standings across all seasons"""
    try:
        # Get all teams
        teams_df = execute_query("SELECT * FROM teams ORDER BY team_name")
        
        standings = []
        for _, team in teams_df.iterrows():
            team_name = str(team["team_name"])
            
            # Get team match stats
            matches_query = """
            SELECT COUNT(*) as total_matches,
                   SUM(CASE WHEN match_winner = ? THEN 1 ELSE 0 END) as wins
            FROM matches 
            WHERE team1 = ? OR team2 = ?
            """
            match_stats = execute_query(matches_query, (team_name, team_name, team_name))
            
            total_matches = int(match_stats.iloc[0]['total_matches']) if pd.notna(match_stats.iloc[0]['total_matches']) else 0
            wins = int(match_stats.iloc[0]['wins']) if pd.notna(match_stats.iloc[0]['wins']) else 0
            
            if total_matches > 0:
                standings.append({
                    "team_id": int(team["team_id"]),
                    "team_name": team_name,
                    "team_name_short": str(team["team_name_short"]),
                    "image_url": str(team["image_url"]) if pd.notna(team["image_url"]) else None,
                    "total_matches": total_matches,
                    "wins": wins,
                    "losses": total_matches - wins,
                    "win_percentage": round((wins / total_matches * 100) if total_matches > 0 else 0, 2)
                })
        
        # Sort by win percentage
        standings.sort(key=lambda x: x["win_percentage"], reverse=True)
        
        return {"team_standings": standings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/seasons/{season}/matches")
async def get_season_matches(season: int):
    """Get all matches for a specific season"""
    try:
        # Get matches for the season
        query = """
        SELECT match_id, team1, team2, match_winner, win_by_runs, win_by_wickets, 
               match_date, venue, city, season, event_name, stage, player_of_match
        FROM matches 
        WHERE season = ? OR season_id = ?
        ORDER BY match_date, match_id
        """
        
        season_matches_df = execute_query(query, (season, season))
        
        if season_matches_df.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        matches_list = []
        for _, match in season_matches_df.iterrows():
            matches_list.append({
                "match_id": int(match['match_id']) if pd.notna(match['match_id']) else None,
                "team1": str(match['team1']) if pd.notna(match['team1']) else "",
                "team2": str(match['team2']) if pd.notna(match['team2']) else "",
                "match_winner": str(match['match_winner']) if pd.notna(match['match_winner']) else None,
                "win_by_runs": int(match['win_by_runs']) if pd.notna(match['win_by_runs']) else None,
                "win_by_wickets": int(match['win_by_wickets']) if pd.notna(match['win_by_wickets']) else None,
                "venue": str(match['venue']) if pd.notna(match['venue']) else "",
                "city": str(match['city']) if pd.notna(match['city']) else "",
                "match_date": str(match['match_date']) if pd.notna(match['match_date']) else "",
                "season": str(match['season']) if pd.notna(match['season']) else None,
                "stage": str(match['stage']) if pd.notna(match['stage']) else "",
                "event_name": str(match['event_name']) if pd.notna(match['event_name']) else "",
                "player_of_match": str(match['player_of_match']) if pd.notna(match['player_of_match']) else None
            })
        
        return {
            "season": season,
            "total_matches": len(matches_list),
            "matches": matches_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ================================
# COMPREHENSIVE STATISTICS ENDPOINTS
# ================================

@app.get("/stats/batsmen/detailed")
async def get_detailed_batsmen_stats(limit: int = 20):
    """Get comprehensive batsman statistics like Cricbuzz"""
    try:
        # Get all unique batsmen with their stats
        query = """
        SELECT 
            batter,
            SUM(batter_runs) as total_runs,
            COUNT(*) as total_balls,
            COUNT(DISTINCT match_id) as total_matches,
            COUNT(DISTINCT match_id || '_' || innings) as total_innings,
            SUM(CASE WHEN batter_runs = 4 THEN 1 ELSE 0 END) as fours,
            SUM(CASE WHEN batter_runs = 6 THEN 1 ELSE 0 END) as sixes,
            SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as dismissals
        FROM ball_by_ball 
        WHERE batter IS NOT NULL 
        GROUP BY batter
        ORDER BY total_runs DESC
        LIMIT ?
        """
        
        batsmen_df = execute_query(query, (limit,))
        
        batting_stats = []
        for _, row in batsmen_df.iterrows():
            batsman = row['batter']
            total_runs = int(row['total_runs'])
            total_balls = int(row['total_balls'])
            total_matches = int(row['total_matches'])
            total_innings = int(row['total_innings'])
            fours = int(row['fours'])
            sixes = int(row['sixes'])
            dismissals = int(row['dismissals'])
            
            # Calculate not outs
            not_outs = total_innings - dismissals
            
            # Calculate strike rate
            strike_rate = round((total_runs / total_balls * 100) if total_balls > 0 else 0, 2)
            
            # Calculate average
            average = round((total_runs / dismissals) if dismissals > 0 else total_runs, 2)
            
            # Get player info
            player_df = execute_query("SELECT player_id, player_image FROM players WHERE player_name = ?", (batsman,))
            player_id = player_df.iloc[0]['player_id'] if not player_df.empty else None
            player_image = player_df.iloc[0]['player_image'] if not player_df.empty else ""
            
            batting_stats.append({
                "player_id": int(player_id) if pd.notna(player_id) else None,
                "player_name": batsman,
                "player_image": str(player_image) if pd.notna(player_image) else "",
                    "total_runs": int(total_runs),
                "total_balls": int(total_balls),
                "total_matches": int(total_matches),
                "total_innings": int(total_innings),
                "not_outs": int(not_outs),
                "fours": int(fours),
                "sixes": int(sixes),
                "strike_rate": strike_rate,
                "average": average,
                "highest_score": int(total_runs)  # Simplified for now
            })
        
        return {
            "total_batsmen": len(batting_stats),
            "top_batsmen": batting_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats/bowlers/detailed")
async def get_detailed_bowlers_stats(limit: int = 20):
    """Get comprehensive bowler statistics like Cricbuzz"""
    try:
        # Get all unique bowlers with their stats
        query = """
        SELECT 
            bowler,
            SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets,
            COUNT(DISTINCT match_id) as total_matches,
            COUNT(*) as total_balls,
            SUM(total_runs) as runs_conceded,
            SUM(CASE WHEN is_wide_ball = 1 THEN 1 ELSE 0 END) as wides,
            SUM(CASE WHEN is_no_ball = 1 THEN 1 ELSE 0 END) as no_balls
        FROM ball_by_ball 
        WHERE bowler IS NOT NULL 
        GROUP BY bowler
        HAVING total_wickets > 0
        ORDER BY total_wickets DESC
        LIMIT ?
        """
        
        bowlers_df = execute_query(query, (limit,))
        
        bowling_stats = []
        for _, row in bowlers_df.iterrows():
            bowler = row['bowler']
            total_wickets = int(row['total_wickets'])
            total_matches = int(row['total_matches'])
            total_balls = int(row['total_balls'])
            runs_conceded = int(row['runs_conceded'])
            wides = int(row['wides'])
            no_balls = int(row['no_balls'])
            
            # Calculate overs bowled (6 balls = 1 over)
            total_overs = round(total_balls / 6, 1)
            
            # Calculate economy rate
            economy = round((runs_conceded / total_overs) if total_overs > 0 else 0, 2)
            
            # Calculate bowling average
            bowling_average = round((runs_conceded / total_wickets) if total_wickets > 0 else 0, 2)
            
            # Calculate strike rate (balls per wicket)
            strike_rate = round((total_balls / total_wickets) if total_wickets > 0 else 0, 2)
            
            # Get player info
            player_df = execute_query("SELECT player_id, player_image FROM players WHERE player_name = ?", (bowler,))
            player_id = player_df.iloc[0]['player_id'] if not player_df.empty else None
            player_image = player_df.iloc[0]['player_image'] if not player_df.empty else ""
            
            bowling_stats.append({
                "player_id": int(player_id) if pd.notna(player_id) else None,
                "player_name": bowler,
                "player_image": str(player_image) if pd.notna(player_image) else "",
                "total_wickets": int(total_wickets),
                "total_matches": int(total_matches),
                "total_overs": total_overs,
                "total_balls": int(total_balls),
                "runs_conceded": int(runs_conceded),
                "economy": economy,
                "bowling_average": bowling_average,
                "strike_rate": strike_rate,
                "best_figures": f"{total_wickets}/{int(runs_conceded)}" if total_matches > 0 else "0/0"
            })
        
        return {
            "total_bowlers": len(bowling_stats),
            "top_bowlers": bowling_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats/teams/comprehensive")
async def get_comprehensive_team_stats():
    """Get comprehensive team statistics like Cricbuzz"""
    try:
        # Get all teams
        teams_df = execute_query("SELECT * FROM teams ORDER BY team_name")
        
        team_stats = []
        
        for _, team in teams_df.iterrows():
            team_name = team['team_name']
            
            # Get team matches
            matches_query = """
            SELECT COUNT(*) as total_matches,
                   SUM(CASE WHEN match_winner = ? THEN 1 ELSE 0 END) as wins
            FROM matches 
            WHERE team1 = ? OR team2 = ?
            """
            match_stats = execute_query(matches_query, (team_name, team_name, team_name))
            total_matches = int(match_stats.iloc[0]['total_matches']) if pd.notna(match_stats.iloc[0]['total_matches']) else 0
            wins = int(match_stats.iloc[0]['wins']) if pd.notna(match_stats.iloc[0]['wins']) else 0
            losses = total_matches - wins
            
            # Get batting stats
            batting_query = """
            SELECT SUM(batter_runs) as total_runs_scored,
                   COUNT(*) as total_balls_faced
            FROM ball_by_ball 
            WHERE team_batting = ?
            """
            batting_stats = execute_query(batting_query, (team_name,))
            total_runs_scored = int(batting_stats.iloc[0]['total_runs_scored']) if pd.notna(batting_stats.iloc[0]['total_runs_scored']) else 0
            total_balls_faced = int(batting_stats.iloc[0]['total_balls_faced']) if pd.notna(batting_stats.iloc[0]['total_balls_faced']) else 0
            
            # Get bowling stats
            bowling_query = """
            SELECT SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets_taken,
                   SUM(total_runs) as total_runs_conceded
            FROM ball_by_ball 
            WHERE team_bowling = ?
            """
            bowling_stats = execute_query(bowling_query, (team_name,))
            total_wickets_taken = int(bowling_stats.iloc[0]['total_wickets_taken']) if pd.notna(bowling_stats.iloc[0]['total_wickets_taken']) else 0
            total_runs_conceded = int(bowling_stats.iloc[0]['total_runs_conceded']) if pd.notna(bowling_stats.iloc[0]['total_runs_conceded']) else 0
            
            # Calculate team batting average
            team_batting_avg = round((total_runs_scored / total_matches) if total_matches > 0 else 0, 2)
            
            # Calculate team bowling average
            team_bowling_avg = round((total_runs_conceded / total_matches) if total_matches > 0 else 0, 2)
            
            # Get seasons participated
            seasons_query = """
            SELECT COUNT(DISTINCT season) as seasons_count
            FROM matches 
            WHERE team1 = ? OR team2 = ?
            """
            seasons_result = execute_query(seasons_query, (team_name, team_name))
            seasons_participated = int(seasons_result.iloc[0]['seasons_count']) if pd.notna(seasons_result.iloc[0]['seasons_count']) else 0
            
            team_stats.append({
                "team_id": int(team['team_id']),
                "team_name": str(team_name),
                "team_name_short": str(team['team_name_short']),
                "image_url": str(team['image_url']) if pd.notna(team['image_url']) else None,
                "total_matches": int(total_matches),
                "wins": int(wins),
                "losses": int(losses),
                "win_percentage": round((wins / total_matches * 100) if total_matches > 0 else 0, 2),
                "total_runs_scored": int(total_runs_scored),
                "total_runs_conceded": int(total_runs_conceded),
                "total_wickets_taken": int(total_wickets_taken),
                "team_batting_average": team_batting_avg,
                "team_bowling_average": team_bowling_avg,
                "seasons_participated": seasons_participated,
                "net_run_rate": round((total_runs_scored - total_runs_conceded) / total_matches if total_matches > 0 else 0, 2)
            })
        
        # Sort by win percentage
        team_stats.sort(key=lambda x: x['win_percentage'], reverse=True)
        
        return {
            "total_teams": len(team_stats),
            "team_rankings": team_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats/matches/recent")
async def get_recent_matches(limit: int = 10):
    """Get recent matches with detailed information"""
    try:
        # Get recent matches sorted by match_date
        query = """
        SELECT match_id, team1, team2, match_winner, win_by_runs, win_by_wickets, 
               match_date, venue, city, season, event_name, stage, player_of_match
        FROM matches 
        ORDER BY match_date DESC 
        LIMIT ?
        """
        
        recent_matches_df = execute_query(query, (limit,))
        
        matches_list = []
        for _, match in recent_matches_df.iterrows():
            matches_list.append({
                "match_id": int(match['match_id']) if pd.notna(match['match_id']) else None,
                "team1": str(match['team1']) if pd.notna(match['team1']) else "",
                "team2": str(match['team2']) if pd.notna(match['team2']) else "",
                "match_winner": str(match['match_winner']) if pd.notna(match['match_winner']) else None,
                "win_by_runs": int(match['win_by_runs']) if pd.notna(match['win_by_runs']) else None,
                "win_by_wickets": int(match['win_by_wickets']) if pd.notna(match['win_by_wickets']) else None,
                "player_of_match": str(match['player_of_match']) if pd.notna(match['player_of_match']) else None,
                "venue": str(match['venue']) if pd.notna(match['venue']) else "",
                "city": str(match['city']) if pd.notna(match['city']) else "",
                "match_date": str(match['match_date']) if pd.notna(match['match_date']) else "",
                "season": str(match['season']) if pd.notna(match['season']) else None,
                "stage": str(match['stage']) if pd.notna(match['stage']) else ""
            })
        
        return {
            "total_matches": len(matches_list),
            "recent_matches": matches_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats/players/{player_id}/career")
async def get_player_career_stats(player_id: int):
    """Get comprehensive career statistics for a specific player"""
    try:
        # Get player info
        player_df = execute_query("SELECT * FROM players WHERE player_id = ?", (player_id,))
        if player_df.empty:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player_name = str(player_df.iloc[0]['player_name'])
        
        # Batting career stats
        batting_query = """
        SELECT 
            SUM(batter_runs) as total_runs,
            COUNT(*) as total_balls,
            COUNT(DISTINCT match_id) as total_matches,
            COUNT(DISTINCT match_id || '_' || innings) as total_innings,
            SUM(CASE WHEN batter_runs = 4 THEN 1 ELSE 0 END) as fours,
            SUM(CASE WHEN batter_runs = 6 THEN 1 ELSE 0 END) as sixes
        FROM ball_by_ball 
        WHERE batter = ?
        """
        batting_stats = execute_query(batting_query, (player_name,))
        
        # Bowling career stats
        bowling_query = """
        SELECT 
            SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets,
            COUNT(DISTINCT match_id) as total_matches,
            COUNT(*) as total_balls,
            SUM(total_runs) as runs_conceded
        FROM ball_by_ball 
        WHERE bowler = ?
        """
        bowling_stats = execute_query(bowling_query, (player_name,))
        
        # Season-wise performance
        season_query = """
        SELECT 
            season_id,
            SUM(batter_runs) as runs,
            COUNT(DISTINCT match_id) as matches
        FROM ball_by_ball 
        WHERE batter = ?
        GROUP BY season_id
        ORDER BY season_id
        """
        season_stats = execute_query(season_query, (player_name,))
        
        # Process batting stats
        batting_runs = int(batting_stats.iloc[0]['total_runs']) if pd.notna(batting_stats.iloc[0]['total_runs']) else 0
        batting_balls = int(batting_stats.iloc[0]['total_balls']) if pd.notna(batting_stats.iloc[0]['total_balls']) else 0
        batting_matches = int(batting_stats.iloc[0]['total_matches']) if pd.notna(batting_stats.iloc[0]['total_matches']) else 0
        batting_innings = int(batting_stats.iloc[0]['total_innings']) if pd.notna(batting_stats.iloc[0]['total_innings']) else 0
        fours = int(batting_stats.iloc[0]['fours']) if pd.notna(batting_stats.iloc[0]['fours']) else 0
        sixes = int(batting_stats.iloc[0]['sixes']) if pd.notna(batting_stats.iloc[0]['sixes']) else 0
        
        # Process bowling stats
        bowling_wickets = int(bowling_stats.iloc[0]['total_wickets']) if pd.notna(bowling_stats.iloc[0]['total_wickets']) else 0
        bowling_matches = int(bowling_stats.iloc[0]['total_matches']) if pd.notna(bowling_stats.iloc[0]['total_matches']) else 0
        bowling_balls = int(bowling_stats.iloc[0]['total_balls']) if pd.notna(bowling_stats.iloc[0]['total_balls']) else 0
        runs_conceded = int(bowling_stats.iloc[0]['runs_conceded']) if pd.notna(bowling_stats.iloc[0]['runs_conceded']) else 0
        
        batting_career = {
            "total_runs": batting_runs,
            "total_balls": batting_balls,
            "total_matches": batting_matches,
            "total_innings": batting_innings,
            "fours": fours,
            "sixes": sixes,
            "strike_rate": round((batting_runs / batting_balls * 100) if batting_balls > 0 else 0, 2),
            "highest_score": batting_runs  # Simplified for now
        }
        
        bowling_career = {
            "total_wickets": bowling_wickets,
            "total_matches": bowling_matches,
            "total_overs": round(bowling_balls / 6, 1),
            "runs_conceded": runs_conceded,
            "economy": round((runs_conceded / (bowling_balls / 6)) if bowling_balls > 0 else 0, 2),
            "bowling_average": round((runs_conceded / bowling_wickets) if bowling_wickets > 0 else 0, 2)
        }
        
        # Process season performance
        season_performance = []
        for _, season in season_stats.iterrows():
            season_performance.append({
                "season": int(season['season_id']),
                "runs": int(season['runs']),
                "matches": int(season['matches'])
            })
    
        return {
            "player_id": player_id,
            "player_name": player_name,
            "player_full_name": str(player_df.iloc[0]['player_full_name']) if pd.notna(player_df.iloc[0]['player_full_name']) else "",
            "player_image": str(player_df.iloc[0]['player_image']) if pd.notna(player_df.iloc[0]['player_image']) else "",
            "bat_style": str(player_df.iloc[0]['bat_style']) if pd.notna(player_df.iloc[0]['bat_style']) else "",
            "bowl_style": str(player_df.iloc[0]['bowl_style']) if pd.notna(player_df.iloc[0]['bowl_style']) else "",
            "batting_career": batting_career,
            "bowling_career": bowling_career,
            "season_performance": season_performance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stats/seasons/{season}/comprehensive")
async def get_season_comprehensive_stats(season: int):
    """Get comprehensive statistics for a specific season"""
    try:
        # Get season matches
        matches_query = """
        SELECT match_id, team1, team2, match_winner
        FROM matches 
        WHERE season = ? OR season_id = ?
        """
        season_matches_df = execute_query(matches_query, (season, season))
        
        # Get season ball data
        ball_query = """
        SELECT match_id, batter, bowler, batter_runs, is_wicket
        FROM ball_by_ball 
        WHERE season_id = ?
        """
        season_ball_df = execute_query(ball_query, (season,))
        
        if season_matches_df.empty and season_ball_df.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        # Season summary
        total_matches = season_matches_df['match_id'].nunique() if not season_matches_df.empty else season_ball_df['match_id'].nunique()
        total_runs = season_ball_df['batter_runs'].sum() if not season_ball_df.empty else 0
        total_wickets = len(season_ball_df[season_ball_df['is_wicket'] == 1]) if not season_ball_df.empty else 0
        
        # Top performers
        top_batsmen = []
        top_bowlers = []
        
        if not season_ball_df.empty:
            # Top batsmen
            batsman_query = """
            SELECT batter, SUM(batter_runs) as total_runs
            FROM ball_by_ball 
            WHERE season_id = ?
            GROUP BY batter
            ORDER BY total_runs DESC
            LIMIT 5
            """
            batsman_stats = execute_query(batsman_query, (season,))
            
            for _, batsman in batsman_stats.iterrows():
                top_batsmen.append({
                    "player_name": str(batsman['batter']),
                    "runs": int(batsman['total_runs'])
                })
            
            # Top bowlers
            bowler_query = """
            SELECT bowler, SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets
            FROM ball_by_ball 
            WHERE season_id = ?
            GROUP BY bowler
            HAVING total_wickets > 0
            ORDER BY total_wickets DESC
            LIMIT 5
            """
            bowler_stats = execute_query(bowler_query, (season,))
            
            for _, bowler in bowler_stats.iterrows():
                top_bowlers.append({
                    "player_name": str(bowler['bowler']),
                    "wickets": int(bowler['total_wickets'])
                })
        
        # Team standings
        team_standings = []
        if not season_matches_df.empty:
            # Get unique teams
            teams_in_season = set(season_matches_df['team1'].tolist() + season_matches_df['team2'].tolist())
            
            for team in teams_in_season:
                team_matches = season_matches_df[(season_matches_df['team1'] == team) | (season_matches_df['team2'] == team)]
                wins = len(team_matches[team_matches['match_winner'] == team])
                
                team_standings.append({
                    "team_name": team,
                    "matches": len(team_matches),
                    "wins": wins,
                    "losses": len(team_matches) - wins,
                    "win_percentage": round((wins / len(team_matches) * 100) if len(team_matches) > 0 else 0, 2)
                })
            
            team_standings.sort(key=lambda x: x['win_percentage'], reverse=True)
        
        return {
            "season": season,
            "total_matches": int(total_matches),
            "total_runs": int(total_runs),
            "total_wickets": int(total_wickets),
            "top_batsmen": top_batsmen,
            "top_bowlers": top_bowlers,
            "team_standings": team_standings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ================================
# BALL-BY-BALL ANALYSIS & CHART DATA ENDPOINTS
# ================================

@app.get("/analysis/ball-by-ball/{match_id}")
async def get_ball_by_ball_analysis(match_id: int):
    """Get detailed ball-by-ball analysis for a specific match"""
    try:
        # Get match info
        match_query = """
        SELECT match_id, team1, team2, match_winner, venue, match_date
        FROM matches 
        WHERE match_id = ?
        """
        match_info = execute_query(match_query, (match_id,))
        if match_info.empty:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match_data = match_info.iloc[0]
        
        # Get ball-by-ball data for the match
        ball_query = """
        SELECT innings, team_batting, batter_runs, extras, total_runs, is_wicket, over_number
        FROM ball_by_ball 
        WHERE match_id = ?
        ORDER BY innings, over_number, ball_number
        """
        match_balls = execute_query(ball_query, (match_id,))
        if match_balls.empty:
            raise HTTPException(status_code=404, detail="Ball-by-ball data not found")
        
        # Analyze by innings
        innings_analysis = []
        for innings in sorted(match_balls['innings'].unique()):
            innings_data = match_balls[match_balls['innings'] == innings]
            
            # Team batting in this innings
            batting_team = str(innings_data['team_batting'].iloc[0]) if not innings_data.empty else ""
            
            # Runs analysis
            total_runs = int(innings_data['batter_runs'].sum()) if pd.notna(innings_data['batter_runs'].sum()) else 0
            extras = int(innings_data['extras'].sum()) if pd.notna(innings_data['extras'].sum()) else 0
            total_score = int(innings_data['total_runs'].sum()) if pd.notna(innings_data['total_runs'].sum()) else 0
            
            # Wickets analysis
            wickets_fallen = len(innings_data[innings_data['is_wicket'] == 1])
            
            # Over-by-over analysis
            over_analysis = []
            for over in sorted(innings_data['over_number'].unique()):
                over_data = innings_data[innings_data['over_number'] == over]
                over_runs = int(over_data['total_runs'].sum()) if pd.notna(over_data['total_runs'].sum()) else 0
                over_wickets = len(over_data[over_data['is_wicket'] == 1])
                
                over_analysis.append({
                    "over": int(over),
                    "runs": over_runs,
                    "wickets": over_wickets,
                    "balls": len(over_data)
                })
            
            # Boundary analysis
            fours = len(innings_data[innings_data['batter_runs'] == 4])
            sixes = len(innings_data[innings_data['batter_runs'] == 6])
            
            innings_analysis.append({
                "innings": int(innings),
                "batting_team": batting_team,
                "total_runs": total_runs,
                "extras": extras,
                "total_score": total_score,
                "wickets_fallen": wickets_fallen,
                "fours": fours,
                "sixes": sixes,
                "over_analysis": over_analysis
            })
        
        return {
            "match_id": match_id,
            "team1": str(match_data['team1']) if pd.notna(match_data['team1']) else "",
            "team2": str(match_data['team2']) if pd.notna(match_data['team2']) else "",
            "match_winner": str(match_data['match_winner']) if pd.notna(match_data['match_winner']) else None,
            "venue": str(match_data['venue']) if pd.notna(match_data['venue']) else "",
            "match_date": str(match_data['match_date']) if pd.notna(match_data['match_date']) else "",
            "innings_analysis": innings_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/pie/team-performance")
async def get_team_performance_pie_chart():
    """Get pie chart data for team performance distribution"""
    try:
        # Get all teams
        teams_df = execute_query("SELECT * FROM teams ORDER BY team_name")
        
        # Calculate wins for each team
        team_wins = {}
        for _, team in teams_df.iterrows():
            team_name = str(team['team_name'])
            
            # Get team wins
            wins_query = """
            SELECT COUNT(*) as wins
            FROM matches 
            WHERE (team1 = ? OR team2 = ?) AND match_winner = ?
            """
            wins_result = execute_query(wins_query, (team_name, team_name, team_name))
            wins = int(wins_result.iloc[0]['wins']) if pd.notna(wins_result.iloc[0]['wins']) else 0
            team_wins[team_name] = wins
        
        # Sort by wins and get top teams for pie chart
        sorted_teams = sorted(team_wins.items(), key=lambda x: x[1], reverse=True)
        top_teams = sorted_teams[:8]  # Top 8 teams
        
        pie_data = []
        for team_name, wins in top_teams:
            # Get team info
            team_info = teams_df[teams_df['team_name'] == team_name]
            if not team_info.empty:
                pie_data.append({
                    "label": str(team_info.iloc[0]['team_name_short']),
                    "value": wins,
                    "team_name": team_name,
                    "color": f"#{hash(team_name) % 0xFFFFFF:06x}"  # Generate color based on team name
                })
        
        return {
            "chart_type": "pie",
            "title": "Team Wins Distribution",
            "data": pie_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/pie/player-runs-distribution")
async def get_player_runs_distribution_pie_chart(limit: int = 10):
    """Get pie chart data for top players' runs distribution"""
    try:
        # Calculate total runs by player
        query = """
        SELECT batter, SUM(batter_runs) as total_runs
        FROM ball_by_ball 
        WHERE batter IS NOT NULL
        GROUP BY batter
        ORDER BY total_runs DESC
        LIMIT ?
        """
        player_runs = execute_query(query, (limit,))
        
        pie_data = []
        for _, player in player_runs.iterrows():
            pie_data.append({
                "label": str(player['batter']),
                "value": int(player['total_runs']),
                "color": f"#{hash(str(player['batter'])) % 0xFFFFFF:06x}"
            })
        
        return {
            "chart_type": "pie",
            "title": f"Top {limit} Players Runs Distribution",
            "data": pie_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/pie/wicket-types")
async def get_wicket_types_pie_chart():
    """Get pie chart data for wicket types distribution"""
    try:
        # Get wicket types distribution
        query = """
        SELECT wicket_kind, COUNT(*) as count
        FROM ball_by_ball 
        WHERE is_wicket = 1 AND wicket_kind IS NOT NULL
        GROUP BY wicket_kind
        ORDER BY count DESC
        """
        wicket_types_df = execute_query(query)
        
        pie_data = []
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
        
        for i, (_, row) in enumerate(wicket_types_df.iterrows()):
            wicket_type = str(row['wicket_kind'])
            count = int(row['count'])
            pie_data.append({
                "label": wicket_type,
                "value": count,
                "color": colors[i % len(colors)]
            })
        
        return {
            "chart_type": "pie",
            "title": "Wicket Types Distribution",
            "data": pie_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/bar/season-wise-stats")
async def get_season_wise_bar_chart():
    """Get bar chart data for season-wise statistics"""
    try:
        # Get unique seasons from ball_by_ball
        seasons_query = """
        SELECT DISTINCT season_id
        FROM ball_by_ball 
        WHERE season_id IS NOT NULL
        ORDER BY season_id
        """
        seasons_df = execute_query(seasons_query)
        
        bar_data = []
        for _, row in seasons_df.iterrows():
            season = int(row['season_id'])
            
            # Get season stats from ball_by_ball
            ball_stats_query = """
            SELECT 
                SUM(batter_runs) as total_runs,
                SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets,
                COUNT(DISTINCT match_id) as total_matches
            FROM ball_by_ball 
            WHERE season_id = ?
            """
            ball_stats = execute_query(ball_stats_query, (season,))
            
            total_runs = int(ball_stats.iloc[0]['total_runs']) if pd.notna(ball_stats.iloc[0]['total_runs']) else 0
            total_wickets = int(ball_stats.iloc[0]['total_wickets']) if pd.notna(ball_stats.iloc[0]['total_wickets']) else 0
            total_matches = int(ball_stats.iloc[0]['total_matches']) if pd.notna(ball_stats.iloc[0]['total_matches']) else 0
            
            bar_data.append({
                "season": season,
                "runs": total_runs,
                "wickets": total_wickets,
                "matches": total_matches
            })
        
        return {
            "chart_type": "bar",
            "title": "Season-wise Statistics",
            "data": bar_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/line/player-performance/{player_id}")
async def get_player_performance_line_chart(player_id: int):
    """Get line chart data for player performance over seasons"""
    try:
        # Get player info
        player_query = """
        SELECT player_name
        FROM players 
        WHERE player_id = ?
        """
        player_info = execute_query(player_query, (player_id,))
        if player_info.empty:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player_name = str(player_info.iloc[0]['player_name'])
        
        # Get player's batting data by season
        season_query = """
        SELECT 
            season_id,
            SUM(batter_runs) as total_runs,
            COUNT(DISTINCT match_id) as total_matches
        FROM ball_by_ball 
        WHERE batter = ?
        GROUP BY season_id
        ORDER BY season_id
        """
        season_stats = execute_query(season_query, (player_name,))
        
        if season_stats.empty:
            raise HTTPException(status_code=404, detail="Player batting data not found")
        
        line_data = []
        for _, season in season_stats.iterrows():
            line_data.append({
                "season": int(season['season_id']),
                "runs": int(season['total_runs']),
                "matches": int(season['total_matches'])
            })
        
        return {
            "chart_type": "line",
            "title": f"{player_name} - Runs Over Seasons",
            "player_name": player_name,
            "data": line_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/line/player-batting-seasons/{player_name}")
async def get_player_batting_seasons_chart(player_name: str):
    """Get detailed batting performance chart for a player across all seasons"""
    try:
        # Clean player name
        clean_name = player_name.strip()
        
        # Get player's batting data from database
        query = """
        SELECT season_id, 
               SUM(batter_runs) as total_runs,
               COUNT(*) as total_balls,
               COUNT(DISTINCT match_id) as matches_played,
               SUM(CASE WHEN batter_runs = 4 THEN 1 ELSE 0 END) as fours,
               SUM(CASE WHEN batter_runs = 6 THEN 1 ELSE 0 END) as sixes
        FROM ball_by_ball 
        WHERE batter = ? 
        GROUP BY season_id 
        ORDER BY season_id
        """
        
        player_batting = execute_query(query, (clean_name,))
        
        if player_batting.empty:
            return {
                "player_name": clean_name,
                "seasons": [],
                "runs": [],
                "balls": [],
                "fours": [],
                "sixes": [],
                "strike_rate": [],
                "average": [],
                "matches": []
            }
        
        # Process results
        season_stats = []
        for _, row in player_batting.iterrows():
            total_runs = int(row['total_runs'])
            total_balls = int(row['total_balls'])
            matches_played = int(row['matches_played'])
            fours = int(row['fours'])
            sixes = int(row['sixes'])
            
            # Calculate strike rate
            strike_rate = round((total_runs / total_balls) * 100, 2) if total_balls > 0 else 0
            
            # Calculate average (simplified)
            average = round(total_runs / matches_played, 2) if matches_played > 0 else 0
            
            season_stats.append({
                "season": int(row['season_id']),
                "runs": total_runs,
                "balls": total_balls,
                "fours": fours,
                "sixes": sixes,
                "strike_rate": strike_rate,
                "average": average,
                "matches": matches_played
            })
        
        return {
            "chart_type": "line",
            "title": f"{clean_name} - Batting Performance Over Seasons",
            "player_name": clean_name,
            "seasons": [s['season'] for s in season_stats],
            "runs": [s['runs'] for s in season_stats],
            "balls": [s['balls'] for s in season_stats],
            "fours": [s['fours'] for s in season_stats],
            "sixes": [s['sixes'] for s in season_stats],
            "strike_rate": [s['strike_rate'] for s in season_stats],
            "average": [s['average'] for s in season_stats],
            "matches": [s['matches'] for s in season_stats]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating batting seasons chart: {str(e)}")

@app.get("/charts/line/player-bowling-seasons/{player_name}")
async def get_player_bowling_seasons_chart(player_name: str):
    """Get detailed bowling performance chart for a player across all seasons"""
    try:
        # Clean player name
        clean_name = player_name.strip()
        
        # Get player's bowling data from database
        query = """
        SELECT season_id,
               SUM(is_wicket) as total_wickets,
               SUM(total_runs) as total_runs_conceded,
               COUNT(*) as total_balls,
               COUNT(DISTINCT match_id) as matches_played
        FROM ball_by_ball 
        WHERE bowler = ? 
        GROUP BY season_id 
        ORDER BY season_id
        """
        
        player_bowling = execute_query(query, (clean_name,))
        
        if player_bowling.empty:
            return {
                "player_name": clean_name,
                "seasons": [],
                "wickets": [],
                "runs_conceded": [],
                "overs": [],
                "economy": [],
                "average": [],
                "matches": []
            }
        
        # Process results
        season_stats = []
        for _, row in player_bowling.iterrows():
            total_wickets = int(row['total_wickets'])
            total_runs_conceded = int(row['total_runs_conceded'])
            total_balls = int(row['total_balls'])
            matches_played = int(row['matches_played'])
            
            # Calculate overs (simplified - 6 balls = 1 over)
            overs = round(total_balls / 6, 1)
            
            # Calculate economy
            economy = round(total_runs_conceded / overs, 2) if overs > 0 else 0
            
            # Calculate bowling average
            average = round(total_runs_conceded / total_wickets, 2) if total_wickets > 0 else 0
            
            season_stats.append({
                "season": int(row['season_id']),
                "wickets": total_wickets,
                "runs_conceded": total_runs_conceded,
                "overs": overs,
                "economy": economy,
                "average": average,
                "matches": matches_played
            })
        
        return {
            "chart_type": "line",
            "title": f"{clean_name} - Bowling Performance Over Seasons",
            "player_name": clean_name,
            "seasons": [s['season'] for s in season_stats],
            "wickets": [s['wickets'] for s in season_stats],
            "runs_conceded": [s['runs_conceded'] for s in season_stats],
            "overs": [s['overs'] for s in season_stats],
            "economy": [s['economy'] for s in season_stats],
            "average": [s['average'] for s in season_stats],
            "matches": [s['matches'] for s in season_stats]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating bowling seasons chart: {str(e)}")

@app.get("/charts/line/team-performance-seasons/{team_name}")
async def get_team_performance_seasons_chart(team_name: str):
    """Get team performance chart across all seasons"""
    try:
        # Clean team name
        clean_name = team_name.strip()
        
        # Get team's matches from database
        matches_query = """
        SELECT season, season_id, match_winner
        FROM matches 
        WHERE team1 = ? OR team2 = ?
        ORDER BY season
        """
        
        team_matches = execute_query(matches_query, (clean_name, clean_name))
        
        if team_matches.empty:
            return {
                "team_name": clean_name,
                "seasons": [],
                "matches_played": [],
                "wins": [],
                "losses": [],
                "win_percentage": [],
                "runs_scored": [],
                "runs_conceded": []
            }
        
        # Group by season
        season_stats = []
        for season in sorted(team_matches['season'].unique()):
            if pd.isna(season):
                continue
            
            # Normalize season value
            normalized_season = _normalize_season_value(season)
            if normalized_season is None:
                continue
                
            season_data = team_matches[team_matches['season'] == season]
            
            matches_played = len(season_data)
            wins = int((season_data['match_winner'] == clean_name).sum())
            losses = matches_played - wins
            win_percentage = round((wins / matches_played) * 100, 2) if matches_played > 0 else 0
            
            # Get runs scored from ball_by_ball
            runs_scored_query = """
            SELECT SUM(total_runs) as total_runs
            FROM ball_by_ball 
            WHERE team_batting = ? AND season_id = ?
            """
            runs_scored_result = execute_query(runs_scored_query, (clean_name, normalized_season))
            runs_scored = int(runs_scored_result.iloc[0]['total_runs']) if not runs_scored_result.empty and pd.notna(runs_scored_result.iloc[0]['total_runs']) else 0
            
            # Get runs conceded from ball_by_ball
            runs_conceded_query = """
            SELECT SUM(total_runs) as total_runs
            FROM ball_by_ball 
            WHERE team_bowling = ? AND season_id = ?
            """
            runs_conceded_result = execute_query(runs_conceded_query, (clean_name, normalized_season))
            runs_conceded = int(runs_conceded_result.iloc[0]['total_runs']) if not runs_conceded_result.empty and pd.notna(runs_conceded_result.iloc[0]['total_runs']) else 0
            
            season_stats.append({
                "season": normalized_season,
                "matches_played": matches_played,
                "wins": wins,
                "losses": losses,
                "win_percentage": win_percentage,
                "runs_scored": runs_scored,
                "runs_conceded": runs_conceded
            })
        
        # Sort by season
        season_stats.sort(key=lambda x: x['season'])
        
        return {
            "chart_type": "line",
            "title": f"{clean_name} - Performance Over Seasons",
            "team_name": clean_name,
            "seasons": [s['season'] for s in season_stats],
            "matches_played": [s['matches_played'] for s in season_stats],
            "wins": [s['wins'] for s in season_stats],
            "losses": [s['losses'] for s in season_stats],
            "win_percentage": [s['win_percentage'] for s in season_stats],
            "runs_scored": [s['runs_scored'] for s in season_stats],
            "runs_conceded": [s['runs_conceded'] for s in season_stats]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating team performance chart: {str(e)}")

@app.get("/analysis/over-by-over/{match_id}")
async def get_over_by_over_analysis(match_id: int):
    """Get over-by-over analysis for a specific match"""
    try:
        # Get ball-by-ball data for the match
        query = """
        SELECT innings, team_batting, over_number, ball_number, batter, bowler, 
               batter_runs, extras, total_runs, is_wicket, wicket_kind
        FROM ball_by_ball 
        WHERE match_id = ?
        ORDER BY innings, over_number, ball_number
        """
        match_balls = execute_query(query, (match_id,))
        if match_balls.empty:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Analyze by innings and over
        analysis = []
        for innings in sorted(match_balls['innings'].unique()):
            innings_data = match_balls[match_balls['innings'] == innings]
            batting_team = str(innings_data['team_batting'].iloc[0]) if not innings_data.empty else ""
            
            innings_analysis = {
                "innings": int(innings),
                "batting_team": batting_team,
                "overs": []
            }
            
            cumulative_runs = 0
            cumulative_wickets = 0
            
            for over in sorted(innings_data['over_number'].unique()):
                over_data = innings_data[innings_data['over_number'] == over]
                over_runs = int(over_data['total_runs'].sum()) if pd.notna(over_data['total_runs'].sum()) else 0
                over_wickets = len(over_data[over_data['is_wicket'] == 1])
                
                cumulative_runs += over_runs
                cumulative_wickets += over_wickets
                
                # Ball-by-ball details for this over
                balls_detail = []
                for _, ball in over_data.iterrows():
                    balls_detail.append({
                        "ball": int(ball['ball_number']),
                        "batter": str(ball['batter']) if pd.notna(ball['batter']) else "",
                        "bowler": str(ball['bowler']) if pd.notna(ball['bowler']) else "",
                        "runs": int(ball['batter_runs']) if pd.notna(ball['batter_runs']) else 0,
                        "extras": int(ball['extras']) if pd.notna(ball['extras']) else 0,
                        "total_runs": int(ball['total_runs']) if pd.notna(ball['total_runs']) else 0,
                        "is_wicket": bool(ball['is_wicket']),
                        "wicket_kind": str(ball['wicket_kind']) if pd.notna(ball['wicket_kind']) else None
                    })
                
                innings_analysis["overs"].append({
                    "over": int(over),
                    "runs": over_runs,
                    "wickets": over_wickets,
                    "cumulative_runs": cumulative_runs,
                    "cumulative_wickets": cumulative_wickets,
                    "balls": balls_detail
                })
            
            analysis.append(innings_analysis)
        
        return {
            "match_id": match_id,
            "over_by_over_analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/analysis/player/{player_id}/detailed")
async def get_player_detailed_analysis(player_id: int):
    """Get detailed analysis for a specific player (batsman or bowler)"""
    try:
        # Get player info
        player_query = """
        SELECT player_name, player_full_name, player_image, bat_style, bowl_style
        FROM players 
        WHERE player_id = ?
        """
        player_info = execute_query(player_query, (player_id,))
        if player_info.empty:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player_name = str(player_info.iloc[0]['player_name'])
        
        # Batting analysis
        batting_query = """
        SELECT batter_runs, season_id, match_id
        FROM ball_by_ball 
        WHERE batter = ?
        """
        batting_data = execute_query(batting_query, (player_name,))
        batting_analysis = {}
        
        if not batting_data.empty:
            # Runs distribution
            runs_dist_query = """
            SELECT batter_runs, COUNT(*) as count
            FROM ball_by_ball 
            WHERE batter = ?
            GROUP BY batter_runs
            ORDER BY batter_runs
            """
            runs_dist_data = execute_query(runs_dist_query, (player_name,))
            runs_distribution = {str(row['batter_runs']): int(row['count']) for _, row in runs_dist_data.iterrows()}
            
            # Performance by season
            season_query = """
            SELECT 
                season_id,
                SUM(batter_runs) as total_runs,
                COUNT(*) as total_balls,
                COUNT(DISTINCT match_id) as total_matches
            FROM ball_by_ball 
            WHERE batter = ?
            GROUP BY season_id
            ORDER BY season_id
            """
            season_data = execute_query(season_query, (player_name,))
            
            season_stats = []
            for _, season in season_data.iterrows():
                season_stats.append({
                    "season": int(season['season_id']),
                    "runs": int(season['total_runs']),
                    "balls": int(season['total_balls']),
                    "matches": int(season['total_matches'])
                })
            
            # Calculate totals
            total_runs = int(batting_data['batter_runs'].sum()) if pd.notna(batting_data['batter_runs'].sum()) else 0
            total_balls = len(batting_data)
            total_matches = batting_data['match_id'].nunique()
            fours = len(batting_data[batting_data['batter_runs'] == 4])
            sixes = len(batting_data[batting_data['batter_runs'] == 6])
            
            batting_analysis = {
                "total_runs": total_runs,
                "total_balls": total_balls,
                "total_matches": total_matches,
                "runs_distribution": runs_distribution,
                "season_performance": season_stats,
                "fours": fours,
                "sixes": sixes,
                "strike_rate": round((total_runs / total_balls * 100) if total_balls > 0 else 0, 2)
            }
        
        # Bowling analysis
        bowling_query = """
        SELECT is_wicket, wicket_kind, total_runs, season_id, match_id, over_number
        FROM ball_by_ball 
        WHERE bowler = ?
        """
        bowling_data = execute_query(bowling_query, (player_name,))
        bowling_analysis = {}
        
        if not bowling_data.empty:
            # Wicket types
            wicket_types_query = """
            SELECT wicket_kind, COUNT(*) as count
            FROM ball_by_ball 
            WHERE bowler = ? AND is_wicket = 1 AND wicket_kind IS NOT NULL
            GROUP BY wicket_kind
            """
            wicket_types_data = execute_query(wicket_types_query, (player_name,))
            wicket_types = {str(row['wicket_kind']): int(row['count']) for _, row in wicket_types_data.iterrows()}
            
            # Performance by season
            bowling_season_query = """
            SELECT 
                season_id,
                SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets,
                SUM(total_runs) as runs_conceded,
                COUNT(DISTINCT match_id) as total_matches
            FROM ball_by_ball 
            WHERE bowler = ?
            GROUP BY season_id
            ORDER BY season_id
            """
            bowling_season_data = execute_query(bowling_season_query, (player_name,))
            
            bowling_season_stats = []
            for _, season in bowling_season_data.iterrows():
                bowling_season_stats.append({
                    "season": int(season['season_id']),
                    "wickets": int(season['total_wickets']),
                    "runs_conceded": int(season['runs_conceded']),
                    "matches": int(season['total_matches'])
                })
            
            # Calculate totals
            total_wickets = len(bowling_data[bowling_data['is_wicket'] == 1])
            total_matches_bowling = bowling_data['match_id'].nunique()
            total_overs = bowling_data.groupby('match_id')['over_number'].max().sum() if not bowling_data.empty else 0
            runs_conceded = int(bowling_data['total_runs'].sum()) if pd.notna(bowling_data['total_runs'].sum()) else 0
            
            bowling_analysis = {
                "total_wickets": total_wickets,
                "total_matches": total_matches_bowling,
                "total_overs": int(total_overs),
                "runs_conceded": runs_conceded,
                "wicket_types": wicket_types,
                "season_performance": bowling_season_stats,
                "economy": round((runs_conceded / total_overs) if total_overs > 0 else 0, 2)
            }
        
        return {
            "player_id": player_id,
            "player_name": player_name,
            "player_full_name": str(player_info.iloc[0]['player_full_name']) if pd.notna(player_info.iloc[0]['player_full_name']) else "",
            "player_image": str(player_info.iloc[0]['player_image']) if pd.notna(player_info.iloc[0]['player_image']) else "",
            "bat_style": str(player_info.iloc[0]['bat_style']) if pd.notna(player_info.iloc[0]['bat_style']) else "",
            "bowl_style": str(player_info.iloc[0]['bowl_style']) if pd.notna(player_info.iloc[0]['bowl_style']) else "",
            "batting_analysis": batting_analysis,
            "bowling_analysis": bowling_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ================================
# SEASON-WISE DETAILED ANALYSIS & GRAPHS
# ================================

@app.get("/analysis/seasons/{season}/detailed")
async def get_season_detailed_analysis(season: int):
    """Get detailed analysis for a specific season with all statistics"""
    try:
        # Get season ball data
        season_ball_query = """
        SELECT batter, bowler, batter_runs, total_runs, is_wicket, match_id, season_id, team_batting, team_bowling, over_number
        FROM ball_by_ball 
        WHERE season_id = ?
        """
        season_ball_data = execute_query(season_ball_query, (season,))
        
        # Get season match data
        season_match_query = """
        SELECT match_id, team1, team2, match_winner, season
        FROM matches 
        WHERE season = ? OR season_id = ?
        """
        season_match_data = execute_query(season_match_query, (season, season))
        
        if season_ball_data.empty and season_match_data.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        # Season summary
        total_matches = season_match_data['match_id'].nunique() if not season_match_data.empty else season_ball_data['match_id'].nunique()
        total_runs = int(season_ball_data['batter_runs'].sum()) if not season_ball_data.empty and pd.notna(season_ball_data['batter_runs'].sum()) else 0
        total_wickets = len(season_ball_data[season_ball_data['is_wicket'] == 1]) if not season_ball_data.empty else 0
        total_fours = len(season_ball_data[season_ball_data['batter_runs'] == 4]) if not season_ball_data.empty else 0
        total_sixes = len(season_ball_data[season_ball_data['batter_runs'] == 6]) if not season_ball_data.empty else 0
        
        # Detailed batsman analysis
        batsman_analysis = []
        if not season_ball_data.empty:
            batsman_query = """
            SELECT 
                batter,
                SUM(batter_runs) as total_runs,
                COUNT(*) as total_balls,
                COUNT(DISTINCT match_id) as total_matches,
                SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as dismissals
            FROM ball_by_ball 
            WHERE season_id = ?
            GROUP BY batter
            ORDER BY total_runs DESC
            LIMIT 20
            """
            batsman_stats = execute_query(batsman_query, (season,))
            
            for _, batsman in batsman_stats.iterrows():
                player_name = str(batsman['batter'])
                total_runs_player = int(batsman['total_runs'])
                total_balls_player = int(batsman['total_balls'])
                total_matches_player = int(batsman['total_matches'])
                dismissals = int(batsman['dismissals'])
                
                # Get player info
                player_info_query = """
                SELECT player_id, player_image
                FROM players 
                WHERE player_name = ?
                """
                player_info = execute_query(player_info_query, (player_name,))
                player_id = int(player_info.iloc[0]['player_id']) if not player_info.empty else None
                player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
                
                # Calculate boundaries
                boundaries_query = """
                SELECT 
                    SUM(CASE WHEN batter_runs = 4 THEN 1 ELSE 0 END) as fours,
                    SUM(CASE WHEN batter_runs = 6 THEN 1 ELSE 0 END) as sixes
                FROM ball_by_ball 
                WHERE season_id = ? AND batter = ?
                """
                boundaries = execute_query(boundaries_query, (season, player_name))
                fours = int(boundaries.iloc[0]['fours']) if not boundaries.empty else 0
                sixes = int(boundaries.iloc[0]['sixes']) if not boundaries.empty else 0
                
                # Calculate highest score
                highest_query = """
                SELECT MAX(match_runs) as highest_score
                FROM (
                    SELECT match_id, SUM(batter_runs) as match_runs
                    FROM ball_by_ball 
                    WHERE season_id = ? AND batter = ?
                    GROUP BY match_id
                )
                """
                highest_data = execute_query(highest_query, (season, player_name))
                highest_score = int(highest_data.iloc[0]['highest_score']) if not highest_data.empty and pd.notna(highest_data.iloc[0]['highest_score']) else 0
                
                # Calculate strike rate and average
                strike_rate = round((total_runs_player / total_balls_player * 100) if total_balls_player > 0 else 0, 2)
                average = round((total_runs_player / dismissals) if dismissals > 0 else total_runs_player, 2)
                
                batsman_analysis.append({
                    "player_id": player_id,
                    "player_name": player_name,
                    "player_image": player_image,
                    "total_runs": total_runs_player,
                    "total_balls": total_balls_player,
                    "total_matches": total_matches_player,
                    "dismissals": dismissals,
                    "fours": fours,
                    "sixes": sixes,
                    "strike_rate": strike_rate,
                    "average": average,
                    "highest_score": highest_score
                })
        
        # Detailed bowler analysis
        bowler_analysis = []
        if not season_ball_data.empty:
            bowler_query = """
            SELECT 
                bowler,
                SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets,
                SUM(total_runs) as runs_conceded,
                COUNT(DISTINCT match_id) as total_matches
            FROM ball_by_ball 
            WHERE season_id = ?
            GROUP BY bowler
            HAVING total_wickets > 0
            ORDER BY total_wickets DESC
            LIMIT 20
            """
            bowler_stats = execute_query(bowler_query, (season,))
            
            for _, bowler in bowler_stats.iterrows():
                bowler_name = str(bowler['bowler'])
                total_wickets_bowler = int(bowler['total_wickets'])
                runs_conceded = int(bowler['runs_conceded'])
                total_matches_bowler = int(bowler['total_matches'])
                
                # Get player info
                player_info_query = """
                SELECT player_id, player_image
                FROM players 
                WHERE player_name = ?
                """
                player_info = execute_query(player_info_query, (bowler_name,))
                player_id = int(player_info.iloc[0]['player_id']) if not player_info.empty else None
                player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
                
                # Calculate overs bowled
                overs_query = """
                SELECT SUM(max_over) as total_overs
                FROM (
                    SELECT match_id, MAX(over_number) as max_over
                    FROM ball_by_ball 
                    WHERE season_id = ? AND bowler = ?
                    GROUP BY match_id
                )
                """
                overs_data = execute_query(overs_query, (season, bowler_name))
                total_overs = int(overs_data.iloc[0]['total_overs']) if not overs_data.empty and pd.notna(overs_data.iloc[0]['total_overs']) else 0
                
                # Calculate economy and average
                economy = round((runs_conceded / total_overs) if total_overs > 0 else 0, 2)
                bowling_average = round((runs_conceded / total_wickets_bowler) if total_wickets_bowler > 0 else 0, 2)
                
                bowler_analysis.append({
                    "player_id": player_id,
                    "player_name": bowler_name,
                    "player_image": player_image,
                    "total_wickets": total_wickets_bowler,
                    "total_matches": total_matches_bowler,
                    "total_overs": total_overs,
                    "runs_conceded": runs_conceded,
                    "economy": economy,
                    "bowling_average": bowling_average,
                    "best_figures": f"{total_wickets_bowler}/{runs_conceded}" if total_matches_bowler > 0 else "0/0"
                })
        
        # Team standings
        team_standings = []
        if not season_match_data.empty:
            teams_in_season = set(season_match_data['team1'].tolist() + season_match_data['team2'].tolist())
            
            for team in teams_in_season:
                team_matches = season_match_data[(season_match_data['team1'] == team) | (season_match_data['team2'] == team)]
                wins = len(team_matches[team_matches['match_winner'] == team])
                
                # Get team batting and bowling stats
                team_batting = season_ball_data[season_ball_data['team_batting'] == team] if not season_ball_data.empty else pd.DataFrame()
                team_bowling = season_ball_data[season_ball_data['team_bowling'] == team] if not season_ball_data.empty else pd.DataFrame()
                
                runs_scored = int(team_batting['batter_runs'].sum()) if not team_batting.empty and pd.notna(team_batting['batter_runs'].sum()) else 0
                runs_conceded = int(team_bowling['total_runs'].sum()) if not team_bowling.empty and pd.notna(team_bowling['total_runs'].sum()) else 0
                wickets_taken = len(team_bowling[team_bowling['is_wicket'] == 1]) if not team_bowling.empty else 0
                
                team_standings.append({
                    "team_name": team,
                    "matches": len(team_matches),
                    "wins": wins,
                    "losses": len(team_matches) - wins,
                    "win_percentage": round((wins / len(team_matches) * 100) if len(team_matches) > 0 else 0, 2),
                    "runs_scored": runs_scored,
                    "runs_conceded": runs_conceded,
                    "wickets_taken": wickets_taken,
                    "net_run_rate": round((runs_scored - runs_conceded) / len(team_matches) if len(team_matches) > 0 else 0, 2)
                })
            
            team_standings.sort(key=lambda x: x['win_percentage'], reverse=True)
        
        return {
            "season": season,
            "season_summary": {
                "total_matches": int(total_matches),
                "total_runs": total_runs,
                "total_wickets": total_wickets,
                "total_fours": total_fours,
                "total_sixes": total_sixes,
                "average_runs_per_match": round(total_runs / total_matches if total_matches > 0 else 0, 2)
            },
            "top_batsmen": batsman_analysis,
            "top_bowlers": bowler_analysis,
            "team_standings": team_standings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/season/{season}/batsman-runs-bar")
async def get_season_batsman_runs_bar_chart(season: int, limit: int = 15):
    """Get bar chart data for top batsmen runs in a specific season"""
    try:
        # Get top batsmen for the season
        batsman_query = """
        SELECT 
            batter,
            SUM(batter_runs) as total_runs
        FROM ball_by_ball 
        WHERE season_id = ?
        GROUP BY batter
        ORDER BY total_runs DESC
        LIMIT ?
        """
        batsman_runs = execute_query(batsman_query, (season, limit))
        
        if batsman_runs.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        bar_data = []
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2']
        
        for i, (_, batsman) in enumerate(batsman_runs.iterrows()):
            player_name = str(batsman['batter'])
            total_runs = int(batsman['total_runs'])
            
            # Get player info
            player_info_query = """
            SELECT player_image
            FROM players 
            WHERE player_name = ?
            """
            player_info = execute_query(player_info_query, (player_name,))
            player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
            
            bar_data.append({
                "label": player_name,
                "value": total_runs,
                "color": colors[i % len(colors)],
                "player_image": player_image
            })
        
        return {
            "chart_type": "bar",
            "title": f"Top {limit} Batsmen Runs - Season {season}",
            "season": season,
            "data": bar_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/season/{season}/bowler-wickets-bar")
async def get_season_bowler_wickets_bar_chart(season: int, limit: int = 15):
    """Get bar chart data for top bowlers wickets in a specific season"""
    try:
        # Get top bowlers for the season
        bowler_query = """
        SELECT 
            bowler,
            SUM(CASE WHEN is_wicket = 1 THEN 1 ELSE 0 END) as total_wickets
        FROM ball_by_ball 
        WHERE season_id = ?
        GROUP BY bowler
        HAVING total_wickets > 0
        ORDER BY total_wickets DESC
        LIMIT ?
        """
        bowler_wickets = execute_query(bowler_query, (season, limit))
        
        if bowler_wickets.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        bar_data = []
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2']
        
        for i, (_, bowler) in enumerate(bowler_wickets.iterrows()):
            bowler_name = str(bowler['bowler'])
            total_wickets = int(bowler['total_wickets'])
            
            # Get player info
            player_info_query = """
            SELECT player_image
            FROM players 
            WHERE player_name = ?
            """
            player_info = execute_query(player_info_query, (bowler_name,))
            player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
            
            bar_data.append({
                "label": bowler_name,
                "value": total_wickets,
                "color": colors[i % len(colors)],
                "player_image": player_image
            })
        
        return {
            "chart_type": "bar",
            "title": f"Top {limit} Bowlers Wickets - Season {season}",
            "season": season,
            "data": bar_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/season/{season}/team-performance-pie")
async def get_season_team_performance_pie_chart(season: int):
    """Get pie chart data for team performance in a specific season"""
    try:
        # Get season match data
        season_match_query = """
        SELECT team1, team2, match_winner
        FROM matches 
        WHERE season = ? OR season_id = ?
        """
        season_match_data = execute_query(season_match_query, (season, season))
        
        if season_match_data.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        # Calculate wins for each team
        team_wins = {}
        teams_in_season = set(season_match_data['team1'].tolist() + season_match_data['team2'].tolist())
        
        for team in teams_in_season:
            team_matches = season_match_data[(season_match_data['team1'] == team) | (season_match_data['team2'] == team)]
            wins = len(team_matches[team_matches['match_winner'] == team])
            team_wins[team] = wins
        
        # Sort by wins and get top teams
        sorted_teams = sorted(team_wins.items(), key=lambda x: x[1], reverse=True)
        
        pie_data = []
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2']
        
        for i, (team_name, wins) in enumerate(sorted_teams):
            # Get team info
            team_info_query = """
            SELECT team_name_short, image_url
            FROM teams 
            WHERE team_name = ?
            """
            team_info = execute_query(team_info_query, (team_name,))
            if not team_info.empty:
                pie_data.append({
                    "label": str(team_info.iloc[0]['team_name_short']),
                    "value": wins,
                    "team_name": team_name,
                    "color": colors[i % len(colors)],
                    "image_url": str(team_info.iloc[0]['image_url']) if pd.notna(team_info.iloc[0]['image_url']) else ""
                })
        
        return {
            "chart_type": "pie",
            "title": f"Team Wins Distribution - Season {season}",
            "season": season,
            "data": pie_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/charts/season/{season}/runs-distribution-pie")
async def get_season_runs_distribution_pie_chart(season: int):
    """Get pie chart data for runs distribution (0,1,2,3,4,6) in a specific season"""
    try:
        # Get runs distribution for the season
        runs_query = """
        SELECT 
            batter_runs,
            COUNT(*) as count
        FROM ball_by_ball 
        WHERE season_id = ?
        GROUP BY batter_runs
        ORDER BY batter_runs
        """
        runs_data = execute_query(runs_query, (season,))
        
        if runs_data.empty:
            raise HTTPException(status_code=404, detail="Season not found")
        
        # Convert to dictionary
        runs_distribution = {int(row['batter_runs']): int(row['count']) for _, row in runs_data.iterrows()}
        
        pie_data = []
        colors = {
            0: '#E8E8E8',  # Gray for dots
            1: '#FF6B6B',  # Red for singles
            2: '#4ECDC4',  # Teal for doubles
            3: '#45B7D1',  # Blue for triples
            4: '#96CEB4',  # Green for fours
            6: '#FFEAA7'   # Yellow for sixes
        }
        
        labels = {
            0: 'Dots (0)',
            1: 'Singles (1)',
            2: 'Doubles (2)',
            3: 'Triples (3)',
            4: 'Fours (4)',
            6: 'Sixes (6)'
        }
        
        for runs, count in runs_distribution.items():
            if runs in [0, 1, 2, 3, 4, 6]:  # Only include standard runs
                pie_data.append({
                    "label": labels[runs],
                    "value": count,
                    "runs": runs,
                    "color": colors[runs]
                })
        
        # Sort by runs value
        pie_data.sort(key=lambda x: x['runs'])
        
        return {
            "chart_type": "pie",
            "title": f"Runs Distribution - Season {season}",
            "season": season,
            "data": pie_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ================================
# MATCH SCORECARD ENDPOINTS
# ================================

@app.get("/matches/{match_id}/scorecard")
async def get_match_scorecard(match_id: int):
    """Get complete match scorecard with detailed statistics"""
    try:
        # Get match info
        match_query = """
        SELECT team1, team2, match_winner, venue, match_date, toss_winner, 
               toss_decision, player_of_match, win_by_runs, win_by_wickets, 
               result, stage
        FROM matches 
        WHERE match_id = ?
        """
        match_info = execute_query(match_query, (match_id,))
        if match_info.empty:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match_data = match_info.iloc[0]
        
        # Get ball-by-ball data for the match
        ball_query = """
        SELECT innings, team_batting, team_bowling, batter, bowler, 
               batter_runs, extras, total_runs, is_wicket, over_number
        FROM ball_by_ball 
        WHERE match_id = ?
        ORDER BY innings, over_number
        """
        match_balls = execute_query(ball_query, (match_id,))
        if match_balls.empty:
            raise HTTPException(status_code=404, detail="Ball-by-ball data not found")
    
        # Match basic info
        match_info_response = {
            "match_id": match_id,
            "team1": str(match_data['team1']) if pd.notna(match_data['team1']) else "",
            "team2": str(match_data['team2']) if pd.notna(match_data['team2']) else "",
            "match_winner": str(match_data['match_winner']) if pd.notna(match_data['match_winner']) else None,
            "venue": str(match_data['venue']) if pd.notna(match_data['venue']) else "",
            "match_date": str(match_data['match_date']) if pd.notna(match_data['match_date']) else "",
            "toss_winner": str(match_data['toss_winner']) if pd.notna(match_data['toss_winner']) else "",
            "toss_decision": str(match_data['toss_decision']) if pd.notna(match_data['toss_decision']) else "",
            "player_of_match": str(match_data['player_of_match']) if pd.notna(match_data['player_of_match']) else "",
            "win_by_runs": int(match_data['win_by_runs']) if pd.notna(match_data['win_by_runs']) else 0,
            "win_by_wickets": int(match_data['win_by_wickets']) if pd.notna(match_data['win_by_wickets']) else 0,
            "result": str(match_data['result']) if pd.notna(match_data['result']) else "",
            "stage": str(match_data['stage']) if pd.notna(match_data['stage']) else ""
        }
    
        # Analyze by innings
        innings_scorecards = []
        for innings in sorted(match_balls['innings'].unique()):
            innings_data = match_balls[match_balls['innings'] == innings]
            
            # Team batting in this innings
            batting_team = str(innings_data['team_batting'].iloc[0]) if not innings_data.empty else ""
            bowling_team = str(innings_data['team_bowling'].iloc[0]) if not innings_data.empty else ""
            
            # Calculate team totals
            total_runs = int(innings_data['batter_runs'].sum()) if pd.notna(innings_data['batter_runs'].sum()) else 0
            extras = int(innings_data['extras'].sum()) if pd.notna(innings_data['extras'].sum()) else 0
            total_score = int(innings_data['total_runs'].sum()) if pd.notna(innings_data['total_runs'].sum()) else 0
            wickets_fallen = len(innings_data[innings_data['is_wicket'] == 1])
            total_overs = int(innings_data['over_number'].max()) if pd.notna(innings_data['over_number'].max()) else 0
            
            # Calculate boundaries
            fours = len(innings_data[innings_data['batter_runs'] == 4])
            sixes = len(innings_data[innings_data['batter_runs'] == 6])
            
            # Batsman scorecard
            batsman_scorecard = []
            batsman_stats = innings_data.groupby('batter').agg({
                'batter_runs': ['sum', 'count'],
                'is_wicket': 'sum'
            }).reset_index()
            
            for _, batsman in batsman_stats.iterrows():
                player_name = str(batsman['batter'])
                runs = int(batsman[('batter_runs', 'sum')]) if pd.notna(batsman[('batter_runs', 'sum')]) else 0
                balls = int(batsman[('batter_runs', 'count')]) if pd.notna(batsman[('batter_runs', 'count')]) else 0
                dismissed = int(batsman[('is_wicket', 'sum')]) > 0
                
                # Get player info
                player_info_query = """
                SELECT player_id, player_image
                FROM players 
                WHERE player_name = ?
                """
                player_info = execute_query(player_info_query, (player_name,))
                player_id = int(player_info.iloc[0]['player_id']) if not player_info.empty else None
                player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
                
                # Calculate boundaries for this batsman
                batsman_data = innings_data[innings_data['batter'] == player_name]
                batsman_fours = len(batsman_data[batsman_data['batter_runs'] == 4])
                batsman_sixes = len(batsman_data[batsman_data['batter_runs'] == 6])
                
                # Calculate strike rate
                strike_rate = round((runs / balls * 100) if balls > 0 else 0, 2)
                
                batsman_scorecard.append({
                    "player_id": player_id,
                    "player_name": player_name,
                    "player_image": player_image,
                    "runs": runs,
                    "balls": balls,
                    "fours": batsman_fours,
                    "sixes": batsman_sixes,
                    "strike_rate": strike_rate,
                    "dismissed": bool(dismissed),
                    "not_out": not bool(dismissed)
                })
            
            # Sort batsmen by runs
            batsman_scorecard.sort(key=lambda x: x['runs'], reverse=True)
            
            # Bowler scorecard
            bowler_scorecard = []
            bowler_stats = innings_data.groupby('bowler').agg({
                'is_wicket': 'sum',
                'total_runs': 'sum',
                'over_number': 'max'
            }).reset_index()
            
            for _, bowler in bowler_stats.iterrows():
                bowler_name = str(bowler['bowler'])
                wickets = int(bowler['is_wicket']) if pd.notna(bowler['is_wicket']) else 0
                runs_conceded = int(bowler['total_runs']) if pd.notna(bowler['total_runs']) else 0
                overs_bowled = int(bowler['over_number']) if pd.notna(bowler['over_number']) else 0
                
                # Get player info
                player_info_query = """
                SELECT player_id, player_image
                FROM players 
                WHERE player_name = ?
                """
                player_info = execute_query(player_info_query, (bowler_name,))
                player_id = int(player_info.iloc[0]['player_id']) if not player_info.empty else None
                player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
                
                # Calculate economy
                economy = round((runs_conceded / overs_bowled) if overs_bowled > 0 else 0, 2)
                
                bowler_scorecard.append({
                    "player_id": player_id,
                    "player_name": bowler_name,
                    "player_image": player_image,
                    "overs": overs_bowled,
                    "maidens": 0,  # Can be calculated if needed
                    "runs_conceded": runs_conceded,
                    "wickets": wickets,
                    "economy": economy
                })
            
            # Sort bowlers by wickets
            bowler_scorecard.sort(key=lambda x: x['wickets'], reverse=True)
            
            # Over-by-over summary
            over_summary = []
            for over in sorted(innings_data['over_number'].unique()):
                over_data = innings_data[innings_data['over_number'] == over]
                over_runs = int(over_data['total_runs'].sum()) if pd.notna(over_data['total_runs'].sum()) else 0
                over_wickets = len(over_data[over_data['is_wicket'] == 1])
                
                over_summary.append({
                    "over": int(over),
                    "runs": over_runs,
                    "wickets": over_wickets
                })
            
            innings_scorecards.append({
                "innings": int(innings),
                "batting_team": batting_team,
                "bowling_team": bowling_team,
                "total_runs": total_runs,
                "extras": extras,
                "total_score": total_score,
                "wickets_fallen": wickets_fallen,
                "total_overs": total_overs,
                "fours": fours,
                "sixes": sixes,
                "run_rate": round(total_score / total_overs if total_overs > 0 else 0, 2),
                "batsman_scorecard": batsman_scorecard,
                "bowler_scorecard": bowler_scorecard,
                "over_summary": over_summary
            })
        
        return {
            "match_info": match_info_response,
            "innings_scorecards": innings_scorecards
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/matches/{match_id}/scorecard/simple")
async def get_match_scorecard_simple(match_id: int):
    """Get simplified match scorecard"""
    try:
        # Get match info
        match_query = """
        SELECT team1, team2, match_winner, venue, match_date
        FROM matches 
        WHERE match_id = ?
        """
        match_info = execute_query(match_query, (match_id,))
        if match_info.empty:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match_data = match_info.iloc[0]
        
        # Get ball-by-ball data for the match
        ball_query = """
        SELECT innings, team_batting, total_runs, is_wicket, over_number
        FROM ball_by_ball 
        WHERE match_id = ?
        ORDER BY innings, over_number
        """
        match_balls = execute_query(ball_query, (match_id,))
        if match_balls.empty:
            raise HTTPException(status_code=404, detail="Ball-by-ball data not found")
        
        # Simple scorecard
        simple_scorecard = []
        for innings in sorted(match_balls['innings'].unique()):
            innings_data = match_balls[match_balls['innings'] == innings]
            
            batting_team = str(innings_data['team_batting'].iloc[0]) if not innings_data.empty else ""
            total_runs = int(innings_data['total_runs'].sum()) if pd.notna(innings_data['total_runs'].sum()) else 0
            wickets_fallen = len(innings_data[innings_data['is_wicket'] == 1])
            total_overs = int(innings_data['over_number'].max()) if pd.notna(innings_data['over_number'].max()) else 0
            
            simple_scorecard.append({
                "innings": int(innings),
                "batting_team": batting_team,
                "runs": total_runs,
                "wickets": wickets_fallen,
                "overs": total_overs,
                "run_rate": round(total_runs / total_overs if total_overs > 0 else 0, 2)
            })
        
        return {
            "match_id": match_id,
            "team1": str(match_data['team1']) if pd.notna(match_data['team1']) else "",
            "team2": str(match_data['team2']) if pd.notna(match_data['team2']) else "",
            "match_winner": str(match_data['match_winner']) if pd.notna(match_data['match_winner']) else None,
            "venue": str(match_data['venue']) if pd.notna(match_data['venue']) else "",
            "match_date": str(match_data['match_date']) if pd.notna(match_data['match_date']) else "",
            "scorecard": simple_scorecard
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/matches/{match_id}/live-score")
async def get_match_live_score(match_id: int):
    """Get live score simulation for a match with ball-by-ball over view"""
    try:
        # Get match info
        match_query = """
        SELECT team1, team2
        FROM matches 
        WHERE match_id = ?
        """
        match_info = execute_query(match_query, (match_id,))
        if match_info.empty:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match_data = match_info.iloc[0]
        
        # Get ball-by-ball data for the match
        ball_query = """
        SELECT innings, team_batting, team_bowling, batter, bowler, 
               total_runs, is_wicket, is_wide_ball, is_no_ball, 
               over_number, ball_number
        FROM ball_by_ball 
        WHERE match_id = ?
        ORDER BY innings, over_number, ball_number
        """
        match_balls = execute_query(ball_query, (match_id,))
        if match_balls.empty:
            raise HTTPException(status_code=404, detail="Ball-by-ball data not found")
    
        # Current innings (assuming last innings is current)
        current_innings = int(match_balls['innings'].max()) if pd.notna(match_balls['innings'].max()) else 1
        current_innings_data = match_balls[match_balls['innings'] == current_innings]
        
        # Current over (assuming last over is current)
        current_over = int(current_innings_data['over_number'].max()) if pd.notna(current_innings_data['over_number'].max()) else 0
        current_over_data = current_innings_data[current_innings_data['over_number'] == current_over]
        
        # Current ball (assuming last ball is current)
        current_ball = int(current_over_data['ball_number'].max()) if pd.notna(current_over_data['ball_number'].max()) else 0
        
        # Calculate current score
        current_runs = int(current_innings_data['total_runs'].sum()) if pd.notna(current_innings_data['total_runs'].sum()) else 0
        current_wickets = len(current_innings_data[current_innings_data['is_wicket'] == 1])
        current_overs = current_over + (current_ball / 6) if current_ball < 6 else current_over + 1
        
        # Current batsmen (last two batsmen who faced balls)
        current_batsmen = current_innings_data['batter'].tail(2).tolist()
        
        # Current bowler (last bowler who bowled)
        current_bowler = str(current_innings_data['bowler'].iloc[-1]) if not current_innings_data.empty else ""
        
        # Current over ball-by-ball breakdown
        current_over_balls = []
        if not current_over_data.empty:
            for _, ball in current_over_data.iterrows():
                ball_runs = int(ball['total_runs']) if pd.notna(ball['total_runs']) else 0
                is_wicket = bool(ball['is_wicket'])
                is_wide = bool(ball['is_wide_ball'])
                is_no_ball = bool(ball['is_no_ball'])
                
                # Create ball symbol
                if is_wicket:
                    ball_symbol = "W"
                elif is_wide:
                    ball_symbol = "Wd"
                elif is_no_ball:
                    ball_symbol = "Nb"
                elif ball_runs == 0:
                    ball_symbol = "*"
                elif ball_runs == 1:
                    ball_symbol = "1"
                elif ball_runs == 2:
                    ball_symbol = "2"
                elif ball_runs == 3:
                    ball_symbol = "3"
                elif ball_runs == 4:
                    ball_symbol = "4"
                elif ball_runs == 6:
                    ball_symbol = "6"
                else:
                    ball_symbol = str(ball_runs)
                
                current_over_balls.append({
                    "ball_number": int(ball['ball_number']) if pd.notna(ball['ball_number']) else 0,
                    "runs": ball_runs,
                    "symbol": ball_symbol,
                    "is_wicket": bool(is_wicket),
                    "is_wide": bool(is_wide),
                    "is_no_ball": bool(is_no_ball),
                    "batsman": str(ball['batter']).split('\n')[0].strip(),
                    "bowler": str(ball['bowler']).split('\n')[0].strip()
                })
        
        # Recent overs summary (last 3 overs)
        recent_overs = []
        recent_overs_data = current_innings_data[current_innings_data['over_number'] >= max(1, current_over - 2)]
        
        for over_num in sorted(recent_overs_data['over_number'].unique()):
            over_data = recent_overs_data[recent_overs_data['over_number'] == over_num]
            over_runs = int(over_data['total_runs'].sum()) if pd.notna(over_data['total_runs'].sum()) else 0
            over_wickets = len(over_data[over_data['is_wicket'] == 1])
            
            # Create over summary string
            over_summary = ""
            for _, ball in over_data.iterrows():
                ball_runs = int(ball['total_runs']) if pd.notna(ball['total_runs']) else 0
                is_wicket = bool(ball['is_wicket'])
                is_wide = bool(ball['is_wide_ball'])
                is_no_ball = bool(ball['is_no_ball'])
                
                if is_wicket:
                    over_summary += "W"
                elif is_wide:
                    over_summary += "Wd"
                elif is_no_ball:
                    over_summary += "Nb"
                elif ball_runs == 0:
                    over_summary += "*"
                elif ball_runs == 1:
                    over_summary += "1"
                elif ball_runs == 2:
                    over_summary += "2"
                elif ball_runs == 3:
                    over_summary += "3"
                elif ball_runs == 4:
                    over_summary += "4"
                elif ball_runs == 6:
                    over_summary += "6"
                else:
                    over_summary += str(ball_runs)
            
            recent_overs.append({
                "over": int(over_num),
                "runs": over_runs,
                "wickets": over_wickets,
                "summary": over_summary,
                "is_current": bool(over_num == current_over)
            })
        
        return {
            "match_id": match_id,
            "team1": str(match_data['team1']) if pd.notna(match_data['team1']) else "",
            "team2": str(match_data['team2']) if pd.notna(match_data['team2']) else "",
            "current_innings": current_innings,
            "batting_team": str(current_innings_data['team_batting'].iloc[0]) if not current_innings_data.empty else "",
            "bowling_team": str(current_innings_data['team_bowling'].iloc[0]) if not current_innings_data.empty else "",
            "current_score": current_runs,
            "current_wickets": current_wickets,
            "current_overs": round(current_overs, 1),
            "current_run_rate": round(current_runs / current_overs if current_overs > 0 else 0, 2),
            "current_batsmen": [str(name).split('\n')[0].strip() for name in current_batsmen],
            "current_bowler": str(current_bowler).split('\n')[0].strip() if current_bowler else "",
            "current_over": current_over,
            "current_ball": current_ball,
            "current_over_balls": current_over_balls,
            "recent_overs": recent_overs,
            "last_ball_runs": int(current_over_data['total_runs'].iloc[-1]) if not current_over_data.empty and pd.notna(current_over_data['total_runs'].iloc[-1]) else 0,
            "last_ball_wicket": bool(current_over_data['is_wicket'].iloc[-1]) if not current_over_data.empty else False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/matches/{match_id}/scorecard/complete")
async def get_complete_match_scorecard(match_id: int):
    """Get complete match scorecard with all details including fall of wickets"""
    try:
        # Get match info
        match_query = """
        SELECT team1, team2, match_winner, venue, match_date, toss_winner, 
               toss_decision, player_of_match, win_by_runs, win_by_wickets, 
               result, stage, city, event_name, match_type, format, overs
        FROM matches 
        WHERE match_id = ?
        """
        match_info = execute_query(match_query, (match_id,))
        if match_info.empty:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match_data = match_info.iloc[0]
        
        # Get ball-by-ball data for the match
        ball_query = """
        SELECT innings, team_batting, team_bowling, batter, bowler, 
               batter_runs, extras, total_runs, is_wicket, over_number, 
               ball_number, wicket_kind, player_out
        FROM ball_by_ball 
        WHERE match_id = ?
        ORDER BY innings, over_number, ball_number
        """
        match_balls = execute_query(ball_query, (match_id,))
        if match_balls.empty:
            raise HTTPException(status_code=404, detail="Ball-by-ball data not found")
    
        # Match basic info
        match_info_response = {
            "match_id": match_id,
            "team1": str(match_data['team1']) if pd.notna(match_data['team1']) else "",
            "team2": str(match_data['team2']) if pd.notna(match_data['team2']) else "",
            "match_winner": str(match_data['match_winner']) if pd.notna(match_data['match_winner']) else None,
            "venue": str(match_data['venue']) if pd.notna(match_data['venue']) else "",
            "match_date": str(match_data['match_date']) if pd.notna(match_data['match_date']) else "",
            "toss_winner": str(match_data['toss_winner']) if pd.notna(match_data['toss_winner']) else "",
            "toss_decision": str(match_data['toss_decision']) if pd.notna(match_data['toss_decision']) else "",
            "player_of_match": str(match_data['player_of_match']) if pd.notna(match_data['player_of_match']) else "",
            "win_by_runs": int(match_data['win_by_runs']) if pd.notna(match_data['win_by_runs']) else 0,
            "win_by_wickets": int(match_data['win_by_wickets']) if pd.notna(match_data['win_by_wickets']) else 0,
            "result": str(match_data['result']) if pd.notna(match_data['result']) else "",
            "stage": str(match_data['stage']) if pd.notna(match_data['stage']) else "",
            "city": str(match_data['city']) if pd.notna(match_data['city']) else "",
            "event_name": str(match_data['event_name']) if pd.notna(match_data['event_name']) else "",
            "match_type": str(match_data['match_type']) if pd.notna(match_data['match_type']) else "",
            "format": str(match_data['format']) if pd.notna(match_data['format']) else "",
            "overs": int(match_data['overs']) if pd.notna(match_data['overs']) else 20
        }
    
        # Analyze by innings
        innings_scorecards = []
        for innings in sorted(match_balls['innings'].unique()):
            innings_data = match_balls[match_balls['innings'] == innings]
            
            # Team batting in this innings
            batting_team = str(innings_data['team_batting'].iloc[0]) if not innings_data.empty else ""
            bowling_team = str(innings_data['team_bowling'].iloc[0]) if not innings_data.empty else ""
            
            # Calculate team totals
            total_runs = int(innings_data['batter_runs'].sum()) if pd.notna(innings_data['batter_runs'].sum()) else 0
            extras = int(innings_data['extras'].sum()) if pd.notna(innings_data['extras'].sum()) else 0
            total_score = int(innings_data['total_runs'].sum()) if pd.notna(innings_data['total_runs'].sum()) else 0
            wickets_fallen = len(innings_data[innings_data['is_wicket'] == 1])
            total_overs = int(innings_data['over_number'].max()) if pd.notna(innings_data['over_number'].max()) else 0
            
            # Calculate boundaries
            fours = len(innings_data[innings_data['batter_runs'] == 4])
            sixes = len(innings_data[innings_data['batter_runs'] == 6])
            
            # Fall of wickets
            fall_of_wickets = []
            cumulative_runs = 0
            for _, ball in innings_data.iterrows():
                cumulative_runs += int(ball['total_runs']) if pd.notna(ball['total_runs']) else 0
                if ball['is_wicket'] == 1:
                    # Clean player names
                    raw_batsman = str(ball['batter'])
                    clean_batsman = raw_batsman.split('\n')[0].strip() if '\n' in raw_batsman else raw_batsman.strip()
                    
                    raw_bowler = str(ball['bowler'])
                    clean_bowler = raw_bowler.split('\n')[0].strip() if '\n' in raw_bowler else raw_bowler.strip()
                    
                    fall_of_wickets.append({
                        "wicket_number": len(fall_of_wickets) + 1,
                        "batsman": clean_batsman,
                        "runs": cumulative_runs,
                        "over": f"{int(ball['over_number'])}.{int(ball['ball_number'])}",
                        "wicket_kind": str(ball['wicket_kind']) if pd.notna(ball['wicket_kind']) else "Unknown",
                        "bowler": clean_bowler
                    })
            
            # Batsman scorecard with detailed stats
            batsman_scorecard = []
            batsman_stats = innings_data.groupby('batter').agg({
                'batter_runs': ['sum', 'count'],
                'is_wicket': 'sum'
            }).reset_index()
            
            for _, batsman in batsman_stats.iterrows():
                # Clean player name - remove extra pandas data
                raw_player_name = str(batsman['batter'])
                player_name = raw_player_name.split('\n')[0].strip() if '\n' in raw_player_name else raw_player_name.strip()
                
                runs = int(batsman[('batter_runs', 'sum')]) if pd.notna(batsman[('batter_runs', 'sum')]) else 0
                balls = int(batsman[('batter_runs', 'count')]) if pd.notna(batsman[('batter_runs', 'count')]) else 0
                dismissed = bool(int(batsman[('is_wicket', 'sum')]) > 0)
                
                # Get player info
                player_info_query = """
                SELECT player_id, player_image, bat_style
                FROM players 
                WHERE player_name = ?
                """
                player_info = execute_query(player_info_query, (player_name,))
                player_id = int(player_info.iloc[0]['player_id']) if not player_info.empty else None
                player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
                bat_style = str(player_info.iloc[0]['bat_style']) if not player_info.empty and pd.notna(player_info.iloc[0]['bat_style']) else ""
                
                # Calculate boundaries for this batsman
                batsman_data = innings_data[innings_data['batter'] == player_name]
                batsman_fours = len(batsman_data[batsman_data['batter_runs'] == 4])
                batsman_sixes = len(batsman_data[batsman_data['batter_runs'] == 6])
                
                # Calculate strike rate
                strike_rate = round((runs / balls * 100) if balls > 0 else 0, 2)
                
                # Calculate runs in different ranges
                runs_0_30 = len(batsman_data[(batsman_data['batter_runs'] >= 0) & (batsman_data['batter_runs'] <= 30)])
                runs_31_60 = len(batsman_data[(batsman_data['batter_runs'] >= 31) & (batsman_data['batter_runs'] <= 60)])
                runs_61_90 = len(batsman_data[(batsman_data['batter_runs'] >= 61) & (batsman_data['batter_runs'] <= 90)])
                runs_91_plus = len(batsman_data[batsman_data['batter_runs'] >= 91])
                
                batsman_scorecard.append({
                    "player_id": player_id,
                    "player_name": player_name,
                    "player_image": player_image,
                    "bat_style": bat_style,
                    "runs": runs,
                    "balls": balls,
                    "fours": batsman_fours,
                    "sixes": batsman_sixes,
                    "strike_rate": strike_rate,
                    "dismissed": dismissed,
                    "not_out": not dismissed,
                    "runs_distribution": {
                        "0-30": runs_0_30,
                        "31-60": runs_31_60,
                        "61-90": runs_61_90,
                        "91+": runs_91_plus
                    }
                })
            
            # Sort batsmen by runs
            batsman_scorecard.sort(key=lambda x: x['runs'], reverse=True)
            
            # Bowler scorecard with detailed stats
            bowler_scorecard = []
            bowler_stats = innings_data.groupby('bowler').agg({
                'is_wicket': 'sum',
                'total_runs': 'sum',
                'over_number': 'max'
            }).reset_index()
            
            for _, bowler in bowler_stats.iterrows():
                # Clean bowler name - remove extra pandas data
                raw_bowler_name = str(bowler['bowler'])
                bowler_name = raw_bowler_name.split('\n')[0].strip() if '\n' in raw_bowler_name else raw_bowler_name.strip()
                
                wickets = int(bowler['is_wicket']) if pd.notna(bowler['is_wicket']) else 0
                runs_conceded = int(bowler['total_runs']) if pd.notna(bowler['total_runs']) else 0
                overs_bowled = int(bowler['over_number']) if pd.notna(bowler['over_number']) else 0
                
                # Get player info
                player_info_query = """
                SELECT player_id, player_image, bowl_style
                FROM players 
                WHERE player_name = ?
                """
                player_info = execute_query(player_info_query, (bowler_name,))
                player_id = int(player_info.iloc[0]['player_id']) if not player_info.empty else None
                player_image = str(player_info.iloc[0]['player_image']) if not player_info.empty and pd.notna(player_info.iloc[0]['player_image']) else ""
                bowl_style = str(player_info.iloc[0]['bowl_style']) if not player_info.empty and pd.notna(player_info.iloc[0]['bowl_style']) else ""
                
                # Calculate economy and average
                economy = round((runs_conceded / overs_bowled) if overs_bowled > 0 else 0, 2)
                bowling_average = round((runs_conceded / wickets) if wickets > 0 else 0, 2)
                
                # Calculate maidens (overs with 0 runs)
                bowler_data = innings_data[innings_data['bowler'] == bowler_name]
                maidens = 0
                for over in bowler_data['over_number'].unique():
                    over_data = bowler_data[bowler_data['over_number'] == over]
                    if over_data['total_runs'].sum() == 0:
                        maidens += 1
                
                bowler_scorecard.append({
                    "player_id": player_id,
                    "player_name": bowler_name,
                    "player_image": player_image,
                    "bowl_style": bowl_style,
                    "overs": overs_bowled,
                    "maidens": maidens,
                    "runs_conceded": runs_conceded,
                    "wickets": wickets,
                    "economy": economy,
                    "bowling_average": bowling_average,
                    "wides": 0,  # Can be calculated if needed
                    "no_balls": 0,  # Can be calculated if needed
                    "best_figures": f"{wickets}/{runs_conceded}" if overs_bowled > 0 else "0/0"
                })
            
            # Sort bowlers by wickets
            bowler_scorecard.sort(key=lambda x: x['wickets'], reverse=True)
            
            # Over-by-over detailed summary
            over_summary = []
            for over in sorted(innings_data['over_number'].unique()):
                over_data = innings_data[innings_data['over_number'] == over]
                over_runs = int(over_data['total_runs'].sum()) if pd.notna(over_data['total_runs'].sum()) else 0
                over_wickets = len(over_data[over_data['is_wicket'] == 1])
                over_extras = int(over_data['extras'].sum()) if pd.notna(over_data['extras'].sum()) else 0
                over_fours = len(over_data[over_data['batter_runs'] == 4])
                over_sixes = len(over_data[over_data['batter_runs'] == 6])
                
                # Get bowler for this over and clean name
                raw_over_bowler = over_data['bowler'].iloc[0] if not over_data.empty else ""
                clean_over_bowler = str(raw_over_bowler).split('\n')[0].strip() if '\n' in str(raw_over_bowler) else str(raw_over_bowler).strip()
                
                over_summary.append({
                    "over": int(over),
                    "runs": over_runs,
                    "wickets": over_wickets,
                    "extras": over_extras,
                    "fours": over_fours,
                    "sixes": over_sixes,
                    "bowler": clean_over_bowler,
                    "run_rate": round(over_runs, 1)
                })
            
            innings_scorecards.append({
                "innings": int(innings),
                "batting_team": batting_team,
                "bowling_team": bowling_team,
                "total_runs": total_runs,
                "extras": extras,
                "total_score": total_score,
                "wickets_fallen": wickets_fallen,
                "total_overs": total_overs,
                "fours": fours,
                "sixes": sixes,
                "run_rate": round(total_score / total_overs if total_overs > 0 else 0, 2),
                "fall_of_wickets": fall_of_wickets,
                "batsman_scorecard": batsman_scorecard,
                "bowler_scorecard": bowler_scorecard,
                "over_summary": over_summary
            })
        
        return {
            "match_info": match_info_response,
            "innings_scorecards": innings_scorecards,
            "match_summary": {
                "total_overs": match_info_response['overs'],
                "match_type": match_info_response['match_type'],
                "format": match_info_response['format'],
                "venue_city": f"{match_info_response['venue']}, {match_info_response['city']}"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ============================================================
# MACHINE LEARNING FEATURES - Direct Integration
# ============================================================

# ML Health Check
@app.get("/ml/health")
async def ml_health_check():
    """ML Services Health Check"""
    return {
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

# ML Match Prediction  
from pydantic import BaseModel

class MatchPredictionRequest(BaseModel):
    team1_id: int
    team2_id: int
    venue: str
    toss_winner: Optional[int] = None
    toss_decision: Optional[str] = None
    season: int = 2024

@app.post("/ml/predict/match")
async def predict_match_outcome(request: MatchPredictionRequest):
    """
    Predict match outcome using historical data
    """
    try:
        team1_id = request.team1_id
        team2_id = request.team2_id
        venue = request.venue
        # Get team names
        team1_query = "SELECT team_name FROM teams WHERE team_id = ?"
        team2_query = "SELECT team_name FROM teams WHERE team_id = ?"
        
        team1_df = execute_query(team1_query, [team1_id])
        team2_df = execute_query(team2_query, [team2_id])
        
        if len(team1_df) == 0 or len(team2_df) == 0:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team1_name = team1_df.iloc[0]['team_name']
        team2_name = team2_df.iloc[0]['team_name']
        
        # Simple prediction based on historical win rates
        query = """
        SELECT 
            SUM(CASE WHEN match_winner = ? THEN 1 ELSE 0 END) * 1.0 / COUNT(*) as team1_win_rate,
            SUM(CASE WHEN match_winner = ? THEN 1 ELSE 0 END) * 1.0 / COUNT(*) as team2_win_rate
        FROM matches
        WHERE (team1 = ? OR team2 = ?) 
        OR (team1 = ? OR team2 = ?)
        """
        
        stats = execute_query(query, [team1_name, team2_name, team1_name, team1_name, team2_name, team2_name])
        
        team1_rate = float(stats.iloc[0]['team1_win_rate']) if stats.iloc[0]['team1_win_rate'] else 0.5
        team2_rate = float(stats.iloc[0]['team2_win_rate']) if stats.iloc[0]['team2_win_rate'] else 0.5
        
        # Normalize probabilities
        total = team1_rate + team2_rate
        if total > 0:
            team1_prob = team1_rate / total
            team2_prob = team2_rate / total
        else:
            team1_prob = team2_prob = 0.5
        
        predicted_winner = team1_name if team1_prob > team2_prob else team2_name
        confidence = abs(team1_prob - team2_prob)
        
        return {
            "team1_name": team1_name,
            "team2_name": team2_name,
            "predicted_winner": predicted_winner,
            "team1_win_probability": round(team1_prob, 3),
            "team2_win_probability": round(team2_prob, 3),
            "confidence_score": round(confidence, 3),
            "key_factors": {
                "team1_historical_rate": round(team1_rate, 3),
                "team2_historical_rate": round(team2_rate, 3),
                "venue": venue
            },
            "venue": venue,
            "model_version": "1.0-simple"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# ML Player Forecast
@app.get("/ml/forecast/player/{player_id}")
async def forecast_player_performance(player_id: int):
    """
    Forecast player performance for next season
    """
    try:
        # Get player info
        player_query = "SELECT * FROM players WHERE player_id = ?"
        player_df = execute_query(player_query, [player_id])
        
        if len(player_df) == 0:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player = player_df.iloc[0]
        
        # Get batting stats
        batting_query = """
        SELECT 
            season_id,
            SUM(batter_runs) as runs,
            COUNT(*) as balls
        FROM ball_by_ball
        WHERE batter = (SELECT player_name FROM players WHERE player_id = ?)
        GROUP BY season_id
        ORDER BY season_id DESC
        LIMIT 3
        """
        
        batting_history = execute_query(batting_query, [player_id])
        
        if len(batting_history) > 0:
            avg_runs = int(batting_history['runs'].mean())
            avg_balls = int(batting_history['balls'].mean())
            strike_rate = (avg_runs / avg_balls * 100) if avg_balls > 0 else 0
            
            # Simple trend
            if len(batting_history) >= 2:
                recent_runs = batting_history.iloc[0]['runs']
                prev_runs = batting_history.iloc[1]['runs']
                trend = "improving" if recent_runs > prev_runs else "declining" if recent_runs < prev_runs else "stable"
            else:
                trend = "stable"
            
            forecast = {
                "player_id": int(player_id),
                "player_name": player['player_name'],
                "player_full_name": player.get('player_full_name', player['player_name']),
                "batting_forecast": {
                    "predicted_runs": avg_runs,
                    "predicted_strike_rate": round(strike_rate, 2),
                    "trend": trend,
                    "confidence_interval": {
                        "min": int(avg_runs * 0.85),
                        "max": int(avg_runs * 1.15),
                        "avg": avg_runs
                    },
                    "current_season_stats": {
                        "runs": int(batting_history.iloc[0]['runs']),
                        "balls": int(batting_history.iloc[0]['balls']),
                        "strike_rate": round((batting_history.iloc[0]['runs'] / batting_history.iloc[0]['balls'] * 100) if batting_history.iloc[0]['balls'] > 0 else 0, 2)
                    }
                },
                "bowling_forecast": None,
                "player_type": "batsman"
            }
            
            return forecast
        else:
            raise HTTPException(status_code=404, detail="Insufficient player data")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")

# ML Player Valuation
@app.get("/ml/valuation/player/{player_id}")
async def estimate_player_value(player_id: int):
    """
    Estimate player's IPL auction value
    """
    try:
        # Get player info
        player_query = "SELECT * FROM players WHERE player_id = ?"
        player_df = execute_query(player_query, [player_id])
        
        if len(player_df) == 0:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player = player_df.iloc[0]
        
        # Get recent performance
        stats_query = """
        SELECT 
            COUNT(DISTINCT match_id) as matches,
            SUM(batter_runs) as runs,
            COUNT(*) as balls
        FROM ball_by_ball
        WHERE batter = (SELECT player_name FROM players WHERE player_id = ?)
        AND season_id >= (SELECT MAX(season_id) - 2 FROM ball_by_ball)
        """
        
        stats = execute_query(stats_query, [player_id])
        
        if len(stats) > 0 and stats.iloc[0]['runs'] > 0:
            runs = int(stats.iloc[0]['runs'])
            matches = int(stats.iloc[0]['matches'])
            
            # Simple valuation formula
            base_value = runs / 100  # Base: 1 crore per 100 runs
            
            if runs > 1500:
                value = base_value * 1.5  # Star player
                category = "Star Batsman"
            elif runs > 800:
                value = base_value * 1.2  # Quality player
                category = "Quality Batsman"
            else:
                value = base_value  # Average player
                category = "Average Batsman"
            
            return {
                "player_id": int(player_id),
                "player_name": player['player_name'],
                "estimated_value_inr": round(value, 2),
                "estimated_value_range": {
                    "min": round(value * 0.8, 2),
                    "max": round(value * 1.2, 2),
                    "avg": round(value, 2)
                },
                "value_factors": {
                    "total_runs": runs,
                    "matches_played": matches,
                    "runs_per_match": round(runs / matches, 1) if matches > 0 else 0
                },
                "category": category,
                "market_trend": "Stable",
                "recommendation": "Good investment" if value > 5 else "Budget pick"
            }
        else:
            raise HTTPException(status_code=404, detail="Insufficient player data")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Valuation failed: {str(e)}")

print("\n" + "="*60)
print("[OK] ML Features loaded successfully!")
# Dream11 Team Optimizer
class Dream11Request(BaseModel):
    budget: float = 100.0
    players_per_team: int = 11
    captain_multiplier: float = 2.0
    vice_captain_multiplier: float = 1.5

@app.post("/ml/dream11/optimize")
async def optimize_dream11_team(request: Dream11Request):
    """
    Optimize Dream11 fantasy team based on player performance
    """
    try:
        # Get top performing players
        players_query = """
        SELECT 
            p.player_id,
            p.player_name,
            p.player_full_name,
            p.bat_style,
            p.bowl_style,
            p.field_pos,
            COUNT(DISTINCT b.match_id) as matches,
            SUM(b.batter_runs) as runs,
            COUNT(*) as balls,
            CASE WHEN COUNT(*) > 0 THEN (SUM(b.batter_runs) * 1.0 / COUNT(*)) ELSE 0 END as strike_rate
        FROM players p
        LEFT JOIN ball_by_ball b ON p.player_name = b.batter
        GROUP BY p.player_id, p.player_name, p.player_full_name, p.bat_style, p.bowl_style, p.field_pos
        HAVING matches >= 5
        ORDER BY runs DESC
        LIMIT 50
        """
        
        players_df = execute_query(players_query, [])
        
        if len(players_df) == 0:
            raise HTTPException(status_code=404, detail="No player data found")
        
        # Simple optimization logic
        selected_team = []
        total_points = 0
        remaining_budget = request.budget
        
        # Categorize players
        batsmen = players_df[
            (players_df['bat_style'].notna()) & 
            (players_df['bat_style'] != '') &
            (players_df['bowl_style'].isna() | (players_df['bowl_style'] == ''))
        ].head(5)
        
        bowlers = players_df[
            (players_df['bowl_style'].notna()) & 
            (players_df['bowl_style'] != '') &
            (players_df['bat_style'].isna() | (players_df['bat_style'] == ''))
        ].head(3)
        
        all_rounders = players_df[
            (players_df['bat_style'].notna()) & 
            (players_df['bat_style'] != '') &
            (players_df['bowl_style'].notna()) & 
            (players_df['bowl_style'] != '')
        ].head(2)
        
        wicket_keepers = players_df[
            players_df['field_pos'].str.contains('wicketkeeper', na=False)
        ].head(1)
        
        # Select top batsmen (5)
        for _, player in batsmen.iterrows():
            points = int(player['runs'] or 0) + (int(player['strike_rate'] or 0) * 0.1)
            cost = min(remaining_budget * 0.8 / len(batsmen), 10.0)
            
            selected_team.append({
                "player_id": int(player['player_id']),
                "player_name": player['player_name'],
                "player_full_name": player.get('player_full_name', player['player_name']),
                "batting_style": player.get('bat_style', ''),
                "bowling_style": player.get('bowl_style', ''),
                "player_type": "batsman",
                "points": points,
                "cost": round(cost, 2),
                "matches": int(player.get('matches', 0)),
                "runs": int(player.get('runs', 0)),
                "strike_rate": round(float(player.get('strike_rate', 0)), 2)
            })
            total_points += points
            remaining_budget -= cost
        
        # Select bowlers (3)
        for _, player in bowlers.iterrows():
            points = int(player['runs'] or 0) * 0.5 + 50  # Simplified bowling points
            cost = min(remaining_budget * 0.6 / len(bowlers), 8.0)
            
            selected_team.append({
                "player_id": int(player['player_id']),
                "player_name": player['player_name'],
                "player_full_name": player.get('player_full_name', player['player_name']),
                "batting_style": player.get('bat_style', ''),
                "bowling_style": player.get('bowl_style', ''),
                "player_type": "bowler",
                "points": points,
                "cost": round(cost, 2),
                "matches": int(player.get('matches', 0)),
                "runs": int(player.get('runs', 0)),
                "strike_rate": round(float(player.get('strike_rate', 0)), 2)
            })
            total_points += points
            remaining_budget -= cost
        
        # Select all-rounders (2)
        for _, player in all_rounders.iterrows():
            points = int(player['runs'] or 0) * 0.8 + 30
            cost = min(remaining_budget * 0.5 / len(all_rounders), 7.0)
            
            selected_team.append({
                "player_id": int(player['player_id']),
                "player_name": player['player_name'],
                "player_full_name": player.get('player_full_name', player['player_name']),
                "batting_style": player.get('bat_style', ''),
                "bowling_style": player.get('bowl_style', ''),
                "player_type": "allrounder",
                "points": points,
                "cost": round(cost, 2),
                "matches": int(player.get('matches', 0)),
                "runs": int(player.get('runs', 0)),
                "strike_rate": round(float(player.get('strike_rate', 0)), 2)
            })
            total_points += points
            remaining_budget -= cost
        
        # Select wicket-keeper (1)
        if len(wicket_keepers) > 0:
            player = wicket_keepers.iloc[0]
            points = int(player['runs'] or 0) + 20  # Bonus for keeper
            cost = min(remaining_budget, 6.0)
            
            selected_team.append({
                "player_id": int(player['player_id']),
                "player_name": player['player_name'],
                "player_full_name": player.get('player_full_name', player['player_name']),
                "batting_style": player.get('bat_style', ''),
                "bowling_style": player.get('bowl_style', ''),
                "player_type": "wicketkeeper",
                "points": points,
                "cost": round(cost, 2),
                "matches": int(player.get('matches', 0)),
                "runs": int(player.get('runs', 0)),
                "strike_rate": round(float(player.get('strike_rate', 0)), 2)
            })
            total_points += points
        
        # Assign captain and vice-captain
        if len(selected_team) >= 2:
            selected_team[0]['is_captain'] = True
            selected_team[0]['points'] *= request.captain_multiplier
            selected_team[1]['is_vice_captain'] = True
            selected_team[1]['points'] *= request.vice_captain_multiplier
        
        total_cost = sum(player['cost'] for player in selected_team)
        final_points = sum(player['points'] for player in selected_team)
        
        return {
            "team": selected_team,
            "summary": {
                "total_players": len(selected_team),
                "total_cost": round(total_cost, 2),
                "remaining_budget": round(request.budget - total_cost, 2),
                "estimated_points": round(final_points, 2),
                "captain": selected_team[0]['player_name'] if len(selected_team) > 0 else None,
                "vice_captain": selected_team[1]['player_name'] if len(selected_team) > 1 else None
            },
            "optimization_factors": {
                "form_based": True,
                "venue_consideration": False,
                "opposition_analysis": False,
                "model_version": "1.0-simple"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dream11 optimization failed: {str(e)}")

# Team Creation & Dream11 from Teams
class TeamCreationRequest(BaseModel):
    team1_name: str
    team2_name: str
    venue: str = "Neutral Venue"
    season: int = 2024

@app.post("/ml/create-teams")
async def create_two_teams(request: TeamCreationRequest):
    """
    Create two balanced teams with batsmen, bowlers, and all-rounders
    """
    try:
        # Get all players with their stats
        players_query = """
        SELECT 
            p.player_id,
            p.player_name,
            p.player_full_name,
            p.bat_style,
            p.bowl_style,
            p.field_pos,
            COUNT(DISTINCT b.match_id) as matches,
            SUM(b.batter_runs) as runs,
            COUNT(*) as balls,
            CASE WHEN COUNT(*) > 0 THEN (SUM(b.batter_runs) * 1.0 / COUNT(*)) ELSE 0 END as strike_rate
        FROM players p
        LEFT JOIN ball_by_ball b ON p.player_name = b.batter
        GROUP BY p.player_id, p.player_name, p.player_full_name, p.bat_style, p.bowl_style, p.field_pos
        HAVING matches >= 3
        ORDER BY runs DESC
        """
        
        players_df = execute_query(players_query, [])
        
        if len(players_df) == 0:
            raise HTTPException(status_code=404, detail="No player data found")
        
        # Categorize players
        batsmen = players_df[
            (players_df['bat_style'].notna()) & 
            (players_df['bat_style'] != '') &
            (players_df['bowl_style'].isna() | (players_df['bowl_style'] == ''))
        ].head(20)
        
        bowlers = players_df[
            (players_df['bowl_style'].notna()) & 
            (players_df['bowl_style'] != '') &
            (players_df['bat_style'].isna() | (players_df['bat_style'] == ''))
        ].head(15)
        
        all_rounders = players_df[
            (players_df['bat_style'].notna()) & 
            (players_df['bat_style'] != '') &
            (players_df['bowl_style'].notna()) & 
            (players_df['bowl_style'] != '')
        ].head(10)
        
        wicket_keepers = players_df[
            players_df['field_pos'].str.contains('wicketkeeper', na=False)
        ].head(5)
        
        # Create Team 1
        team1 = []
        team1.extend(batsmen.head(5).to_dict('records'))
        team1.extend(bowlers.head(3).to_dict('records'))
        team1.extend(all_rounders.head(2).to_dict('records'))
        if len(wicket_keepers) > 0:
            team1.append(wicket_keepers.iloc[0].to_dict())
        
        # Create Team 2
        team2 = []
        team2.extend(batsmen.iloc[5:10].to_dict('records'))
        team2.extend(bowlers.iloc[3:6].to_dict('records'))
        team2.extend(all_rounders.iloc[2:4].to_dict('records'))
        if len(wicket_keepers) > 1:
            team2.append(wicket_keepers.iloc[1].to_dict())
        
        # Format teams
        def format_team(team_data, team_name):
            formatted_team = []
            for player in team_data:
                formatted_team.append({
                    "player_id": int(player['player_id']),
                    "player_name": player['player_name'],
                    "player_full_name": player.get('player_full_name', player['player_name']),
                    "batting_style": player.get('bat_style', ''),
                    "bowling_style": player.get('bowl_style', ''),
                    "field_position": player.get('field_pos', ''),
                    "matches": int(player.get('matches', 0)),
                    "runs": int(player.get('runs', 0)),
                    "strike_rate": round(float(player.get('strike_rate', 0)), 2),
                    "player_type": "wicketkeeper" if "wicketkeeper" in str(player.get('field_pos', '')).lower() 
                                 else "allrounder" if player.get('bowl_style') and player.get('bat_style')
                                 else "bowler" if player.get('bowl_style')
                                 else "batsman"
                })
            return formatted_team
        
        team1_formatted = format_team(team1, request.team1_name)
        team2_formatted = format_team(team2, request.team2_name)
        
        return {
            "match_info": {
                "team1_name": request.team1_name,
                "team2_name": request.team2_name,
                "venue": request.venue,
                "season": request.season
            },
            "team1": team1_formatted,
            "team2": team2_formatted,
            "team_summary": {
                "team1_players": len(team1_formatted),
                "team2_players": len(team2_formatted),
                "total_players": len(team1_formatted) + len(team2_formatted)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Team creation failed: {str(e)}")

@app.post("/ml/dream11-from-teams")
async def create_dream11_from_teams(request: TeamCreationRequest):
    """
    Create Dream11 team from the two created teams
    """
    try:
        # First create the teams
        teams_response = await create_two_teams(request)
        
        # Combine all players from both teams
        all_players = teams_response["team1"] + teams_response["team2"]
        
        # Dream11 optimization logic
        dream11_team = []
        budget = 100.0
        
        # Select 1 Wicket Keeper
        keepers = [p for p in all_players if p["player_type"] == "wicketkeeper"]
        if keepers:
            keeper = keepers[0]
            keeper["cost"] = 8.0
            keeper["points"] = keeper["runs"] + 20  # Bonus for keeper
            keeper["is_captain"] = False
            keeper["is_vice_captain"] = False
            dream11_team.append(keeper)
            budget -= keeper["cost"]
        
        # Select 3-5 Batsmen
        batsmen = [p for p in all_players if p["player_type"] == "batsman"]
        batsmen_selected = batsmen[:5]  # Top 5 batsmen
        for i, batsman in enumerate(batsmen_selected):
            batsman["cost"] = 9.0 - (i * 0.5)  # Decreasing cost
            batsman["points"] = batsman["runs"] + (batsman["strike_rate"] * 0.1)
            batsman["is_captain"] = (i == 0)  # First batsman as captain
            batsman["is_vice_captain"] = (i == 1)  # Second batsman as vice-captain
            dream11_team.append(batsman)
            budget -= batsman["cost"]
        
        # Select 3-5 Bowlers
        bowlers = [p for p in all_players if p["player_type"] == "bowler"]
        bowlers_selected = bowlers[:3]  # Top 3 bowlers
        for i, bowler in enumerate(bowlers_selected):
            bowler["cost"] = 7.0 - (i * 0.5)
            bowler["points"] = bowler["runs"] * 0.3 + 50  # Bowling points
            bowler["is_captain"] = False
            bowler["is_vice_captain"] = False
            dream11_team.append(bowler)
            budget -= bowler["cost"]
        
        # Select 1-3 All-rounders
        all_rounders = [p for p in all_players if p["player_type"] == "allrounder"]
        all_rounders_selected = all_rounders[:2]  # Top 2 all-rounders
        for i, ar in enumerate(all_rounders_selected):
            ar["cost"] = 8.0 - (i * 0.5)
            ar["points"] = ar["runs"] * 0.8 + 30  # All-rounder bonus
            ar["is_captain"] = False
            ar["is_vice_captain"] = False
            dream11_team.append(ar)
            budget -= ar["cost"]
        
        # Apply captain and vice-captain multipliers
        captain = next((p for p in dream11_team if p.get("is_captain")), None)
        vice_captain = next((p for p in dream11_team if p.get("is_vice_captain")), None)
        
        if captain:
            captain["points"] *= 2.0
        if vice_captain:
            vice_captain["points"] *= 1.5
        
        total_cost = sum(p["cost"] for p in dream11_team)
        total_points = sum(p["points"] for p in dream11_team)
        
        return {
            "match_info": teams_response["match_info"],
            "original_teams": {
                "team1": teams_response["team1"],
                "team2": teams_response["team2"]
            },
            "dream11_team": dream11_team,
            "dream11_summary": {
                "total_players": len(dream11_team),
                "total_cost": round(total_cost, 2),
                "remaining_budget": round(100.0 - total_cost, 2),
                "estimated_points": round(total_points, 2),
                "captain": captain["player_name"] if captain else None,
                "vice_captain": vice_captain["player_name"] if vice_captain else None,
                "team_composition": {
                    "wicketkeepers": len([p for p in dream11_team if p["player_type"] == "wicketkeeper"]),
                    "batsmen": len([p for p in dream11_team if p["player_type"] == "batsman"]),
                    "bowlers": len([p for p in dream11_team if p["player_type"] == "bowler"]),
                    "allrounders": len([p for p in dream11_team if p["player_type"] == "allrounder"])
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dream11 creation failed: {str(e)}")

# Image Upload and Management
@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...), player_id: Optional[int] = Form(None)):
    """
    Upload and permanently save player/team images
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Create uploads directory if it doesn't exist
        upload_dir = "player_images"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as buffer:
            content = await file.read()
            await buffer.write(content)
        
        # If player_id is provided, update database
        if player_id:
            update_query = "UPDATE players SET player_image = ? WHERE player_id = ?"
            execute_query(update_query, [f"/player_images/{unique_filename}", player_id])
        
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "filename": unique_filename,
            "file_path": f"/player_images/{unique_filename}",
            "player_id": player_id,
            "upload_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/images/{filename}")
async def get_image(filename: str):
    """
    Serve uploaded images
    """
    try:
        file_path = os.path.join("player_images", filename)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        else:
            # Return default player image if not found
            default_path = os.path.join("player_images", "default_player.jpg")
            if os.path.exists(default_path):
                return FileResponse(default_path)
            else:
                raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving image: {str(e)}")

@app.get("/players/{player_id}/avatar")
async def get_player_avatar(player_id: int):
    """
    Get player avatar with fallback to generated avatar
    """
    try:
        # Get player info
        query = "SELECT player_name, player_image FROM players WHERE player_id = ?"
        result = execute_query(query, [player_id])
        
        if len(result) == 0:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player = result.iloc[0]
        player_name = player['player_name']
        player_image = player['player_image']
        
        # Check if image exists
        if player_image and player_image.strip():
            # Stored as "player_x.jpg" or "/player_images/player_x.jpg"
            filename = os.path.basename(player_image.strip())
            image_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(image_path):
                return FileResponse(image_path)
        
        # Generate avatar with initials if no image
        return generate_avatar_response(player_name, player_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def generate_avatar_response(player_name: str, player_id: int):
    """
    Generate SVG avatar with player initials
    """
    # Extract initials
    initials = ''.join([name[0].upper() for name in player_name.split()[:2]])
    if len(initials) == 0:
        initials = "P"
    elif len(initials) > 2:
        initials = initials[:2]
    
    # Generate color based on player_id
    colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
        "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
        "#F8C471", "#82E0AA", "#F1948A", "#85C1E9", "#D7BDE2"
    ]
    color = colors[player_id % len(colors)]
    
    # Create SVG avatar
    svg_content = f"""
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="25" fill="{color}"/>
        <text x="25" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
              text-anchor="middle" fill="white">{initials}</text>
    </svg>
    """
    
    return Response(content=svg_content, media_type="image/svg+xml")

@app.post("/update-player-image")
async def update_player_image(
    player_id: int = Form(...),
    file: UploadFile = File(...)
):
    """
    Update specific player's image
    """
    try:
        # Check if player exists
        player_query = "SELECT player_id FROM players WHERE player_id = ?"
        player_df = execute_query(player_query, [player_id])
        
        if len(player_df) == 0:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Upload image
        upload_result = await upload_image(file, player_id)
        
        return {
            "success": True,
            "message": f"Image updated for player {player_id}",
            "player_id": player_id,
            "image_url": upload_result["file_path"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.get("/players/{player_id}/image")
async def get_player_image(player_id: int):
    """
    Get player's image URL
    """
    try:
        query = "SELECT player_image FROM players WHERE player_id = ?"
        result = execute_query(query, [player_id])
        
        if len(result) == 0:
            raise HTTPException(status_code=404, detail="Player not found")
        
        image_url = result.iloc[0]['player_image']
        
        return {
            "player_id": player_id,
            "image_url": image_url,
            "avatar_url": f"/players/{player_id}/avatar",
            "has_image": bool(image_url and image_url.strip())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

print("[OK] Match Outcome Prediction: POST /ml/predict/match")
print("[OK] Player Forecasting: GET /ml/forecast/player/{id}")
print("[OK] Player Valuation: GET /ml/valuation/player/{id}")
print("[OK] Dream11 Optimizer: POST /ml/dream11/optimize")
print("[OK] Team Creation: POST /ml/create-teams")
print("[OK] Dream11 from Teams: POST /ml/dream11-from-teams")
print("[OK] Image Upload: POST /upload/image")
print("[OK] Update Player Image: POST /update-player-image")
print("[OK] Health Check: GET /ml/health")
print("[OK] API Docs: http://localhost:8000/docs")
print("="*60 + "\n")

# ============================================================

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

