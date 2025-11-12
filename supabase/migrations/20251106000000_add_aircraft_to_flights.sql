-- Add aircraft column to flights table
ALTER TABLE flights
ADD COLUMN aircraft TEXT;

-- Create index for aircraft lookups
CREATE INDEX idx_flights_aircraft ON flights(aircraft);
