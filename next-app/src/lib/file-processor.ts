import fs from 'fs'
import path from 'path'

export interface FileStats {
  user: string
  date: Date
  filename: string
  hour: number
}

export interface DashboardData {
  totalFiles: number
  dailyAvg: number
  topUsers: Array<{ name: string; count: number }>
  hourlyData: Array<{ hour: string; files: number }>
  dailyData: Array<{ date: string; files: number }>
  recentActivity: Array<{ user: string; time: string; action: string }>
  dateRange: {
    start?: string
    end?: string
    effectiveStart?: string
    effectiveEnd?: string
  }
  summary: {
    uniqueUsers: number
    totalInteractions: number
    weekData: number[]
  }
}

export function analyzeFiles(folderPath: string): DashboardData {
  try {
    if (!fs.existsSync(folderPath)) {
      return getEmptyData()
    }

    const files = fs.readdirSync(folderPath)
    const pattern = /^output-(.+)-(\d{14})\.jpg$/

    const stats: FileStats[] = files
      .filter(f => pattern.test(f))
      .map(filename => {
        const match = filename.match(pattern)
        if (!match) return null
        
        const [, user, timestamp] = match
        const year = parseInt(timestamp.slice(0, 4))
        const month = parseInt(timestamp.slice(4, 6)) - 1
        const day = parseInt(timestamp.slice(6, 8))
        const hour = parseInt(timestamp.slice(8, 10))
        const minute = parseInt(timestamp.slice(10, 12))
        const second = parseInt(timestamp.slice(12, 14))
        
        return {
          user,
          date: new Date(year, month, day, hour, minute, second),
          filename,
          hour
        }
      })
      .filter(Boolean) as FileStats[]

    return processStats(stats)
  } catch (error) {
    console.error('Error analyzing files:', error)
    return getEmptyData()
  }
}

function processStats(stats: FileStats[]): DashboardData {
  const totalFiles = stats.length
  
  // Top users
  const userCounts = stats.reduce((acc, stat) => {
    acc[stat.user] = (acc[stat.user] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topUsers = Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Hourly data
  const hourCounts = Array.from({ length: 24 }, (_, i) => ({ 
    hour: `${i.toString().padStart(2, '0')}:00`, 
    files: 0 
  }))
  
  stats.forEach(stat => {
    hourCounts[stat.hour].files++
  })

  // Daily data (last 7 days)
  const now = new Date()
  const dailyData = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayFiles = stats.filter(stat => 
      stat.date.toISOString().split('T')[0] === dateStr
    ).length

    dailyData.push({
      date: date.toLocaleDateString('ru-RU', { 
        month: 'short', 
        day: 'numeric' 
      }),
      files: dayFiles
    })
  }

  // Recent activity
  const recentActivity = stats
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)
    .map(stat => ({
      user: stat.user,
      time: stat.date.toLocaleString('ru-RU'),
      action: `Создан файл ${stat.filename}`
    }))

  const dailyAvg = Math.round(totalFiles / Math.max(7, 1))
  const uniqueUsers = Object.keys(userCounts).length

  return {
    totalFiles,
    dailyAvg,
    topUsers,
    hourlyData: hourCounts,
    dailyData,
    recentActivity,
    dateRange: {
      effectiveStart: stats.length > 0 ? stats[0].date.toISOString() : undefined,
      effectiveEnd: stats.length > 0 ? stats[stats.length - 1].date.toISOString() : undefined
    },
    summary: {
      uniqueUsers,
      totalInteractions: totalFiles,
      weekData: dailyData.map(d => d.files)
    }
  }
}

function getEmptyData(): DashboardData {
  return {
    totalFiles: 0,
    dailyAvg: 0,
    topUsers: [],
    hourlyData: Array.from({ length: 24 }, (_, i) => ({ 
      hour: `${i.toString().padStart(2, '0')}:00`, 
      files: 0 
    })),
    dailyData: [],
    recentActivity: [
      { user: "Система", time: new Date().toLocaleString('ru-RU'), action: "Нет данных для отображения" }
    ],
    dateRange: {},
    summary: {
      uniqueUsers: 0,
      totalInteractions: 0,
      weekData: []
    }
  }
}