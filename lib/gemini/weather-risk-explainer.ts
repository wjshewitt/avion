/**
 * Gemini AI Weather Risk Explainer
 * Generates natural language explanations for weather risk scores
 */

import { GoogleGenAI } from '@google/genai';
import type { DecodedMetar, DecodedTaf } from '@/types/checkwx';
import type { WeatherRiskFactorResult } from '@/lib/weather/risk/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = 'gemini-2.0-flash-exp';

const WEATHER_RISK_EXPLANATION_PROMPT = `You are an aviation weather risk analyst. Explain weather risk scores concisely for pilots and operations teams.

INPUT DATA:
- Risk Score: {score}/100 (Tier: {tier})
- Confidence: {confidence}%
- Flight Phase: {phase}
- Factor Breakdown: {factorBreakdown}
- METAR: {metar}
- TAF: {taf}

YOUR TASK:
Provide a 2-3 sentence explanation answering:
1. WHY is the score {score}? (Which factors drive it?)
2. WHAT are the key weather concerns? (Surface winds, visibility, ceilings, precipitation?)
3. WHAT should operators know? (Phase-specific operational impact)

CONSTRAINTS:
- Maximum 3 sentences
- Use plain aviation language (decode abbreviations like "IFR conditions" not just "IFR")
- Focus on actionable insights
- Mention data confidence if < 70%
- Be specific about numbers (e.g., "winds gusting to 26 knots" not "strong winds")

OUTPUT FORMAT:
Plain text only. No markdown. No preamble. Start directly with the explanation.`;

export interface WeatherRiskExplanationInput {
  score: number | null;
  tier: string | null;
  confidence: number;
  phase: string;
  factorBreakdown: WeatherRiskFactorResult[];
  metar?: DecodedMetar;
  taf?: DecodedTaf;
}

export interface WeatherRiskExplanationResult {
  explanation: string;
  tokensUsed: number;
  cost: number;
  model: string;
  timestamp: string;
}

/**
 * Format factor breakdown for AI consumption
 */
function formatFactorBreakdown(factors: WeatherRiskFactorResult[]): string {
  return factors
    .map((f) => {
      const details = f.details
        ? `\n    - Actual: ${f.details.actualValue}\n    - Threshold: ${f.details.threshold}\n    - Impact: ${f.details.impact}`
        : '';
      return `  • ${f.name.replace(/_/g, ' ')}: Score ${f.score}, Severity ${f.severity}${
        f.messages.length ? `\n    Messages: ${f.messages.join('; ')}` : ''
      }${details}`;
    })
    .join('\n');
}

/**
 * Generate natural language explanation for weather risk score
 */
export async function explainWeatherRisk(
  input: WeatherRiskExplanationInput
): Promise<WeatherRiskExplanationResult> {
  const {
    score,
    tier,
    confidence,
    phase,
    factorBreakdown,
    metar,
    taf,
  } = input;

  // Handle insufficient data case
  if (score === null || tier === null) {
    return {
      explanation: 'Insufficient weather data is available to calculate a reliable risk score. Current data sources may be incomplete, outdated, or unavailable. Operators should verify conditions through alternative means before proceeding.',
      tokensUsed: 0,
      cost: 0,
      model: MODEL,
      timestamp: new Date().toISOString(),
    };
  }

  // Build context string
  const factorText = formatFactorBreakdown(factorBreakdown);
  const metarText = metar?.raw_text || 'Not available';
  const tafText = taf?.raw_text || 'Not available';

  // Create prompt with actual data
  const prompt = WEATHER_RISK_EXPLANATION_PROMPT.replace('{score}', score.toString())
    .replace('{tier}', tier)
    .replace('{confidence}', Math.round(confidence * 100).toString())
    .replace('{phase}', phase)
    .replace('{factorBreakdown}', factorText)
    .replace('{metar}', metarText)
    .replace('{taf}', tafText);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    // Extract text
    const explanation = response.text?.trim() || 'Unable to generate explanation at this time.';

    // Calculate tokens and cost
    const inputTokens = response.usageMetadata?.promptTokenCount || 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    const tokensUsed = inputTokens + outputTokens;

    // Gemini 2.0 Flash pricing: $0.10/$0.40 per 1M tokens
    const cost = inputTokens * 0.0000001 + outputTokens * 0.0000004;

    return {
      explanation,
      tokensUsed,
      cost,
      model: MODEL,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to generate weather risk explanation:', error);
    
    // Return a fallback explanation based on available data
    const fallbackExplanation = generateFallbackExplanation(input);
    
    return {
      explanation: fallbackExplanation,
      tokensUsed: 0,
      cost: 0,
      model: 'fallback',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Generate a rule-based fallback explanation when AI is unavailable
 */
function generateFallbackExplanation(input: WeatherRiskExplanationInput): string {
  const { score, tier, confidence, phase, factorBreakdown } = input;

  if (score === null) {
    return 'Weather risk cannot be calculated due to insufficient data.';
  }

  // Find highest contributing factor
  const topFactor = factorBreakdown.reduce((max, f) => (f.score > max.score ? f : max), factorBreakdown[0]);
  
  const tierText = tier === 'on_track' ? 'low risk' : tier === 'monitor' ? 'moderate risk' : 'high risk';
  const factorName = topFactor?.name.replace(/_/g, ' ') || 'weather conditions';
  const confText = confidence < 0.7 ? ' Note: confidence is lower than ideal due to limited or dated weather reports.' : '';

  return `The ${score}/100 ${tierText} score is primarily driven by ${factorName} (severity: ${topFactor?.severity}). Current flight phase is ${phase}.${confText}`;
}

/**
 * Calculate cost for explanation generation
 */
export function calculateExplanationCost(inputTokens: number, outputTokens: number): number {
  // Gemini 2.0 Flash: $0.10/$0.40 per 1M tokens
  return inputTokens * 0.0000001 + outputTokens * 0.0000004;
}
