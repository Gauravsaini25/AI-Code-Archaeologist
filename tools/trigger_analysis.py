import requests
import os

BASE_URL = "http://localhost:8005"
TEST_DATA_PATH = os.path.abspath("test_data/demo")

def trigger_analysis():
    print(f"Triggering analysis for: {TEST_DATA_PATH}")
    try:
        response = requests.post(f"{BASE_URL}/analyze", json={
            "path": TEST_DATA_PATH,
            "language": "java"
        })
        response.raise_for_status()
        print("Analysis Result:", response.json())
        
        # Check graph
        graph_res = requests.get(f"{BASE_URL}/graph")
        graph_data = graph_res.json()
        print(f"Graph Data: {len(graph_data.get('nodes', []))} nodes, {len(graph_data.get('links', []))} links")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_analysis()
