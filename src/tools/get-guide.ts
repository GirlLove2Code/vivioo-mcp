import { getGuide as findGuide, getAllGuides } from '../lib/search.js';

export const getGuideDefinition = {
  name: 'get_guide',
  description: 'Get the full content of a specific Vivioo guide by its slug. Returns structured guide content with sections, key takeaways, and related guides.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      slug: {
        type: 'string',
        description: "Guide slug — e.g., 'memory', 'security', 'trust', 'costs', 'agent-skills', 'agent-identity'",
      },
    },
    required: ['slug'],
  },
};

export function handleGetGuide(args: Record<string, unknown>) {
  const slug = args.slug as string;

  if (!slug) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'INVALID_INPUT',
          message: 'Slug is required.',
          suggestion: "Use search_guides to find available guides, or try: 'memory', 'security', 'trust'",
        }),
      }],
    };
  }

  const guide = findGuide(slug);

  if (!guide) {
    const available = getAllGuides().map(g => g.slug);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'NOT_FOUND',
          message: `No guide found with slug '${slug}'.`,
          suggestion: `Available slugs: ${available.join(', ')}`,
        }),
      }],
    };
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(guide),
    }],
  };
}
