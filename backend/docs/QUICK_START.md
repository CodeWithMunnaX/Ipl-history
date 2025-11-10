# 🚀 Quick Start Guide - 5 Minutes to ML-Powered IPL Dashboard

## ⚡ Super Quick Setup (Copy-Paste Commands)

### **Step 1: Install Dependencies** (30 seconds)
```bash
pip install -r requirements_ml.txt
```

### **Step 2: Start Server** (10 seconds)
```bash
python -m app.main_new
```

### **Step 3: Open Browser** (5 seconds)
```
http://localhost:8000/docs
```

### **Step 4: Train ML Model** (1 minute)
```bash
# Open new terminal and run:
curl -X POST http://localhost:8000/ml/train/match-predictor
```

---

## 🎯 Test ML Features (Copy-Paste)

### **1. Predict Match Winner**
```bash
curl -X POST "http://localhost:8000/ml/predict/match" \
  -H "Content-Type: application/json" \
  -d '{
    "team1_id": 3,
    "team2_id": 1,
    "venue": "Wankhede Stadium",
    "season": 2024
  }'
```

### **2. Forecast Player Performance**
```bash
curl http://localhost:8000/ml/forecast/player/253802
```

### **3. Generate Dream11 Team**
```bash
curl -X POST "http://localhost:8000/ml/dream11/optimize" \
  -H "Content-Type: application/json" \
  -d '{
    "team1_id": 3,
    "team2_id": 1,
    "venue": "Wankhede Stadium",
    "budget": 100
  }'
```

### **4. Calculate Win Probability**
```bash
curl -X POST "http://localhost:8000/ml/win-probability" \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": 335982,
    "current_innings": 2,
    "current_over": 15.3,
    "current_score": 142,
    "wickets_fallen": 4,
    "target": 180
  }'
```

### **5. Estimate Player Value**
```bash
curl http://localhost:8000/ml/valuation/player/253802
```

---

## 🎨 Frontend Setup (Next.js)

### **Option 1: Start from Scratch**
```bash
# Create Next.js app
npx create-next-app@latest ipl-dashboard --typescript --tailwind --app

cd ipl-dashboard

# Install dependencies
npm install axios react-query recharts framer-motion lucide-react

# Copy component examples from FRONTEND_DEVELOPMENT_GUIDE.md

# Start development
npm run dev
```

### **Option 2: Quick Test (HTML)**
```html
<!-- Save as test.html and open in browser -->
<!DOCTYPE html>
<html>
<head>
    <title>IPL ML Test</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .result { background: #f0f0f0; padding: 20px; margin: 10px 0; border-radius: 8px; }
        button { background: #1e40af; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #1e3a8a; }
    </style>
</head>
<body>
    <h1>🏏 IPL ML Predictions</h1>
    
    <button onclick="predictMatch()">Predict Match</button>
    <button onclick="forecastPlayer()">Forecast Player</button>
    <button onclick="valuatePlayer()">Player Value</button>
    
    <div id="result" class="result"></div>
    
    <script>
        async function predictMatch() {
            const response = await fetch('http://localhost:8000/ml/predict/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    team1_id: 3,
                    team2_id: 1,
                    venue: 'Wankhede Stadium',
                    season: 2024
                })
            });
            const data = await response.json();
            document.getElementById('result').innerHTML = `
                <h2>Match Prediction</h2>
                <p><strong>Winner:</strong> ${data.predicted_winner}</p>
                <p><strong>Probability:</strong> ${(data.team1_win_probability * 100).toFixed(1)}% vs ${(data.team2_win_probability * 100).toFixed(1)}%</p>
                <p><strong>Confidence:</strong> ${(data.confidence_score * 100).toFixed(1)}%</p>
            `;
        }
        
        async function forecastPlayer() {
            const response = await fetch('http://localhost:8000/ml/forecast/player/253802');
            const data = await response.json();
            const batting = data.batting_forecast;
            document.getElementById('result').innerHTML = `
                <h2>Player Forecast: ${data.player_name}</h2>
                <p><strong>Predicted Runs:</strong> ${batting.predicted_runs}</p>
                <p><strong>Strike Rate:</strong> ${batting.predicted_strike_rate}</p>
                <p><strong>Trend:</strong> ${batting.trend}</p>
                <p><strong>Range:</strong> ${batting.confidence_interval.min} - ${batting.confidence_interval.max}</p>
            `;
        }
        
        async function valuatePlayer() {
            const response = await fetch('http://localhost:8000/ml/valuation/player/253802');
            const data = await response.json();
            document.getElementById('result').innerHTML = `
                <h2>Player Valuation: ${data.player_name}</h2>
                <p><strong>Estimated Value:</strong> ₹${data.estimated_value_inr} Crores</p>
                <p><strong>Range:</strong> ₹${data.estimated_value_range.min} - ₹${data.estimated_value_range.max} Cr</p>
                <p><strong>Category:</strong> ${data.category}</p>
                <p><strong>Trend:</strong> ${data.market_trend}</p>
                <p><strong>Recommendation:</strong> ${data.recommendation}</p>
            `;
        }
    </script>
</body>
</html>
```

