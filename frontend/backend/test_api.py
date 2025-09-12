#!/usr/bin/env python3
"""
Simple test script to verify the Study Planner API is working
"""
import requests
import json

# Test configuration
BACKEND_URL = "https://study-plannerback.onrender.com"

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        print(f"Health check status: {response.status_code}")
        print(f"Health check response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_home_endpoint():
    """Test the home endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"Home endpoint status: {response.status_code}")
        print(f"Home endpoint response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Home endpoint failed: {e}")
        return False

def test_generate_plan():
    """Test the generate plan endpoint"""
    try:
        test_data = {
            "topic": "Python programming",
            "hours_per_day": 2,
            "days": 3,
            "goal": "Learn the basics of Python"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/generate_plan",
            json=test_data,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Generate plan status: {response.status_code}")
        print(f"Generate plan response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Generate plan failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Study Planner API...")
    print("=" * 50)
    
    # Test all endpoints
    health_ok = test_health_endpoint()
    print()
    
    home_ok = test_home_endpoint()
    print()
    
    plan_ok = test_generate_plan()
    print()
    
    # Summary
    print("=" * 50)
    print("Test Summary:")
    print(f"Health endpoint: {'✓' if health_ok else '✗'}")
    print(f"Home endpoint: {'✓' if home_ok else '✗'}")
    print(f"Generate plan: {'✓' if plan_ok else '✗'}")
    
    if all([health_ok, home_ok, plan_ok]):
        print("\n🎉 All tests passed! Your API is working correctly.")
    else:
        print("\n❌ Some tests failed. Check the error messages above.")
