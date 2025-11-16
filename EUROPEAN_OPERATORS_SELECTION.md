# European Charter Operators Search

## Overview
Added a simple autocomplete search for European charter operators in the Flight Creation Wizard's Aircraft step. Following Dieter Rams' principle of "Less, but better" - a single input field with intelligent suggestions.

## Features

### 1. **Curated Operator List**
12 popular European charter operators available as search suggestions:

| Operator | Region |
|----------|--------|
| NetJets Europe | Pan-European |
| VistaJet | Malta |
| Luxaviation | Luxembourg |
| Air Hamburg | Germany |
| GlobeAir | Austria |
| ExecuJet Europe | Switzerland |
| TAG Aviation | Switzerland |
| Flexjet | UK |
| Jetfly | Belgium |
| Elit'Avia | France |
| Comlux | Switzerland |
| London Executive Aviation | UK |

### 2. **Autocomplete Search**
- **Single input field**: Type to search or enter custom operator
- **Live filtering**: Results update as you type
- **Smart matching**: Case-insensitive substring search
- **No mode switching**: Seamlessly handles both curated and custom entries
- **Click outside to dismiss**: Dropdown auto-closes when focus lost

### 3. **Minimal UI**
- **Groove-input styling**: Consistent with Avion design language
- **Building2 icon**: Subtle visual indicator in input field
- **Dropdown suggestions**: Clean ceramic card with hover states
- **Region labels**: 10px mono uppercase showing operational base
- **Smooth animations**: 150ms fade in/out with subtle Y-axis motion

## Design Tokens Applied

```css
/* Search Input */
.groove-input {
  /* Inset shadow for tactile depth */
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.1), 
              inset -1px -1px 3px rgba(255,255,255,0.2);
  border: 1px solid var(--border);
}

/* Dropdown Container */
.ceramic {
  background: #f4f4f4;
  box-shadow: -2px -2px 5px rgba(255,255,255,0.8),
              2px 2px 5px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
}

/* Suggestion Items */
button:hover {
  background: rgba(0, 0, 0, 0.05);
  transition: background 0.15s;
}
```

## Typography
- **Operator names**: 14px semibold, truncated to prevent overflow
- **Region labels**: 10px JetBrains Mono, uppercase, `tracking-wider`
- **Custom operator placeholder**: Helpful examples for user guidance

## Layout
- **Responsive grid**: 1 column mobile, 2 columns tablet/desktop
- **Gap spacing**: 12px between cards for breathing room
- **Max width**: 4xl container (1024px) for optimal readability
- **Icon size**: 8x8 boxes with 16px icons (strokeWidth 1.5)

## User Flow

### Searching for Operator
1. User clicks into operator input field
2. Types a few characters (e.g., "net")
3. Dropdown appears with matching operators (e.g., "NetJets Europe")
4. User clicks suggestion to select
5. Dropdown closes, value populated

### Entering Custom Operator
1. User types complete custom name (e.g., "Private")
2. If no matches, continues typing
3. Presses Enter or clicks away
4. Custom operator value saved
5. No suggestions shown for non-matching text

## Integration Points

### StepAircraft Component
```tsx
const [showSuggestions, setShowSuggestions] = useState(false);
const [filteredOperators, setFilteredOperators] = useState(EUROPEAN_OPERATORS);

const handleOperatorInput = (value: string) => {
  onOperatorChange(value);
  if (value.trim()) {
    const filtered = EUROPEAN_OPERATORS.filter(op =>
      op.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOperators(filtered);
    setShowSuggestions(true);
  }
};
```
- Live filtering on every keystroke
- Case-insensitive substring matching
- No mode state, no complexity

### FlightCreationWizard
- No changes required to parent component
- Operator value flows through existing `onOperatorChange` prop
- Maintains backward compatibility with existing flights

## Benefits

1. **Less, but better**: Single input field handles all cases elegantly
2. **No cognitive load**: No mode switching or UI state changes
3. **Fast input**: Type a few chars, click suggestion
4. **Flexibility**: Works for both curated and custom operators
5. **Familiar pattern**: Standard autocomplete behavior users expect
6. **Dieter Rams approved**: Removes unnecessary complexity

## Future Enhancements

- Add operator logos/branding
- Include fleet size or aircraft type hints
- Expand to US/Asia operators with region filter
- API integration for real-time operator data
- Add "Recently used" section for frequent operators

---

**Implementation Date**: 2025-11-14  
**Design Language**: Avion v1.2 (Dieter Rams, Ceramic/Tungsten)  
**Pattern Source**: Onboarding RoleStep component
