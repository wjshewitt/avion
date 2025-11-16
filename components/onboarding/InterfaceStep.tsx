"use client";

interface InterfaceStepProps {
  theme: string;
  updateData: (data: { theme: string }) => void;
}

export function InterfaceStep({ theme, updateData }: InterfaceStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Interface Mode</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wide">
          Choose your theme
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        {/* Ceramic (Light) */}
        <button
          onClick={() => updateData({ theme: "ceramic" })}
          className={`group relative w-32 h-40 rounded-lg border-2 transition-all ${
            theme === "ceramic"
              ? "border-[#F04E30] shadow-lg scale-105"
              : "border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <div className="absolute inset-0 bg-[#f4f4f4] rounded-md m-1 flex flex-col p-3">
            <div className="h-2 w-12 bg-zinc-200 rounded-full mb-2"></div>
            <div className="h-2 w-8 bg-zinc-200 rounded-full mb-4"></div>
            <div className="flex-1 bg-white rounded border border-zinc-100 shadow-sm"></div>
          </div>
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <span
              className={`text-xs font-bold ${
                theme === "ceramic" ? "text-[#F04E30]" : "text-zinc-500"
              }`}
            >
              Ceramic
            </span>
          </div>
        </button>

        {/* Tungsten (Dark) */}
        <button
          onClick={() => updateData({ theme: "tungsten" })}
          className={`group relative w-32 h-40 rounded-lg border-2 transition-all ${
            theme === "tungsten"
              ? "border-[#F04E30] shadow-lg scale-105"
              : "border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <div className="absolute inset-0 bg-[#1a1a1a] rounded-md m-1 flex flex-col p-3">
            <div className="h-2 w-12 bg-zinc-800 rounded-full mb-2"></div>
            <div className="h-2 w-8 bg-zinc-800 rounded-full mb-4"></div>
            <div className="flex-1 bg-zinc-900 rounded border border-zinc-800 shadow-inner"></div>
          </div>
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <span
              className={`text-xs font-bold ${
                theme === "tungsten" ? "text-[#F04E30]" : "text-zinc-500"
              }`}
            >
              Tungsten
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
