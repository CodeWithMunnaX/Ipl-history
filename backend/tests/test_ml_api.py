"""
Quick Test Script for ML API
Run this to test if everything works
"""
import sys
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n[*] Testing ML Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/ml/health", timeout=5)
        if response.status_code == 200:
            print("[OK] ML Services Health:", response.json())
            return True
        else:
            print("[FAIL] Health check failed:", response.status_code)
            return False
    except requests.exceptions.ConnectionError:
        print("[FAIL] Server not running on port 8000")
        print("[TIP] Run 'python -m app.main_new' first")
        return False
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def test_match_prediction():
    """Test match prediction"""
    print("\n[*] Testing Match Prediction...")
    try:
        data = {
            "team1_id": 3,
            "team2_id": 1,
            "venue": "Wankhede Stadium",
            "season": 2024
        }
        response = requests.post(f"{BASE_URL}/ml/predict/match", json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"[OK] Prediction successful!")
            print(f"   Winner: {result['predicted_winner']}")
            print(f"   Probability: {result['team1_win_probability']:.1%} vs {result['team2_win_probability']:.1%}")
            print(f"   Confidence: {result['confidence_score']:.1%}")
            return True
        else:
            print(f"[FAIL] Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def test_player_forecast():
    """Test player forecasting"""
    print("\n[*] Testing Player Forecast...")
    try:
        player_id = 6730  # Valid player ID
        response = requests.get(f"{BASE_URL}/ml/forecast/player/{player_id}", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"[OK] Forecast successful!")
            print(f"   Player: {result['player_name']}")
            if result.get('batting_forecast'):
                bf = result['batting_forecast']
                print(f"   Predicted Runs: {bf['predicted_runs']}")
                print(f"   Trend: {bf['trend']}")
            return True
        elif response.status_code == 404:
            print(f"[FAIL] Player not found or no data")
            return False
        else:
            print(f"[FAIL] Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def test_player_valuation():
    """Test player valuation"""
    print("\n[*] Testing Player Valuation...")
    try:
        player_id = 6730  # Valid player ID
        response = requests.get(f"{BASE_URL}/ml/valuation/player/{player_id}", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"[OK] Valuation successful!")
            print(f"   Player: {result['player_name']}")
            print(f"   Estimated Value: Rs.{result['estimated_value_inr']} Crores")
            print(f"   Category: {result['category']}")
            return True
        elif response.status_code == 404:
            print(f"[FAIL] Player not found or no data")
            return False
        else:
            print(f"[FAIL] Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def test_dream11():
    """Test Dream11 optimization"""
    print("\n[*] Testing Dream11 Optimization...")
    try:
        data = {
            "team1_id": 3,
            "team2_id": 1,
            "venue": "Wankhede Stadium",
            "budget": 100
        }
        response = requests.post(f"{BASE_URL}/ml/dream11/optimize", json=data, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            print(f"[OK] Team optimization successful!")
            if result.get('captain'):
                print(f"   Captain: {result['captain']['player_name']}")
            print(f"   Predicted Points: {result.get('total_predicted_points', 'N/A')}")
            return True
        else:
            print(f"[FAIL] Failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("IPL Dashboard ML API - Test Suite")
    print("=" * 60)
    
    # Test health first
    if not test_health():
        print("\n[FAIL] Server not accessible. Please start the server first:")
        print("   python -m app.main_new")
        sys.exit(1)
    
    # Run other tests
    tests = [
        test_match_prediction,
        test_player_forecast,
        test_player_valuation,
        test_dream11
    ]
    
    results = []
    for test_func in tests:
        try:
            results.append(test_func())
        except Exception as e:
            print(f"❌ Test crashed: {e}")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    passed = sum(results)
    total = len(results) + 1  # +1 for health check
    print(f"[OK] Passed: {passed + 1}/{total}")
    print(f"[FAIL] Failed: {total - passed - 1}/{total}")
    
    if all(results):
        print("\n[SUCCESS] All tests passed! API is working correctly.")
        print("\n[NEXT] Next steps:")
        print("   1. Check FRONTEND_DEVELOPMENT_GUIDE.md")
        print("   2. Build frontend components")
        print("   3. Integrate with these endpoints")
    else:
        print("\n[WARNING] Some tests failed. Check the errors above.")
    
    print("\n[DOCS] Documentation:")
    print("   - ML_FEATURES_GUIDE.md - Complete ML features guide")
    print("   - FRONTEND_DEVELOPMENT_GUIDE.md - Frontend integration")
    print("   - QUICK_START.md - Quick start guide")

if __name__ == "__main__":
    main()

