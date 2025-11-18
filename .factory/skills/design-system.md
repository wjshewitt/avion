# FlightChat Design System Guidelines

## Avion Design Language

### Core Philosophy
"Less, but better" - Every element justifies its existence through function, not decoration.

### Color System
- **Ceramic Material** (#F4F4F4) - Light mode surface
- **Tungsten** (#1A1A1A) - Dark mode surface
- **Safety Orange** (#F04E30) - ONLY for active states, critical alerts, and primary CTAs
- **Typography**: Inter for UI text, JetBrains Mono for data/metrics

### Typography Hierarchy
- Use Inter font family throughout the application
- JetBrains Mono reserved for flight data, weather codes, and technical metrics
- Typography creates hierarchy naturally through size and weight variations

### Elevation and Shadows
- Use `box-shadow` to indicate physical depth and elevation
- Shadows are functional, not decorative
- Consistent elevation patterns for modals, dropdowns, and cards

### Animation Guidelines
- Fast, purposeful animations (150-300ms)
- Never bouncy or overly decorative
- Motion provides meaning and user feedback

## Component Usage

### shadcn/ui Components
Located in `components/ui/`:

#### Buttons
- Use `Button` component for all clickable actions
- Safety Orange variant only for primary/critical actions
- Implement proper loading states with `loading` prop

#### Forms
- Use `Input`, `Textarea`, `Select` components
- Integrate with react-hook-form and Zod validation
- Follow existing form patterns in compliance and flight modules

#### Cards and Layout
- Use `Card`, `CardHeader`, `CardContent` for content sections
- `Separator` for visual divisions
- `ScrollArea` for overflow content

### Custom Avion Components
Located in `components/avion/`:

#### ConsoleTabs
- Tab navigation system
- Follow existing tab patterns in weather and chat pages

#### StatusLED
- Status indicators with aviation-inspired design
- Used for system status, weather alerts, and flight conditions

### Theme-Aware Components
- All components must support light/dark themes
- Use CSS custom properties for theme variables
- Test in both themes before implementation complete

## Layout Patterns

### Page Structure
```
page.tsx
├── Layout (header, sidebar)
├── main content area
└── footer/actions
```

### Responsive Design
- Mobile-first approach
- Breakpoints follow Tailwind defaults (sm, md, lg, xl)
- Maintain functionality across all screen sizes

## Styling Conventions

### Tailwind Utilities
- Prefer Tailwind utilities over custom CSS
- Use `cn()` utility for className merging
- Consistent spacing and sizing scales

### Component Variants
- Use `class-variance-authority` (CVA) for component variations
- Define size, variant, and state props clearly
- Follow existing patterns in `components/avion/`

### CSS Custom Properties
- Define design tokens in CSS variables
- Support theme switching through variable updates
- Maintain consistent naming conventions

## Accessibility Standards

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order through content
- Focus indicators clearly visible

### Screen Reader Support
- Semantic HTML elements
- ARIA labels where needed
- Alt text for meaningful images

### Color and Contrast
- Sufficient contrast ratios (WCAG AA or better)
- Don't rely on color alone for meaning
- Test contrast in both themes

## Performance Guidelines

### Bundle Optimization
- Import components individually when possible
- Use dynamic imports for heavy components
- Optimize images and assets

### Rendering Performance
- Avoid unnecessary re-renders
- Use React.memo appropriately
- Implement proper loading states

## Integration Examples

### Weather Card Implementation
```tsx
// Use existing Card component with avion theming
<Card className="avion-weather-card">
  <CardHeader>
    <h3 className="text-lg font-inter font-medium">
      {airport.city} ({airport.icao})
    </h3>
  </CardHeader>
  <CardContent>
    <WeatherConditions data={weather} />
  </CardContent>
</Card>
```

### Chat Message Styling
```tsx
// Follow existing chat patterns
<div className="flex gap-3 p-4">
  <Avatar src={sender.avatar} />
  <div className="flex-1">
    <div className="text-sm font-inter text-muted-foreground">
      {sender.name}
    </div>
    <MessageContent content={message} />
  </div>
</div>
```

### Form Integration
```tsx
// Use existing form patterns
<form onSubmit={handleSubmit(onSubmit)}>
  <div className="space-y-4">
    <FormField
      control={control}
      name="departure"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Departure Airport</FormLabel>
          <FormControl>
            <Input placeholder="KJFK" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
</form>
```

## Common Gotchas

- **Never use Safety Orange** for non-critical elements
- **Always test** in both light and dark themes
- **Typography matters** - use JetBrains Mono only for technical data
- **Animations should be fast** - avoid slow or bouncy transitions
- **Shadows indicate depth** - not decoration
