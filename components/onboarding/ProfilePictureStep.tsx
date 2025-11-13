"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, User } from "lucide-react";
import { VerticalBarsLoader } from "@/components/kokonutui/minimal-loaders";

interface ProfilePictureStepProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ProfilePictureStep({ value, onChange }: ProfilePictureStepProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      // Handle both possible response formats
      const avatarUrl = data.avatarUrl || data.url || data.profile?.avatar_url;
      
      if (!avatarUrl) {
        throw new Error("No avatar URL returned from server");
      }

      onChange(avatarUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium text-text-primary tracking-tight">Add a profile picture</h2>
        <p className="text-sm text-text-muted">Optional — you can skip this step and add one later</p>
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-40 h-40 bg-background-secondary border-2 border-border-subtle overflow-hidden flex items-center justify-center">
            {value ? (
              <Image src={value} alt="Profile" width={160} height={160} className="w-full h-full object-cover" />
            ) : (
              <User className="w-20 h-20 text-text-muted" />
            )}
          </div>
          {value && (
            <button
              onClick={handleRemove}
              className="absolute top-0 right-0 p-2 bg-critical text-white hover:bg-critical/90 transition-colors border border-critical"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Upload Area */}
        {!value && (
          <div
            className={`w-full max-w-md p-12 border-2 border-dashed transition-all ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border-subtle hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border border-primary/20">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-primary font-medium">
                  Drop your image here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-text-muted mt-2 font-medium">
                  PNG, JPG, GIF · Max 5MB
                </p>
              </div>
            </div>
          </div>
        )}

        {value && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="font-medium tracking-wide uppercase text-xs"
          >
            <Upload className="w-4 h-4 mr-2" />
            Change Image
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {error && (
          <div className="bg-critical/5 p-3 border-l-4 border-critical">
            <p className="text-xs text-critical font-medium">{error}</p>
          </div>
        )}

        {uploading && (
          <div className="bg-background-secondary p-4 border border-border-subtle flex items-center gap-3">
            <VerticalBarsLoader size="sm" color="text-green" />
            <p className="text-xs text-text-muted font-medium">Processing image...</p>
          </div>
        )}
      </div>
    </div>
  );
}
