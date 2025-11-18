import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrafficFilters {
  source: 'all' | 'corporate' | 'airline';
  altitudeMin: number;
  altitudeMax: number;
  speedMin: number;
  speedMax: number;
  onGround: boolean | 'both';
  searchQuery: string;
}

interface TrafficFilterStore {
  filters: TrafficFilters;
  setFilter: <K extends keyof TrafficFilters>(key: K, value: TrafficFilters[K]) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TrafficFilters = {
  source: 'all',
  altitudeMin: 0,
  altitudeMax: 60000,
  speedMin: 0,
  speedMax: 1000,
  onGround: 'both',
  searchQuery: '',
};

export const useTrafficFilterStore = create<TrafficFilterStore>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    }),
    {
      name: 'flight-tracker-filters',
    }
  )
);
