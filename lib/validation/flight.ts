import { z } from 'zod';

const isoDateSchema = z
  .string({ required_error: 'Date is required' })
  .min(1, 'Date is required')
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date provided',
  });

const airportSchema = z.object({
  icao: z
    .string({ required_error: 'ICAO is required' })
    .trim()
    .min(4, 'ICAO must be 4 characters')
    .max(4, 'ICAO must be 4 characters'),
  iata: z
    .string()
    .trim()
    .min(2, 'IATA codes are 2-3 characters')
    .max(3, 'IATA codes are 2-3 characters')
    .optional(),
  name: z.string().trim().min(1),
  city: z.string().trim().min(1),
  country: z.string().trim().min(1),
});

const passengerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Passenger name is required'),
});

const statusOptions = ['On Time', 'Delayed', 'Cancelled'] as const;

export const flightCreationSchema = z
  .object({
    flightCode: z
      .string({ required_error: 'Flight code is required' })
      .trim()
      .min(3, 'Flight code must be at least 3 characters')
      .max(10, 'Flight code must be at most 10 characters'),
    status: z.enum(statusOptions),
    origin: airportSchema.nullable(),
    destination: airportSchema.nullable(),
    scheduledAt: isoDateSchema,
    arrivalAt: isoDateSchema,
    operator: z
      .string()
      .trim()
      .max(120, 'Operator name is too long')
      .optional()
      .default(''),
    tailNumber: z
      .string()
      .trim()
      .max(12, 'Tail number is too long')
      .optional()
      .default(''),
    aircraft: z
      .string()
      .trim()
      .max(120, 'Aircraft type is too long')
      .optional()
      .default(''),
    passengerCount: z
      .number()
      .int()
      .min(0)
      .max(999)
      .nullable()
      .default(null),
    crewCount: z
      .number()
      .int()
      .min(0)
      .max(99)
      .nullable()
      .default(null),
    notes: z
      .string()
      .max(2000, 'Notes must be under 2000 characters')
      .optional()
      .default(''),
    passengers: z.array(passengerSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.origin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['origin'],
        message: 'Origin airport is required',
      });
    }

    if (!data.destination) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destination'],
        message: 'Destination airport is required',
      });
    }

    if (data.origin && data.destination && data.origin.icao === data.destination.icao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destination'],
        message: 'Origin and destination must be different',
      });
    }

    const departure = Date.parse(data.scheduledAt);
    const arrival = Date.parse(data.arrivalAt);

    if (!Number.isNaN(departure) && !Number.isNaN(arrival) && arrival < departure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['arrivalAt'],
        message: 'Arrival must be after departure',
      });
    }

    if (
      typeof data.passengerCount === 'number' &&
      data.passengerCount >= 0 &&
      data.passengers.length > data.passengerCount
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passengers'],
        message: 'Passenger list exceeds declared passenger count',
      });
    }
  });

export type FlightFormValues = z.infer<typeof flightCreationSchema>;

export const flightStepFieldMap: Record<number, (keyof FlightFormValues)[]> = {
  1: ['flightCode', 'status'],
  2: ['origin', 'destination'],
  3: ['scheduledAt', 'arrivalAt'],
  4: [],
  5: ['passengerCount', 'crewCount', 'notes', 'passengers'],
};

export const FLIGHT_STATUS_OPTIONS = statusOptions;
