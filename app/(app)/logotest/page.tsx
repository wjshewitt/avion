'use client';

import { 
  Activity04Icon as Activity, 
  Airplane02Icon as Airplane, 
  CloudIcon as Cloud, 
  Settings05Icon as Settings, 
  CompassIcon as Compass, 
  MapsIcon as Map 
} from 'hugeicons-react';
import { 
  Accessibility as SolarActivity,
  AirbudsCaseCharge as SolarCharge,
  Cloud as SolarCloud,
  Settings as SolarSettings,
  Compass as SolarCompass,
  Map as SolarMap,
} from '@solar-icons/react';

const IconCard = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-sm p-4 flex flex-col items-center justify-center gap-3 text-center">
    <div className="w-16 h-16 flex items-center justify-center text-foreground">{children}</div>
    <p className="text-xs font-mono text-muted-foreground">{name}</p>
  </div>
);

export default function LogoTestPage() {
  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Icon Pack Showcase</h1>
        <p className="text-muted-foreground mt-1">A visual comparison of different icon libraries for potential logo use.</p>
      </div>

      {/* Huge Icons Section */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4 border-b border-border pb-2">
          Huge Icons (Stroke)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <IconCard name="Activity">
            <Activity size={48} strokeWidth={1.5} />
          </IconCard>
          <IconCard name="Airplane">
            <Airplane size={48} strokeWidth={1.5} />
          </IconCard>
          <IconCard name="Cloud">
            <Cloud size={48} strokeWidth={1.5} />
          </IconCard>
          <IconCard name="Settings">
            <Settings size={48} strokeWidth={1.5} />
          </IconCard>
          <IconCard name="Compass">
            <Compass size={48} strokeWidth={1.5} />
          </IconCard>
          <IconCard name="Map">
            <Map size={48} strokeWidth={1.5} />
          </IconCard>
        </div>
      </section>

      {/* Solar Icons - Bold */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4 border-b border-border pb-2">
          Solar Icons (Bold)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <IconCard name="Activity">
            <SolarActivity size={48} weight="Bold" />
          </IconCard>
          <IconCard name="Charge">
            <SolarCharge size={48} weight="Bold" />
          </IconCard>
          <IconCard name="Cloud">
            <SolarCloud size={48} weight="Bold" />
          </IconCard>
          <IconCard name="Settings">
            <SolarSettings size={48} weight="Bold" />
          </IconCard>
          <IconCard name="Compass">
            <SolarCompass size={48} weight="Bold" />
          </IconCard>
          <IconCard name="Map">
            <SolarMap size={48} weight="Bold" />
          </IconCard>
        </div>
      </section>
      
      {/* Solar Icons - Duotone */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4 border-b border-border pb-2">
          Solar Icons (Duotone)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <IconCard name="Activity">
            <SolarActivity size={48} weight="BoldDuotone" />
          </IconCard>
          <IconCard name="Charge">
            <SolarCharge size={48} weight="BoldDuotone" />
          </IconCard>
          <IconCard name="Cloud">
            <SolarCloud size={48} weight="BoldDuotone" />
          </IconCard>
          <IconCard name="Settings">
            <SolarSettings size={48} weight="BoldDuotone" />
          </IconCard>
          <IconCard name="Compass">
            <SolarCompass size={48} weight="BoldDuotone" />
          </IconCard>
          <IconCard name="Map">
            <SolarMap size={48} weight="BoldDuotone" />
          </IconCard>
        </div>
      </section>

      {/* Solar Icons - Linear */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4 border-b border-border pb-2">
          Solar Icons (Linear)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <IconCard name="Activity">
            <SolarActivity size={48} weight="Linear" />
          </IconCard>
          <IconCard name="Charge">
            <SolarCharge size={48} weight="Linear" />
          </IconCard>
          <IconCard name="Cloud">
            <SolarCloud size={48} weight="Linear" />
          </IconCard>
          <IconCard name="Settings">
            <SolarSettings size={48} weight="Linear" />
          </IconCard>
          <IconCard name="Compass">
            <SolarCompass size={48} weight="Linear" />
          </IconCard>
          <IconCard name="Map">
            <SolarMap size={48} weight="Linear" />
          </IconCard>
        </div>
      </section>
    </div>
  );
}
