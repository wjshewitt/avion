import { Alert } from './types';

export const mockAlerts: Alert[] = [
 {
 id: '1',
 severity: 'critical',
 message: 'FL789: Heavy icing above 12k ft. Recommend altitude change.',
 flightId: '3',
 timestamp: new Date(Date.now() - 600000),
 },
 {
 id: '2',
 severity: 'warning',
 message: 'FL567: Thunderstorms at destination. Monitor weather closely.',
 flightId: '5',
 timestamp: new Date(Date.now() - 1200000),
 },
];
