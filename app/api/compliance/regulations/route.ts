import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildFlightComplianceContext } from '@/lib/compliance/context';
import {
  fetchComplianceRegulations,
  type ComplianceScope,
  type ComplianceQueryContext,
} from '@/lib/compliance/regulation-service';

const scopeSet: Set<ComplianceScope> = new Set([
  'arrival',
  'departure',
  'state_of_operator',
  'state_of_registry',
]);

const parseScopes = (value: string | null): ComplianceScope[] => {
  if (!value) return Array.from(scopeSet);
  return value
    .split(',')
    .map((scope) => scope.trim() as ComplianceScope)
    .filter((scope) => scopeSet.has(scope));
};

const parseEquipment = (value: string | null): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const admin = createAdminClient();

  try {
    const scopes = parseScopes(search.get('scopes'));

    const context: ComplianceQueryContext = {
      destinationCountryCode: search.get('destinationCountry') ?? undefined,
      originCountryCode: search.get('originCountry') ?? undefined,
      operatorCountryCode: search.get('operatorCountry') ?? undefined,
      registryCountryCode: search.get('registryCountry') ?? undefined,
      operatorType: (search.get('operatorType') as ComplianceQueryContext['operatorType']) ?? undefined,
      aircraftMtowKg: search.get('mtowKg') ? Number(search.get('mtowKg')) : undefined,
      aircraftEquipment: parseEquipment(search.get('equipment')),
    };

    const operatorName = search.get('operator') ?? undefined;
    const tailNumber = search.get('tailNumber') ?? undefined;
    const originIcao = search.get('originIcao') ?? undefined;
    const destinationIcao = search.get('destinationIcao') ?? undefined;

    const needsDerivation =
      !context.destinationCountryCode ||
      !context.originCountryCode ||
      !context.operatorCountryCode ||
      !context.registryCountryCode;

    let derivedPayload: Awaited<ReturnType<typeof buildFlightComplianceContext>> | null = null;

    if (needsDerivation || operatorName || tailNumber || originIcao || destinationIcao) {
      derivedPayload = await buildFlightComplianceContext({
        supabase: admin,
        operatorName,
        tailNumber,
        originIcao,
        destinationIcao,
        persistAircraft: false,
      });

      context.destinationCountryCode = context.destinationCountryCode ?? derivedPayload.destinationCountryCode ?? undefined;
      context.originCountryCode = context.originCountryCode ?? derivedPayload.originCountryCode ?? undefined;
      context.operatorCountryCode = context.operatorCountryCode ?? derivedPayload.operatorCountryCode ?? undefined;
      context.registryCountryCode = context.registryCountryCode ?? derivedPayload.aircraftRegistryCode ?? undefined;
      context.operatorType = context.operatorType ?? derivedPayload.operatorType ?? undefined;
    }

    const grouped = await fetchComplianceRegulations(admin, context, scopes);

    const response = Object.fromEntries(
      scopes.map((scope) => [
        scope,
        grouped[scope].map((regulation) => ({
          id: regulation.id,
          title: regulation.title,
          regulator: regulation.regulator,
          reference: regulation.reference,
          summary: regulation.summary,
          compliance_action: regulation.compliance_action,
          risk_level: regulation.risk_level,
          citation_url: regulation.citation_url,
          scope_notes: regulation.regulation_scopes
            .filter((entry) => entry.scope === scope)
            .map((entry) => entry.trigger_notes)
            .filter(Boolean),
        })),
      ])
    );

    return NextResponse.json({
      scopes,
      context: {
        destinationCountryCode: context.destinationCountryCode ?? null,
        originCountryCode: context.originCountryCode ?? null,
        operatorCountryCode: context.operatorCountryCode ?? null,
        registryCountryCode: context.registryCountryCode ?? null,
        operatorType: context.operatorType ?? null,
      },
      derived: derivedPayload?.contextPayload ?? null,
      regulations: response,
    });
  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json({ error: 'Failed to load compliance regulations' }, { status: 500 });
  }
}
