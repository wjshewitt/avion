"use client";

import { useState } from"react";
import ShinyButton from"@/components/ui-lab/magic/ShinyButton";
import AnimatedBeam from"@/components/ui-lab/magic/AnimatedBeam";
import SpotlightCard from"@/components/ui-lab/aceternity/SpotlightCard";
import LampHero from"@/components/ui-lab/aceternity/LampHero";
import MinimalHero from"@/components/ui-lab/blocks/MinimalHero";
import PricingTiers from"@/components/ui-lab/blocks/PricingTiers";
import AuroraBackground from"@/components/ui-lab/nyxb/AuroraBackground";
import BentoGridMini from"@/components/ui-lab/nyxb/BentoGridMini";
import Meteors from"@/components/ui-lab/animata/Meteors";
import TextScramble from"@/components/ui-lab/animata/TextScramble";
import MagneticButton from"@/components/ui-lab/motion/MagneticButton";
import TiltParallaxCard from"@/components/ui-lab/motion/TiltParallaxCard";

const tabs = [
 { id:"magic", label:"Magic UI" },
 { id:"aceternity", label:"Aceternity" },
 { id:"blocks", label:"Shadcn Blocks" },
 { id:"nyxb", label:"Nyxb" },
 { id:"animata", label:"Animata" },
 { id:"motion", label:"Motion" },
];

export default function UILabPage() {
 const [active, setActive] = useState<string>("magic");

 return (
 <div className="flex-1 overflow-auto bg-gradient-to-br from-surface via-white to-surface">
 <div className="max-w-7xl mx-auto px-8 py-8">
 <h1 className="text-2xl font-bold text-text-primary dark:text-slate-50 mb-2">UI Lab</h1>
 <p className="text-sm text-text-secondary dark:text-slate-400 mb-6">Creative shadcn-style experiments (copy-paste friendly)</p>

 <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
 {tabs.map((t) => (
 <button
 key={t.id}
 onClick={() => setActive(t.id)}
 className={`px-4 py-2 text-sm transition-colors ${
 active === t.id
 ?"bg-blue text-white shadow-md"
 :"bg-surface dark:bg-slate-800 text-text-secondary dark:text-slate-400 hover:bg-gray-100"
 }`}
 >
 {t.label}
 </button>
 ))}
 </div>

 {active ==="magic" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="p-6 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 flex items-center justify-center min-h-[160px]">
 <ShinyButton>Launch</ShinyButton>
 </div>
 <div className="p-6 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 min-h-[160px]">
 <AnimatedBeam />
 </div>
 </div>
 )}

 {active ==="aceternity" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <SpotlightCard title="Aceternity Spotlight" subtitle="Mouse‑tracked light" />
 <LampHero title="Ship Faster" subtitle="Curved lamp light sweep" />
 </div>
 )}

 {active ==="blocks" && (
 <div className="space-y-6">
 <MinimalHero />
 <PricingTiers />
 </div>
 )}

 {active ==="nyxb" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <AuroraBackground className="p-10 border border-border dark:border-slate-700 bg-white dark:bg-slate-900" />
 <BentoGridMini />
 </div>
 )}

 {active ==="animata" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="relative h-64 overflow-hidden border border-border dark:border-slate-700 bg-white dark:bg-slate-900">
 <Meteors />
 </div>
 <div className="p-6 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 flex items-center justify-center">
 <TextScramble text="FlightOps" />
 </div>
 </div>
 )}

 {active ==="motion" && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="p-6 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 flex items-center justify-center min-h-[160px]">
 <MagneticButton>Attract</MagneticButton>
 </div>
 <TiltParallaxCard className="h-64" />
 </div>
 )}
 </div>
 </div>
 );
}
