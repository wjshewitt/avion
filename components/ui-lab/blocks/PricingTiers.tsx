"use client";

import * as React from"react";

const tiers = [
 { name:"Starter", price:"$0", features: ["Basic UI","Community"], cta:"Try" },
 { name:"Pro", price:"$19", features: ["Animations","Blocks","Priority"], cta:"Buy" },
 { name:"Enterprise", price:"Contact", features: ["SLA","SSO","Support"], cta:"Contact" },
];

export default function PricingTiers() {
 return (
 <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {tiers.map((t) => (
 <div
 key={t.name}
 className="border border-border dark:border-slate-700 bg-white dark:bg-slate-900 p-6 transition-transform hover:-translate-y-1 hover:shadow"
 >
 <h4 className="text-lg font-semibold text-text-primary dark:text-slate-50">{t.name}</h4>
 <p className="mt-1 text-2xl font-bold">{t.price}</p>
 <ul className="mt-3 space-y-1 text-sm text-text-secondary dark:text-slate-400">
 {t.features.map((f) => (
 <li key={f}>• {f}</li>
 ))}
 </ul>
 <button className="mt-4 w-full bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue/90">
 {t.cta}
 </button>
 </div>
 ))}
 </section>
 );
}
