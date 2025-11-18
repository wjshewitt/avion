import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  FlightRecord,
  RiskScores,
  CrewBriefing,
  AirportCoordinate,
} from "@/types";
import type { UserProfile, UserPreferences } from "@/types/profile";

// Application state interface
export type WeatherViewMode = "standard" | "advanced";
export type SpeedUnit = "kt" | "kmh" | "mph";
export type DistanceUnit = "sm" | "mi" | "km";

export interface AppState {
  flights: FlightRecord[];
  selectedFlightId: string | null;
  riskScores: Record<string, RiskScores>;
  briefings: Record<string, CrewBriefing>;
  airports: AirportCoordinate[];
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;

  // Preferences
  weatherViewMode: WeatherViewMode;
  weatherUnits: {
    speed: SpeedUnit;
    visibility: DistanceUnit;
  };

  // Actions
  setFlights: (flights: FlightRecord[]) => void;
  selectFlight: (flightId: string | null) => void;
  setRiskScores: (scores: Record<string, RiskScores>) => void;
  setBriefings: (briefings: Record<string, CrewBriefing>) => void;
  setAirports: (airports: AirportCoordinate[]) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsLoadingProfile: (isLoading: boolean) => void;
  setWeatherViewMode: (mode: WeatherViewMode) => void;
  setWeatherUnits: (partial: Partial<AppState["weatherUnits"]>) => void;
}

// Create Zustand store with devtools middleware
export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      flights: [],
      selectedFlightId: null,
      riskScores: {},
      briefings: {},
      airports: [],
      userProfile: null,
      isLoadingProfile: false,
      weatherViewMode: "standard",
      weatherUnits: {
        speed: "kt",
        visibility: "mi",
      },

      // Actions
      setFlights: (flights) => set({ flights }, false, "setFlights"),

      selectFlight: (flightId) =>
        set({ selectedFlightId: flightId }, false, "selectFlight"),

      setRiskScores: (scores) =>
        set({ riskScores: scores }, false, "setRiskScores"),

      setBriefings: (briefings) => set({ briefings }, false, "setBriefings"),

      setAirports: (airports) => set({ airports }, false, "setAirports"),

      setUserProfile: (profile) => set({ userProfile: profile }, false, "setUserProfile"),

      setIsLoadingProfile: (isLoading) => set({ isLoadingProfile: isLoading }, false, "setIsLoadingProfile"),
      setWeatherViewMode: (mode) => set({ weatherViewMode: mode }, false, "setWeatherViewMode"),
      setWeatherUnits: (partial) =>
        set(
          (state) => ({
            weatherUnits: {
              ...state.weatherUnits,
              ...partial,
            },
          }),
          false,
          "setWeatherUnits",
        ),
    }),
    {
      name: "FlightOps Store",
    }
  )
);

// Selector hooks for optimized re-renders
export const useFlights = () => useStore((state) => state.flights);
export const useSelectedFlightId = () =>
  useStore((state) => state.selectedFlightId);
export const useSelectedFlight = () =>
  useStore((state) => {
    if (!state.selectedFlightId) return null;
    return state.flights.find((f) => f.id === state.selectedFlightId) || null;
  });
export const useRiskScores = () => useStore((state) => state.riskScores);
export const useSelectedFlightRiskScores = () =>
  useStore((state) => {
    if (!state.selectedFlightId) return null;
    return state.riskScores[state.selectedFlightId] || null;
  });
export const useBriefings = () => useStore((state) => state.briefings);
export const useSelectedFlightBriefing = () =>
  useStore((state) => {
    if (!state.selectedFlightId) return null;
    return state.briefings[state.selectedFlightId] || null;
  });

export const useAirports = () => useStore((state) => state.airports);

// Action hooks
export const useStoreActions = () =>
  useStore((state) => ({
    setFlights: state.setFlights,
    selectFlight: state.selectFlight,
    setRiskScores: state.setRiskScores,
    setBriefings: state.setBriefings,
    setAirports: state.setAirports,
    setUserProfile: state.setUserProfile,
    setIsLoadingProfile: state.setIsLoadingProfile,
  }));
