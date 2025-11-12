"use client";

import * as React from"react";

export default function MinimalHero() {
 return (
 <section className="relative overflow-hidden border border-border dark:border-slate-700 bg-white dark:bg-slate-900 px-8 py-10">
 <h3 className="text-3xl font-extrabold tracking-tight">
 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
 Build delightful flight ops UIs
 </span>
 </h3>
 <p className="mt-2 max-w-prose text-sm text-text-secondary dark:text-slate-400">
 Opinionated blocks you can copy-paste and own.
 </p>
 <div className="mt-5 flex gap-3">
 <a className="bg-blue px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue/90" href="#">Get started</a>
 <a className="border border-border dark:border-slate-700 px-4 py-2 text-sm font-medium text-text-primary dark:text-slate-50 hover:bg-surface dark:bg-slate-800" href="#">Learn more</a>
 </div>
 </section>
 );
}
