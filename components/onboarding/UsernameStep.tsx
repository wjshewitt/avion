"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { USERNAME_REGEX, MIN_USERNAME_LENGTH } from "@/lib/utils/username";

interface UsernameStepProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
}

export function UsernameStep({ value, onChange, onValidChange }: UsernameStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleChange = (newValue: string) => {
    setTouched(true);
    onChange(newValue);

    if (!newValue || newValue.length < MIN_USERNAME_LENGTH) {
      setError(null);
      onValidChange(false);
      return;
    }

    if (!USERNAME_REGEX.test(newValue)) {
      setError("Only letters, numbers, and underscores allowed");
      onValidChange(false);
      return;
    }

    setError(null);
    onValidChange(true);
  };

  const getStatusIcon = () => {
    if (!touched || !value) return null;
    if (error) return <XCircle className="w-4 h-4 text-critical" />;
    if (value.length >= MIN_USERNAME_LENGTH) return <CheckCircle2 className="w-4 h-4 text-green" />;
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium text-text-primary tracking-tight">Choose your username</h2>
        <p className="text-sm text-text-muted">This will be your unique identifier in FlightOps AI</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="username" className="text-text-primary font-medium uppercase text-xs tracking-wider">
          Username <span className="text-critical">*</span>
        </Label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            placeholder="pilot_john"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`pr-12 font-mono ${
              touched && error
                ? "border-critical focus:border-critical"
                : touched && value.length >= MIN_USERNAME_LENGTH && !error
                ? "border-green focus:border-green"
                : ""
            }`}
            maxLength={20}
            autoComplete="off"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center border border-border-subtle bg-background-secondary">
            {getStatusIcon()}
          </div>
        </div>

        {touched && error && (
          <div className="border-l-2 border-critical pl-3">
            <p className="text-xs text-critical font-medium">{error}</p>
          </div>
        )}

        <p className="text-xs text-text-muted font-medium">
          3–20 characters · Letters, numbers, underscores
        </p>
      </div>

      <div className="bg-background-secondary p-4 border-l-4 border-text-muted/30">
        <p className="text-xs text-text-secondary leading-relaxed">
          Choose a username that's easy to remember and professional. You won't be able to change it later.
        </p>
      </div>
    </div>
  );
}
