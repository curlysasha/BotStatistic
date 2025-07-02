import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Activity, Users, FileText, TrendingUp, Calendar, Clock, BarChart3, RefreshCw } from 'lucide-react'

interface StatCard {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

interface DashboardData {
  totalFiles: number
  dailyAvg: number
  topUsers: Array<{ name: string; count: number }>
  hourlyData: Array<{ hour: string; files: number }>
  dailyData: Array<{ date: string; files: number }>
  recentActivity: Array<{ user: string; time: string; action: string }>
}

const chartConfig = {
  files: {
    label: "Файлы",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "Пользователи", 
    color: "hsl(var(--chart-2))",
  }
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchData = async () => {
    setLoading(true)
    try {
      // Имитация API запроса - заменим на реальный позже
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: DashboardData = {
        totalFiles: 1247,
        dailyAvg: 89,
        topUsers: [
          { name: "user_001", count: 156 },
          { name: "user_002", count: 134 },
          { name: "user_003", count: 98 },
          { name: "user_004", count: 87 },
          { name: "user_005", count: 73 }
        ],
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          files: Math.floor(Math.random() * 50) + 10
        })),
        dailyData: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { 
            month: 'short', 
            day: 'numeric' 
          }),
          files: Math.floor(Math.random() * 100) + 50
        })),
        recentActivity: [
          { user: "user_001", time: "2 мин назад", action: "Создал файл output-001-1234567890.jpg" },
          { user: "user_002", time: "5 мин назад", action: "Создал файл output-002-1234567880.png" },
          { user: "user_003", time: "8 мин назад", action: "Создал файл output-003-1234567870.jpg" },
          { user: "user_001", time: "12 мин назад", action: "Создал файл output-001-1234567860.png" },
          { user: "user_004", time: "15 мин назад", action: "Создал файл output-004-1234567850.jpg" }
        ]
      }
      
      setData(mockData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Автоматическое обновление каждые 15 минут
    const interval = setInterval(fetchData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const statCards: StatCard[] = [
    {
      title: "Всего файлов",
      value: data?.totalFiles.toLocaleString() || "0",
      icon: FileText,
      change: "+12.5%",
      trend: "up"
    },
    {
      title: "Среднее в день",
      value: data?.dailyAvg.toString() || "0",
      icon: Activity,
      change: "+8.2%", 
      trend: "up"
    },
    {
      title: "Активных пользователей",
      value: data?.topUsers.length.toString() || "0",
      icon: Users,
      change: "-2.1%",
      trend: "down"
    },
    {
      title: "Сегодня",
      value: data?.dailyData[data.dailyData.length - 1]?.files.toString() || "0",
      icon: TrendingUp,
      change: "+15.3%",
      trend: "up"
    }
  ]

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Статистика файлов</h1>
          <p className="text-muted-foreground">
            Последнее обновление: {lastUpdate.toLocaleString('ru-RU')}
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    'text-muted-foreground'
                  } flex items-center gap-1`}>
                    <TrendingUp className={`h-3 w-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    {stat.change} за неделю
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Распределение по часам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={data?.hourlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="files" fill="var(--color-files)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Тренд за неделю
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={data?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="files" 
                  stroke="var(--color-files)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-files)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Топ пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={data?.topUsers || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                >
                  {data?.topUsers.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Последняя активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}