# 🚀 Deployment Troubleshooting Guide

## ✅ **Fixed Deployment Issues**

### **🔧 Common Deployment Problems & Solutions:**

#### **1. Port Binding Issue:**
**Problem:** `python main.py` doesn't work on cloud platforms
**Solution:** Use `uvicorn` directly with proper host and port

**Fixed Files:**
- **Procfile:** `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **render.yaml:** Updated startCommand to use uvicorn

#### **2. Python Version Issue:**
**Problem:** Python 3.13.0 not available on all platforms
**Solution:** Use stable Python 3.11.0

**Fixed:** `render.yaml` - Changed to `PYTHON_VERSION: 3.11.0`

#### **3. Dependency Issues:**
**Problem:** Some packages cause conflicts
**Solution:** Removed problematic dependencies

**Removed:**
- `python-jose[cryptography]` - Can cause SSL issues
- `passlib[bcrypt]` - Not needed for basic functionality

**Added:**
- `aiofiles==23.2.1` - For async file operations
- `Pillow==10.1.0` - For image processing

---

## 🎯 **Deployment Platforms**

### **1. Render.com:**
```yaml
# render.yaml (already configured)
services:
  - type: web
    name: ipl-backend
    env: python
    plan: free
    region: oregon
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

### **2. Heroku:**
```bash
# Procfile (already configured)
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **3. Railway:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/ml/health"
  }
}
```

### **4. Vercel:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

---

## 🔍 **Debugging Steps**

### **1. Check Build Logs:**
Look for these common errors:
- `ModuleNotFoundError` - Missing dependencies
- `Port already in use` - Port binding issue
- `Permission denied` - File permission issue

### **2. Test Locally:**
```bash
# Test with production settings
export PORT=8000
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **3. Check Dependencies:**
```bash
# Install dependencies
pip install -r requirements.txt

# Test imports
python -c "import fastapi, uvicorn, pandas; print('All imports successful')"
```

---

## 📋 **Pre-Deployment Checklist**

### **✅ Files Required:**
- [x] `main.py` - Main application
- [x] `requirements.txt` - Dependencies
- [x] `Procfile` - Process configuration
- [x] `render.yaml` - Render.com config
- [x] `ipl_data.db` - Database file
- [x] `player_images/` - Image directory

### **✅ Configuration:**
- [x] Port binding: `0.0.0.0:$PORT`
- [x] Python version: `3.11.0`
- [x] Dependencies: All required packages
- [x] Database: SQLite file included

### **✅ Testing:**
- [x] Local server starts successfully
- [x] All endpoints respond correctly
- [x] Database connections work
- [x] Image upload/download works

---

## 🚨 **Common Error Solutions**

### **Error: "Module not found"**
```bash
# Solution: Add missing dependency to requirements.txt
echo "missing-package==1.0.0" >> requirements.txt
```

### **Error: "Port already in use"**
```bash
# Solution: Use environment variable for port
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **Error: "Database not found"**
```bash
# Solution: Ensure database file is in repository
git add ipl_data.db
git commit -m "Add database file"
```

### **Error: "Permission denied"**
```bash
# Solution: Check file permissions
chmod 644 *.py
chmod 755 player_images/
```

---

## 🎯 **Quick Deploy Commands**

### **Render.com:**
```bash
# Connect to Render
git remote add render https://git.render.com/your-repo.git
git push render main
```

### **Heroku:**
```bash
# Install Heroku CLI
heroku create your-app-name
git push heroku main
```

### **Railway:**
```bash
# Install Railway CLI
railway login
railway deploy
```

---

## ✅ **Deployment Status**

**All deployment issues have been fixed:**

1. ✅ **Port Binding** - Fixed with uvicorn
2. ✅ **Python Version** - Updated to 3.11.0
3. ✅ **Dependencies** - Cleaned up requirements.txt
4. ✅ **Configuration** - Updated Procfile and render.yaml
5. ✅ **Database** - SQLite file ready for deployment

**Your app should now deploy successfully! 🚀**
