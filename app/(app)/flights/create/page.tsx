import FlightCreationWizard from '@/components/flights/wizard/FlightCreationWizard';

export const metadata = {
  title: 'Create Flight | FlightChat',
  description: 'Create a new flight',
};

export default function CreateFlightPage() {
  return (
    <div className="relative min-h-full">
      <div
        className="absolute inset-0 tech-grid opacity-40 pointer-events-none"
        aria-hidden
      />

      <div className="relative h-full corner-brackets corner-brackets-lg corner-brackets-default">
        <div className="corner-brackets-inner h-full flex flex-col gap-8 p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-1">
                Flight Creation Wizard
              </p>
              <h1 className="text-2xl font-light tracking-tight text-foreground">
                Create Flight
              </h1>
            </div>
          </div>

          <div className="flex-1 flex">
            <FlightCreationWizard />
          </div>
        </div>
      </div>
    </div>
  );
}
