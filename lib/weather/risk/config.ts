import type { RiskModelConfig } from "./types";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RISK_CONFIG, RISK_PROFILES } from "./constants";

export async function resolveRiskConfig(userId?: string): Promise<RiskModelConfig> {
  // 1. Start with defaults
  let config: RiskModelConfig = { ...DEFAULT_RISK_CONFIG };

  if (!userId) return config;

  try {
    // 2. Fetch user preferences
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_profiles")
      .select("preferences")
      .eq("user_id", userId)
      .single();

    if (data && 'preferences' in data) {
      const prefs = (data as any).preferences as Record<string, any>;
      const userRiskConfig = prefs["risk_model_v2"] as Partial<RiskModelConfig> | undefined;

      if (userRiskConfig) {
        // 3. Apply Profile Overlay
        if (userRiskConfig.profile && RISK_PROFILES[userRiskConfig.profile]) {
           const profileOverlay = RISK_PROFILES[userRiskConfig.profile];
           config = {
             ...config,
             profile: userRiskConfig.profile,
             dimensions: { ...config.dimensions, ...profileOverlay.dimensions },
             factors: { ...config.factors, ...profileOverlay.factors },
           };
        }

        // 4. Apply specific user overrides (deep merge mimic)
        if (userRiskConfig.dimensions) {
          config.dimensions = { ...config.dimensions, ...userRiskConfig.dimensions };
        }
        if (userRiskConfig.factors) {
          config.factors = { ...config.factors, ...userRiskConfig.factors };
        }
      }
    }
  } catch (err) {
    console.error("[RiskConfig] Failed to resolve user config", err);
    // Fallback to defaults on error
  }

  return config;
}
