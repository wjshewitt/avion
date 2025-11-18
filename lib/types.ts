// Type definitions for FlightOps

export type FlightStatus = 
 | 'SCHEDULED' 
 | 'DEPARTED' 
 | 'EN_ROUTE' 
 | 'ARRIVED' 
 | 'DELAYED' 
 | 'CANCELLED';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type WeatherCondition = 'VFR' | 'MVFR' | 'IFR' | 'LIFR';

export interface Airport {
 code: string;
 name: string;
 city: string;
 lat: number;
 lng: number;
}

export interface Weather {
 condition: WeatherCondition;
 temperature: number;
 tempCelsius?: number;
 wind: {
 speed: number;
 direction: number;
 };
 visibility: number;
 ceiling?: number;
 qnh?: number;
 risks: string[];
}

export interface Flight {
 id: string;
 flightNumber: string;
 departure: Airport;
 arrival: Airport;
 status: FlightStatus;
 scheduledDeparture: string;
 actualDeparture?: string;
 scheduledArrival: string;
 estimatedArrival?: string;
 altitude?: number;
 speed?: number;
 heading?: number;
 riskLevel: RiskLevel;
 weather?: Weather;
 aiInsight?: string;
}

// New types for expanded features

export interface Attachment {
 name?: string;
 contentType?: string;
 url: string;
}

export interface PartialToolCall {
 state: 'partial-call';
 toolName: string;
}

export interface ToolCall {
 state: 'call';
 toolName: string;
}

export interface ToolResult {
 state: 'result';
 toolName: string;
 result: {
 __cancelled?: boolean;
 [key: string]: any;
 };
}

export type ToolInvocation = PartialToolCall | ToolCall | ToolResult;

export interface ReasoningPart {
 type: 'reasoning';
 reasoning: string;
}

export interface ToolInvocationPart {
 type: 'tool-invocation';
 toolInvocation: ToolInvocation;
}

export interface TextPart {
 type: 'text';
 text: string;
}

export type MessagePart = TextPart | ReasoningPart | ToolInvocationPart;

export interface Message {
 id: string;
 role: 'user' | 'assistant' | (string & {});
 content: string;
 timestamp: Date;
 createdAt?: Date;
 experimental_attachments?: Attachment[];
 toolInvocations?: ToolInvocation[];
 parts?: MessagePart[];
}

export interface Alert {
 id: string;
 severity: 'warning' | 'critical';
 message: string;
 flightId?: string;
 timestamp: Date;
}

export interface Runway {
 name: string;
 length: number;
 width: number;
 surface: string;
}

export interface Frequency {
 type: string;
 frequency: string;
}

export interface NavAid {
 type: string;
 identifier: string;
 frequency?: string;
}

export interface AirportDetail extends Airport {
 elevation: number;
 runways: Runway[];
 frequencies: Frequency[];
 navAids: NavAid[];
 icao: string;
 iata: string;
}
