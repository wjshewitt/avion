import { Flight, FlightStatus } from './types';

export const mockFlights: Flight[] = [
 {
 id: '1',
 flightNumber: 'FL123',
 departure: {
 code: 'JFK',
 name: 'John F. Kennedy International Airport',
 city: 'New York',
 lat: 40.6413,
 lng: -73.7781,
 },
 arrival: {
 code: 'LAX',
 name: 'Los Angeles International Airport',
 city: 'Los Angeles',
 lat: 33.9416,
 lng: -118.4085,
 },
 status: 'DEPARTED',
 scheduledDeparture: '14:00',
 actualDeparture: '14:02',
 scheduledArrival: '17:40',
 estimatedArrival: '17:32',
 altitude: 32000,
 speed: 485,
 heading: 270,
 riskLevel: 'MODERATE',
 weather: {
 condition: 'MVFR',
 temperature: 12,
 wind: {
 speed: 18,
 direction: 45,
 },
 visibility: 8,
 ceiling: 12000,
 risks: ['Moderate icing 18k-22k ft', 'Headwind 18kt (vs 12kt forecast)'],
 },
 aiInsight: 'Consider FL340 for better winds. 12min saved.',
 },
 {
 id: '2',
 flightNumber: 'FL456',
 departure: {
 code: 'BOS',
 name: 'Logan International Airport',
 city: 'Boston',
 lat: 42.3656,
 lng: -71.0096,
 },
 arrival: {
 code: 'SFO',
 name: 'San Francisco International Airport',
 city: 'San Francisco',
 lat: 37.6213,
 lng: -122.3790,
 },
 status: 'SCHEDULED',
 scheduledDeparture: '16:00',
 scheduledArrival: '19:30',
 riskLevel: 'LOW',
 weather: {
 condition: 'VFR',
 temperature: 18,
 wind: {
 speed: 8,
 direction: 180,
 },
 visibility: 10,
 risks: [],
 },
 aiInsight: 'Clear conditions. No weather advisories.',
 },
 {
 id: '3',
 flightNumber: 'FL789',
 departure: {
 code: 'MIA',
 name: 'Miami International Airport',
 city: 'Miami',
 lat: 25.7959,
 lng: -80.2870,
 },
 arrival: {
 code: 'SEA',
 name: 'Seattle-Tacoma International Airport',
 city: 'Seattle',
 lat: 47.4502,
 lng: -122.3088,
 },
 status: 'EN_ROUTE',
 scheduledDeparture: '10:15',
 actualDeparture: '10:18',
 scheduledArrival: '14:45',
 estimatedArrival: '14:52',
 altitude: 38000,
 speed: 520,
 heading: 315,
 riskLevel: 'HIGH',
 weather: {
 condition: 'IFR',
 temperature: 4,
 wind: {
 speed: 28,
 direction: 270,
 },
 visibility: 3,
 ceiling: 8000,
 risks: ['Heavy icing above 12k ft', 'Strong crosswinds at destination', 'Turbulence expected'],
 },
 aiInsight: 'Recommend holding pattern. Destination weather deteriorating.',
 },
 {
 id: '4',
 flightNumber: 'FL234',
 departure: {
 code: 'ORD',
 name:"O'Hare International Airport",
 city: 'Chicago',
 lat: 41.9742,
 lng: -87.9073,
 },
 arrival: {
 code: 'DEN',
 name: 'Denver International Airport',
 city: 'Denver',
 lat: 39.8561,
 lng: -104.6737,
 },
 status: 'ARRIVED',
 scheduledDeparture: '08:00',
 actualDeparture: '08:03',
 scheduledArrival: '10:15',
 estimatedArrival: '10:12',
 riskLevel: 'LOW',
 weather: {
 condition: 'VFR',
 temperature: 15,
 wind: {
 speed: 12,
 direction: 90,
 },
 visibility: 10,
 risks: [],
 },
 aiInsight: 'Flight completed successfully.',
 },
 {
 id: '5',
 flightNumber: 'FL567',
 departure: {
 code: 'ATL',
 name: 'Hartsfield-Jackson Atlanta International Airport',
 city: 'Atlanta',
 lat: 33.6407,
 lng: -84.4277,
 },
 arrival: {
 code: 'PHX',
 name: 'Phoenix Sky Harbor International Airport',
 city: 'Phoenix',
 lat: 33.4484,
 lng: -112.0740,
 },
 status: 'DELAYED',
 scheduledDeparture: '18:30',
 scheduledArrival: '20:45',
 riskLevel: 'MODERATE',
 weather: {
 condition: 'MVFR',
 temperature: 22,
 wind: {
 speed: 15,
 direction: 220,
 },
 visibility: 6,
 ceiling: 10000,
 risks: ['Thunderstorms in area', 'Visibility reduced'],
 },
 aiInsight: 'Weather delay. Expect 45min departure delay.',
 },
];

export function getMockAircraftData(flightId: string) {
 const aircraftTypes = [
 { type: 'Boeing 737-800', maxAltitude: 41000, cruiseSpeed: 485, range: 3060 },
 { type: 'Airbus A320neo', maxAltitude: 39800, cruiseSpeed: 470, range: 3400 },
 { type: 'Boeing 787-9', maxAltitude: 43000, cruiseSpeed: 490, range: 7635 },
 { type: 'Airbus A350-900', maxAltitude: 43100, cruiseSpeed: 488, range: 8100 },
 { type: 'Boeing 777-300ER', maxAltitude: 43100, cruiseSpeed: 490, range: 7370 },
 ];

 const index = parseInt(flightId) % aircraftTypes.length;
 const aircraft = aircraftTypes[index];
 const regNumber = Math.floor(Math.random() * 9000) + 1000;

 return {
 ...aircraft,
 registration: `N${regNumber}${String.fromCharCode(65 + index)}${String.fromCharCode(65 + (index + 1) % 26)}`,
 };
}
