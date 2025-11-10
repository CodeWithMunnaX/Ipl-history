# 🏏 IPL Team Creation & Dream11 - Complete Frontend Guide

## ✅ **Working Endpoints:**

1. **POST** `/ml/create-teams` - Create two balanced teams
2. **POST** `/ml/dream11-from-teams` - Create Dream11 team from the two teams

---

## 🚀 **Frontend Integration Examples**

### **1. Team Creation Component**

```jsx
import React, { useState } from 'react';

const TeamCreation = () => {
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team1_name: 'Mumbai Indians',
    team2_name: 'Chennai Super Kings',
    venue: 'Wankhede Stadium',
    season: 2024
  });

  const createTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ml/create-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      setTeams(result);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="team-creation">
      <h2>Create Two Teams</h2>
      
      <div className="form-group">
        <input
          type="text"
          placeholder="Team 1 Name"
          value={formData.team1_name}
          onChange={(e) => setFormData({...formData, team1_name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Team 2 Name"
          value={formData.team2_name}
          onChange={(e) => setFormData({...formData, team2_name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Venue"
          value={formData.venue}
          onChange={(e) => setFormData({...formData, venue: e.target.value})}
        />
        <button onClick={createTeams} disabled={loading}>
          {loading ? 'Creating Teams...' : 'Create Teams'}
        </button>
      </div>

      {teams && (
        <div className="teams-display">
          <div className="match-info">
            <h3>Match: {teams.match_info.team1_name} vs {teams.match_info.team2_name}</h3>
            <p>Venue: {teams.match_info.venue}</p>
            <p>Season: {teams.match_info.season}</p>
          </div>

          <div className="teams-container">
            <div className="team-card">
              <h3>{teams.match_info.team1_name}</h3>
              <div className="players-list">
                {teams.team1.map((player, index) => (
                  <div key={index} className={`player-item ${player.player_type}`}>
                    <div className="player-info">
                      <h4>{player.player_name}</h4>
                      <p>{player.player_full_name}</p>
                      <span className="player-type">{player.player_type}</span>
                    </div>
                    <div className="player-stats">
                      <p>Matches: {player.matches}</p>
                      <p>Runs: {player.runs}</p>
                      <p>SR: {player.strike_rate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="team-card">
              <h3>{teams.match_info.team2_name}</h3>
              <div className="players-list">
                {teams.team2.map((player, index) => (
                  <div key={index} className={`player-item ${player.player_type}`}>
                    <div className="player-info">
                      <h4>{player.player_name}</h4>
                      <p>{player.player_full_name}</p>
                      <span className="player-type">{player.player_type}</span>
                    </div>
                    <div className="player-stats">
                      <p>Matches: {player.matches}</p>
                      <p>Runs: {player.runs}</p>
                      <p>SR: {player.strike_rate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCreation;
```

### **2. Dream11 Team Creation Component**

