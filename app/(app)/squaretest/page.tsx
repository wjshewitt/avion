'use client';

import SquareLoader from '@/components/kokonutui/square-loader';
import {
  CornerBracketsLoader,
  VerticalBarsLoader,
  ScannerLoader,
  CornerSweepLoader,
  PulseCornersLoader,
  GridDotsLoader,
  CrossLoader,
  LShapeLoader,
} from '@/components/kokonutui/minimal-loaders';

export default function SquareTestPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Minimal Loading Symbols</h1>
      <p className="text-text-secondary mb-12">Dieter Rams aesthetic: straight lines, geometric precision, functional beauty</p>
      
      <div className="space-y-16">
        {/* Original Square Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">01 — Square Loader</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <SquareLoader size="sm" />
              <p className="text-xs text-text-secondary font-mono">Small</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <SquareLoader size="md" />
              <p className="text-xs text-text-secondary font-mono">Medium</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <SquareLoader size="lg" />
              <p className="text-xs text-text-secondary font-mono">Large</p>
            </div>
          </div>
        </section>

        {/* Corner Brackets Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">02 — Corner Brackets</h2>
          <p className="text-sm text-text-secondary mb-4">Rotating corner brackets inspired by the app's bracket design system</p>
          <div className="grid grid-cols-4 gap-6">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CornerBracketsLoader size="md" color="text-blue" />
              <p className="text-xs text-text-secondary font-mono">Blue</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CornerBracketsLoader size="md" color="text-green" />
              <p className="text-xs text-text-secondary font-mono">Green</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CornerBracketsLoader size="md" color="text-red" />
              <p className="text-xs text-text-secondary font-mono">Red</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CornerBracketsLoader size="md" color="text-amber" />
              <p className="text-xs text-text-secondary font-mono">Amber</p>
            </div>
          </div>
        </section>

        {/* Vertical Bars Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">03 — Vertical Bars</h2>
          <p className="text-sm text-text-secondary mb-4">Oscillating vertical bars for audio/data visualization feel</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <VerticalBarsLoader size="sm" />
              <p className="text-xs text-text-secondary font-mono">Small</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <VerticalBarsLoader size="md" color="text-green" />
              <p className="text-xs text-text-secondary font-mono">Medium</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <VerticalBarsLoader size="lg" color="text-purple-500" />
              <p className="text-xs text-text-secondary font-mono">Large</p>
            </div>
          </div>
        </section>

        {/* Scanner Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">04 — Scanner</h2>
          <p className="text-sm text-text-secondary mb-4">Horizontal line scanning vertically, evoking radar or progress monitoring</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <ScannerLoader size="md" color="text-blue" />
              <p className="text-xs text-text-secondary font-mono">Default</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <ScannerLoader size="md" color="text-green" />
              <p className="text-xs text-text-secondary font-mono">Success</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <ScannerLoader size="md" color="text-red" />
              <p className="text-xs text-text-secondary font-mono">Alert</p>
            </div>
          </div>
        </section>

        {/* Corner Sweep Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">05 — Corner Sweep</h2>
          <p className="text-sm text-text-secondary mb-4">Line sweeping around the perimeter like a radar sweep</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CornerSweepLoader size="sm" />
              <p className="text-xs text-text-secondary font-mono">Small</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CornerSweepLoader size="md" color="text-amber" />
              <p className="text-xs text-text-secondary font-mono">Medium</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CornerSweepLoader size="lg" color="text-purple-500" />
              <p className="text-xs text-text-secondary font-mono">Large</p>
            </div>
          </div>
        </section>

        {/* Pulse Corners Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">06 — Pulse Corners</h2>
          <p className="text-sm text-text-secondary mb-4">Sequential corner activation in clockwise pattern</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <PulseCornersLoader size="md" color="text-blue" />
              <p className="text-xs text-text-secondary font-mono">Blue</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <PulseCornersLoader size="md" color="text-green" />
              <p className="text-xs text-text-secondary font-mono">Green</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <PulseCornersLoader size="md" color="text-red" />
              <p className="text-xs text-text-secondary font-mono">Red</p>
            </div>
          </div>
        </section>

        {/* Grid Dots Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">07 — Grid Dots</h2>
          <p className="text-sm text-text-secondary mb-4">3×3 dot matrix with sequential activation</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <GridDotsLoader size="sm" />
              <p className="text-xs text-text-secondary font-mono">Small</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <GridDotsLoader size="md" color="text-purple-500" />
              <p className="text-xs text-text-secondary font-mono">Medium</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <GridDotsLoader size="lg" color="text-amber" />
              <p className="text-xs text-text-secondary font-mono">Large</p>
            </div>
          </div>
        </section>

        {/* Cross Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">08 — Cross</h2>
          <p className="text-sm text-text-secondary mb-4">Expanding and contracting cross pattern from center</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CrossLoader size="md" color="text-blue" />
              <p className="text-xs text-text-secondary font-mono">Blue</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CrossLoader size="md" color="text-green" />
              <p className="text-xs text-text-secondary font-mono">Green</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <CrossLoader size="lg" color="text-red" />
              <p className="text-xs text-text-secondary font-mono">Large</p>
            </div>
          </div>
        </section>

        {/* L-Shape Loader */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-mono">09 — L-Shape</h2>
          <p className="text-sm text-text-secondary mb-4">Rotating L-shapes forming dynamic corners</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <LShapeLoader size="sm" color="text-amber" />
              <p className="text-xs text-text-secondary font-mono">Small</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <LShapeLoader size="md" color="text-blue" />
              <p className="text-xs text-text-secondary font-mono">Medium</p>
            </div>
            <div className="border border-border p-8 flex flex-col items-center justify-center gap-4">
              <LShapeLoader size="lg" color="text-purple-500" />
              <p className="text-xs text-text-secondary font-mono">Large</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="border-t border-border pt-12">
          <h2 className="text-xl font-semibold mb-6 font-mono">Use Cases</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <div className="flex items-center gap-4 mb-3">
                <CornerBracketsLoader size="sm" color="text-blue" />
                <span className="text-sm font-mono">Authenticating...</span>
              </div>
              <p className="text-xs text-text-secondary">Corner brackets for auth operations</p>
            </div>
            <div className="border border-border p-6">
              <div className="flex items-center gap-4 mb-3">
                <VerticalBarsLoader size="sm" color="text-green" />
                <span className="text-sm font-mono">Processing audio...</span>
              </div>
              <p className="text-xs text-text-secondary">Vertical bars for media processing</p>
            </div>
            <div className="border border-border p-6">
              <div className="flex items-center gap-4 mb-3">
                <ScannerLoader size="sm" color="text-amber" />
                <span className="text-sm font-mono">Scanning weather data...</span>
              </div>
              <p className="text-xs text-text-secondary">Scanner for data analysis</p>
            </div>
            <div className="border border-border p-6">
              <div className="flex items-center gap-4 mb-3">
                <GridDotsLoader size="sm" color="text-purple-500" />
                <span className="text-sm font-mono">Syncing fleet data...</span>
              </div>
              <p className="text-xs text-text-secondary">Grid for batch operations</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
