"use client";

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

export type ComplianceScope = 'arrival' | 'departure' | 'state_of_operator' | 'state_of_registry';

export interface CompliancePreviewParams {
  operator?: string | null;
  tailNumber?: string | null;
  originIcao?: string | null;
  destinationIcao?: string | null;
  destinationCountryCode?: string | null;
  originCountryCode?: string | null;
  operatorCountryCode?: string | null;
  registryCountryCode?: string | null;
  scopes?: ComplianceScope[];
}

export interface ComplianceRegulationSummary {
  id: string;
  title: string;
  regulator: string | null;
  reference: string | null;
  summary: string | null;
  compliance_action: string | null;
  risk_level: string | null;
  citation_url: string | null;
  scope_notes: (string | null)[];
}

export interface ComplianceApiResponse {
  scopes: ComplianceScope[];
  context: {
    destinationCountryCode: string | null;
    originCountryCode: string | null;
    operatorCountryCode: string | null;
    registryCountryCode: string | null;
    operatorType: string | null;
  };
  derived: Record<string, any> | null;
  regulations: Record<ComplianceScope, ComplianceRegulationSummary[]>;
}

const buildQueryString = (params: CompliancePreviewParams) => {
  const search = new URLSearchParams();
  if (params.operator) search.set('operator', params.operator);
  if (params.tailNumber) search.set('tailNumber', params.tailNumber);
  if (params.originIcao) search.set('originIcao', params.originIcao);
  if (params.destinationIcao) search.set('destinationIcao', params.destinationIcao);
  if (params.destinationCountryCode) search.set('destinationCountry', params.destinationCountryCode);
  if (params.originCountryCode) search.set('originCountry', params.originCountryCode);
  if (params.operatorCountryCode) search.set('operatorCountry', params.operatorCountryCode);
  if (params.registryCountryCode) search.set('registryCountry', params.registryCountryCode);
  if (params.scopes?.length) search.set('scopes', params.scopes.join(','));
  return search.toString();
};

export function useComplianceRegulations(
  params: CompliancePreviewParams,
  options?: Pick<UseQueryOptions<ComplianceApiResponse>, 'enabled'>
) {
  const queryString = buildQueryString(params);
  const enabled = options?.enabled ?? true;

  return useQuery<ComplianceApiResponse>({
    queryKey: ['compliance-regulations', queryString],
    queryFn: async () => {
      const url = queryString ? `/api/compliance/regulations?${queryString}` : '/api/compliance/regulations';
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch compliance data');
      }
      return (await response.json()) as ComplianceApiResponse;
    },
    enabled,
  });
}
