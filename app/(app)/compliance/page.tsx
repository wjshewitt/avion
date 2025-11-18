'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, FileText, ChevronRight, Globe, Shield, Briefcase, Plane, ArrowRight, Database } from 'lucide-react';
import { regulations, briefingItems, operationalScenarios } from '@/lib/compliance/regulations';
import { countryRequirements } from '@/lib/compliance/countries';
import { AvionCard } from '@/components/ui/avion-card';
import { GrooveInput } from '@/components/ui/groove-input';
import { ComplianceStatusMatrix, type ComplianceCheckItem } from '@/components/compliance/ComplianceStatusMatrix';

// Mock Mission Data for Initial State
const defaultChecks: ComplianceCheckItem[] = [
  {
    id: 'chk-001',
    category: 'CABOTAGE',
    label: 'Domestic Point-to-Point Check',
    status: 'REVIEW',
    detail: 'Proposed itinerary includes internal legs within France (LFPB -> LFMN). Verify Operator (VistaJet) has valid cabotage rights or EU AOC.',
    reference: 'EU REG 1008/2008'
  },
  {
    id: 'chk-002',
    category: 'PERMITS',
    label: 'Landing Permit Requirements',
    status: 'OK',
    detail: 'France (FR) requires prior notification but no specific landing permit for EU-registered aircraft. Slot coordination mandatory at LFMN.',
    reference: 'FR AIP GEN 1.2'
  },
  {
    id: 'chk-003',
    category: 'CREW DUTY',
    label: 'Projected Duty Time',
    status: 'OK',
    detail: 'Estimated mission time (2h 15m) is well within 10h single-pilot / 14h multi-pilot duty limits. Rest period verified.',
    reference: '14 CFR § 135.267'
  },
  {
    id: 'chk-004',
    category: 'RESTRICTIONS',
    label: 'Noise Abatement (LFMN)',
    status: 'WARNING',
    detail: 'Strict night curfew 23:30 - 06:00 local. Stage 3 aircraft restrictions apply. Ensure aircraft meets noise quota.',
    reference: 'LFMN AD 2.21'
  }
];

export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [missionData, setMissionData] = useState({
    origin: 'EGLL',
    destination: 'LFMN',
    operator: 'VistaJet',
    registry: '9H-VIS',
    date: new Date().toISOString().split('T')[0]
  });

  // Search Logic for Reference Library
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

    return results;
  }, [searchQuery]);

  const showSearchResults = searchQuery.length >= 2;

  return (
    <div className="flex-1 overflow-auto p-6 sm:p-8 bg-[#F4F4F4] dark:bg-[#1A1A1A] min-h-screen font-sans">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
            OPERATIONAL COMPLIANCE
          </div>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Mission Feasibility
          </h1>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Current Cycle</div>
           <div className="text-sm font-mono font-medium text-zinc-700 dark:text-zinc-300">AIRAC 2403 • EFFECTIVE 21 MAR</div>
        </div>
      </div>

      {/* Mission Input Panel (Control Surface) */}
      <AvionCard variant="tungsten" className="mb-8 p-0 overflow-hidden">
        <div className="border-b border-[#333] px-6 py-4 bg-[#252525]">
          <div className="flex items-center gap-2 text-zinc-200">
            <Briefcase size={16} strokeWidth={1.5} />
            <span className="text-xs font-semibold tracking-wide uppercase">Mission Parameters</span>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Origin */}
            <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Origin (ICAO)</label>
                <GrooveInput 
                    variant="tungsten" 
                    value={missionData.origin}
                    onChange={(e) => setMissionData({...missionData, origin: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                />
            </div>

             {/* Destination */}
             <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Dest (ICAO)</label>
                <GrooveInput 
                    variant="tungsten" 
                    value={missionData.destination}
                    onChange={(e) => setMissionData({...missionData, destination: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                />
            </div>

             {/* Operator */}
             <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Operator</label>
                <GrooveInput 
                    variant="tungsten" 
                    value={missionData.operator}
                    onChange={(e) => setMissionData({...missionData, operator: e.target.value})}
                />
            </div>

             {/* Registry */}
             <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Aircraft Reg</label>
                <GrooveInput 
                    variant="tungsten" 
                    value={missionData.registry}
                    onChange={(e) => setMissionData({...missionData, registry: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                />
            </div>

             {/* Date */}
             <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Date</label>
                <GrooveInput 
                    variant="tungsten" 
                    type="date"
                    value={missionData.date}
                    onChange={(e) => setMissionData({...missionData, date: e.target.value})}
                    className="font-mono"
                />
            </div>
        </div>
      </AvionCard>

      {/* Compliance Report (Data Grid) */}
      <div className="mb-12">
         <ComplianceStatusMatrix checks={defaultChecks} />
      </div>

      {/* Reference Library (Secondary) */}
      <div className="border-t border-zinc-200 dark:border-[#333] pt-10">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Database size={18} strokeWidth={1.5} className="text-zinc-400" />
                Regulatory Reference Library
            </h2>
        </div>

        <div className="max-w-2xl mb-8">
             <GrooveInput
                variant="ceramic"
                icon={<Search size={16} strokeWidth={1.5} />}
                placeholder="SEARCH REGULATIONS, COUNTRIES (e.g. 'UK Cabotage'), OR PERMITS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-mono text-sm"
            />
        </div>

        {showSearchResults ? (
            <div className="grid gap-3 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                {searchResults.slice(0, 8).map((result, idx) => (
                     <Link 
                        key={idx} 
                        href={
                        result.type === 'regulation' ? `/compliance/regulations/${result.item.id}` :
                        result.type === 'country' ? `/compliance/countries?q=${result.item.countryCode}` :
                        '#'
                        }
                    >
                        <div className="group flex items-center gap-4 p-4 bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm hover:border-[#2563EB] transition-all">
                            <div className="text-zinc-400 group-hover:text-[#2563EB]">
                                {result.type === 'country' ? <Globe size={18} /> : <FileText size={18} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        {result.item.title || result.item.countryName}
                                    </div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                                        {result.type}
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                     {result.item.summary || result.item.overview}
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-zinc-300 group-hover:text-[#2563EB]" />
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Link href="/compliance/countries" className="group block">
                    <AvionCard variant="ceramic" className="h-full hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                            <Globe size={20} strokeWidth={1.5} />
                            <span className="text-sm font-semibold">Global Country Database</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Permit requirements, cabotage rules, and customs procedures for 190+ countries.
                        </p>
                    </AvionCard>
                 </Link>

                  <Link href="/compliance/regulations/crew-duty" className="group block">
                    <AvionCard variant="ceramic" className="h-full hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                            <Shield size={20} strokeWidth={1.5} />
                            <span className="text-sm font-semibold">Crew Duty Limitations</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            FAR 135, EASA ORO.FTL, and CAP 371 flight time and rest requirement calculators.
                        </p>
                    </AvionCard>
                 </Link>

                 <Link href="/compliance/briefings/passenger" className="group block">
                    <AvionCard variant="ceramic" className="h-full hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                            <Plane size={20} strokeWidth={1.5} />
                            <span className="text-sm font-semibold">Passenger Briefings</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Mandatory pre-flight safety scripts and checklists for various aircraft types.
                        </p>
                    </AvionCard>
                 </Link>
            </div>
        )}
      </div>

    </div>
  );
}

