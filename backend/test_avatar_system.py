#!/usr/bin/env python3
"""
Test script for the new avatar system
"""

import requests
import json

API_BASE = 'http://localhost:8000'

def test_avatar_system():
    print("🧪 Testing IPL Avatar System")
    print("=" * 50)
    
    # Test 1: Get players with avatar URLs
    print("\n1️⃣ Testing players endpoint with avatar URLs...")
    try:
        response = requests.get(f'{API_BASE}/players')
        if response.status_code == 200:
            data = response.json()
            players = data.get('players', [])[:5]  # Test first 5 players
            
            print(f"✅ Found {len(players)} players")
            for player in players:
                print(f"   - {player['player_name']} (ID: {player['player_id']})")
                print(f"     Avatar URL: {API_BASE}{player['avatar_url']}")
                print(f"     Has Image: {bool(player['player_image'])}")
        else:
            print(f"❌ Failed to get players: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Test specific player avatars
    print("\n2️⃣ Testing specific player avatars...")
    test_players = [61, 25, 33, 47, 76]  # Some player IDs
    
    for player_id in test_players:
        try:
            response = requests.get(f'{API_BASE}/players/{player_id}/avatar')
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'image/svg' in content_type:
                    print(f"✅ Player {player_id}: Generated SVG avatar")
                elif 'image/' in content_type:
                    print(f"✅ Player {player_id}: Real image")
                else:
                    print(f"✅ Player {player_id}: Avatar served (Type: {content_type})")
            else:
                print(f"❌ Player {player_id}: Failed ({response.status_code})")
        except Exception as e:
            print(f"❌ Player {player_id}: Error - {e}")
    
    # Test 3: Test player image info
    print("\n3️⃣ Testing player image info...")
    try:
        response = requests.get(f'{API_BASE}/players/61/image')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Player 61 image info:")
            print(f"   - Image URL: {data.get('image_url', 'None')}")
            print(f"   - Avatar URL: {data.get('avatar_url', 'None')}")
            print(f"   - Has Image: {data.get('has_image', False)}")
        else:
            print(f"❌ Failed to get player image info: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Avatar System Test Complete!")
    print("\n💡 Usage in Frontend:")
    print("   <img src='http://localhost:8000/players/61/avatar' alt='Player Avatar'>")
    print("\n📱 Frontend Examples:")
    print("   - player_avatars_demo.html")
    print("   - image_upload_frontend.html")

if __name__ == "__main__":
    test_avatar_system()
