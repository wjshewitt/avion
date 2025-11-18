"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/queryKeys";
import type {
  HazardFeatureNormalized,
  HazardKind,
  PilotReport,
} from "@/types/weather";
import type { BoundingBox } from "@/lib/weather/awc";

async function fetchAwcData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  const payload = await response.json();
  if (!payload?.success) {
    throw new Error(payload?.error || "AWC feed returned an error");
  }
  return payload.data as T;
}

function serializeBbox(bbox?: BoundingBox): string | undefined {
  if (!bbox) return undefined;
  return `${bbox.west.toFixed(2)},${bbox.south.toFixed(2)},${bbox.east.toFixed(
    2
  )},${bbox.north.toFixed(2)}`;
}

interface HazardHookBase {
  bbox?: BoundingBox;
  hours?: number;
  enabled?: boolean;
}

export function useAwcHazardFeed(
  feed: Exclude<HazardKind, "pirep">,
  options: HazardHookBase &
    Omit<
      UseQueryOptions<HazardFeatureNormalized[], Error>,
      "queryKey" | "queryFn"
    > = {}
) {
  const { bbox, hours = 4, enabled = true, ...queryOptions } = options;
  const bboxParam = serializeBbox(bbox);

  return useQuery<HazardFeatureNormalized[], Error>({
    queryKey: queryKeys.weather.awcHazard(feed, {
      bbox: bboxParam,
      hours,
    }),
    queryFn: () =>
      fetchAwcData<HazardFeatureNormalized[]>(
        `/api/weather/awc/${feed}?hours=${hours}${
          bboxParam ? `&bbox=${bboxParam}` : ""
        }`
      ),
    enabled: enabled && (!!bboxParam || feed === "cwa"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

export function useAwcPireps(
  options: HazardHookBase &
    Omit<UseQueryOptions<PilotReport[], Error>, "queryKey" | "queryFn"> = {}
) {
  const { bbox, hours = 3, enabled = true, ...queryOptions } = options;
  const bboxParam = serializeBbox(bbox);

  return useQuery<PilotReport[], Error>({
    queryKey: queryKeys.weather.awcPirep({ bbox: bboxParam, hours }),
    queryFn: () =>
      fetchAwcData<PilotReport[]>(
        `/api/weather/awc/pirep?hours=${hours}${
          bboxParam ? `&bbox=${bboxParam}` : ""
        }`
      ),
    enabled: enabled && !!bboxParam,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}
