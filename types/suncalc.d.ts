declare module "suncalc" {
  export interface GetTimesResult {
    sunrise: Date;
    sunset: Date;
    dawn: Date;
    dusk: Date;
    solarNoon: Date;
    [key: string]: Date;
  }
  export function getTimes(date: Date, lat: number, lon: number): GetTimesResult;
}
