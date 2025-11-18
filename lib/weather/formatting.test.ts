import { describe, it, expect } from 'vitest';
import type { WindData, VisibilityData, CloudLayer } from '@/types/checkwx';
import { formatWindDisplay, formatVisibilityDisplay, formatCloudsDisplay, type WeatherFormatOptions } from './formatting';

const baseOpts: WeatherFormatOptions = {
  mode: 'simplified',
  speedUnit: 'kt',
  visibilityUnit: 'mi',
};

describe('weather formatting helpers', () => {
  it('formats calm wind', () => {
    const result = formatWindDisplay(undefined, baseOpts);
    expect(result.primary).toBe('Calm');
  });

  it('formats wind with gusts in simplified mode', () => {
    const wind: WindData = {
      degrees: 310,
      speed_kts: 14,
      gust_kts: 25,
    } as WindData;

    const result = formatWindDisplay(wind, baseOpts);
    expect(result.primary).toBe('14 kt at 310°');
    expect(result.secondary).toBe('25 kt gusts');
  });

  it('formats visibility in miles and kilometres', () => {
    const vis: VisibilityData = {
      miles_float: 10,
    } as VisibilityData;

    const miles = formatVisibilityDisplay(vis, baseOpts);
    expect(miles).toBe('10 mi');

    const km = formatVisibilityDisplay(vis, { ...baseOpts, visibilityUnit: 'km' });
    expect(km.endsWith(' km')).toBe(true);
  });

  it('formats clouds with friendly phrases', () => {
    const clouds: CloudLayer[] = [
      { code: 'FEW', base_feet_agl: 5500 } as CloudLayer,
    ];

    const result = formatCloudsDisplay(clouds, baseOpts);
    expect(result).toContain('Few clouds');
    expect(result).toContain('5,500');
  });
});
