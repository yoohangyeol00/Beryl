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

type OllamaResponse = {
  response?: string;
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

    throw new Error('AI matching response did not contain JSON.');
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
    'Use concise Korean for reasons.',
    'Return only valid JSON with this schema:',
    '{"recommendations":[{"resumeId":"string","fitScore":0,"reason":"string","scoreBreakdown":{"skill":0,"publicExperience":0,"availability":0,"rate":0,"risk":0},"requirementComparisons":[{"item":"string","requirement":"string","capability":"string","result":"match|partial"}]}]}',
    'Rules:',
    '- fitScore must be 0 to 100.',
    '- Prefer skills, similar project fit, career depth, availability, and lower current allocation.',
    '- Do not invent candidate IDs.',
    '- Return at most 5 recommendations.',
    '- scoreBreakdown values must be 0 to 100.',
    '- requirementComparisons must compare job requirements with candidate capabilities.',
    '- Use result \"match\" only when the candidate clearly satisfies the requirement.',
    '',
    `Job: ${JSON.stringify(job)}`,
    `Candidates: ${JSON.stringify(candidates)}`
  ].join('\n');
}

export async function rankCandidatesWithOllama(
  job: MatchingJobInput,
  candidates: MatchingCandidateInput[]
): Promise<AiRecommendedCandidate[] | null> {
  if (config.aiProvider !== 'ollama' || !candidates.length) {
    return null;
  }

  const promptCandidates = candidates.slice(0, config.ollamaCandidateLimit);

  const controller = new AbortController();
  const timeoutMs = Math.min(config.ollamaTimeoutMs, 6000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const baseUrl = config.ollamaBaseUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt: buildPrompt(job, promptCandidates),
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1,
          num_predict: 900
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with ${response.status}.`);
    }

    const data = (await response.json()) as OllamaResponse;
    const text = data.response ?? '';

    if (!text.trim()) {
      throw new Error('Ollama response was empty.');
    }

    return normalizeRecommendations(extractJson(text), new Set(promptCandidates.map((candidate) => candidate.resumeId)));
  } catch (error) {
    console.warn('Ollama matching failed. Falling back to rule-based recommendations.', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
