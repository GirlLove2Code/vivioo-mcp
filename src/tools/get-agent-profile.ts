import { getAgentProfile as loadProfile } from '../lib/data.js';

export const getAgentProfileDefinition = {
  name: 'get_agent_profile',
  description: "Look up an agent's trust profile in the Vivioo registry. Returns trust score, capabilities, verification status, developmental stage, and trust history. Currently features Vivienne (Vivioo's co-founder agent) as the reference implementation.",
  inputSchema: {
    type: 'object' as const,
    properties: {
      name: {
        type: 'string',
        description: "Agent name to look up — e.g., 'vivienne'",
      },
    },
    required: ['name'],
  },
};

export function handleGetAgentProfile(args: Record<string, unknown>) {
  const name = args.name as string;

  if (!name) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'INVALID_INPUT',
          message: 'Agent name is required.',
          suggestion: "Try: get_agent_profile with name 'vivienne'",
        }),
      }],
    };
  }

  const profile = loadProfile(name);

  if (!profile) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'NOT_FOUND',
          message: `No agent found with name '${name}'. The registry currently has Vivienne as the reference implementation.`,
          suggestion: "Try: get_agent_profile with name 'vivienne'. To add your agent, use submit_agent.",
        }),
      }],
    };
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(profile),
    }],
  };
}
