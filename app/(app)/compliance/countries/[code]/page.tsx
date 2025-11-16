'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, AlertCircle, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { countryRequirements } from '@/lib/compliance/countries';

export default function CountryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const country = countryRequirements.find(
    (c) => c.countryCode.toLowerCase() === code.toLowerCase()
  );

  if (!country) {
    return (
      <div className="flex-1 overflow-auto p-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Country Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested country information could not be found in our database.
          </p>
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-sm text-sm font-medium hover:bg-[#2563EB]/90 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to Compliance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Back Button */}
      <Link
        href="/compliance"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to Compliance
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Globe size={32} strokeWidth={1.5} className="text-[#2563EB]" />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
              {country.region} • {country.countryCode}
            </div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              {country.countryName}
            </h1>
          </div>
        </div>

        {country.overview && (
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            {country.overview}
          </p>
        )}
      </div>

      {/* Operational Overview */}
      {(country.privateOpsNotes || country.charterOpsNotes || country.cabotageNotes || country.riskNotes) && (
        <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {country.privateOpsNotes && country.privateOpsNotes.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  PRIVATE / NON-REVENUE OPERATIONS
                </div>
                <ul className="space-y-1">
                  {country.privateOpsNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-[#2563EB] mt-0.5">•</span>
                      <span className="text-foreground">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {country.charterOpsNotes && country.charterOpsNotes.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  CHARTER / COMMERCIAL OPERATIONS
                </div>
                <ul className="space-y-1">
                  {country.charterOpsNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span className="text-foreground">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(country.cabotageNotes && country.cabotageNotes.length > 0) ||
            (country.riskNotes && country.riskNotes.length > 0) ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {country.cabotageNotes && country.cabotageNotes.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    CABOTAGE & DOMESTIC LEGS
                  </div>
                  <ul className="space-y-1">
                    {country.cabotageNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-[#F04E30] mt-0.5">•</span>
                        <span className="text-foreground">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {country.riskNotes && country.riskNotes.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    RISK & ENFORCEMENT NOTES
                  </div>
                  <ul className="space-y-1">
                    {country.riskNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span className="text-foreground">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Overflight Permit Requirements */}
      {country.overflightPermit.required && (
        <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
            OVERFLIGHT PERMIT REQUIRED
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Clock size={20} strokeWidth={1.5} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Advance Notice</div>
                <div className="text-lg font-mono font-bold text-foreground tabular-nums">
                  {country.overflightPermit.advanceNoticeHours} hours
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign size={20} strokeWidth={1.5} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Estimated Cost</div>
                <div className="text-lg font-semibold text-foreground">
                  {country.overflightPermit.estimatedCost}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe size={20} strokeWidth={1.5} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Validity</div>
                <div className="text-lg font-semibold text-foreground">
                  {country.overflightPermit.validityDays} days
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Application Process:</div>
            <p className="text-sm text-foreground">{country.overflightPermit.applicationProcess}</p>
          </div>
        </div>
      )}

      {!country.overflightPermit.required && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-sm p-6 mb-6">
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 mb-2">
            ✓ No Overflight Permit Required
          </div>
          <p className="text-sm text-muted-foreground">{country.overflightPermit.applicationProcess}</p>
        </div>
      )}

      {/* Landing Permit */}
      <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
          LANDING PERMITS
        </div>
        {country.landingPermit.required ? (
          <div>
            <div className="text-sm font-semibold text-amber-600 dark:text-amber-500 mb-4">
              ⚠ Landing Permit Required
            </div>
            {country.landingPermit.approvedAirports.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-muted-foreground mb-2">Approved Airports:</div>
                <div className="flex flex-wrap gap-2">
                  {country.landingPermit.approvedAirports.map((airport) => (
                    <span
                      key={airport}
                      className="px-2 py-1 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 rounded-sm text-xs font-mono"
                    >
                      {airport}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {country.landingPermit.restrictions.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Restrictions:</div>
                <ul className="space-y-1">
                  {country.landingPermit.restrictions.map((restriction, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-emerald-600 dark:text-emerald-500">
            ✓ No special landing permit required
          </div>
        )}
      </div>

      {/* Special Requirements */}
      {country.specialRequirements.length > 0 && (
        <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
            SPECIAL REQUIREMENTS
          </div>
          <ul className="space-y-2">
            {country.specialRequirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-[#F04E30] mt-0.5">•</span>
                <span className="text-foreground">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Customs & Immigration */}
      {country.customsImmigration.length > 0 && (
        <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
            CUSTOMS & IMMIGRATION
          </div>
          <ul className="space-y-2">
            {country.customsImmigration.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-[#2563EB] mt-0.5">•</span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Curfews & Noise */}
      {(country.curfews.length > 0 || country.noiseRestrictions.length > 0) && (
        <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
            CURFEWS & NOISE RESTRICTIONS
          </div>
          {country.curfews.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-foreground mb-2">Curfews:</div>
              <ul className="space-y-1">
                {country.curfews.map((curfew, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{curfew}</li>
                ))}
              </ul>
            </div>
          )}
          {country.noiseRestrictions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-foreground mb-2">Noise Restrictions:</div>
              <ul className="space-y-1">
                {country.noiseRestrictions.map((noise, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{noise}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Handling Agents */}
      {country.handlingAgents && country.handlingAgents.length > 0 && (
        <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
            RECOMMENDED HANDLING AGENTS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {country.handlingAgents.map((agent) => (
              <div key={agent} className="px-3 py-2 bg-muted/30 rounded-sm text-sm text-foreground">
                {agent}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Authority */}
      <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
          REGULATORY AUTHORITY
        </div>
        <div className="space-y-2">
          <div className="text-base font-semibold text-foreground">{country.regulatoryAuthority.name}</div>
          <a
            href={country.regulatoryAuthority.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
          >
            {country.regulatoryAuthority.website}
            <ExternalLink size={14} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
}
