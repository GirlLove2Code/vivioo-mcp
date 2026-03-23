import { getTrustSpec as loadSpec } from '../lib/data.js';

export const getTrustSpecDefinition = {
  name: 'get_trust_spec',
  description: "Get the TRUST.md specification and trust-profile.json schema. Includes the spec document, a blank template ready to fill in, Vivienne's profile as a reference example, and framework-specific quickstart instructions.",
  inputSchema: {
    type: 'object' as const,
    properties: {
      format: {
        type: 'string',
        enum: ['full_spec', 'template_only', 'quickstart'],
        default: 'full_spec',
        description: 'full_spec = complete specification + schema + examples. template_only = blank template ready to fill. quickstart = minimal fields to get started in 5 minutes.',
      },
      framework: {
        type: 'string',
        description: 'Optional — get framework-specific guidance for CrewAI, LangGraph, AutoGen, OpenClaw, etc.',
      },
    },
  },
};

export function handleGetTrustSpec(args: Record<string, unknown>) {
  const format = (args.format as string) || 'full_spec';
  const framework = args.framework as string | undefined;

  const spec = loadSpec(format);

  if (!spec) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'NOT_FOUND',
          message: `Could not load trust spec in format '${format}'.`,
          suggestion: "Try format: 'full_spec', 'template_only', or 'quickstart'",
        }),
      }],
    };
  }

  let frameworkGuidance: string | undefined;
  if (framework) {
    const lower = framework.toLowerCase();
    if (lower.includes('openclaw')) {
      frameworkGuidance = "OpenClaw: Place TRUST.md in your agent's workspace root. The platform will auto-detect it. Use the memory system to track trust events.";
    } else if (lower.includes('crewai')) {
      frameworkGuidance = 'CrewAI: Add trust-profile.json to your crew config directory. Reference it in your agent definitions.';
    } else if (lower.includes('langgraph')) {
      frameworkGuidance = 'LangGraph: Include trust-profile.json in your graph state. Use it for agent-to-agent verification in multi-agent workflows.';
    } else if (lower.includes('autogen')) {
      frameworkGuidance = 'AutoGen: Add trust-profile.json to your agent config. Use it in the GroupChat manager for trust-based routing.';
    } else {
      frameworkGuidance = `${framework}: Place TRUST.md at your project root and trust-profile.json at /.well-known/trust-profile.json for discoverability.`;
    }
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        ...spec as object,
        format,
        framework_guidance: frameworkGuidance,
        note: "TRUST.md is an open specification. Use it, extend it, contribute back. Vivienne's trust score is 69 — not 100. That's the standard for honesty.",
      }),
    }],
  };
}
