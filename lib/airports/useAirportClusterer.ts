import { useCallback, useMemo } from "react";
import Supercluster from "supercluster";
import type { AirportLite } from "@/types/airport-lite";
import type { AirportLiteDeckDataset } from "@/lib/airports/airport-lite-utils";

export interface ClusterPointProperties {
  cluster: boolean;
  point_count?: number;
  point_count_abbreviated?: string | number;
  cluster_id?: number;
}

export type ClusterFeature = GeoJSON.Feature<GeoJSON.Point, ClusterPointProperties>;

export interface AirportClusterFeature {
  type: "airport";
  airport: AirportLite;
}

export interface MapClusterResult {
  clusters: ClusterFeature[];
  airports: AirportLite[];
}

export function buildClusterIndex(dataset?: AirportLiteDeckDataset | null) {
  if (!dataset?.airports.length) return null;

  const features = dataset.airports.map((airport, index) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [dataset.positions[index * 2], dataset.positions[index * 2 + 1]],
    },
    properties: {
      icao: airport.icao,
      type: airport.type,
      popularity: dataset.popularityScores[index],
      runway: dataset.runwayLengths[index],
    },
  }));

  return new Supercluster({
    radius: 60,
    maxZoom: 9,
  }).load(features as GeoJSON.Feature<GeoJSON.Point>[]);
}

export function useAirportClusterer(dataset?: AirportLiteDeckDataset) {
  const index = useMemo(() => buildClusterIndex(dataset), [dataset]);
  const airportLookup = useMemo(() => {
    if (!dataset) return null;
    return new Map(dataset.airports.map((airport) => [airport.icao, airport] as const));
  }, [dataset]);

  const getClusters = useCallback(
    ({ bbox, zoom }: { bbox: [number, number, number, number]; zoom: number }): MapClusterResult => {
      if (!index || !dataset) return { clusters: [], airports: dataset?.airports ?? [] };
      const raw = index.getClusters(bbox, Math.round(zoom));

      const clusters: ClusterFeature[] = [];
      const airports: AirportLite[] = [];

      raw.forEach((feature) => {
        const props = feature.properties ?? {};
        if (props.cluster) {
          clusters.push(feature as ClusterFeature);
        } else {
          const airport = airportLookup?.get(props.icao as string);
          if (airport) airports.push(airport);
        }
      });

      return { clusters, airports };
    },
    [index, dataset, airportLookup]
  );

  const getExpansionZoom = useCallback(
    (clusterId: number) => index?.getClusterExpansionZoom(clusterId) ?? null,
    [index]
  );

  return {
    hasClusters: Boolean(index),
    getClusters,
    getExpansionZoom,
  };
}
