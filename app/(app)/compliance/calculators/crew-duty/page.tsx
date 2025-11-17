'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Plus, Trash2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  calculateCrewDuty, 
  getCalculatorInfo, 
  formatDutyHours,
  type RegulatoryFramework,
  type FlightHistory,
  type AcclimatizationStatus
} from '@/lib/compliance/calculators/index';

export default function CrewDutyCalculatorPage() {
  const [selectedFramework, setSelectedFramework] = useState<RegulatoryFramework>('faa-part-135');
  const [crewSize, setCrewSize] = useState<1 | 2>(1);
  const [proposedFlightHours, setProposedFlightHours] = useState<string>('');
  const [recentFlights, setRecentFlights] = useState<FlightHistory[]>([]);
  
  // EASA-specific fields
  const [acclimatizationStatus, setAcclimatizationStatus] = useState<AcclimatizationStatus>('home-base');
  const [sectorCount, setSectorCount] = useState<number>(1);
  const [reportingTime, setReportingTime] = useState<string>('');
  
  // Transport Canada specific
  const [consecutiveDaysOff, setConsecutiveDaysOff] = useState<number>(0);
  
  // CASA Australia specific
  const [operatorHasFRMS, setOperatorHasFRMS] = useState<boolean>(false);
  
  const [result, setResult] = useState<any>(null);

  const calculatorInfo = getCalculatorInfo();

  const addFlight = () => {
    setRecentFlights([
      ...recentFlights,
      { date: new Date().toISOString(), hours: 0 }
    ]);
  };

  const updateFlight = (index: number, field: 'date' | 'hours', value: string | number) => {
    const updated = [...recentFlights];
    if (field === 'date') {
      updated[index].date = new Date(value as string).toISOString();
    } else {
      updated[index].hours = Number(value);
    }
    setRecentFlights(updated);
  };

  const removeFlight = (index: number) => {
    setRecentFlights(recentFlights.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    const hours = parseFloat(proposedFlightHours);
    if (isNaN(hours) || hours <= 0) {
      alert('Please enter a valid proposed flight hours value');
      return;
    }

    const baseInput: any = {
      framework: selectedFramework,
      recentFlights,
      proposedFlightHours: hours,
      crewSize,
    };

    // Add framework-specific fields
    if (selectedFramework === 'easa-eu-ops' || selectedFramework === 'uk-caa') {
      baseInput.acclimatizationStatus = acclimatizationStatus;
      baseInput.sectorCount = sectorCount;
      if (reportingTime) {
        baseInput.reportingTime = new Date(reportingTime).toISOString();
      }
    }

    if (selectedFramework === 'transport-canada') {
      baseInput.consecutiveDaysOff = consecutiveDaysOff;
    }

    if (selectedFramework === 'casa-australia') {
      baseInput.operatorHasFRMS = operatorHasFRMS;
    }

    const calculationResult = calculateCrewDuty(baseInput);
    setResult(calculationResult);
  };

  const selectedCalcInfo = calculatorInfo.find(c => c.framework === selectedFramework);

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/compliance"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Compliance
        </Link>
        
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
          CREW DUTY CALCULATOR
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          Flight & Duty Time Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate crew duty compliance for multiple regulatory frameworks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Framework Selector */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="text-sm font-semibold text-foreground mb-4">Regulatory Framework</div>
            <div className="space-y-2">
              {calculatorInfo.map((calc) => (
                <button
                  key={calc.framework}
                  onClick={() => setSelectedFramework(calc.framework)}
                  className={`w-full text-left px-4 py-3 border rounded-sm transition-colors ${
                    selectedFramework === calc.framework
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'bg-card border-border text-foreground hover:border-[#2563EB]'
                  }`}
                >
                  <div className="font-semibold text-sm">{calc.name}</div>
                  <div className={`text-xs ${
                    selectedFramework === calc.framework ? 'text-white/80' : 'text-muted-foreground'
                  }`}>
                    {calc.jurisdiction}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Crew Configuration */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="text-sm font-semibold text-foreground mb-4">Crew Configuration</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCrewSize(1)}
                className={`px-4 py-3 border rounded-sm transition-colors ${
                  crewSize === 1
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : 'bg-card border-border text-foreground hover:border-[#2563EB]'
                }`}
              >
                Single Pilot
              </button>
              <button
                onClick={() => setCrewSize(2)}
                className={`px-4 py-3 border rounded-sm transition-colors ${
                  crewSize === 2
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : 'bg-card border-border text-foreground hover:border-[#2563EB]'
                }`}
              >
                Two Pilots
              </button>
            </div>
          </div>

          {/* Framework-Specific Fields */}
          {(selectedFramework === 'easa-eu-ops' || selectedFramework === 'uk-caa') && (
            <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6 space-y-4">
              <div className="text-sm font-semibold text-foreground mb-4">EASA-Specific Parameters</div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Acclimatization Status</label>
                <select
                  value={acclimatizationStatus}
                  onChange={(e) => setAcclimatizationStatus(e.target.value as AcclimatizationStatus)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground"
                >
                  <option value="home-base">Home Base</option>
                  <option value="away">Away from Base</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Number of Sectors</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sectorCount}
                  onChange={(e) => setSectorCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Reporting Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={reportingTime}
                  onChange={(e) => setReportingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground"
                />
              </div>
            </div>
          )}

          {selectedFramework === 'transport-canada' && (
            <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
              <div className="text-sm font-semibold text-foreground mb-4">Transport Canada Parameters</div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Consecutive Days Off (Last 7 Days)</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={consecutiveDaysOff}
                  onChange={(e) => setConsecutiveDaysOff(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground font-mono"
                />
              </div>
            </div>
          )}

          {selectedFramework === 'casa-australia' && (
            <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
              <div className="text-sm font-semibold text-foreground mb-4">CASA Australia Parameters</div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={operatorHasFRMS}
                  onChange={(e) => setOperatorHasFRMS(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Operator has approved FRMS</span>
              </label>
            </div>
          )}

          {/* Recent Flights */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-foreground">Recent Flights</div>
              <button
                onClick={addFlight}
                className="flex items-center gap-2 px-3 py-1 text-xs bg-[#2563EB] text-white rounded-sm hover:bg-[#2563EB]/90 transition-colors"
              >
                <Plus size={14} strokeWidth={1.5} />
                Add Flight
              </button>
            </div>

            {recentFlights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent flights added. Click "Add Flight" to begin.
              </div>
            ) : (
              <div className="space-y-3">
                {recentFlights.map((flight, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="datetime-local"
                      value={flight.date.substring(0, 16)}
                      onChange={(e) => updateFlight(index, 'date', e.target.value)}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-sm text-foreground text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Hours"
                      value={flight.hours || ''}
                      onChange={(e) => updateFlight(index, 'hours', e.target.value)}
                      className="w-24 px-3 py-2 bg-background border border-border rounded-sm text-foreground text-sm font-mono"
                    />
                    <button
                      onClick={() => removeFlight(index)}
                      className="p-2 text-muted-foreground hover:text-[#F04E30] transition-colors"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposed Flight */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="text-sm font-semibold text-foreground mb-4">Proposed Flight</div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Flight Hours</label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 4.5"
                value={proposedFlightHours}
                onChange={(e) => setProposedFlightHours(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground font-mono text-lg"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2563EB] text-white rounded-sm hover:bg-[#2563EB]/90 transition-colors font-semibold"
          >
            <Calculator size={20} strokeWidth={1.5} />
            Calculate Compliance
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Status Card */}
              <div className={`border rounded-sm p-6 ${
                result.status === 'legal' 
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : result.status === 'marginal'
                  ? 'bg-amber-500/10 border-amber-500'
                  : 'bg-[#F04E30]/10 border-[#F04E30]'
              }`}>
                <div className="flex items-start gap-4">
                  <div>
                    {result.status === 'legal' ? (
                      <CheckCircle size={32} strokeWidth={1.5} className="text-emerald-500" />
                    ) : result.status === 'marginal' ? (
                      <AlertTriangle size={32} strokeWidth={1.5} className="text-amber-500" />
                    ) : (
                      <AlertCircle size={32} strokeWidth={1.5} className="text-[#F04E30]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-lg font-semibold mb-2 ${
                      result.status === 'legal' 
                        ? 'text-emerald-500'
                        : result.status === 'marginal'
                        ? 'text-amber-500'
                        : 'text-[#F04E30]'
                    }`}>
                      {result.status === 'legal' ? 'Legal' : result.status === 'marginal' ? 'Marginal' : 'Illegal'}
                    </div>
                    <div className="text-sm text-foreground">{result.message}</div>
                  </div>
                </div>
              </div>

              {/* Calculation Details */}
              <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
                <div className="text-sm font-semibold text-foreground mb-4">Calculation Details</div>
                <div className="space-y-3">
                  {result.calculationDetails?.map((detail: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{detail.label}</span>
                      <span className="text-sm font-mono font-semibold text-foreground">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulation Reference */}
              <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
                <div className="text-sm font-semibold text-foreground mb-2">Regulation Reference</div>
                <div className="text-sm text-muted-foreground">{result.regulationReference}</div>
              </div>

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
                  <div className="text-sm font-semibold text-foreground mb-4">Suggestions</div>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-[#2563EB] mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-12 text-center">
              <Calculator size={48} strokeWidth={1.5} className="mx-auto text-muted-foreground/30 mb-4" />
              <div className="text-muted-foreground">
                Enter flight details and click "Calculate Compliance" to see results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
