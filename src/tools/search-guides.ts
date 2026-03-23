import { searchGuides } from '../lib/search.js';

export const searchGuidesDefinition = {
  name: 'search_guides',
  description: "Search Vivioo's curated knowledge base of 20+ guides on building, raising, and working with AI agents. Covers trust, memory, security, costs, troubleshooting, platforms, and agent development. Written by a real builder and her AI agent from lived experience.",
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: "Search query — e.g., 'agent memory management', 'how to set boundaries', 'cost control', 'security best practices'",
      },
      audience: {
        type: 'string',
        enum: ['builder', 'agent', 'both'],
        default: 'both',
        description: 'Filter by audience: builder guides, agent guides (written by Vivienne for agents), or both',
      },
    },
    required: ['query'],
  },
};

export function handleSearchGuides(args: Record<string, unknown>) {
  const query = args.query as string;
  const audience = (args.audience as string) || 'both';

  if (!query || query.trim().length === 0) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'INVALID_INPUT',
          message: 'Query is required.',
          suggestion: "Try: search_guides with query 'memory' or 'security' or 'trust'",
        }),
      }],
    };
  }

  const results = searchGuides(query, audience);

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        results: results.map(r => ({
          title: r.title,
          slug: r.slug,
          audience: r.audience,
          summary: r.summary,
          relevant_sections: r.relevant_sections,
          url: r.url,
          authors: r.authors,
        })),
        total_guides: 20,
        query,
        audience_filter: audience,
        suggestion: results.length === 0
          ? "No results found. Try broader terms like 'trust', 'memory', 'security', or 'costs'."
          : results.length > 0
          ? `Found ${results.length} matching guides. Use get_guide with a slug for full content.`
          : undefined,
      }),
    }],
  };
}
