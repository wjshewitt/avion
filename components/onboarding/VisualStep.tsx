"use client";

import { useState, useRef } from "react";
import { Aperture, Edit2 } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";

interface VisualStepProps {
  avatar: string | null;
  username: string;
  name: string;
  updateData: (data: { avatar: string }) => void;
}

export function VisualStep({ avatar, username, name, updateData }: VisualStepProps) {
  const [preview, setPreview] = useState<string | null>(avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        updateData({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAvatar = () => {
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "avion"}`;
    setPreview(url);
    updateData({ avatar: url });
  };

  const generateInitialsAvatar = () => {
    const seed = name || username || "User";
    const avatar = createAvatar(initials, {
      seed,
      backgroundColor: ["b6e3f4"],
      textColor: ["111827"],
    });

    const svg = avatar.toString();
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setPreview(svgDataUrl);
    updateData({ avatar: svgDataUrl });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Profile picture
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wide">
          Upload a photo or use a generated avatar
        </p>
      </div>

      <div className="flex justify-center">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative w-32 h-32 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-[#F04E30] transition-colors cursor-pointer flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-800"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-zinc-400 group-hover:text-[#F04E30] transition-colors">
              <Aperture size={24} strokeWidth={1.5} />
              <span className="text-[10px] font-mono mt-2 uppercase">Upload</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Edit2 size={16} className="text-white" strokeWidth={1.5} />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFile}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={generateAvatar}
          className="text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 transition-colors"
        >
          Random avatar
        </button>
        <button
          onClick={generateInitialsAvatar}
          className="text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 transition-colors"
        >
          Use your initials
        </button>
      </div>
    </div>
  );
}
