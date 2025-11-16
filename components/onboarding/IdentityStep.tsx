"use client";

import { CheckCircle2, XCircle, User } from "lucide-react";
import { USERNAME_REGEX, MIN_USERNAME_LENGTH } from "@/lib/utils/username";

interface IdentityStepProps {
  name: string;
  username: string;
  updateData: (data: { name?: string; username?: string }) => void;
}

export function IdentityStep({ name, username, updateData }: IdentityStepProps) {
  const hasMinLength = username.length >= MIN_USERNAME_LENGTH;
  const hasValidFormat = username === "" || USERNAME_REGEX.test(username);

  const statusColor = !hasMinLength
    ? "text-zinc-400 dark:text-zinc-500"
    : !hasValidFormat
    ? "text-red-600 dark:text-red-400"
    : "text-emerald-600 dark:text-emerald-400";

  const getStatusIcon = () => {
    if (!hasMinLength) return null;
    if (!hasValidFormat) {
      return <XCircle size={18} className="text-red-500" strokeWidth={1.5} />;
    }
    return <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={1.5} />;
  };

  const getStatusMessage = () => {
    if (!hasMinLength) return "Min 3 characters. Visible to all fleet operators.";
    if (!hasValidFormat) return "Only letters, numbers, and underscores allowed.";
    return "Looks good.";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tell us who you are
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wide">
          Your name and a short username
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1 text-left">
          <label className="text-[10px] font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Full name
          </label>
          <div className="groove-input p-4 rounded-md flex items-center gap-3">
            <User
              size={18}
              strokeWidth={1.5}
              className="text-zinc-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => updateData({ name: e.target.value })}
              placeholder="First and last name"
              className="bg-transparent border-none outline-none w-full text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-600"
            />
          </div>
        </div>

        <div className="space-y-1 text-left">
          <label className="text-[10px] font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Username
          </label>
          <div className="groove-input p-4 rounded-md flex items-center gap-3">
          <span className="text-zinc-400 dark:text-zinc-500 font-mono select-none">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => updateData({ username: e.target.value })}
            placeholder="username"
            className="bg-transparent border-none outline-none w-full font-mono text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-600"
            autoFocus
          />
          {getStatusIcon()}
          </div>
        </div>
        <p className={`text-[10px] text-center transition-colors ${statusColor}`}>
          {getStatusMessage()}
        </p>
      </div>
    </div>
  );
}
