# 🎨 IPL Dashboard Charts - Frontend Integration Guide

## 📋 **Complete Frontend Integration Examples**

### 🚀 **1. Chart.js Integration (Most Popular)**

#### **HTML Setup:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IPL Dashboard Charts</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .chart-container {
            width: 400px;
            height: 400px;
            margin: 20px;
            display: inline-block;
        }
        .chart-title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>🏏 IPL Dashboard Charts</h1>
    
    <!-- Season Selector -->
    <div>
        <label>Select Season:</label>
        <select id="seasonSelect" onchange="loadSeasonCharts()">
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
        </select>
    </div>
    
    <!-- Chart Containers -->
    <div class="chart-container">
        <div class="chart-title">Team Performance</div>
        <canvas id="teamPieChart"></canvas>
    </div>
    
    <div class="chart-container">
        <div class="chart-title">Batsman Runs</div>
        <canvas id="batsmanBarChart"></canvas>
    </div>
    
    <div class="chart-container">
        <div class="chart-title">Runs Distribution</div>
        <canvas id="runsPieChart"></canvas>
    </div>
    
    <div class="chart-container">
        <div class="chart-title">Bowler Wickets</div>
        <canvas id="bowlerBarChart"></canvas>
    </div>

    <script>
        // Global variables for charts
        let teamPieChart, batsmanBarChart, runsPieChart, bowlerBarChart;
        
        // Load charts when page loads
        window.onload = function() {
            loadSeasonCharts();
        };
        
        // Load all charts for selected season
        async function loadSeasonCharts() {
            const season = document.getElementById('seasonSelect').value;
            
            try {
                // Load Team Performance Pie Chart
                await loadTeamPieChart(season);
                
                // Load Batsman Runs Bar Chart
                await loadBatsmanBarChart(season);
                
                // Load Runs Distribution Pie Chart
                await loadRunsPieChart(season);
                
                // Load Bowler Wickets Bar Chart
                await loadBowlerBarChart(season);
                
                console.log('All charts loaded successfully!');
                
            } catch (error) {
                console.error('Error loading charts:', error);
            }
        }
        
        // Team Performance Pie Chart
        async function loadTeamPieChart(season) {
            const response = await fetch(`http://localhost:8000/charts/season/${season}/team-performance-pie`);
            const data = await response.json();
            
            const ctx = document.getElementById('teamPieChart').getContext('2d');
            
            if (teamPieChart) {
                teamPieChart.destroy();
            }
            
            teamPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.data.map(item => item.label),
                    datasets: [{
                        data: data.data.map(item => item.value),
                        backgroundColor: data.data.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: data.title,
                            font: { size: 16 }
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} wins (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Batsman Runs Bar Chart
        async function loadBatsmanBarChart(season) {
            const response = await fetch(`http://localhost:8000/charts/season/${season}/batsman-runs-bar?limit=10`);
            const data = await response.json();
            
            const ctx = document.getElementById('batsmanBarChart').getContext('2d');
            
            if (batsmanBarChart) {
                batsmanBarChart.destroy();
            }
            
            batsmanBarChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.data.map(item => item.label),
                    datasets: [{
                        label: 'Runs',
                        data: data.data.map(item => item.value),
                        backgroundColor: data.data.map(item => item.color),
                        borderColor: data.data.map(item => item.color),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Runs'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Players'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: data.title,
                            font: { size: 16 }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed.y} runs`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Runs Distribution Pie Chart
        async function loadRunsPieChart(season) {
            const response = await fetch(`http://localhost:8000/charts/season/${season}/runs-distribution-pie`);
            const data = await response.json();
            
            const ctx = document.getElementById('runsPieChart').getContext('2d');
            
            if (runsPieChart) {
                runsPieChart.destroy();
            }
            
            runsPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.data.map(item => item.label),
                    datasets: [{
                        data: data.data.map(item => item.value),
                        backgroundColor: data.data.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: data.title,
                            font: { size: 16 }
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} balls (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Bowler Wickets Bar Chart
        async function loadBowlerBarChart(season) {
            const response = await fetch(`http://localhost:8000/charts/season/${season}/bowler-wickets-bar?limit=10`);
            const data = await response.json();
            
            const ctx = document.getElementById('bowlerBarChart').getContext('2d');
            
            if (bowlerBarChart) {
                bowlerBarChart.destroy();
            }
            
            bowlerBarChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.data.map(item => item.label),
                    datasets: [{
                        label: 'Wickets',
                        data: data.data.map(item => item.value),
                        backgroundColor: data.data.map(item => item.color),
                        borderColor: data.data.map(item => item.color),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Wickets'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Players'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: data.title,
                            font: { size: 16 }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed.y} wickets`;
                                }
                            }
                        }
                    }
                }
            });
        }
    </script>
</body>
</html>
```

---

### ⚛️ **2. React Integration**

#### **Install Dependencies:**
```bash
npm install react-chartjs-2 chart.js
```

#### **React Component:**
```jsx
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const IPLCharts = () => {
  const [season, setSeason] = useState('2023');
  const [teamPieData, setTeamPieData] = useState(null);
  const [batsmanBarData, setBatsmanBarData] = useState(null);
  const [runsPieData, setRunsPieData] = useState(null);
  const [bowlerBarData, setBowlerBarData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all charts data
  const loadChartsData = async (selectedSeason) => {
    setLoading(true);
    try {
      const [teamResponse, batsmanResponse, runsResponse, bowlerResponse] = await Promise.all([
        fetch(`http://localhost:8000/charts/season/${selectedSeason}/team-performance-pie`),
        fetch(`http://localhost:8000/charts/season/${selectedSeason}/batsman-runs-bar?limit=10`),
        fetch(`http://localhost:8000/charts/season/${selectedSeason}/runs-distribution-pie`),
        fetch(`http://localhost:8000/charts/season/${selectedSeason}/bowler-wickets-bar?limit=10`)
      ]);

      const [teamData, batsmanData, runsData, bowlerData] = await Promise.all([
        teamResponse.json(),
        batsmanResponse.json(),
        runsResponse.json(),
        bowlerResponse.json()
      ]);

      setTeamPieData(teamData);
      setBatsmanBarData(batsmanData);
      setRunsPieData(runsData);
      setBowlerBarData(bowlerData);
    } catch (error) {
      console.error('Error loading charts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartsData(season);
  }, [season]);

  const handleSeasonChange = (e) => {
    setSeason(e.target.value);
    loadChartsData(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading charts...</div>;
  }

  return (
    <div className="ipl-charts">
      <h1>🏏 IPL Dashboard Charts</h1>
      
      {/* Season Selector */}
      <div className="season-selector">
        <label>Select Season:</label>
        <select value={season} onChange={handleSeasonChange}>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Team Performance Pie Chart */}
        {teamPieData && (
          <div className="chart-container">
            <h3>{teamPieData.title}</h3>
            <Pie
              data={{
                labels: teamPieData.data.map(item => item.label),
                datasets: [{
                  data: teamPieData.data.map(item => item.value),
                  backgroundColor: teamPieData.data.map(item => item.color),
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} wins (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}

        {/* Batsman Runs Bar Chart */}
        {batsmanBarData && (
          <div className="chart-container">
            <h3>{batsmanBarData.title}</h3>
            <Bar
              data={{
                labels: batsmanBarData.data.map(item => item.label),
                datasets: [{
                  label: 'Runs',
                  data: batsmanBarData.data.map(item => item.value),
                  backgroundColor: batsmanBarData.data.map(item => item.color),
                  borderColor: batsmanBarData.data.map(item => item.color),
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Runs'
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        )}

        {/* Runs Distribution Pie Chart */}
        {runsPieData && (
          <div className="chart-container">
            <h3>{runsPieData.title}</h3>
            <Pie
              data={{
                labels: runsPieData.data.map(item => item.label),
                datasets: [{
                  data: runsPieData.data.map(item => item.value),
                  backgroundColor: runsPieData.data.map(item => item.color),
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        )}

        {/* Bowler Wickets Bar Chart */}
        {bowlerBarData && (
          <div className="chart-container">
            <h3>{bowlerBarData.title}</h3>
            <Bar
              data={{
                labels: bowlerBarData.data.map(item => item.label),
                datasets: [{
                  label: 'Wickets',
                  data: bowlerBarData.data.map(item => item.value),
                  backgroundColor: bowlerBarData.data.map(item => item.color),
                  borderColor: bowlerBarData.data.map(item => item.color),
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Wickets'
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IPLCharts;
```

#### **CSS for React Component:**
```css
.ipl-charts {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.season-selector {
  margin-bottom: 30px;
  text-align: center;
}

.season-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.season-selector select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.chart-container h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin: 50px 0;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    padding: 15px;
  }
}
```

---

### 🟢 **3. Vue.js Integration**

#### **Install Dependencies:**
```bash
npm install vue-chartjs chart.js
```

#### **Vue Component:**
```vue
<template>
  <div class="ipl-charts">
    <h1>🏏 IPL Dashboard Charts</h1>
    
    <!-- Season Selector -->
    <div class="season-selector">
      <label>Select Season:</label>
      <select v-model="selectedSeason" @change="loadCharts">
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
        <option value="2020">2020</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading charts...
    </div>

    <!-- Charts Grid -->
    <div v-else class="charts-grid">
      <!-- Team Performance Pie Chart -->
      <div v-if="teamPieData" class="chart-container">
        <h3>{{ teamPieData.title }}</h3>
        <pie-chart
          :data="teamPieChartData"
          :options="pieChartOptions"
        />
      </div>

      <!-- Batsman Runs Bar Chart -->
      <div v-if="batsmanBarData" class="chart-container">
        <h3>{{ batsmanBarData.title }}</h3>
        <bar-chart
          :data="batsmanBarChartData"
          :options="barChartOptions"
        />
      </div>

      <!-- Runs Distribution Pie Chart -->
      <div v-if="runsPieData" class="chart-container">
        <h3>{{ runsPieData.title }}</h3>
        <pie-chart
          :data="runsPieChartData"
          :options="pieChartOptions"
        />
      </div>

      <!-- Bowler Wickets Bar Chart -->
      <div v-if="bowlerBarData" class="chart-container">
        <h3>{{ bowlerBarData.title }}</h3>
        <bar-chart
          :data="bowlerBarChartData"
          :options="barChartOptions"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Pie, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default {
  name: 'IPLCharts',
  components: {
    PieChart: Pie,
    BarChart: Bar
  },
  data() {
    return {
      selectedSeason: '2023',
      loading: false,
      teamPieData: null,
      batsmanBarData: null,
      runsPieData: null,
      bowlerBarData: null,
      pieChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      },
      barChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    }
  },
  computed: {
    teamPieChartData() {
      if (!this.teamPieData) return null
      return {
        labels: this.teamPieData.data.map(item => item.label),
        datasets: [{
          data: this.teamPieData.data.map(item => item.value),
          backgroundColor: this.teamPieData.data.map(item => item.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    },
    batsmanBarChartData() {
      if (!this.batsmanBarData) return null
      return {
        labels: this.batsmanBarData.data.map(item => item.label),
        datasets: [{
          label: 'Runs',
          data: this.batsmanBarData.data.map(item => item.value),
          backgroundColor: this.batsmanBarData.data.map(item => item.color),
          borderColor: this.batsmanBarData.data.map(item => item.color),
          borderWidth: 1
        }]
      }
    },
    runsPieChartData() {
      if (!this.runsPieData) return null
      return {
        labels: this.runsPieData.data.map(item => item.label),
        datasets: [{
          data: this.runsPieData.data.map(item => item.value),
          backgroundColor: this.runsPieData.data.map(item => item.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    },
    bowlerBarChartData() {
      if (!this.bowlerBarData) return null
      return {
        labels: this.bowlerBarData.data.map(item => item.label),
        datasets: [{
          label: 'Wickets',
          data: this.bowlerBarData.data.map(item => item.value),
          backgroundColor: this.bowlerBarData.data.map(item => item.color),
          borderColor: this.bowlerBarData.data.map(item => item.color),
          borderWidth: 1
        }]
      }
    }
  },
  async mounted() {
    await this.loadCharts()
  },
  methods: {
    async loadCharts() {
      this.loading = true
      try {
        const [teamResponse, batsmanResponse, runsResponse, bowlerResponse] = await Promise.all([
          fetch(`http://localhost:8000/charts/season/${this.selectedSeason}/team-performance-pie`),
          fetch(`http://localhost:8000/charts/season/${this.selectedSeason}/batsman-runs-bar?limit=10`),
          fetch(`http://localhost:8000/charts/season/${this.selectedSeason}/runs-distribution-pie`),
          fetch(`http://localhost:8000/charts/season/${this.selectedSeason}/bowler-wickets-bar?limit=10`)
        ])

        const [teamData, batsmanData, runsData, bowlerData] = await Promise.all([
          teamResponse.json(),
          batsmanResponse.json(),
          runsResponse.json(),
          bowlerResponse.json()
        ])

        this.teamPieData = teamData
        this.batsmanBarData = batsmanData
        this.runsPieData = runsData
        this.bowlerBarData = bowlerData
      } catch (error) {
        console.error('Error loading charts:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.ipl-charts {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.season-selector {
  margin-bottom: 30px;
  text-align: center;
}

.season-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.season-selector select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.chart-container h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin: 50px 0;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    padding: 15px;
  }
}
</style>
```

---

### 📱 **4. Mobile Responsive Design**

#### **CSS for Mobile:**
```css
/* Mobile First Design */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 10px;
}

.chart-container {
  width: 100%;
  height: 300px;
  margin: 10px 0;
}

/* Tablet */
@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
  
  .chart-container {
    height: 350px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .chart-container {
    height: 400px;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .charts-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

### 🧪 **5. Testing Your Charts**

#### **Test API Endpoints:**
```bash
# Test team performance pie chart
curl http://localhost:8000/charts/season/2023/team-performance-pie

# Test batsman runs bar chart
curl http://localhost:8000/charts/season/2023/batsman-runs-bar?limit=10

# Test runs distribution pie chart
curl http://localhost:8000/charts/season/2023/runs-distribution-pie

# Test bowler wickets bar chart
curl http://localhost:8000/charts/season/2023/bowler-wickets-bar?limit=10
```

#### **Test in Browser:**
1. Save the HTML code as `ipl_charts.html`
2. Open in browser
3. Select different seasons
4. Charts should update automatically

---

### 🚀 **6. Quick Start Guide**

1. **Start API Server:**
   ```bash
   python main.py
   ```

2. **Choose Your Framework:**
   - **HTML + Chart.js** - Copy HTML code
   - **React** - Use React component
   - **Vue.js** - Use Vue component

3. **Test Charts:**
   ```bash
   curl http://localhost:8000/charts/season/2023/team-performance-pie
   ```

4. **Customize:**
   - Change colors
   - Modify chart types
   - Add animations
   - Update styling

---

**🎉 Ab aap easily frontend mein charts integrate kar sakte hain!**

### **Summary:**
- ✅ **HTML + Chart.js** - Complete working example
- ✅ **React Integration** - Ready-to-use component
- ✅ **Vue.js Integration** - Complete Vue component
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Interactive Charts** - Season selection, tooltips
- ✅ **Real-time Data** - Live API integration
