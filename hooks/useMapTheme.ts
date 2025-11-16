import { useTheme } from 'next-themes';
import { AVION_DARK_STYLE, AVION_LIGHT_STYLE } from '@/components/map/mapStyles';

export function useMapTheme() {
  const { theme, resolvedTheme } = useTheme();
  
  const activeTheme = resolvedTheme || theme || 'dark';
  const isDark = activeTheme === 'dark';

  return {
    mapStyle: isDark ? AVION_DARK_STYLE : AVION_LIGHT_STYLE,
    primaryColor: isDark ? '#F04E30' : '#2563EB', // Safety Orange (dark) / Info Blue (light)
    secondaryColor: isDark ? '#2563EB' : '#F04E30', // Swapped for secondary accent
    surfaceColor: isDark ? '#2A2A2A' : '#F4F4F4',
    textColor: isDark ? '#E5E5E5' : '#1A1A1A',
    borderColor: isDark ? '#333333' : '#E0E0E0',
    isDark,
  };
}
