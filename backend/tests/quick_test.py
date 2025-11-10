#!/usr/bin/env python3
"""
Quick test to verify the API fixes
"""

import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing IPL API fixes...")
    
    try:
        # Test players endpoint that was failing
        print("Testing /players endpoint...")
        response = requests.get(f"{base_url}/players")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Players endpoint working! Found {len(data['players'])} players")
            
            # Check if we can serialize the data
            json_str = json.dumps(data)
            print("✅ JSON serialization working!")
            
            # Show sample player data
            if data['players']:
                sample_player = data['players'][0]
                print(f"Sample player: {sample_player['player_name']} (ID: {sample_player['player_id']})")
                print(f"Player image: {sample_player['player_image']}")
        else:
            print(f"❌ Players endpoint failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()
