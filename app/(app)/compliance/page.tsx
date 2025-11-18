'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, FileText, ChevronRight, Check, AlertCircle, Globe } from 'lucide-react';
import { regulations, briefingItems, operationalScenarios } from '@/lib/compliance/regulations';
import { countryRequirements } from '@/lib/compliance/countries';
import { AvionCard } from '@/components/ui/avion-card';
import { GrooveInput } from '@/components/ui/groove-input';
import { DutyTimeline } from '@/components/compliance/DutyTimeline';
import { ComplianceHealthGauge } from '@/components/compliance/ComplianceHealthGauge';

// Mock Data for Dashboard
const crewStatus = {
  crewId: "C-1244",
  name: "Capt. J. Reynolds",
  role: "PIC",
  currentDutyHours: 8.2,
  maxDutyHours: 10,
  restRequired: false,
  restUntil: null,
  upcomingFlights: ["F-1992"]
};

const complianceScore = {
  overall: 92,
  crew: 25,
  aircraft: 25,
  documentation: 22, // Slightly lower
  authorization: 20  // Lower
};

const activeRegions = [
  { code: 'EU', name: 'EASA Zone', status: 'compliant' },
  { code: 'US', name: 'FAA Zone', status: 'compliant' },
  { code: 'MA', name: 'Morocco', status: 'warning' }, // Permit needed
];

