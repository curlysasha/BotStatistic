# BotStatisticMCP - Modern React Dashboard (2025-07-02)

## Project Overview
Complete redesign of BotStatisticMCP interface using modern React + shadcn/ui + Tailwind CSS stack. Successfully migrated from basic Flask templates to professional-grade dashboard with real-time statistics and interactive charts.

## Architecture Overview

### 🏗️ Tech Stack
- **Backend**: Flask API (Python 3.12) - порт 5000
- **Frontend**: React 18 + TypeScript + Vite - порт 5173  
- **UI Library**: shadcn/ui v4 components
- **Styling**: Tailwind CSS v3 (stable)
- **Charts**: Recharts library
- **CORS**: flask-cors for cross-domain requests

### 📊 API Integration
- **Real-time Data**: `/api/dashboard` endpoint
- **File Statistics**: Analysis of photo output files
- **User Analytics**: Top users, activity patterns
- **Time-based Charts**: Hourly and daily distributions

## Key Features Implemented

### ✅ Modern Dashboard Components
1. **Statistics Cards**: Total files, daily average, unique users, today's activity
2. **Interactive Charts**: Bar charts (hourly), Line charts (weekly trends), Pie charts (top users)
3. **Recent Activity Feed**: Real-time file creation monitoring
4. **Auto-refresh**: Updates every 15 minutes
5. **Loading States**: Skeleton animations and error handling

### ✅ Technical Implementation
- **Responsive Design**: Mobile-first approach, adapts 320px → 1400px
- **TypeScript**: Full type safety throughout the application
- **Component System**: Reusable shadcn/ui components (Card, Button, Chart)
- **Modern CSS**: CSS variables, dark/light theme support
- **Error Boundaries**: Graceful fallbacks when API unavailable

### ✅ Data Processing
- **File Pattern Recognition**: `output-{user}-{YYYYMMDDHH}.jpg` format
- **Date Range Filtering**: Optional start/end date parameters
- **Statistical Analysis**: Daily averages, user rankings, time distributions
- **Mock Data Fallback**: Test data for development environment

## Project Structure

```
BotStatisticMCP/
├── server.py              # Flask API backend
├── .env                   # Environment configuration
├── requirements.txt       # Python dependencies
├── start.sh              # Linux startup script
├── start.bat             # Windows startup script
├── frontend/             # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   └── Dashboard.tsx
│   │   ├── lib/utils.ts  # Utility functions
│   │   └── index.css     # Tailwind + theme variables
│   ├── vite.config.ts    # Vite configuration
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── test_data/            # Sample files for development
├── SETUP-GUIDE.md        # Installation instructions
└── CLAUDE.md            # This documentation
```

## Startup Instructions

### 🚀 Quick Start (One Command)

**Linux/WSL:**
```bash
cd /path/to/BotStatisticMCP && ./start.sh
```

**Windows:**
```cmd
cd C:\path\to\BotStatisticMCP && start.bat
```

### 📋 Manual Startup

**Terminal 1 - Flask API:**
```bash
cd /path/to/BotStatisticMCP
python3 server.py
```

**Terminal 2 - React Frontend:**
```bash
cd /path/to/BotStatisticMCP/frontend
npm run dev
```

**Access URLs:**
- React Dashboard: `http://localhost:5173`
- Flask API: `http://localhost:5000`
- API Endpoint: `http://localhost:5000/api/dashboard`

### ⚙️ Configuration

**Environment Variables (.env):**
```bash
PHOTO_FOLDER_PATH=/path/to/your/photo/files
```

**For Development:**
- Test data location: `/path/to/BotStatisticMCP/test_data`
- Sample files automatically generated with realistic naming patterns

## Development Workflow

### 🔧 Setup for New Environment
1. Follow instructions in `SETUP-GUIDE.md`
2. Install Python dependencies: `pip3 install -r requirements.txt flask-cors`
3. Install Node.js dependencies: `cd frontend && npm install`
4. Configure `.env` file with correct photo folder path
5. Start both servers using startup scripts

### 🎨 UI Development
- All shadcn/ui components available in `frontend/src/components/ui/`
- Theme customization via CSS variables in `index.css`
- Component demos and documentation via MCP servers
- TypeScript ensures type safety for all props and data

### 📊 Data Integration
- API endpoint returns JSON formatted for React components
- Date transformation for Russian locale display
- Error handling with fallback to offline mode
- Real-time updates via React hooks and fetch API

## Completed MCP Integration

### ✅ shadcn/ui MCP Server
- **Purpose**: Access to component library documentation and source code
- **Usage**: Generate Button, Card, Chart, and other UI components
- **Integration**: All components properly installed and configured

### ✅ Context7 MCP Server  
- **Purpose**: React and JavaScript library documentation
- **Usage**: Best practices, hooks patterns, TypeScript guidance
- **Integration**: Used for proper React 18 implementation

## Performance & Compatibility

### ✅ Stable Dependencies
- **Node.js 18.19.1**: WSL compatible version
- **Vite 5.4.19**: Stable build tool (not v7 which requires Node 20+)
- **Tailwind CSS v3**: Stable PostCSS setup (not v4 beta)
- **React 18.3.1**: Latest stable React with hooks

### ✅ Cross-Platform Support
- **WSL/Linux**: Bash scripts and Unix paths
- **Windows**: Batch files and Windows paths  
- **Development**: Hot reload on both platforms
- **Production**: Static build deployment ready

## Next Steps Available

### 🎯 Potential Enhancements
1. **Dark/Light Theme Toggle**: shadcn/ui theme switcher component
2. **Real-time WebSocket**: Live updates without polling
3. **Export Features**: PDF reports, CSV downloads
4. **User Drill-down**: Individual user activity pages
5. **Date Range Picker**: Interactive date selection
6. **Performance Metrics**: API response times, file processing stats

### 🚀 Production Deployment
- **Static Build**: `npm run build` for production assets
- **Nginx Setup**: Serve React static files + proxy API calls
- **Environment**: Separate dev/staging/prod configurations
- **Monitoring**: Error tracking and performance analytics

## Success Metrics
- ✅ **100% Feature Parity**: All original Flask functionality preserved
- ✅ **Modern UX**: Professional dashboard interface
- ✅ **Mobile Responsive**: Works on all device sizes
- ✅ **Type Safe**: Full TypeScript coverage
- ✅ **Component Library**: Reusable shadcn/ui system
- ✅ **Real-time Data**: Live statistics and charts
- ✅ **Cross-platform**: Linux and Windows support

Project successfully completed with modern architecture and production-ready codebase!

## Previous Project History

### BUDKA Configurator UI Redesign Project (2025-06-26)
Complete redesign of BUDKA Configurator Electron app from original basic interface to modern dark theme UI based on design.png analysis.

### BUDKA Event Launcher & S3 Synchronization System (2025-06-30)
Complete implementation of event launcher system with S3 cloud synchronization for BUDKA photo booth application.