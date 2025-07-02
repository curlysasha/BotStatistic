# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BotStatisticMCP is a Flask-based web application for analyzing and visualizing file statistics from photo generation activities. The application processes files with pattern `output-{user_id}-{timestamp}.{ext}` and provides comprehensive analytics through a modern multi-theme dashboard.

## Technology Stack

- **Backend**: Python 3.10 with Flask
- **Frontend**: HTML5, CSS3, JavaScript with Chart.js
- **Data Processing**: Pandas, NumPy
- **Styling**: Bootstrap 5 + Custom CSS with glassmorphism effects
- **Configuration**: python-dotenv

## Development Commands

### Setup
```bash
python -m venv venv
source venv/bin/activate          # Linux/Mac
# call venv/Scripts/activate.bat  # Windows
pip install -r requirements.txt
```

### Running the Application
```bash
python server.py
```
Server runs on `0.0.0.0:5000` with debug mode enabled.

## Configuration

Required environment variable in `.env`:
- `PHOTO_FOLDER_PATH`: Path to directory containing files to analyze
- Defaults to `/home/iservice4070/NeuroAvatar/outputs` if not set

## Architecture

### Core Components

**server.py** (347 lines): Main Flask application handling:
- File pattern recognition and parsing
- Statistical calculations and aggregations
- API endpoints for dashboard data
- Excel export functionality

**templates/detailed_report.html** (1124 lines): Advanced dashboard featuring:
- Multi-theme system (Light/Dark with 3 design variants)
- Interactive Chart.js visualizations
- Real-time updates every 15 minutes
- Responsive design with glassmorphism effects

### Key Features

1. **File Analysis Engine**: Processes files matching `output-{user_id}-{timestamp}.{ext}` pattern
2. **Multi-dimensional Statistics**: Daily, hourly, weekly, and user-based aggregations
3. **Advanced UI**: Theme switching, real-time updates, mobile-responsive
4. **Export Capabilities**: Excel export with date range filtering

### API Endpoints

- `/` - Main dashboard
- `/export` - Excel export with date filtering
- `/day/<date>` - Hourly breakdown for specific date
- `/api/user_activity/<user_id>` - Individual user analytics
- `/server_time` - Real-time server updates

### Data Processing Pipeline

The application uses defaultdict and Counter for efficient aggregation of:
- Daily file counts and user activity
- Hourly distribution patterns
- Weekly trends and user rankings
- Date range filtering with inclusive/exclusive boundaries

### Frontend Architecture

- **CSS Custom Properties**: Comprehensive theming system with design tokens
- **JavaScript Modules**: Chart management, theme switching, API integration
- **Performance**: Hardware-accelerated animations, efficient DOM updates
- **Accessibility**: High contrast themes, responsive breakpoints

## Current Development Status

Active branch: `feat/dashboard-revamp-stats` contains major UI/UX improvements including:
- Multi-theme implementation
- Enhanced visual design with glassmorphism
- Real-time features and interactive elements

## File Structure

```
/
├── server.py              # Main Flask application
├── requirements.txt       # Python dependencies
├── templates/
│   └── detailed_report.html  # Dashboard template
├── .env                   # Configuration
└── .python-version        # Python 3.10
```