```jsx
import React, { useState } from 'react';

const Dream11FromTeams = () => {
  const [dream11Team, setDream11Team] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team1_name: 'Mumbai Indians',
    team2_name: 'Chennai Super Kings',
    venue: 'Wankhede Stadium',
    season: 2024
  });

  const createDream11Team = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ml/dream11-from-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      setDream11Team(result);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="dream11-from-teams">
      <h2>Create Dream11 Team from Two Teams</h2>
      
      <div className="form-group">
        <input
          type="text"
          placeholder="Team 1 Name"
          value={formData.team1_name}
          onChange={(e) => setFormData({...formData, team1_name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Team 2 Name"
          value={formData.team2_name}
          onChange={(e) => setFormData({...formData, team2_name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Venue"
          value={formData.venue}
          onChange={(e) => setFormData({...formData, venue: e.target.value})}
        />
        <button onClick={createDream11Team} disabled={loading}>
          {loading ? 'Creating Dream11 Team...' : 'Create Dream11 Team'}
        </button>
      </div>

      {dream11Team && (
        <div className="dream11-result">
          <div className="match-info">
            <h3>Match: {dream11Team.match_info.team1_name} vs {dream11Team.match_info.team2_name}</h3>
            <p>Venue: {dream11Team.match_info.venue}</p>
          </div>

          <div className="dream11-summary">
            <h3>Dream11 Team Summary</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="label">Total Players:</span>
                <span className="value">{dream11Team.dream11_summary.total_players}</span>
              </div>
              <div className="stat-item">
                <span className="label">Total Cost:</span>
                <span className="value">₹{dream11Team.dream11_summary.total_cost}</span>
              </div>
              <div className="stat-item">
                <span className="label">Remaining Budget:</span>
                <span className="value">₹{dream11Team.dream11_summary.remaining_budget}</span>
              </div>
              <div className="stat-item">
                <span className="label">Estimated Points:</span>
                <span className="value">{dream11Team.dream11_summary.estimated_points}</span>
              </div>
              <div className="stat-item">
                <span className="label">Captain:</span>
                <span className="value captain">{dream11Team.dream11_summary.captain}</span>
              </div>
              <div className="stat-item">
                <span className="label">Vice Captain:</span>
                <span className="value vice-captain">{dream11Team.dream11_summary.vice_captain}</span>
              </div>
            </div>

            <div className="team-composition">
              <h4>Team Composition</h4>
              <div className="composition-stats">
                <span className="comp-item">WK: {dream11Team.dream11_summary.team_composition.wicketkeepers}</span>
                <span className="comp-item">BAT: {dream11Team.dream11_summary.team_composition.batsmen}</span>
                <span className="comp-item">BOWL: {dream11Team.dream11_summary.team_composition.bowlers}</span>
                <span className="comp-item">AR: {dream11Team.dream11_summary.team_composition.allrounders}</span>
              </div>
            </div>
          </div>

          <div className="dream11-players">
            <h3>Selected Players</h3>
            <div className="players-grid">
              {dream11Team.dream11_team.map((player, index) => (
                <div key={index} className={`dream11-player-card ${player.player_type}`}>
                  <div className="player-header">
                    <h4>{player.player_name}</h4>
                    {player.is_captain && <span className="captain-badge">C</span>}
                    {player.is_vice_captain && <span className="vc-badge">VC</span>}
                  </div>
                  <div className="player-details">
                    <p className="player-type">{player.player_type}</p>
                    <p className="cost">₹{player.cost}</p>
                    <p className="points">{player.points.toFixed(0)} pts</p>
                  </div>
                  <div className="player-stats">
                    <p>Matches: {player.matches}</p>
                    <p>Runs: {player.runs}</p>
                    <p>SR: {player.strike_rate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="original-teams">
            <h3>Original Teams</h3>
            <div className="teams-container">
              <div className="team-card">
                <h4>{dream11Team.match_info.team1_name}</h4>
                <div className="players-list">
                  {dream11Team.original_teams.team1.map((player, index) => (
                    <div key={index} className="player-item">
                      <span>{player.player_name}</span>
                      <span className="player-type">{player.player_type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="team-card">
                <h4>{dream11Team.match_info.team2_name}</h4>
                <div className="players-list">
                  {dream11Team.original_teams.team2.map((player, index) => (
                    <div key={index} className="player-item">
                      <span>{player.player_name}</span>
                      <span className="player-type">{player.player_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dream11FromTeams;
```

### **3. Complete Dashboard Component**

```jsx
import React, { useState } from 'react';
import TeamCreation from './TeamCreation';
import Dream11FromTeams from './Dream11FromTeams';

const IPLTeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('teams');

  return (
    <div className="ipl-team-dashboard">
      <header>
        <h1>🏏 IPL Team Creation & Dream11 Dashboard</h1>
        <nav className="tabs">
          <button 
            className={activeTab === 'teams' ? 'active' : ''}
            onClick={() => setActiveTab('teams')}
          >
            Create Teams
          </button>
          <button 
            className={activeTab === 'dream11' ? 'active' : ''}
            onClick={() => setActiveTab('dream11')}
          >
            Dream11 from Teams
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'teams' && <TeamCreation />}
        {activeTab === 'dream11' && <Dream11FromTeams />}
      </main>
    </div>
  );
};

export default IPLTeamDashboard;
```

---

## 🎨 **CSS Styling**

