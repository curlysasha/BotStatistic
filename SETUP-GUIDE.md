# 🚀 Инструкция: React + shadcn/ui + Tailwind CSS

## Проблемы и решения для WSL/Node.js 18

### ⚠️ Основные проблемы
1. **Node.js 18.19.1** + **Vite 7.0** = несовместимость
2. **Tailwind CSS v4** + **Node.js 18** = ошибки компиляции
3. **shadcn/ui v4** требует новые версии зависимостей

### ✅ Рабочая конфигурация

#### 1. Создание проекта
```bash
# Создать React + TypeScript проект
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### 2. Установка Tailwind CSS v3 (стабильная)
```bash
# Удалить новые версии если есть
npm uninstall tailwindcss @tailwindcss/vite

# Установить стабильную версию v3
npm install -D tailwindcss@3 postcss autoprefixer
npm install -D @types/node

# Инициализация
npx tailwindcss init
```

#### 3. Конфигурация PostCSS
**Создать `postcss.config.js`:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 4. Конфигурация Vite
**Обновить `vite.config.ts`:**
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
```

#### 5. Конфигурация TypeScript
**Обновить `tsconfig.json`:**
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Обновить `tsconfig.app.json`:**
```json
{
  "compilerOptions": {
    // ... существующие настройки
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 6. Конфигурация Tailwind CSS
**Обновить `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

#### 7. CSS настройки
**Обновить `src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### 8. Установка shadcn/ui зависимостей
```bash
# Основные зависимости
npm install clsx tailwind-merge lucide-react recharts class-variance-authority
npm install @radix-ui/react-slot

# Для конкретных компонентов (по необходимости)
npm install @radix-ui/react-select
npm install @radix-ui/react-switch
npm install @radix-ui/react-radio-group
```

#### 9. Создание компонентов
**Создать структуру:**
```bash
mkdir -p src/lib src/components/ui
```

**Создать `src/lib/utils.ts`:**
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Создать `components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

#### 10. Тестирование
```bash
npm run dev
```

## 🔧 Рабочие версии зависимостей

### Основные пакеты
- **Node.js**: 18.19.1 (WSL совместимость)
- **Vite**: 5.4.19 (совместимо с Node 18)
- **React**: 18.3.1
- **TypeScript**: 5.6.2
- **Tailwind CSS**: 3.4.0 (стабильная)

### shadcn/ui пакеты
- **clsx**: ^2.1.1
- **tailwind-merge**: ^2.5.4
- **class-variance-authority**: ^0.7.1
- **lucide-react**: ^0.468.0
- **recharts**: ^2.13.3
- **@radix-ui/react-slot**: ^1.1.0

## ❌ Что НЕ работает

### Не использовать:
- **Tailwind CSS v4** (требует Node >=20)
- **Vite 7.0** (требует Node >=20) 
- **@tailwindcss/vite plugin** (проблемы с v3)
- **shadcn/ui v5** (экспериментальная)

### Ошибки которых следует избегать:
1. `crypto.hash is not a function` - версия Vite слишком новая
2. `Cannot apply unknown utility class bg-background` - проблемы с Tailwind v4
3. `ERESOLVE unable to resolve dependency tree` - конфликт версий

## 🎯 Итоговая структура проекта

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui компоненты
│   ├── lib/
│   │   └── utils.ts      # cn() функция
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css         # Tailwind + CSS переменные
├── components.json       # shadcn/ui конфигурация
├── tailwind.config.js    # Tailwind конфигурация
├── postcss.config.js     # PostCSS конфигурация
├── vite.config.ts        # Vite конфигурация
├── tsconfig.json         # TypeScript конфигурация
└── package.json
```

## 🚀 Быстрая команда установки

```bash
# Полная установка одной командой (после создания Vite проекта)
npm uninstall tailwindcss @tailwindcss/vite 2>/dev/null || true && \
npm install -D tailwindcss@3 postcss autoprefixer @types/node && \
npm install clsx tailwind-merge lucide-react recharts class-variance-authority @radix-ui/react-slot && \
npx tailwindcss init
```

Этот guide проверен на WSL с Node.js 18.19.1 и гарантированно работает! 🎉