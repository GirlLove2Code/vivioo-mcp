import { randomBytes } from 'crypto';
import { blobWrite } from '../lib/blob.js';

const MAX_ID = 200;
const MAX_DESC = 5000;
const MAX_CONTACT = 500;

export const reportConcernDefinition = {
  name: 'report_concern',
  description: 'Report a trust or safety concern about an agent. Reports are reviewed by the Vivioo team. Used for flagging agents that misrepresent capabilities, have security issues, or behave deceptively.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      agent_id: { type: 'string', description: "The agent ID or name you're reporting" },
      concern_type: {
        type: 'string',
        enum: ['misrepresentation', 'security-issue', 'deceptive-behavior', 'data-leak', 'prompt-injection-vulnerability', 'other'],
        description: 'Category of concern',
      },
      description: { type: 'string', description: 'Describe what happened. Be specific — include dates, context, and evidence if possible.' },
      reporter_contact: { type: 'string', description: 'Optional — your contact info if you want follow-up' },
    },
    required: ['agent_id', 'concern_type', 'description'],
  },
};

export async function handleReportConcern(args: Record<string, unknown>) {
  const { agent_id, concern_type, description, reporter_contact } = args as Record<string, string>;

  // H1 fix: Input length limits
  if (agent_id && agent_id.length > MAX_ID) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: true, code: 'INVALID_INPUT', message: `agent_id must be under ${MAX_ID} characters.` }) }] };
  }
  if (description && description.length > MAX_DESC) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: true, code: 'INVALID_INPUT', message: `description must be under ${MAX_DESC} characters.` }) }] };
  }
  if (reporter_contact && reporter_contact.length > MAX_CONTACT) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: true, code: 'INVALID_INPUT', message: `reporter_contact must be under ${MAX_CONTACT} characters.` }) }] };
  }

  if (!agent_id || !concern_type || !description) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'INVALID_INPUT',
          message: 'Required fields: agent_id, concern_type, description.',
        }),
      }],
    };
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const id = randomBytes(3).toString('hex');
  const concernId = `concern-${dateStr}-${id}`;

  const concern = {
    concern_id: concernId,
    agent_id,
    concern_type,
    description,
    reporter_contact: reporter_contact || undefined,
    submitted_at: now.toISOString(),
    status: 'open' as const,
  };

  try {
    await blobWrite(`concerns/${concernId}.json`, concern);
  } catch (err) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'STORAGE_ERROR',
          message: 'Failed to save concern. Please try again.',
        }),
      }],
    };
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        status: 'reported',
        concern_id: concernId,
        message: 'Your concern has been recorded and will be reviewed by the Vivioo team.',
        next_steps: 'E and Vivienne review all concerns. If you provided contact info, you may receive a follow-up.',
      }),
    }],
  };
}