export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    regulations.forEach(reg => {
      if (
        reg.title.toLowerCase().includes(query) ||
        reg.summary.toLowerCase().includes(query) ||
        reg.keyPoints.some(kp => kp.toLowerCase().includes(query))
      ) {
        results.push({ type: 'regulation', item: reg });
      }
    });

    countryRequirements.forEach(country => {
      if (
        country.countryName.toLowerCase().includes(query) ||
        country.specialRequirements.some(req => req.toLowerCase().includes(query))
      ) {
        results.push({ type: 'country', item: country });
      }
    });

    operationalScenarios.forEach(scenario => {
      if (
        scenario.title.toLowerCase().includes(query) ||
        scenario.question.toLowerCase().includes(query) ||
        scenario.tags.some(tag => tag.toLowerCase().includes(query))
      ) {
        results.push({ type: 'scenario', item: scenario });
      }
    });

    return results;
  }, [searchQuery]);

  const showSearchResults = searchQuery.length >= 2;

  return (
    <div className="flex-1 overflow-auto p-6 sm:p-8 bg-[#F4F4F4] dark:bg-[#1A1A1A] min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
          REGULATORY REFERENCE
        </div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Compliance Intelligence
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
          Real-time regulatory monitoring and operational feasibility assessment.
        </p>
      </div>

      {/* Control Panel Search */}
      <div className="mb-10 max-w-4xl">
        <GrooveInput
          variant="tungsten"
          icon={<Search size={18} strokeWidth={1.5} />}
          placeholder="SEARCH REGULATIONS, COUNTRIES (e.g., 'UK landing'), OR SCENARIOS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="font-mono text-sm tracking-wide"
        />
        {!showSearchResults && (
          <div className="flex items-center gap-3 mt-3 px-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Quick Access:</span>
            {['CREW DUTY', 'MOROCCO PERMITS', 'PAX BRIEFING', 'EAPIS'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-2 py-1 bg-zinc-200 dark:bg-[#2A2A2A] border border-zinc-300 dark:border-[#333] rounded-[2px] text-[10px] font-mono text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-[#323232] transition-colors uppercase"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results Overlay */}
      {showSearchResults ? (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
            {searchResults.length} RESULT{searchResults.length !== 1 ? 'S' : ''} FOUND
          </h2>
          <div className="space-y-3">
            {searchResults.slice(0, 10).map((result, idx) => (
              <Link 
                key={idx} 
                href={
                  result.type === 'regulation' ? `/compliance/regulations/${result.item.id}` :
                  result.type === 'country' ? `/compliance/countries?q=${result.item.countryCode}` :
                  `/compliance/scenarios#${result.item.id}`
                }
              >
                <AvionCard variant="ceramic" className="hover:border-[#2563EB] group transition-colors cursor-pointer">
                  <div className="flex items-start gap-4">
                     <div className="mt-0.5 text-zinc-400 group-hover:text-[#2563EB] transition-colors">
                        {result.type === 'regulation' && <FileText size={18} strokeWidth={1.5} />}
                        {result.type === 'country' && <Globe size={18} strokeWidth={1.5} />}
                        {result.type === 'scenario' && <AlertCircle size={18} strokeWidth={1.5} />}
                     </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                            {result.item.title || result.item.countryName}
                        </div>
                        <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-widest">
                            {result.type}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 font-normal">
                        {result.item.summary || result.item.overview || result.item.question}
                      </div>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-zinc-300 group-hover:text-[#2563EB] self-center transition-colors" />
                  </div>
                </AvionCard>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Flight Deck Modules Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
          
          {/* 1. Compliance Health Prism */}
          <AvionCard variant="ceramic" className="relative overflow-hidden">
            <div className="absolute top-6 left-6 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              SYSTEM STATUS
            </div>
            <div className="mt-8">
               <ComplianceHealthGauge score={complianceScore} />
            </div>
            <div className="mt-6 border-t border-zinc-200 dark:border-[#333] pt-4 flex justify-between items-center">
               <span className="text-xs text-zinc-500">Last Audit: Today 08:00Z</span>
               <button className="text-xs font-mono text-[#2563EB] hover:text-[#1e40af] uppercase tracking-wider">View Report →</button>
            </div>
          </AvionCard>

          {/* 2. Crew Status Panel */}
          <AvionCard variant="tungsten">
             <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  CREW READINESS
                </div>
                <div className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
             </div>
             
             <div className="space-y-6">
                <DutyTimeline crew={crewStatus} />
                
                <div className="p-4 bg-[#323232] rounded-sm border border-[#3a3a3a]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-zinc-300">Rest Period</span>
                        <span className="text-[10px] font-mono text-zinc-500">REQUIRED</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl font-mono font-bold text-zinc-200">10:00</div>
                        <div className="text-xs text-zinc-500">consecutive hours<br/>pre-duty</div>
                    </div>
                </div>
             </div>

             <div className="mt-6 pt-4 border-t border-[#333] grid grid-cols-2 gap-4">
                <Link href="/compliance/calculators/crew-duty" className="flex items-center justify-center px-4 py-2 bg-[#F04E30] hover:bg-[#d93e2b] text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors">
                   Calculator
                </Link>
                <Link href="/compliance/regulations/crew-duty" className="flex items-center justify-center px-4 py-2 border border-[#333] hover:border-[#555] text-zinc-300 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors">
                   Regulation
                </Link>
             </div>
          </AvionCard>

          {/* 3. Country Requirements / Active Regions */}
          <AvionCard variant="ceramic">
            <div className="flex items-start justify-between mb-6">
                 <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  ACTIVE REGIONS
                </div>
                <Globe size={16} strokeWidth={1.5} className="text-zinc-400" />
            </div>
            
            <div className="space-y-3">
                {activeRegions.map((region) => (
                    <div key={region.code} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-[#333] rounded-sm bg-white dark:bg-[#2A2A2A]">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-200 w-8">{region.code}</span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">{region.name}</span>
                        </div>
                        {region.status === 'compliant' ? (
                            <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono uppercase tracking-wide rounded-sm border border-emerald-200 dark:border-emerald-800/50">
                                Compliant
                            </div>
                        ) : (
                             <div className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono uppercase tracking-wide rounded-sm border border-amber-200 dark:border-amber-800/50">
                                Check
                            </div>
                        )}
                    </div>
                ))}
                <div className="p-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-sm flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors">
                    <span className="text-xs">+ Add Region</span>
                </div>
            </div>

             <Link href="/compliance/countries" className="mt-6 block w-full text-center text-xs font-mono text-[#2563EB] hover:text-[#1e40af] uppercase tracking-wider border-t border-zinc-200 dark:border-[#333] pt-4">
              Global Database →
            </Link>
          </AvionCard>

           {/* 4. Passenger Briefing Checklist */}
           <AvionCard variant="ceramic" className="lg:col-span-2 xl:col-span-1">
             <div className="flex items-start justify-between mb-6">
                 <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  PRE-FLIGHT BRIEFING
                </div>
                <div className="text-xs font-mono text-zinc-400">FAR 135.117</div>
            </div>

            <div className="space-y-1">
                {briefingItems.slice(0, 5).map((item, idx) => (
                    <div key={item.id} className="group flex items-start gap-3 p-2 hover:bg-zinc-100 dark:hover:bg-[#323232] rounded-sm transition-colors cursor-pointer">
                         <div className="mt-0.5 h-4 w-4 border border-zinc-300 dark:border-zinc-600 rounded-[2px] flex items-center justify-center group-hover:border-[#2563EB] transition-colors">
                            {idx < 2 && <Check size={12} className="text-[#2563EB]" />}
                         </div>
                         <div className="flex-1">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{item.title}</div>
                            <div className="text-[11px] text-zinc-400 line-clamp-1">{item.description}</div>
                         </div>
                    </div>
                ))}
            </div>
             <Link href="/compliance/briefings/passenger" className="mt-6 block w-full text-center text-xs font-mono text-[#2563EB] hover:text-[#1e40af] uppercase tracking-wider border-t border-zinc-200 dark:border-[#333] pt-4">
              Launch Checklist Mode →
            </Link>
           </AvionCard>

        </div>
      )}
    </div>
  );
}

