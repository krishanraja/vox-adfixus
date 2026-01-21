# Design System

## Brand Colors

All colors use HSL format and are defined in `src/index.css`:

```css
:root {
  /* Primary: AdFixus Brand Blue */
  --primary: 214.3 93.9% 41.8%;
  --primary-foreground: 0 0% 100%;
  
  /* Secondary: Neutral Gray */
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  /* Accent: Success Green */
  --accent: 142 76% 36%;
  --accent-foreground: 0 0% 100%;
  
  /* Semantic Colors */
  --success: 142 76% 36%;      /* Green - positive outcomes, ROI */
  --warning: 38 92% 50%;       /* Amber - caution, moderate scenarios */
  --destructive: 0 84% 60%;    /* Red - errors, negative values */
  
  /* Neutral Palette */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  /* Cards & Surfaces */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  
  /* Form Elements */
  --input: 214.3 31.8% 91.4%;
  --ring: 214.3 93.9% 41.8%;
}
```

### Dark Mode

Dark mode tokens (automatic via system preference):

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --primary: 214.3 93.9% 51.8%;
  --primary-foreground: 0 0% 100%;
}
```

---

## Typography

```css
/* Font Stack */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Scale (Tailwind defaults) */
text-xs:   0.75rem   /* 12px */
text-sm:   0.875rem  /* 14px */
text-base: 1rem      /* 16px */
text-lg:   1.125rem  /* 18px */
text-xl:   1.25rem   /* 20px */
text-2xl:  1.5rem    /* 24px */
text-3xl:  1.875rem  /* 30px */
text-4xl:  2.25rem   /* 36px */
```

### Usage Patterns

| Element | Class | Example |
|---------|-------|---------|
| Page Title | `text-2xl font-bold` | "Incremental Revenue to Vox" |
| Section Header | `text-lg font-semibold` | "ID Infrastructure" |
| Card Title | `text-base font-medium` | "Monthly Incremental Revenue" |
| Body Text | `text-sm text-muted-foreground` | Descriptions, help text |
| Large Numbers | `text-3xl font-bold text-primary` | "$82,998" |
| Labels | `text-xs font-medium uppercase` | "MONTHLY" |

---

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
| RadioGroup | `ui/radio-group.tsx` | Risk scenario selection |
| Alert | `ui/alert.tsx` | Warnings, info boxes |
| Separator | `ui/separator.tsx` | Horizontal dividers |

---

## Spacing Scale

```css
/* Tailwind defaults */
space-1:  0.25rem  /* 4px */
space-2:  0.5rem   /* 8px */
space-3:  0.75rem  /* 12px */
space-4:  1rem     /* 16px */
space-6:  1.5rem   /* 24px */
space-8:  2rem     /* 32px */
space-12: 3rem     /* 48px */
```

---

## Layout Patterns

### Page Container

```tsx
<div className="container mx-auto max-w-6xl px-4 py-8">
```

### Card Grid (3-column)

```tsx
<div className="grid md:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Card Grid (2-column)

```tsx
<div className="grid md:grid-cols-2 gap-6">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Gradient Backgrounds

```tsx
// Hero/Summary card
className="bg-gradient-to-br from-primary/5 to-accent/5"

// Success/ROI card
className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"

// Warning/Caution card
className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20"
```

---

## Chart Styling (Recharts)

```tsx
// Colors
const CHART_COLORS = {
  primary: '#3b82f6',      // Blue - revenue
  secondary: '#10b981',    // Green - ROI
  reference: '#f59e0b',    // Orange - reference lines
  grid: 'currentColor',    // Adapts to theme
};

// Grid
<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

// Axes
<XAxis 
  dataKey="monthLabel" 
  tick={{ fontSize: 12 }}
  stroke="currentColor"
/>

// Dual Y-Axis
<YAxis yAxisId="revenue" orientation="left" />
<YAxis yAxisId="roi" orientation="right" />
```

---

## Icons (Lucide React)

Common icons used throughout:

```tsx
import { 
  // Revenue/Money
  DollarSign,
  TrendingUp,
  PiggyBank,
  
  // Time
  Calendar,
  Clock,
  
  // Actions
  Download,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
  
  // Info
  Info,
  AlertCircle,
  CheckCircle,
  
  // Business
  Calculator,
  Building,
  Users,
  Briefcase,
  Target,
  
  // Charts
  LineChart,
  BarChart,
  
  // Technical
  Code,
  Sliders,
} from 'lucide-react';
```

---

## Card Variants

### Standard Card

```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

### Highlight Card (Green Border)

```tsx
<Card className="p-6 border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
```

### Metric Card (Centered)

```tsx
<div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border-2 border-green-400">
  <div className="text-sm text-muted-foreground mb-2">Label</div>
  <div className="text-6xl font-bold text-green-600">5.5x</div>
  <div className="text-xs text-muted-foreground">Subtitle</div>
</div>
```

---

## Button Variants

```tsx
// Primary (default)
<Button>Primary Action</Button>

// Secondary/Outline
<Button variant="outline">Secondary Action</Button>

// Ghost (minimal)
<Button variant="ghost">Ghost Button</Button>

// With Icon
<Button className="gap-2">
  <Download className="h-4 w-4" />
  Download PDF
</Button>

// Large
<Button size="lg">Large Button</Button>
```

---

## Badge Variants

```tsx
// Default
<Badge>Default</Badge>

// Success
<Badge className="bg-green-500 text-white">Best Value</Badge>

// Warning
<Badge className="bg-amber-500 text-white">POC Phase</Badge>

// Outline
<Badge variant="outline">Outline</Badge>
```

---

## Animation & Transitions

```css
/* Transitions */
transition-colors: 150ms ease
transition-all: 300ms ease

/* Progress bar fills */
className="transition-all duration-500"

/* Chart animations (Recharts) */
animationDuration={500}

/* Collapsible animations */
data-[state=open]:animate-collapsible-down
data-[state=closed]:animate-collapsible-up
```

---

## Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Responsive Patterns

```tsx
// Hide on mobile
className="hidden md:block"

// Show only on mobile
className="md:hidden"

// Responsive grid
className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"

// Responsive text
className="text-2xl md:text-3xl lg:text-4xl"
```

---

## PDF Styling

PDF uses pdfmake, not Tailwind. Key styles:

```typescript
styles: {
  h1: { fontSize: 18, bold: true, color: '#0F172A' },
  h2: { fontSize: 14, bold: true, color: '#1E293B' },
  h3: { fontSize: 12, bold: true, color: '#1E293B' },
  body: { fontSize: 10, color: '#475569', lineHeight: 1.4 },
  tableHeader: { fontSize: 9, bold: true, color: '#1E293B', alignment: 'center' },
  tableCell: { fontSize: 9, color: '#475569' },
  metricValue: { fontSize: 14, bold: true, color: '#1E293B' },
  footnote: { fontSize: 7, color: '#94A3B8', italics: true },
  disclaimerBox: { fontSize: 8, color: '#64748B' },
}
```
