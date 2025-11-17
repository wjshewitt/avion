import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ComplianceRegulation,
  ComplianceRegulationAircraftProfile,
  ComplianceRegulationJurisdiction,
  ComplianceRegulationOperatorProfile,
  ComplianceRegulationScope,
  Database,
} from '@/lib/supabase/types';

export type ComplianceScope = 'arrival' | 'departure' | 'state_of_operator' | 'state_of_registry';

export interface ComplianceQueryContext {
  destinationCountryCode?: string | null;
  originCountryCode?: string | null;
  operatorCountryCode?: string | null;
  registryCountryCode?: string | null;
  operatorType?: 'charter' | 'private' | 'cargo' | 'air_ambulance' | 'military' | 'unknown';
  aircraftClass?: string | null;
  aircraftMtowKg?: number | null;
  aircraftEquipment?: string[];
}

interface RegulationWithRelations extends ComplianceRegulation {
  regulation_scopes: ComplianceRegulationScope[];
  regulation_jurisdictions: ComplianceRegulationJurisdiction[];
  regulation_operator_profiles: ComplianceRegulationOperatorProfile[];
  regulation_aircraft_profiles: ComplianceRegulationAircraftProfile[];
}

const ALL_SCOPES: ComplianceScope[] = ['arrival', 'departure', 'state_of_operator', 'state_of_registry'];

const GLOBAL_CODE = 'GLOBAL';

const defaultContext: Required<Pick<ComplianceQueryContext, 'operatorType' | 'aircraftEquipment'>> = {
  operatorType: 'charter',
  aircraftEquipment: [],
};

const normalizeCode = (code?: string | null) => (code ? code.toUpperCase() : null);

const buildJurisdictionList = (scope: ComplianceScope, ctx: ComplianceQueryContext): string[] => {
  const codes: string[] = [GLOBAL_CODE];
  switch (scope) {
    case 'arrival':
      if (ctx.destinationCountryCode) codes.push(ctx.destinationCountryCode.toUpperCase());
      break;
    case 'departure':
      if (ctx.originCountryCode) codes.push(ctx.originCountryCode.toUpperCase());
      break;
    case 'state_of_operator':
      if (ctx.operatorCountryCode) codes.push(ctx.operatorCountryCode.toUpperCase());
      break;
    case 'state_of_registry':
      if (ctx.registryCountryCode) codes.push(ctx.registryCountryCode.toUpperCase());
      break;
  }
  return Array.from(new Set(codes));
};

const operatorMatches = (
  profiles: ComplianceRegulationOperatorProfile[],
  operatorType: ComplianceQueryContext['operatorType']
) => {
  if (!profiles.length) return true;
  const currentType = operatorType ?? defaultContext.operatorType;
  return profiles.some((profile) => profile.operator_type === currentType);
};

const aircraftMatches = (
  profiles: ComplianceRegulationAircraftProfile[],
  ctx: ComplianceQueryContext
) => {
  if (!profiles.length) return true;
  const mtow = ctx.aircraftMtowKg ?? null;
  const equipment = ctx.aircraftEquipment ?? defaultContext.aircraftEquipment;

  return profiles.some((profile) => {
    if (profile.aircraft_class && ctx.aircraftClass && profile.aircraft_class !== ctx.aircraftClass) {
      return false;
    }

    if (profile.mtow_min_kg && mtow && mtow < Number(profile.mtow_min_kg)) {
      return false;
    }

    if (profile.mtow_max_kg && mtow && mtow > Number(profile.mtow_max_kg)) {
      return false;
    }

    if (profile.required_equipment?.length) {
      const hasAll = profile.required_equipment.every((item) => equipment.includes(item));
      if (!hasAll) return false;
    }

    return true;
  });
};

const jurisdictionMatches = (
  scope: ComplianceScope,
  jurisdictions: ComplianceRegulationJurisdiction[],
  ctx: ComplianceQueryContext
) => {
  const entries = jurisdictions.filter((entry) => entry.scope === scope);
  if (!entries.length) return true;
  const allowedCodes = buildJurisdictionList(scope, ctx);
  return entries.some((entry) => {
    if (!entry.jurisdiction_code) return false;
    return allowedCodes.includes(entry.jurisdiction_code.toUpperCase());
  });
};

function regulationApplies(
  regulation: RegulationWithRelations,
  scope: ComplianceScope,
  ctx: ComplianceQueryContext
): boolean {
  const hasScope = regulation.regulation_scopes.some((entry) => entry.scope === scope);
  if (!hasScope) return false;

  if (!jurisdictionMatches(scope, regulation.regulation_jurisdictions, ctx)) {
    return false;
  }

  if (!operatorMatches(regulation.regulation_operator_profiles, ctx.operatorType)) {
    return false;
  }

  if (!aircraftMatches(regulation.regulation_aircraft_profiles, ctx)) {
    return false;
  }

  return true;
}

export async function fetchComplianceRegulations(
  client: SupabaseClient<Database>,
  context: ComplianceQueryContext,
  scopes: ComplianceScope[] = ALL_SCOPES
): Promise<Record<ComplianceScope, RegulationWithRelations[]>> {
  const { data, error } = await (client.from('compliance_regulations') as any)
    .select(`
      *,
      regulation_scopes:compliance_regulation_scopes(*),
      regulation_jurisdictions:compliance_regulation_jurisdictions(*),
      regulation_operator_profiles:compliance_regulation_operator_profiles(*),
      regulation_aircraft_profiles:compliance_regulation_aircraft_profiles(*)
    `)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  const grouped: Record<ComplianceScope, RegulationWithRelations[]> = {
    arrival: [],
    departure: [],
    state_of_operator: [],
    state_of_registry: [],
  };

  const normalizedContext: ComplianceQueryContext = {
    ...context,
    destinationCountryCode: normalizeCode(context.destinationCountryCode),
    originCountryCode: normalizeCode(context.originCountryCode),
    operatorCountryCode: normalizeCode(context.operatorCountryCode),
    registryCountryCode: normalizeCode(context.registryCountryCode),
  };

  (data as RegulationWithRelations[]).forEach((regulation) => {
    scopes.forEach((scope) => {
      if (regulationApplies(regulation, scope, normalizedContext)) {
        grouped[scope].push(regulation);
      }
    });
  });

  return grouped;
}
