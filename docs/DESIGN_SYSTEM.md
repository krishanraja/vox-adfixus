# Design System

## Brand Colors

Defined in `src/index.css` using HSL color tokens:

```css
:root {
  /* Primary: AdFixus Brand Blue */
  --primary: 214.3 93.9% 41.8%;
  --primary-foreground: 0 0% 100%;
  
  /* Accent: Success Green */
  --accent: 142 76% 36%;
  --accent-foreground: 0 0% 100%;
  
  /* Semantic Colors */
  --success: 142 76% 36%;      /* Green - positive outcomes */
  --warning: 38 92% 50%;       /* Amber - caution states */
  --destructive: 0 84% 60%;    /* Red - errors */
  
  /* Neutral Palette */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  /* Cards & Surfaces */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
}
```

## Typography

```css
/* Font Stack */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## Component Library

Based on **shadcn/ui** (Radix primitives + Tailwind):

| Component | Location | Usage |
|-----------|----------|-------|
| Button | `ui/button.tsx` | Actions, CTAs |
| Card | `ui/card.tsx` | Content containers |
| Slider | `ui/slider.tsx` | CPM, assumption inputs |
| Select | `ui/select.tsx` | Dropdowns |
| Dialog | `ui/dialog.tsx` | Modals (lead capture) |
| Collapsible | `ui/collapsible.tsx` | Expandable sections |
| Toast | `ui/toast.tsx` | Notifications |
| Tooltip | `ui/tooltip.tsx` | Info hovers |
| Badge | `ui/badge.tsx` | Labels, tags |
| Progress | `ui/progress.tsx` | Percentage bars |
| Tabs | `ui/tabs.tsx` | View switching |

## Spacing Scale

```css
/* Tailwind defaults */
space-1: 0.25rem  /* 4px */
space-2: 0.5rem   /* 8px */
space-3: 0.75rem  /* 12px */
space-4: 1rem     /* 16px */
space-6: 1.5rem   /* 24px */
space-8: 2rem     /* 32px */
```

## Layout Patterns

### Page Container
```tsx
<div className="container mx-auto max-w-6xl px-4 py-8">
```

### Card Grid
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Gradient Backgrounds
```tsx
// Primary gradient (hero cards)
className="bg-gradient-to-br from-primary/5 to-accent/5"

// Success gradient (ROI cards)
className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20"
```

## Chart Styling (Recharts)

```tsx
// Line colors
Primary line: "#3b82f6"     // Blue
Secondary line: "#10b981"   // Green
Reference line: "#f59e0b"   // Orange

// Grid
<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
```

## Icons (Lucide React)

```tsx
import { 
  DollarSign,     // Revenue
  TrendingUp,     // Growth/ROI
  Calendar,       // Time periods
  Download,       // Export
  RefreshCw,      // Reset
  Settings,       // Configuration
  Info,           // Tooltips
  ChevronDown,    // Expand
  Calculator,     // Calculations
  Building,       // Enterprise
  Users,          // Team/Org
} from 'lucide-react';
```

## Dark Mode

Automatic theme detection via `next-themes`:

```tsx
// Theme toggle handled by system preference
// Dark mode tokens defined in :root.dark
```

## Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## Animation

```css
/* Transitions */
transition-colors: 150ms ease
transition-all: 300ms ease

/* Chart animations */
animationDuration: 500ms
```
