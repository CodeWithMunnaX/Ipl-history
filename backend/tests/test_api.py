#!/usr/bin/env python3
"""
Test script for IPL Dashboard API
Run this after starting the API server to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, description):
    """Test a single endpoint"""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {description}")
            print(f"   Response keys: {list(data.keys()) if isinstance(data, dict) else 'List response'}")
            return True
        else:
            print(f"❌ {description} - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {description} - Error: {str(e)}")
        return False

def main():
    print("🧪 Testing IPL Dashboard API")
    print("=" * 50)
    
    # Test basic endpoints
    tests = [
        ("/", "API Root"),
        ("/teams", "Get All Teams"),
        ("/players", "Get All Players"),
        ("/seasons", "Get All Seasons"),
        ("/overall/top-batsmen?limit=5", "Top Batsmen Overall"),
        ("/overall/top-bowlers?limit=5", "Top Bowlers Overall"),
        ("/overall/team-standings", "Team Standings"),
    ]
    
    passed = 0
    total = len(tests)
    
    for endpoint, description in tests:
        if test_endpoint(endpoint, description):
            passed += 1
        print()
    
    # Test specific team and player endpoints
    print("Testing specific resources...")
    team_tests = [
        ("/teams/3", "Mumbai Indians Details"),
        ("/teams/3/stats", "Mumbai Indians Stats"),
    ]
    
    for endpoint, description in team_tests:
        if test_endpoint(endpoint, description):
            passed += 1
        print()
    
    player_tests = [
        ("/players/12", "David Warner Details"),
        ("/players/12/stats", "David Warner Stats"),
    ]
    
    for endpoint, description in player_tests:
        if test_endpoint(endpoint, description):
            passed += 1
        print()
    
    # Test season endpoints
    season_tests = [
        ("/seasons/2023/winners", "2023 Season Winners"),
        ("/seasons/2023/top-batsmen?limit=3", "2023 Top Batsmen"),
        ("/seasons/2023/top-bowlers?limit=3", "2023 Top Bowlers"),
    ]
    
    for endpoint, description in season_tests:
        if test_endpoint(endpoint, description):
            passed += 1
        print()
    
    total += len(team_tests) + len(player_tests) + len(season_tests)
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the API server.")

if __name__ == "__main__":
    main()
