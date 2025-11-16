import type { AirportLite } from "@/types/airport-lite";

export type MapCalloutState = {
  airport: AirportLite;
  position: { x: number; y: number };
} | null;

export type MapCalloutAction =
  | { type: "open"; airport: AirportLite; position: { x: number; y: number } }
  | { type: "move"; position: { x: number; y: number } }
  | { type: "close" };

export function mapCalloutReducer(state: MapCalloutState, action: MapCalloutAction): MapCalloutState {
  switch (action.type) {
    case "open":
      return { airport: action.airport, position: action.position };
    case "move":
      if (!state) return state;
      return { ...state, position: action.position };
    case "close":
      return null;
    default:
      return state;
  }
}
