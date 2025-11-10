#!/usr/bin/env python3
"""
IPL Dashboard API Usage Examples
This script demonstrates how to use the API endpoints
"""

import requests
import json
from typing import Dict, List

class IPLDashboardClient:
    """Client for IPL Dashboard API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
    
    def get_teams(self) -> List[Dict]:
        """Get all teams"""
        response = requests.get(f"{self.base_url}/teams")
        return response.json()["teams"]
    
    def get_team_stats(self, team_id: int) -> Dict:
        """Get team statistics"""
        response = requests.get(f"{self.base_url}/teams/{team_id}/stats")
        return response.json()
    
    def get_players(self) -> List[Dict]:
        """Get all players"""
        response = requests.get(f"{self.base_url}/players")
        return response.json()["players"]
    
    def get_player_stats(self, player_id: int) -> Dict:
        """Get player statistics"""
        response = requests.get(f"{self.base_url}/players/{player_id}/stats")
        return response.json()
    
    def get_seasons(self) -> List[int]:
        """Get all seasons"""
        response = requests.get(f"{self.base_url}/seasons")
        return response.json()["seasons"]
    
    def get_season_winners(self, season: int) -> Dict:
        """Get season winners"""
        response = requests.get(f"{self.base_url}/seasons/{season}/winners")
        return response.json()
    
    def get_season_top_batsmen(self, season: int, limit: int = 10) -> Dict:
        """Get top batsmen for season"""
        response = requests.get(f"{self.base_url}/seasons/{season}/top-batsmen?limit={limit}")
        return response.json()
    
    def get_season_top_bowlers(self, season: int, limit: int = 10) -> Dict:
        """Get top bowlers for season"""
        response = requests.get(f"{self.base_url}/seasons/{season}/top-bowlers?limit={limit}")
        return response.json()
    
    def get_overall_top_batsmen(self, limit: int = 10) -> Dict:
        """Get overall top batsmen"""
        response = requests.get(f"{self.base_url}/overall/top-batsmen?limit={limit}")
        return response.json()
    
    def get_overall_top_bowlers(self, limit: int = 10) -> Dict:
        """Get overall top bowlers"""
        response = requests.get(f"{self.base_url}/overall/top-bowlers?limit={limit}")
        return response.json()
    
    def get_team_standings(self) -> Dict:
        """Get team standings"""
        response = requests.get(f"{self.base_url}/overall/team-standings")
        return response.json()

def main():
    """Example usage of the IPL Dashboard API"""
    print("🏏 IPL Dashboard API Examples")
    print("=" * 50)
    
    # Initialize client
    client = IPLDashboardClient()
    
    try:
        # Get all teams
        print("📋 Getting all teams...")
        teams = client.get_teams()
        print(f"Found {len(teams)} teams")
        for team in teams[:3]:  # Show first 3 teams
            print(f"  - {team['team_name']} ({team['team_name_short']})")
        print()
        
        # Get team statistics for Mumbai Indians (team_id: 3)
        print("📊 Mumbai Indians Statistics:")
        mi_stats = client.get_team_stats(3)
        print(f"  Total Matches: {mi_stats['total_matches']}")
        print(f"  Wins: {mi_stats['wins']}")
        print(f"  Win Percentage: {mi_stats['win_percentage']}%")
        print(f"  Total Runs: {mi_stats['total_runs']}")
        print(f"  Total Wickets: {mi_stats['total_wickets']}")
        print()
        
        # Get seasons
        print("📅 Available Seasons:")
        seasons = client.get_seasons()
        print(f"Seasons: {seasons}")
        print()
        
        # Get 2023 season winners
        if 2023 in seasons:
            print("🏆 2023 Season Winners:")
            winners = client.get_season_winners(2023)
            print(f"  Winner: {winners['winner']}")
            print(f"  Runner-up: {winners['runner_up']}")
            print()
        
        # Get top batsmen for 2023
        if 2023 in seasons:
            print("🥇 Top 5 Batsmen of 2023:")
            top_batsmen = client.get_season_top_batsmen(2023, 5)
            for i, batsman in enumerate(top_batsmen['top_batsmen'], 1):
                print(f"  {i}. {batsman['player_name']}: {batsman['total_runs']} runs")
            print()
        
        # Get overall top batsmen
        print("🌟 All-time Top 5 Batsmen:")
        overall_batsmen = client.get_overall_top_batsmen(5)
        for i, batsman in enumerate(overall_batsmen['top_batsmen'], 1):
            print(f"  {i}. {batsman['player_name']}: {batsman['total_runs']} runs")
        print()
        
        # Get team standings
        print("📈 Top 5 Teams by Win Percentage:")
        standings = client.get_team_standings()
        for i, team in enumerate(standings['team_standings'][:5], 1):
            print(f"  {i}. {team['team_name']}: {team['win_percentage']}% ({team['wins']}/{team['total_matches']})")
        print()
        
        print("✅ All examples completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server.")
        print("Make sure the server is running at http://localhost:8000")
        print("Run: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
