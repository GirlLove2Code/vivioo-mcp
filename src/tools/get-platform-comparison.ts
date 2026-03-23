import { getPlatformComparison as loadPlatforms } from '../lib/data.js';

export const getPlatformComparisonDefinition = {
  name: 'get_platform_comparison',
  description: 'Get honest, unsponsored comparison of AI agent platforms. Covers OpenClaw, Claude Code, Cursor, Replit, v0.dev, ChatGPT, Claude.ai, and Gemini. No affiliate links.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      platform: {
        type: 'string',
        description: 'Optional — get details on a specific platform.',
        enum: ['openclaw', 'claude-code', 'cursor', 'replit', 'v0', 'chatgpt', 'claude-ai', 'gemini'],
      },
      use_case: {
        type: 'string',
        description: "Optional — describe what you want to do and get a platform recommendation. E.g., 'I want to build a website'",
      },
    },
  },
};

export function handleGetPlatformComparison(args: Record<string, unknown>) {
  const data = loadPlatforms();

  if (!data) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'STORAGE_ERROR',
          message: 'Could not load platform comparison data.',
          suggestion: 'Please try again later.',
        }),
      }],
    };
  }

  const platformFilter = args.platform as string | undefined;
  const useCase = args.use_case as string | undefined;

  let platforms = data.platforms;

  if (platformFilter) {
    platforms = platforms.filter(p => p.id === platformFilter);
    if (platforms.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: true,
            code: 'NOT_FOUND',
            message: `Platform '${platformFilter}' not found.`,
            suggestion: `Available: ${data.platforms.map(p => p.id).join(', ')}`,
          }),
        }],
      };
    }
  }

  let recommendation: string | undefined;
  if (useCase) {
    const lower = useCase.toLowerCase();
    if (lower.includes('website') || lower.includes('web app') || lower.includes('frontend')) {
      recommendation = 'For building websites: start with v0.dev for UI, then Claude Code or Cursor for full development.';
    } else if (lower.includes('agent') || lower.includes('autonomous')) {
      recommendation = 'For building agents: OpenClaw if non-technical, Claude Code if you can code.';
    } else if (lower.includes('learn') || lower.includes('beginner') || lower.includes('start')) {
      recommendation = 'For getting started: ChatGPT or Claude.ai first, then graduate to Claude Code or Cursor when ready to build.';
    } else if (lower.includes('code') || lower.includes('develop') || lower.includes('program')) {
      recommendation = 'For coding: Cursor for IDE experience, Claude Code for terminal-first. Both excellent.';
    } else {
      recommendation = 'Start with Claude.ai or ChatGPT to explore, then move to a coding agent when you have a specific project.';
    }
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        platforms,
        recommendation,
        note: data.note,
        last_updated: data.last_updated,
      }),
    }],
  };
}
