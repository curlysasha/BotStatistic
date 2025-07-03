# 🚀 BotStatisticMCP - Next.js Edition

Современный дашборд для статистики файлов, построенный на **Next.js 15** + **shadcn/ui** + **TypeScript**.

## ✨ Особенности

- **🔥 Next.js 15** - Latest App Router с Server Components
- **🎨 shadcn/ui** - Современные UI компоненты 
- **📊 Recharts** - Интерактивные графики
- **🌙 Dark/Light Mode** - Переключение темы
- **📱 Responsive** - Адаптивный дизайн
- **⚡ TypeScript** - Полная типизация
- **🔄 Real-time** - Автообновление каждые 15 минут

## 🚀 Быстрый старт

### Запуск одной командой:
```bash
npm run dev
```

**Готово!** Откройте http://localhost:3000

## 📁 Структура проекта

```
next-app/
├── src/
│   ├── app/
│   │   ├── api/dashboard/         # API эндпоинт
│   │   ├── globals.css           # Стили + shadcn переменные
│   │   ├── layout.tsx            # Основной лейаут
│   │   └── page.tsx              # Главная страница
│   ├── components/
│   │   ├── ui/                   # shadcn/ui компоненты
│   │   └── Dashboard.tsx         # Главный компонент дашборда
│   └── lib/
│       ├── utils.ts              # Утилиты (cn функция)
│       └── file-processor.ts     # Логика анализа файлов
├── .env.local                    # Настройки окружения
├── components.json               # Конфигурация shadcn/ui
└── tailwind.config.js            # Настройки Tailwind
```

## ⚙️ Конфигурация

### Environment Variables (.env.local):
```bash
PHOTO_FOLDER_PATH=../test_data
```

## 🔧 API

### GET /api/dashboard
Возвращает статистику файлов в формате:
```typescript
{
  totalFiles: number
  dailyAvg: number
  topUsers: Array<{ name: string; count: number }>
  hourlyData: Array<{ hour: string; files: number }>
  dailyData: Array<{ date: string; files: number }>
  recentActivity: Array<{ user: string; time: string; action: string }>
  summary: {
    uniqueUsers: number
    totalInteractions: number
    weekData: number[]
  }
}
```

## 🔄 Миграция с Flask

Вся логика анализа файлов перенесена в:
- `src/lib/file-processor.ts` - JavaScript версия Python кода
- `src/app/api/dashboard/route.ts` - API endpoint вместо Flask

**Преимущества Next.js версии:**
- ✅ **Одна команда запуска** - `npm run dev`
- ✅ **Современный UI** - shadcn/ui компоненты
- ✅ **TypeScript** - полная типизация
- ✅ **Hot Reload** - мгновенное обновление
- ✅ **Единый деплой** - статика + API в одном месте

---

**🎉 Готово!** Теперь у вас полнофункциональный дашборд на современном стеке!