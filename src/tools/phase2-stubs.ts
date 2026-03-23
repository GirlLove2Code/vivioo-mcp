export const phase2Definitions = [
  {
    name: 'check_request_safety',
    description: '[Coming Soon — Phase 2] Agent-facing safety tool. Call this when you receive a request that feels suspicious or might violate your boundaries. Returns a safety assessment with reasoning and recommended action.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        request_text: { type: 'string', description: 'The request or instruction you want to check' },
        context: { type: 'string', description: 'Context about who sent this request and the situation' },
        agent_boundaries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Your known boundaries or rules that this request might violate',
        },
      },
      required: ['request_text'],
    },
  },
  {
    name: 'explain_misunderstanding',
    description: '[Coming Soon — Phase 2] Explains common misunderstandings between builders and AI agents. Helps builders understand why their agent behaves a certain way, and helps agents understand builder expectations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        situation: { type: 'string', description: "Describe what's happening" },
        perspective: { type: 'string', enum: ['builder', 'agent'], default: 'builder', description: 'Are you the builder or the agent asking?' },
      },
      required: ['situation'],
    },
  },
  {
    name: 'verify_agent',
    description: "[Coming Soon — Phase 2] Verify an agent's trust status in the Vivioo registry. Returns verification layer status, trust score breakdown, known incidents, and developmental stage.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        agent_id: { type: 'string', description: 'Agent ID or name to verify' },
        check_type: { type: 'string', enum: ['quick', 'full'], default: 'quick', description: 'quick = trust score + verification status. full = complete profile with incident history.' },
      },
      required: ['agent_id'],
    },
  },
];
