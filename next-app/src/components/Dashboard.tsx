'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { 
  Activity, Users, FileText, TrendingUp, Calendar, Clock, BarChart3, 
  RefreshCw, Sun, Moon
} from 'lucide-react'

interface DashboardData {
  totalFiles: number
  dailyAvg: number
  topUsers: Array<{ name: string; count: number }>
  hourlyData: Array<{ hour: string; files: number }>
  dailyData: Array<{ date: string; files: number; users: number }>
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
  last7Days?: Array<[string, number, number]>
}

const chartConfig = {
  files: {
    label: "Файлы",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "Пользователи", 
    color: "hsl(var(--chart-2))",
  },
  activity: {
    label: "Активность",
    color: "hsl(var(--chart-3))",
  }
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const apiData = await response.json()
      
      const transformedData: DashboardData = {
        totalFiles: apiData.totalFiles || 0,
        dailyAvg: apiData.dailyAvg || 0,
        topUsers: apiData.topUsers || [],
        hourlyData: apiData.hourlyData || [],
        dailyData: (apiData.dailyData || []).map((item: any) => ({
          date: item.date, // Keep original date string from API
          files: item.files,
          users: item.users || 0
        })),
        recentActivity: apiData.recentActivity || [],
        dateRange: apiData.dateRange || {},
        summary: apiData.summary || { uniqueUsers: 0, totalInteractions: 0, weekData: [] },
        last7Days: apiData.last7Days || []
      }
      
      setData(transformedData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      
      const mockData: DashboardData = {
        totalFiles: 0,
        dailyAvg: 0,
        topUsers: [],
        hourlyData: [],
        dailyData: [],
        recentActivity: [
          { user: "API недоступен", time: "сейчас", action: "Используются тестовые данные" }
        ],
        dateRange: {},
        summary: { uniqueUsers: 0, totalInteractions: 0, weekData: [] }
      }
      
      setData(mockData)
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Всего файлов",
      value: data?.totalFiles.toLocaleString() || "0",
      icon: FileText,
      color: "text-blue-500"
    },
    {
      title: "Среднее в день",
      value: data?.dailyAvg.toString() || "0",
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "Уникальных пользователей",
      value: data?.summary.uniqueUsers.toString() || "0",
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "Сегодня",
      value: data?.dailyData[data.dailyData.length - 1]?.files.toString() || "0",
      icon: TrendingUp,
      color: "text-orange-500"
    }
  ]

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
        <div className="flex gap-2">
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
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
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Chart - Динамика загрузок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Динамика загрузок
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full h-[400px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <LineChart data={data?.dailyData || []} width="100%" height="100%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis fontSize={12} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line 
                  type="monotone" 
                  dataKey="files" 
                  stroke="var(--color-files)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-files)', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="var(--color-users)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-users)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Распределение по часам
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full h-[300px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart data={data?.hourlyData || []} width="100%" height="100%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="files" fill="var(--color-files)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Day of Week Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Активность по дням недели
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full h-[300px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart data={data?.summary.weekData.map((count, index) => ({
                  day: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index],
                  files: count
                })) || []} width="100%" height="100%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="files" fill="var(--color-activity)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Last 7 Days Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Последние 7 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Файлы</TableHead>
                  <TableHead>Пользователи</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.last7Days?.map(([date, files, users], index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {new Date(date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>{files}</TableCell>
                    <TableCell>{users}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Топ пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Файлы</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.topUsers?.map((user, index) => (
                  <TableRow 
                    key={index}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => alert(`Детали пользователя: ${user.name}\nФайлов: ${user.count}`)}
                  >
                    <TableCell className="font-medium text-blue-600 hover:text-blue-800">
                      {user.name}
                    </TableCell>
                    <TableCell>{user.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}