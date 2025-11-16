# Wireframe World Map Component

## Overview

The `WireframeWorldMap` component is an interactive, canvas-based world map visualization that displays geographic data using a wireframe dot pattern. It's perfect for showing global presence, office locations, or geographic distribution in your flightchat application.

## Features

- **Interactive Navigation**: Drag to pan, scroll to zoom
- **Wireframe Design**: Uses dots to create a stippled, minimalist appearance
- **Country Highlighting**: Highlight specific countries in green
- **Office/Location Markers**: Display red markers for specific cities or locations
- **Responsive Design**: Adapts to different screen sizes
- **Dark Theme**: Matches the flightchat dark aesthetic
- **Touch Support**: Works on mobile and touch devices

## Installation

The component requires these dependencies:

```bash
npm install d3 @types/d3
```

## Basic Usage

```tsx
import WireframeWorldMap from '@/components/wireframe/world-map';

export default function MyPage() {
  return (
    <WireframeWorldMap 
      width={900} 
      height={400} 
      className="w-full"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `960` | Map width in pixels |
| `height` | `number` | `420` | Map height in pixels |
| `className` | `string` | `''` | Additional CSS classes |
| `highlightedCountries` | `string[]` | `[]` | Countries to highlight in green |
| `officeMarkers` | `OfficeMarker[]` | `[]` | City/location markers |

### OfficeMarker Type

```tsx
interface OfficeMarker {
  city: string;      // City name (must be in city database)
  label?: string;    // Optional custom label for the marker
}
```

## Advanced Usage Examples

### Highlighting Countries

```tsx
const highlightedCountries = [
  'United States of America',
  'United Kingdom', 
  'Japan',
  'Australia'
];

<WireframeWorldMap 
  highlightedCountries={highlightedCountries}
  width={800}
  height={400}
/>
```

### Adding Office Markers

```tsx
const officeMarkers = [
  { city: 'San Francisco', label: 'HQ' },
  { city: 'London', label: 'European Office' },
  { city: 'Tokyo', label: 'Asia Pacific' },
  { city: 'Sydney', label: 'ANZ Office' }
];

<WireframeWorldMap 
  officeMarkers={officeMarkers}
  width={900}
  height={500}
/>
```

### Combined Example

```tsx
const MapComponent = () => {
  const highlightedCountries = ['United States of America', 'Germany', 'Singapore'];
  const officeMarkers = [
    { city: 'San Francisco', label: 'Tech Hub' },
    { city: 'Berlin', label: 'European Office' },
    { city: 'Singapore', label: 'Asia HQ' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Our Global Presence</h2>
      <WireframeWorldMap
        highlightedCountries={highlightedCountries}
        officeMarkers={officeMarkers}
        width={900}
        height={450}
        className="rounded-lg"
      />
    </div>
  );
};
```

## Supported Countries

The map supports highlighting for all major countries including:
- Americas: USA, Canada, Mexico, Brazil, Argentina, Chile, Colombia
- Europe: UK, France, Germany, Netherlands, Spain, Italy, and all EU countries
- Asia-Pacific: China, Japan, South Korea, Australia, New Zealand, Singapore, Hong Kong
- Middle East: Israel, UAE, Saudi Arabia, Qatar

## Supported Cities

The component includes coordinates for major cities worldwide. Office markers require cities from this predefined list. Some examples:
- **Americas**: San Francisco, New York, Toronto, São Paulo, Mexico City
- **Europe**: London, Paris, Berlin, Amsterdam, Madrid
- **Asia**: Tokyo, Shanghai, Singapore, Hong Kong, Mumbai
- **Middle East**: Dubai, Tel Aviv, Riyadh
- **Oceania**: Sydney, Melbourne, Auckland

## Styling

The component uses Tailwind CSS classes and includes default styling for:
- Dark navy background with gradient overlay
- Gray wireframe dots
- Green highlighted countries (`hsl(152, 100%, 65%)`)
- Red office markers
- Semi-transparent borders and shadows

You can add custom classes via the `className` prop:

```tsx
<WireframeWorldMap 
  className="border-2 border-blue-500 rounded-xl shadow-2xl"
  width={800}
  height={400}
/>
```

## Performance Notes

- The component uses HTML Canvas for efficient rendering
- Geographic data is loaded from Natural Earth GeoJSON URLs
- Only highlightable countries are rendered individually for performance
- Dot density is optimized for balance of detail and performance

## Error Handling

The component includes built-in error handling:
- Shows error state if geographic data fails to load
- Displays loading indicator during data fetch
- Fallback to basic rendering if services are unavailable

## Responsive Behavior

The component automatically adjusts to:
- Container width constraints
- Device pixel ratio for crisp rendering
- Touch interactions for mobile devices
- Viewport height limitations

## Browser Support

- Modern browsers with Canvas 2D support
- Touch devices (iOS Safari, Android Chrome)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- High-DPI/Retina displays

## Integration Tips

### With Flight Data

```tsx
// Show flight route origins
const flightOrigins = flights.map(flight => ({
  city: flight.origin.city,
  label: flight.origin.code
}));

<WireframeWorldMap 
  officeMarkers={flightOrigins}
  width={1000}
  height={500}
/>
```

### With Airport Data

```tsx
// Display major airport locations
const airportMarkers = [
  { city: 'San Francisco', label: 'SFO' },
  { city: 'New York', label: 'JFK' },
  { city: 'London', label: 'LHR' },
  { city: 'Tokyo', label: 'NRT' }
];

// Highlight countries with most airports
const topAirportCountries = ['United States', 'United Kingdom', 'Japan'];

<WireframeWorldMap 
  officeMarkers={airportMarkers}
  highlightedCountries={topAirportCountries}
/>
```

## Troubleshooting

### Missing City Coordinates
If you see warnings about missing coordinates, the city isn't in the database. Use one of the supported cities or add it to `lib/utils/city-coordinates.ts`.

### Country Name Issues
Country names must match the Natural Earth GeoJSON format exactly. Use the exact names shown in the "Supported Countries" section above.

### Performance Issues
- Reduce the number of highlighted countries for better performance
- Use reasonable dimensions (avoid very large widths/heights)
- Consider debouncing prop updates if they change frequently

## File Structure

```
components/wireframe/world-map.tsx        # Main component
lib/utils/country-regions.ts              # Country data utilities
lib/utils/city-coordinates.ts             # City coordinate mappings
```

## Dependencies

- `d3` for geographic projections and utilities
- `@types/d3` for TypeScript support
- Built-in Canvas API for rendering
- No external map libraries required
