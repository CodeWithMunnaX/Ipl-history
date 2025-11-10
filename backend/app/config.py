"""
Configuration settings for IPL Dashboard API
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database
DB_PATH = os.path.join(BASE_DIR, 'ipl_data.db')

# Image upload settings
UPLOAD_DIR = os.path.join(BASE_DIR, "player_images")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create directories
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ML Model settings
ML_MODELS_DIR = os.path.join(BASE_DIR, "app", "ml", "trained_models")
os.makedirs(ML_MODELS_DIR, exist_ok=True)

# API Settings
API_TITLE = "IPL Dashboard API with ML"
API_VERSION = "2.0.0"
API_DESCRIPTION = "Advanced IPL Analytics Platform with Machine Learning Predictions"

# CORS Settings
CORS_ORIGINS = ["*"]

# Cache settings
CACHE_ENABLED = True
CACHE_TTL = 3600  # 1 hour

