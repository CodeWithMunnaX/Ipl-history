#!/usr/bin/env python3
"""
IPL Dashboard API - Comprehensive Usage Examples
This script demonstrates all the new Cricbuzz-style endpoints
"""

import requests
import json
from typing import Dict, List

class IPLComprehensiveClient:
    """Client for IPL Dashboard API with comprehensive statistics"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
    
    def get_detailed_batsmen_stats(self, limit: int = 20) -> Dict:
        """Get comprehensive batsman statistics"""
        response = requests.get(f"{self.base_url}/stats/batsmen/detailed?limit={limit}")
        return response.json()
    
    def get_detailed_bowlers_stats(self, limit: int = 20) -> Dict:
        """Get comprehensive bowler statistics"""
        response = requests.get(f"{self.base_url}/stats/bowlers/detailed?limit={limit}")
        return response.json()
    
    def get_comprehensive_team_stats(self) -> Dict:
        """Get comprehensive team statistics"""
        response = requests.get(f"{self.base_url}/stats/teams/comprehensive")
        return response.json()
    
    def get_recent_matches(self, limit: int = 10) -> Dict:
        """Get recent matches"""
        response = requests.get(f"{self.base_url}/stats/matches/recent?limit={limit}")
        return response.json()
    
    def get_player_career_stats(self, player_id: int) -> Dict:
        """Get player career statistics"""
        response = requests.get(f"{self.base_url}/stats/players/{player_id}/career")
        return response.json()
    
    def get_season_comprehensive_stats(self, season: int) -> Dict:
        """Get comprehensive season statistics"""
        response = requests.get(f"{self.base_url}/stats/seasons/{season}/comprehensive")
        return response.json()

def main():
    """Demonstrate comprehensive IPL statistics"""
    print("🏏 IPL Dashboard API - Comprehensive Statistics Demo")
    print("=" * 60)
    
    client = IPLComprehensiveClient()
    
    try:
        # 1. Detailed Batsmen Statistics
        print("\n📊 TOP BATSMEN (Detailed Stats)")
        print("-" * 40)
        batsmen_stats = client.get_detailed_batsmen_stats(5)
        for i, batsman in enumerate(batsmen_stats['top_batsmen'], 1):
            print(f"{i}. {batsman['player_name']}")
            print(f"   Runs: {batsman['total_runs']} | Avg: {batsman['average']} | SR: {batsman['strike_rate']}")
            print(f"   Matches: {batsman['total_matches']} | 4s: {batsman['fours']} | 6s: {batsman['sixes']}")
            print(f"   HS: {batsman['highest_score']} | Not Outs: {batsman['not_outs']}")
            print()
        
        # 2. Detailed Bowlers Statistics
        print("\n🎯 TOP BOWLERS (Detailed Stats)")
        print("-" * 40)
        bowlers_stats = client.get_detailed_bowlers_stats(5)
        for i, bowler in enumerate(bowlers_stats['top_bowlers'], 1):
            print(f"{i}. {bowler['player_name']}")
            print(f"   Wickets: {bowler['total_wickets']} | Avg: {bowler['bowling_average']} | Econ: {bowler['economy']}")
            print(f"   Matches: {bowler['total_matches']} | Overs: {bowler['total_overs']} | SR: {bowler['strike_rate']}")
            print(f"   Best: {bowler['best_figures']}")
            print()
        
        # 3. Comprehensive Team Statistics
        print("\n🏆 TEAM RANKINGS (Comprehensive)")
        print("-" * 40)
        team_stats = client.get_comprehensive_team_stats()
        for i, team in enumerate(team_stats['team_rankings'][:5], 1):
            print(f"{i}. {team['team_name']} ({team['team_name_short']})")
            print(f"   Win %: {team['win_percentage']}% | Matches: {team['total_matches']} | W-L: {team['wins']}-{team['losses']}")
            print(f"   Runs Scored: {team['total_runs_scored']} | Runs Conceded: {team['total_runs_conceded']}")
            print(f"   NRR: {team['net_run_rate']} | Seasons: {team['seasons_participated']}")
            print()
        
        # 4. Recent Matches
        print("\n📅 RECENT MATCHES")
        print("-" * 40)
        recent_matches = client.get_recent_matches(5)
        for match in recent_matches['recent_matches']:
            print(f"{match['team1']} vs {match['team2']}")
            print(f"Winner: {match['match_winner']} | Date: {match['match_date']}")
            if match['win_by_runs']:
                print(f"Won by {match['win_by_runs']} runs")
            elif match['win_by_wickets']:
                print(f"Won by {match['win_by_wickets']} wickets")
            print(f"Venue: {match['venue']}, {match['city']}")
            print(f"MoM: {match['player_of_match']}")
            print()
        
        # 5. Player Career Stats (Example with David Warner)
        print("\n👤 PLAYER CAREER STATS (David Warner)")
        print("-" * 40)
        try:
            # Find David Warner's player_id
            players_response = requests.get(f"{client.base_url}/players")
            players = players_response.json()['players']
            warner_id = None
            for player in players:
                if 'Warner' in player['player_name']:
                    warner_id = player['player_id']
                    break
            
            if warner_id:
                career_stats = client.get_player_career_stats(warner_id)
                print(f"Player: {career_stats['player_name']} ({career_stats['player_full_name']})")
                print(f"Batting Style: {career_stats['bat_style']} | Bowling Style: {career_stats['bowl_style']}")
                print("\nBatting Career:")
                batting = career_stats['batting_career']
                print(f"  Runs: {batting['total_runs']} | Avg: {batting['strike_rate']} | SR: {batting['strike_rate']}")
                print(f"  Matches: {batting['total_matches']} | Innings: {batting['total_innings']}")
                print(f"  4s: {batting['fours']} | 6s: {batting['sixes']} | HS: {batting['highest_score']}")
                
                print("\nBowling Career:")
                bowling = career_stats['bowling_career']
                print(f"  Wickets: {bowling['total_wickets']} | Avg: {bowling['bowling_average']} | Econ: {bowling['economy']}")
                print(f"  Matches: {bowling['total_matches']} | Overs: {bowling['total_overs']}")
                
                print("\nSeason Performance:")
                for season in career_stats['season_performance'][:3]:  # Show last 3 seasons
                    print(f"  {season['season']}: {season['runs']} runs in {season['matches']} matches")
        except Exception as e:
            print(f"Could not fetch player career stats: {e}")
        
        # 6. Season Comprehensive Stats (Example with 2023)
        print("\n📈 SEASON COMPREHENSIVE STATS (2023)")
        print("-" * 40)
        try:
            season_stats = client.get_season_comprehensive_stats(2023)
            print(f"Season: {season_stats['season']}")
            print(f"Total Matches: {season_stats['total_matches']}")
            print(f"Total Runs: {season_stats['total_runs']}")
            print(f"Total Wickets: {season_stats['total_wickets']}")
            
            print("\nTop Batsmen:")
            for i, batsman in enumerate(season_stats['top_batsmen'], 1):
                print(f"  {i}. {batsman['player_name']}: {batsman['runs']} runs")
            
            print("\nTop Bowlers:")
            for i, bowler in enumerate(season_stats['top_bowlers'], 1):
                print(f"  {i}. {bowler['player_name']}: {bowler['wickets']} wickets")
            
            print("\nTeam Standings:")
            for i, team in enumerate(season_stats['team_standings'][:5], 1):
                print(f"  {i}. {team['team_name']}: {team['wins']}/{team['matches']} ({team['win_percentage']}%)")
        except Exception as e:
            print(f"Could not fetch season stats: {e}")
        
        print("\n✅ All comprehensive statistics fetched successfully!")
        print("🎉 Your IPL Dashboard API is now Cricbuzz-ready!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server.")
        print("Make sure the server is running at http://localhost:8000")
        print("Run: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