```css
.team-creation, .dream11-from-teams {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  flex: 1;
  min-width: 200px;
}

.form-group button {
  padding: 10px 20px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.form-group button:hover:not(:disabled) {
  background: #34495e;
}

.form-group button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.match-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.teams-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.team-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.team-card h3, .team-card h4 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.player-item.batsman { border-left-color: #27ae60; }
.player-item.bowler { border-left-color: #e74c3c; }
.player-item.allrounder { border-left-color: #f39c12; }
.player-item.wicketkeeper { border-left-color: #9b59b6; }

.player-info h4 {
  margin: 0;
  font-size: 16px;
}

.player-info p {
  margin: 2px 0;
  font-size: 12px;
  color: #666;
}

.player-type {
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.player-stats {
  text-align: right;
  font-size: 12px;
}

.player-stats p {
  margin: 2px 0;
}

.dream11-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-item .label {
  font-weight: bold;
  color: #2c3e50;
}

.stat-item .value {
  color: #27ae60;
  font-weight: bold;
}

.stat-item .value.captain {
  color: #e74c3c;
}

.stat-item .value.vice-captain {
  color: #3498db;
}

.team-composition {
  background: white;
  padding: 15px;
  border-radius: 5px;
}

.composition-stats {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.comp-item {
  background: #3498db;
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.dream11-player-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
}

.dream11-player-card.batsman { border-left: 4px solid #27ae60; }
.dream11-player-card.bowler { border-left: 4px solid #e74c3c; }
.dream11-player-card.allrounder { border-left: 4px solid #f39c12; }
.dream11-player-card.wicketkeeper { border-left: 4px solid #9b59b6; }

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.player-header h4 {
  margin: 0;
  color: #2c3e50;
}

.captain-badge, .vc-badge {
  background: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.vc-badge {
  background: #3498db;
}

.player-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.player-details p {
  margin: 0;
  font-size: 12px;
}

.cost {
  color: #27ae60;
  font-weight: bold;
}

.points {
  color: #2c3e50;
  font-weight: bold;
}

.player-stats {
  font-size: 11px;
  color: #666;
}

.player-stats p {
  margin: 2px 0;
}

.original-teams {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  padding: 10px 20px;
  background: #ecf0f1;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.tabs button.active {
  background: #3498db;
  color: white;
}

.tabs button:hover:not(.active) {
  background: #bdc3c7;
}

@media (max-width: 768px) {
  .teams-container {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .players-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group {
    flex-direction: column;
  }
  
  .form-group input {
    min-width: auto;
  }
}
```

---

## 📱 **Usage Examples**

### **JavaScript API Calls:**

```javascript
// Create two teams
const createTeams = async (team1Name, team2Name, venue) => {
  const response = await fetch('http://localhost:8000/ml/create-teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      team1_name: team1Name,
      team2_name: team2Name,
      venue: venue,
      season: 2024
    })
  });
  return await response.json();
};

// Create Dream11 team from teams
const createDream11FromTeams = async (team1Name, team2Name, venue) => {
  const response = await fetch('http://localhost:8000/ml/dream11-from-teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      team1_name: team1Name,
      team2_name: team2Name,
      venue: venue,
      season: 2024
    })
  });
  return await response.json();
};

// Usage
const teams = await createTeams('Mumbai Indians', 'Chennai Super Kings', 'Wankhede Stadium');
console.log('Created Teams:', teams);

const dream11Team = await createDream11FromTeams('Mumbai Indians', 'Chennai Super Kings', 'Wankhede Stadium');
console.log('Dream11 Team:', dream11Team);
```

---

## ✅ **All Features Working!**

- ✅ **Team Creation**: Creates balanced teams with batsmen, bowlers, all-rounders, and wicket-keepers
- ✅ **Dream11 Optimization**: Creates optimal Dream11 team from the two teams
- ✅ **Player Categorization**: Automatically categorizes players by type
- ✅ **Cost & Points Calculation**: Assigns costs and calculates points for Dream11
- ✅ **Captain & Vice-Captain**: Automatically assigns captain and vice-captain
- ✅ **Complete Frontend Integration**: Ready-to-use React components

**Ready to use in your frontend!** 🚀
