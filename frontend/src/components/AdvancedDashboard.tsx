import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { 
  Activity, Users, FileText, TrendingUp, Calendar, Clock, BarChart3, 
  RefreshCw, Download, Filter, Sun, Moon, ChevronDown
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'

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

interface UserActivityData {
  user_id: string
  total_files: number
  daily_activity: Array<[string, number]>
  hourly_distribution: number[]
  day_of_week_distribution: number[]
}

interface DateFilter {
  startDate: string
  endDate: string
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

export function AdvancedDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [dateFilter, setDateFilter] = useState<DateFilter>({ startDate: '', endDate: '' })
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivityData | null>(null)
  const [dayModalData, setDayModalData] = useState<{ date: string; hourly: number[] } | null>(null)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)

  const fetchData = async (startDate?: string, endDate?: string) => {
    setLoading(true)
    try {
      let url = 'http://localhost:5000/api/dashboard'
      const params = []
      if (startDate) params.push(`start_date=${startDate}`)
      if (endDate) params.push(`end_date=${endDate}`)
      if (params.length > 0) url += '?' + params.join('&')

      const response = await fetch(url)
      
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
          date: new Date(item.date).toLocaleDateString('ru-RU', { 
            month: 'short', 
            day: 'numeric' 
          }),
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

  const fetchUserActivity = async (userId: string) => {
    try {
      let url = `/api/user_activity/${userId}`
      const params = []
      if (dateFilter.startDate) params.push(`start_date=${dateFilter.startDate}`)
      if (dateFilter.endDate) params.push(`end_date=${dateFilter.endDate}`)
      if (params.length > 0) url += '?' + params.join('&')

      const response = await fetch(`http://localhost:5000${url}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const userData = await response.json()
      setUserActivity(userData)
      setSelectedUser(userId)
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error)
    }
  }

  const fetchDayDetail = async (date: string) => {
    try {
      const response = await fetch(`http://localhost:5000/day/${date}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const dayData = await response.json()
      setDayModalData({ date, hourly: dayData.hourly })
    } catch (error) {
      console.error('Ошибка загрузки данных дня:', error)
    }
  }

  const applyDateFilter = () => {
    fetchData(dateFilter.startDate, dateFilter.endDate)
    setIsDateFilterOpen(false)
  }

  const setQuickFilter = (type: 'last7' | 'last14' | 'thisMonth' | 'allTime') => {
    const today = new Date()
    let start = '', end = ''

    switch (type) {
      case 'last7':
        start = format(subDays(today, 6), 'yyyy-MM-dd')
        end = format(today, 'yyyy-MM-dd')
        break
      case 'last14':
        start = format(subDays(today, 13), 'yyyy-MM-dd')
        end = format(today, 'yyyy-MM-dd')
        break
      case 'thisMonth':
        start = format(startOfMonth(today), 'yyyy-MM-dd')
        end = format(endOfMonth(today), 'yyyy-MM-dd')
        break
      case 'allTime':
        start = ''
        end = ''
        break
    }

    setDateFilter({ startDate: start, endDate: end })
    fetchData(start, end)
    setIsDateFilterOpen(false)
  }

  const exportToExcel = () => {
    let url = 'http://localhost:5000/export'
    const params = []
    if (dateFilter.startDate) params.push(`start_date=${dateFilter.startDate}`)
    if (dateFilter.endDate) params.push(`end_date=${dateFilter.endDate}`)
    if (params.length > 0) url += '?' + params.join('&')
    
    window.open(url, '_blank')
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
    
    fetchData()
    
    const interval = setInterval(() => fetchData(dateFilter.startDate, dateFilter.endDate), 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Всего файлов",
      value: data?.totalFiles.toLocaleString() || "0",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Среднее в день",
      value: data?.dailyAvg.toString() || "0",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Уникальных пользователей",
      value: data?.summary.uniqueUsers.toString() || "0",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Сегодня",
      value: data?.dailyData[data.dailyData.length - 1]?.files.toString() || "0",
      icon: TrendingUp,
      color: "text-orange-600"
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-none xl:max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Расширенная статистика файлов</h1>
          <p className="text-muted-foreground">
            Последнее обновление: {lastUpdate.toLocaleString('ru-RU')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 button-group">
          <Button onClick={toggleTheme} variant="outline" size="icon" className="sm:w-auto">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Dialog open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 sm:w-auto">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Фильтр по дате</span>
                <span className="sm:hidden">Фильтр</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Фильтр по дате</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Начальная дата</label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Конечная дата</label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full p-2 border rounded-md mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setQuickFilter('last7')}>7 дней</Button>
                  <Button variant="outline" onClick={() => setQuickFilter('last14')}>14 дней</Button>
                  <Button variant="outline" onClick={() => setQuickFilter('thisMonth')}>Этот месяц</Button>
                  <Button variant="outline" onClick={() => setQuickFilter('allTime')}>Весь период</Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={applyDateFilter} className="flex-1">Применить</Button>
                  <Button variant="outline" onClick={() => setIsDateFilterOpen(false)} className="flex-1 sm:flex-none">Отмена</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => fetchData(dateFilter.startDate, dateFilter.endDate)} disabled={loading} className="gap-2 sm:w-auto">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Обновить</span>
            <span className="sm:hidden">↻</span>
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="gap-2 sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
            <span className="sm:hidden">↓</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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

      {/* Main Chart */}
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
              Распределение по дням недели
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
                  <XAxis 
                    dataKey="day" 
                    fontSize={12}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="files" fill="var(--color-users)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Last 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Последние 7 дней
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="table-container">
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
                    <TableCell>
                      <button 
                        onClick={() => fetchDayDetail(date)}
                        className="text-blue-600 hover:underline"
                      >
                        {date}
                      </button>
                    </TableCell>
                    <TableCell>{files}</TableCell>
                    <TableCell>{users}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Нет данных за последние 7 дней
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Топ пользователей ({data?.dateRange.effectiveStart || 'начало'} - {data?.dateRange.effectiveEnd || 'конец'})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead className="text-right">Файлов</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {data?.topUsers?.slice(0, 10).map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <button 
                        onClick={() => fetchUserActivity(user.name)}
                        className="text-primary hover:underline font-medium"
                      >
                        {user.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-right font-mono">{user.count}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Нет данных о пользователях
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="dialog-wide overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">📊 Статистика пользователя: {selectedUser}</DialogTitle>
          </DialogHeader>
          {userActivity && (
            <div className="space-y-4">
              {/* Stats Summary */}
              <div className="flex items-center justify-center gap-8 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Всего файлов</p>
                  <p className="text-2xl font-bold text-primary">{userActivity.total_files}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Период</p>
                  <p className="text-sm font-medium">{dateFilter.startDate || 'начало'} - {dateFilter.endDate || 'конец'}</p>
                </div>
              </div>
              
              {/* Main Daily Chart - Full Width */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Динамика активности по дням
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full h-[250px]">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <LineChart 
                        data={userActivity.daily_activity.map(([date, count]) => ({ 
                          date: new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }), 
                          files: count 
                        }))} 
                        width="100%" 
                        height="100%"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={10}
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          dataKey="files" 
                          stroke="var(--color-files)" 
                          strokeWidth={3}
                          dot={{ fill: 'var(--color-files)', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Two Charts Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4" />
                      Распределение по часам
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="w-full h-[220px]">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart 
                          data={userActivity.hourly_distribution.map((count, hour) => ({ 
                            hour: `${hour.toString().padStart(2, '0')}:00`, 
                            files: count 
                          }))} 
                          width="100%" 
                          height="100%"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="hour" 
                            fontSize={8}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                          />
                          <YAxis fontSize={8} tick={{ fontSize: 8 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="files" fill="var(--color-files)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4" />
                      По дням недели
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="w-full h-[220px]">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart 
                          data={userActivity.day_of_week_distribution.map((count, index) => ({ 
                            day: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index], 
                            files: count 
                          }))} 
                          width="100%" 
                          height="100%"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="day" 
                            fontSize={10}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis fontSize={8} tick={{ fontSize: 8 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="files" fill="var(--color-users)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Detail Modal */}
      <Dialog open={!!dayModalData} onOpenChange={() => setDayModalData(null)}>
        <DialogContent className="dialog-medium">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              📊 Детализация за {dayModalData?.date}
            </DialogTitle>
          </DialogHeader>
          {dayModalData && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Всего файлов за день</p>
                <p className="text-xl font-bold text-primary">
                  {dayModalData.hourly.reduce((sum, count) => sum + count, 0)}
                </p>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Активность по часам
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full h-[350px]">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <LineChart 
                        data={dayModalData.hourly.map((count, hour) => ({ 
                          hour: `${hour.toString().padStart(2, '0')}:00`, 
                          files: count 
                        }))} 
                        width="100%" 
                        height="100%"
                      >
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
                        <Line 
                          dataKey="files" 
                          stroke="var(--color-files)" 
                          strokeWidth={3}
                          dot={{ fill: 'var(--color-files)', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}