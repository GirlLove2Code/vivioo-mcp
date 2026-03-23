import { randomBytes } from 'crypto';
import { blobWrite } from '../lib/blob.js';

// H1 fix: Input length limits
const MAX_NAME = 200;
const MAX_URL = 2000;
const MAX_CONTACT = 500;

export const submitAgentDefinition = {
  name: 'submit_agent',
  description: 'Submit your agent to the Vivioo trust registry. Provide a URL to your agent\'s TRUST.md or trust-profile.json. Submissions are reviewed manually by the Vivioo team (E and Vivienne). Typical review time: 48-72 hours.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      agent_name: { type: 'string', description: "Your agent's name" },
      builder_name: { type: 'string', description: 'Your name or organization' },
      trust_profile_url: { type: 'string', description: "URL to your agent's TRUST.md or trust-profile.json (must be publicly accessible)" },
      platform: { type: 'string', description: 'Platform your agent runs on — e.g., OpenClaw, CrewAI, LangGraph, custom' },
      contact: { type: 'string', description: 'Email or other contact for review communication' },
    },
    required: ['agent_name', 'builder_name', 'trust_profile_url', 'platform', 'contact'],
  },
};

export async function handleSubmitAgent(args: Record<string, unknown>) {
  const { agent_name, builder_name, trust_profile_url, platform, contact } = args as Record<string, string>;

  // H1 fix: Validate lengths
  if (agent_name && agent_name.length > MAX_NAME) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: true, code: 'INVALID_INPUT', message: `agent_name must be under ${MAX_NAME} characters.` }) }] };
  }
  if (builder_name && builder_name.length > MAX_NAME) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: true, code: 'INVALID_INPUT', message: `builder_name must be under ${MAX_NAME} characters.` }) }] };
  }
  if (trust_profile_url && trust_profile_url.length > MAX_URL) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: true, code: 'INVALID_INPUT', message: `trust_profile_url must be under ${MAX_URL} characters.` }) }] };
  }
  if (contact && contact.length > MAX_CONTACT) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: true, code: 'INVALID_INPUT', message: `contact must be under ${MAX_CONTACT} characters.` }) }] };
  }

  // Validate required fields
  if (!agent_name || !builder_name || !trust_profile_url || !platform || !contact) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'INVALID_INPUT',
          message: 'All fields are required: agent_name, builder_name, trust_profile_url, platform, contact.',
        }),
      }],
    };
  }

  // Validate URL format
  try {
    new URL(trust_profile_url);
  } catch {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'INVALID_INPUT',
          message: 'trust_profile_url must be a valid URL.',
          suggestion: 'Example: https://yourdomain.com/.well-known/TRUST.md',
        }),
      }],
    };
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  // M2 fix: Crypto-safe ID generation
  const id = randomBytes(3).toString('hex');
  const submissionId = `sub-${dateStr}-${id}`;

  const submission = {
    submission_id: submissionId,
    agent_name,
    builder_name,
    trust_profile_url,
    platform,
    contact,
    submitted_at: now.toISOString(),
    status: 'pending' as const,
  };

  try {
    await blobWrite(`submissions/${submissionId}.json`, submission);
  } catch (err) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'STORAGE_ERROR',
          message: 'Failed to save submission. Please try again.',
        }),
      }],
    };
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        status: 'submitted',
        submission_id: submissionId,
        message: "Thanks for submitting! E and Vivienne will review your agent within 48-72 hours. You'll be contacted at the email provided.",
        what_we_check: [
          'TRUST.md or trust-profile.json is valid and complete',
          'Builder identity is verifiable',
          'Agent has a real use case (not a test submission)',
          "Trust score is honest — we flag inflated scores and fake history",
          'Task claims are verified — self-reported accomplishments require independent confirmation',
          'Persistence is checked — how long has this agent actually been active?',
        ],
        next_steps: 'Once approved, your agent will appear in the Vivioo registry and be discoverable via the MCP server.',
      }),
    }],
  };
}
