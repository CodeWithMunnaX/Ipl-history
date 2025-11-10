#!/usr/bin/env python3
"""
IPL Dashboard API - Frontend Chart Integration Examples
This script demonstrates how to use the chart data endpoints for frontend visualization
"""

import requests
import json
from typing import Dict, List

class IPLChartClient:
    """Client for IPL Dashboard API chart data"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
    
    def get_team_performance_pie_chart(self) -> Dict:
        """Get team performance pie chart data"""
        response = requests.get(f"{self.base_url}/charts/pie/team-performance")
        return response.json()
    
    def get_player_runs_pie_chart(self, limit: int = 10) -> Dict:
        """Get player runs distribution pie chart data"""
        response = requests.get(f"{self.base_url}/charts/pie/player-runs-distribution?limit={limit}")
        return response.json()
    
    def get_wicket_types_pie_chart(self) -> Dict:
        """Get wicket types pie chart data"""
        response = requests.get(f"{self.base_url}/charts/pie/wicket-types")
        return response.json()
    
    def get_season_wise_bar_chart(self) -> Dict:
        """Get season-wise bar chart data"""
        response = requests.get(f"{self.base_url}/charts/bar/season-wise-stats")
        return response.json()
    
    def get_player_performance_line_chart(self, player_id: int) -> Dict:
        """Get player performance line chart data"""
        response = requests.get(f"{self.base_url}/charts/line/player-performance/{player_id}")
        return response.json()
    
    def get_ball_by_ball_analysis(self, match_id: int) -> Dict:
        """Get ball-by-ball analysis for a match"""
        response = requests.get(f"{self.base_url}/analysis/ball-by-ball/{match_id}")
        return response.json()
    
    def get_over_by_over_analysis(self, match_id: int) -> Dict:
        """Get over-by-over analysis for a match"""
        response = requests.get(f"{self.base_url}/analysis/over-by-over/{match_id}")
        return response.json()
    
    def get_player_detailed_analysis(self, player_id: int) -> Dict:
        """Get detailed player analysis"""
        response = requests.get(f"{self.base_url}/analysis/player/{player_id}/detailed")
        return response.json()

def generate_chart_configs():
    """Generate chart configurations for different charting libraries"""
    
    print("📊 IPL Dashboard API - Frontend Chart Integration")
    print("=" * 60)
    
    client = IPLChartClient()
    
    try:
        # 1. PIE CHART - Team Performance
        print("\n🥧 PIE CHART - Team Performance")
        print("-" * 40)
        team_pie_data = client.get_team_performance_pie_chart()
        
        # Chart.js configuration
        chartjs_config = {
            "type": "pie",
            "data": {
                "labels": [item["label"] for item in team_pie_data["data"]],
                "datasets": [{
                    "data": [item["value"] for item in team_pie_data["data"]],
                    "backgroundColor": [item["color"] for item in team_pie_data["data"]],
                    "borderWidth": 2,
                    "borderColor": "#fff"
                }]
            },
            "options": {
                "responsive": True,
                "plugins": {
                    "title": {
                        "display": True,
                        "text": team_pie_data["title"]
                    },
                    "legend": {
                        "position": "bottom"
                    }
                }
            }
        }
        
        print("Chart.js Configuration:")
        print(json.dumps(chartjs_config, indent=2))
        
        # 2. PIE CHART - Player Runs Distribution
        print("\n🥧 PIE CHART - Player Runs Distribution")
        print("-" * 40)
        player_pie_data = client.get_player_runs_pie_chart(8)
        
        # Recharts configuration (React)
        recharts_config = {
            "type": "PieChart",
            "width": 400,
            "height": 400,
            "data": [
                {
                    "name": item["label"],
                    "value": item["value"],
                    "fill": item["color"]
                }
                for item in player_pie_data["data"]
            ]
        }
        
        print("Recharts Configuration:")
        print(json.dumps(recharts_config, indent=2))
        
        # 3. PIE CHART - Wicket Types
        print("\n🥧 PIE CHART - Wicket Types")
        print("-" * 40)
        wicket_pie_data = client.get_wicket_types_pie_chart()
        
        # D3.js configuration
        d3_config = {
            "width": 400,
            "height": 400,
            "radius": 150,
            "data": [
                {
                    "label": item["label"],
                    "value": item["value"],
                    "color": item["color"]
                }
                for item in wicket_pie_data["data"]
            ]
        }
        
        print("D3.js Configuration:")
        print(json.dumps(d3_config, indent=2))
        
        # 4. BAR CHART - Season-wise Stats
        print("\n📊 BAR CHART - Season-wise Statistics")
        print("-" * 40)
        season_bar_data = client.get_season_wise_bar_chart()
        
        # Chart.js Bar Chart configuration
        bar_chart_config = {
            "type": "bar",
            "data": {
                "labels": [f"Season {item['season']}" for item in season_bar_data["data"]],
                "datasets": [
                    {
                        "label": "Runs",
                        "data": [item["runs"] for item in season_bar_data["data"]],
                        "backgroundColor": "rgba(54, 162, 235, 0.6)",
                        "borderColor": "rgba(54, 162, 235, 1)",
                        "borderWidth": 1
                    },
                    {
                        "label": "Wickets",
                        "data": [item["wickets"] for item in season_bar_data["data"]],
                        "backgroundColor": "rgba(255, 99, 132, 0.6)",
                        "borderColor": "rgba(255, 99, 132, 1)",
                        "borderWidth": 1
                    }
                ]
            },
            "options": {
                "responsive": True,
                "scales": {
                    "y": {
                        "beginAtZero": True
                    }
                },
                "plugins": {
                    "title": {
                        "display": True,
                        "text": season_bar_data["title"]
                    }
                }
            }
        }
        
        print("Chart.js Bar Chart Configuration:")
        print(json.dumps(bar_chart_config, indent=2))
        
        # 5. LINE CHART - Player Performance
        print("\n📈 LINE CHART - Player Performance")
        print("-" * 40)
        try:
            # Find a player with data
            players_response = requests.get(f"{client.base_url}/players")
            players = players_response.json()['players']
            sample_player_id = players[0]['player_id'] if players else 12
            
            player_line_data = client.get_player_performance_line_chart(sample_player_id)
            
            # Chart.js Line Chart configuration
            line_chart_config = {
                "type": "line",
                "data": {
                    "labels": [f"Season {item['season']}" for item in player_line_data["data"]],
                    "datasets": [{
                        "label": "Runs",
                        "data": [item["runs"] for item in player_line_data["data"]],
                        "borderColor": "rgba(75, 192, 192, 1)",
                        "backgroundColor": "rgba(75, 192, 192, 0.2)",
                        "borderWidth": 2,
                        "fill": True,
                        "tension": 0.4
                    }]
                },
                "options": {
                    "responsive": True,
                    "scales": {
                        "y": {
                            "beginAtZero": True
                        }
                    },
                    "plugins": {
                        "title": {
                            "display": True,
                            "text": player_line_data["title"]
                        }
                    }
                }
            }
            
            print("Chart.js Line Chart Configuration:")
            print(json.dumps(line_chart_config, indent=2))
            
        except Exception as e:
            print(f"Could not fetch player line chart data: {e}")
        
        # 6. Ball-by-Ball Analysis Example
        print("\n🏏 BALL-BY-BALL ANALYSIS")
        print("-" * 40)
        try:
            # Get a sample match
            matches_response = requests.get(f"{client.base_url}/stats/matches/recent?limit=1")
            if matches_response.status_code == 200:
                matches = matches_response.json()['recent_matches']
                if matches:
                    sample_match_id = matches[0]['match_id']
                    
                    ball_by_ball = client.get_ball_by_ball_analysis(sample_match_id)
                    
                    print(f"Match: {ball_by_ball['team1']} vs {ball_by_ball['team2']}")
                    print(f"Venue: {ball_by_ball['venue']}")
                    print(f"Date: {ball_by_ball['match_date']}")
                    
                    for innings in ball_by_ball['innings_analysis']:
                        print(f"\nInnings {innings['innings']}: {innings['batting_team']}")
                        print(f"  Total Score: {innings['total_score']}/{innings['wickets_fallen']}")
                        print(f"  Fours: {innings['fours']}, Sixes: {innings['sixes']}")
                        print(f"  Overs: {len(innings['over_analysis'])}")
                        
                        # Show first few overs
                        for over in innings['over_analysis'][:3]:
                            print(f"    Over {over['over']}: {over['runs']} runs, {over['wickets']} wickets")
        except Exception as e:
            print(f"Could not fetch ball-by-ball analysis: {e}")
        
        print("\n✅ All chart configurations generated successfully!")
        print("🎨 Ready for frontend integration!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server.")
        print("Make sure the server is running at http://localhost:8000")
        print("Run: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def generate_html_example():
    """Generate HTML example with Chart.js integration"""
    
    html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IPL Dashboard - Charts</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .chart-container { width: 400px; height: 400px; margin: 20px; display: inline-block; }
        .chart-title { text-align: center; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>🏏 IPL Dashboard - Interactive Charts</h1>
    
    <div class="chart-container">
        <div class="chart-title">Team Performance</div>
        <canvas id="teamPieChart"></canvas>
    </div>
    
    <div class="chart-container">
        <div class="chart-title">Player Runs Distribution</div>
        <canvas id="playerPieChart"></canvas>
    </div>
    
    <div class="chart-container">
        <div class="chart-title">Wicket Types</div>
        <canvas id="wicketPieChart"></canvas>
    </div>
    
    <div class="chart-container">
        <div class="chart-title">Season-wise Statistics</div>
        <canvas id="seasonBarChart"></canvas>
    </div>
    
    <div class="chart-container">
        <div class="chart-title">Player Performance Over Time</div>
        <canvas id="playerLineChart"></canvas>
    </div>

    <script>
        // Fetch data from API and create charts
        async function loadCharts() {
            try {
                // Team Performance Pie Chart
                const teamResponse = await fetch('http://localhost:8000/charts/pie/team-performance');
                const teamData = await teamResponse.json();
                
                new Chart(document.getElementById('teamPieChart'), {
                    type: 'pie',
                    data: {
                        labels: teamData.data.map(item => item.label),
                        datasets: [{
                            data: teamData.data.map(item => item.value),
                            backgroundColor: teamData.data.map(item => item.color)
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { display: true, text: teamData.title }
                        }
                    }
                });
                
                // Player Runs Pie Chart
                const playerResponse = await fetch('http://localhost:8000/charts/pie/player-runs-distribution?limit=8');
                const playerData = await playerResponse.json();
                
                new Chart(document.getElementById('playerPieChart'), {
                    type: 'pie',
                    data: {
                        labels: playerData.data.map(item => item.label),
                        datasets: [{
                            data: playerData.data.map(item => item.value),
                            backgroundColor: playerData.data.map(item => item.color)
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { display: true, text: playerData.title }
                        }
                    }
                });
                
                // Wicket Types Pie Chart
                const wicketResponse = await fetch('http://localhost:8000/charts/pie/wicket-types');
                const wicketData = await wicketResponse.json();
                
                new Chart(document.getElementById('wicketPieChart'), {
                    type: 'pie',
                    data: {
                        labels: wicketData.data.map(item => item.label),
                        datasets: [{
                            data: wicketData.data.map(item => item.value),
                            backgroundColor: wicketData.data.map(item => item.color)
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { display: true, text: wicketData.title }
                        }
                    }
                });
                
                // Season-wise Bar Chart
                const seasonResponse = await fetch('http://localhost:8000/charts/bar/season-wise-stats');
                const seasonData = await seasonResponse.json();
                
                new Chart(document.getElementById('seasonBarChart'), {
                    type: 'bar',
                    data: {
                        labels: seasonData.data.map(item => `Season ${item.season}`),
                        datasets: [
                            {
                                label: 'Runs',
                                data: seasonData.data.map(item => item.runs),
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Wickets',
                                data: seasonData.data.map(item => item.wickets),
                                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true } },
                        plugins: { title: { display: true, text: seasonData.title } }
                    }
                });
                
                console.log('All charts loaded successfully!');
                
            } catch (error) {
                console.error('Error loading charts:', error);
            }
        }
        
        // Load charts when page loads
        loadCharts();
    </script>
</body>
</html>
    """
    
    with open('ipl_dashboard_charts.html', 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    print("\n📄 HTML Example Generated: ipl_dashboard_charts.html")
    print("Open this file in a browser to see interactive charts!")

if __name__ == "__main__":
    generate_chart_configs()
    generate_html_example()
