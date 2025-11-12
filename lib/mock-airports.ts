import { AirportDetail } from './types';

export const mockAirports: AirportDetail[] = [
 {
 code: 'KJFK',
 icao: 'KJFK',
 iata: 'JFK',
 name: 'John F. Kennedy International Airport',
 city: 'New York',
 lat: 40.6413,
 lng: -73.7781,
 elevation: 13,
 runways: [
 { name: '04L/22R', length: 12079, width: 200, surface: 'Asphalt' },
 { name: '04R/22L', length: 8400, width: 150, surface: 'Asphalt' },
 { name: '13L/31R', length: 10000, width: 150, surface: 'Asphalt' },
 { name: '13R/31L', length: 14572, width: 200, surface: 'Asphalt' },
 ],
 frequencies: [
 { type: 'Tower', frequency: '119.1' },
 { type: 'Ground', frequency: '121.9' },
 { type: 'Clearance', frequency: '128.025' },
 { type: 'ATIS', frequency: '128.725' },
 ],
 navAids: [
 { type: 'VOR', identifier: 'JFK', frequency: '115.9' },
 { type: 'ILS', identifier: 'I-JFK', frequency: '109.5' },
 ],
 },
 {
 code: 'KLAX',
 icao: 'KLAX',
 iata: 'LAX',
 name: 'Los Angeles International Airport',
 city: 'Los Angeles',
 lat: 33.9416,
 lng: -118.4085,
 elevation: 125,
 runways: [
 { name: '06L/24R', length: 8926, width: 150, surface: 'Asphalt' },
 { name: '06R/24L', length: 10285, width: 150, surface: 'Asphalt' },
 { name: '07L/25R', length: 12091, width: 200, surface: 'Asphalt' },
 { name: '07R/25L', length: 11096, width: 150, surface: 'Asphalt' },
 ],
 frequencies: [
 { type: 'Tower', frequency: '133.9' },
 { type: 'Ground', frequency: '121.65' },
 { type: 'ATIS', frequency: '133.8' },
 ],
 navAids: [
 { type: 'VOR', identifier: 'LAX', frequency: '113.6' },
 ],
 },
 {
 code: 'KORD',
 icao: 'KORD',
 iata: 'ORD',
 name:"O'Hare International Airport",
 city: 'Chicago',
 lat: 41.9742,
 lng: -87.9073,
 elevation: 672,
 runways: [
 { name: '04L/22R', length: 7500, width: 150, surface: 'Asphalt' },
 { name: '10L/28R', length: 13000, width: 200, surface: 'Asphalt' },
 ],
 frequencies: [
 { type: 'Tower', frequency: '120.75' },
 { type: 'Ground', frequency: '121.9' },
 { type: 'ATIS', frequency: '135.4' },
 ],
 navAids: [
 { type: 'VOR', identifier: 'ORD', frequency: '113.9' },
 ],
 },
];

export const popularAirports = ['KJFK', 'KLAX', 'KORD', 'KATL', 'KDEN', 'KSFO', 'KSEA', 'KMIA'];