---

## 📊 Project Structure Visualization

```
📦 backend/
│
├── 📂 app/                          # New Modular Structure
│   │
│   ├── 📄 __init__.py              # Package init
│   ├── 📄 config.py                # ⚙️  Configuration
│   ├── 📄 database.py              # 🗄️  Database utilities
│   ├── 📄 main_new.py              # 🚀 New entry point
│   │
│   ├── 📂 models/                   # Data Models
│   │   ├── 📄 __init__.py
│   │   └── 📄 schemas.py           # Pydantic models
│   │
│   ├── 📂 ml/                       # 🤖 Machine Learning
│   │   ├── 📄 __init__.py
│   │   ├── 📄 match_predictor.py   # 🎯 Match prediction
│   │   ├── 📄 player_forecasting.py # 📈 Player forecast
│   │   ├── 📄 dream11_optimizer.py  # 🎮 Dream11 team
│   │   ├── 📄 win_probability.py    # ⚡ Win probability
│   │   ├── 📄 player_valuation.py   # 💰 Player value
│   │   └── 📂 trained_models/       # Saved models
│   │
│   ├── 📂 routes/                   # API Routes
│   │   ├── 📄 __init__.py
│   │   └── 📄 ml_predictions.py    # ML endpoints
│   │
│   ├── 📂 services/                 # Business Logic
│   │   └── (future services)
│   │
│   └── 📂 utils/                    # Utilities
│       └── (future utilities)
│
├── 📄 main.py                       # Original file (kept)
├── 📄 ipl_data.db                   # SQLite database
├── 📄 requirements_ml.txt           # ML dependencies
│
├── 📂 player_images/                # Player images
│
└── 📚 Documentation/
    ├── 📄 ML_FEATURES_GUIDE.md
    ├── 📄 FRONTEND_DEVELOPMENT_GUIDE.md
    ├── 📄 PROJECT_SUMMARY.md
    └── 📄 QUICK_START.md (this file)
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts: `http://localhost:8000`
- [ ] API docs load: `http://localhost:8000/docs`
- [ ] Health check passes: `GET /ml/health`
- [ ] Match prediction works
- [ ] Player forecast works
- [ ] Dream11 optimization works
- [ ] Win probability works
- [ ] Player valuation works

---

## 🆘 Troubleshooting

### **Problem: Module not found**
```bash
# Solution: Install dependencies
pip install -r requirements_ml.txt
```

### **Problem: Database not found**
```bash
# Solution: Make sure ipl_data.db is in backend folder
# If missing, check your database setup
```

### **Problem: Model not trained**
```bash
# Solution: Train the model
curl -X POST http://localhost:8000/ml/train/match-predictor
```

### **Problem: CORS error in browser**
```javascript
// Already handled! CORS is enabled for all origins
// If still facing issues, check browser console
```

---

## 🎓 Learning Path

### **Week 1: Backend**
1. Day 1-2: Understand folder structure
2. Day 3-4: Study ML models
3. Day 5-7: Test all endpoints

### **Week 2: Frontend**
1. Day 1-2: Setup Next.js project
2. Day 3-5: Build ML components
3. Day 6-7: Integrate with backend

### **Week 3: Polish**
1. Day 1-2: UI/UX improvements
2. Day 3-4: Add more features
3. Day 5-7: Testing & deployment

---

## 📱 Mobile Testing

```bash
# Find your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Access from phone (same WiFi)
http://192.168.x.x:8000
```

---

## 🚀 Production Deployment

### **Backend (Render)**
```bash
# 1. Push to GitHub
git add .
git commit -m "Add ML features"
git push

# 2. Deploy on Render
# - Connect GitHub repo
# - Build command: pip install -r requirements_ml.txt
# - Start command: uvicorn app.main_new:app --host 0.0.0.0 --port $PORT
```

### **Frontend (Vercel)**
```bash
# 1. Build Next.js app
npm run build

# 2. Deploy
vercel

# 3. Set environment variable
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## 💡 Pro Tips

1. **Use Postman** for testing APIs (import from `/docs`)
2. **Check logs** if something fails: Server console shows detailed errors
3. **Read docs** before asking: All features are documented
4. **Start simple** then add complexity
5. **Test locally** before deploying

---

## 🎉 You're Ready!

Your ML-powered IPL Dashboard is now ready. Start building amazing features!

**Next:** Check `FRONTEND_DEVELOPMENT_GUIDE.md` for UI components.

---

**Questions?** Check the docs:
- `ML_FEATURES_GUIDE.md` - ML features
- `FRONTEND_DEVELOPMENT_GUIDE.md` - Frontend
- `PROJECT_SUMMARY.md` - Overview

