import { config } from '../config.js';

export type MatchingJobInput = {
  title: string;
  agency: string;
  category: string;
  description: string;
  requirements: string[];
};

export type MatchingCandidateInput = {
  resumeId: string;
  name: string;
  role: string;
  careerYears: number;
  skills: string[];
  availableFrom: string;
  availabilityStatus: string;
  currentProject: string;
  currentClient: string;
  currentManMonths: number;
};

export type AiRecommendedCandidate = {
  resumeId: string;
  fitScore: number;
  reason: string;
  scoreBreakdown?: AiScoreBreakdown;
  requirementComparisons?: AiRequirementComparison[];
};

export type AiScoreBreakdown = {
  skill: number;
  publicExperience: number;
  availability: number;
  rate: number;
  risk: number;
};

export type AiRequirementComparison = {
  item: string;
  requirement: string;
  capability: string;
  result: 'match' | 'partial';
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type RecommendationJson = {
  recommendations?: Array<{
    resumeId?: unknown;
    fitScore?: unknown;
    reason?: unknown;
    scoreBreakdown?: unknown;
    requirementComparisons?: unknown;
  }>;
};

function clampScore(value: unknown): number {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeScoreBreakdown(value: unknown): AiScoreBreakdown | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    skill: clampScore(value.skill),
    publicExperience: clampScore(value.publicExperience),
    availability: clampScore(value.availability),
    rate: clampScore(value.rate),
    risk: clampScore(value.risk)
  };
}

function normalizeRequirementComparisons(value: unknown): AiRequirementComparison[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const comparisons = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const result = item.result === 'match' ? 'match' : 'partial';

      return {
        item: typeof item.item === 'string' ? item.item.slice(0, 60) : '',
        requirement: typeof item.requirement === 'string' ? item.requirement.slice(0, 140) : '',
        capability: typeof item.capability === 'string' ? item.capability.slice(0, 160) : '',
        result
      };
    })
    .filter((item): item is AiRequirementComparison => Boolean(item?.item && item.requirement && item.capability))
    .slice(0, 6);

  return comparisons.length ? comparisons : undefined;
}

function extractJson(text: string): RecommendationJson {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as RecommendationJson;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as RecommendationJson;
    }

    throw new Error('Gemini response did not contain JSON.');
  }
}

function normalizeRecommendations(value: RecommendationJson, candidateIds: Set<string>): AiRecommendedCandidate[] {
  return (value.recommendations ?? [])
    .map((item) => ({
      resumeId: typeof item.resumeId === 'string' ? item.resumeId : '',
      fitScore: clampScore(item.fitScore),
      reason: typeof item.reason === 'string' ? item.reason.trim() : '',
      scoreBreakdown: normalizeScoreBreakdown(item.scoreBreakdown),
      requirementComparisons: normalizeRequirementComparisons(item.requirementComparisons)
    }))
    .filter((item) => candidateIds.has(item.resumeId))
    .map((item) => ({
      ...item,
      reason: item.reason.slice(0, 180)
    }));
}

function buildPrompt(job: MatchingJobInput, candidates: MatchingCandidateInput[]): string {
  return [
    'You are an assistant for BERYL, a procurement and staffing operations system.',
    'Rank candidate resumes for a supplier-side bid notice.',
    'Use Korean for reasons.',
    'Return only valid JSON with this schema:',
    '{"recommendations":[{"resumeId":"string","fitScore":0,"reason":"string","scoreBreakdown":{"skill":0,"publicExperience":0,"availability":0,"rate":0,"risk":0},"requirementComparisons":[{"item":"string","requirement":"string","capability":"string","result":"match|partial"}]}]}',
    'Rules:',
    '- fitScore must be 0 to 100.',
    '- Prefer skills, similar project fit, career depth, availability, and lower current allocation.',
    '- Do not invent candidate IDs.',
    '- Return at most 8 recommendations.',
    '- scoreBreakdown values must be 0 to 100.',
    '- requirementComparisons must compare job requirements with candidate capabilities.',
    '- Use result \"match\" only when the candidate clearly satisfies the requirement.',
    '',
    `Job: ${JSON.stringify(job)}`,
    `Candidates: ${JSON.stringify(candidates)}`
  ].join('\n');
}

export async function rankCandidatesWithGemini(
  job: MatchingJobInput,
  candidates: MatchingCandidateInput[]
): Promise<AiRecommendedCandidate[] | null> {
  if (config.aiProvider !== 'gemini' || !config.geminiApiKey || !candidates.length) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.geminiTimeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.geminiModel)}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: buildPrompt(job, candidates) }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with ${response.status}.`);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n') ?? '';

    if (!text.trim()) {
      throw new Error('Gemini response was empty.');
    }

    return normalizeRecommendations(extractJson(text), new Set(candidates.map((candidate) => candidate.resumeId)));
  } catch (error) {
    console.warn('Gemini matching failed. Falling back to rule-based recommendations.', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
