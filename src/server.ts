import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import Phase 1 tool definitions and handlers
import { searchGuidesDefinition, handleSearchGuides } from './tools/search-guides.js';
import { getGuideDefinition, handleGetGuide } from './tools/get-guide.js';
import { getAlertsDefinition, handleGetAlerts } from './tools/get-alerts.js';
import { getPlatformComparisonDefinition, handleGetPlatformComparison } from './tools/get-platform-comparison.js';
import { getAgentProfileDefinition, handleGetAgentProfile } from './tools/get-agent-profile.js';
import { getTrustSpecDefinition, handleGetTrustSpec } from './tools/get-trust-spec.js';
import { submitAgentDefinition, handleSubmitAgent } from './tools/submit-agent.js';
import { reportConcernDefinition, handleReportConcern } from './tools/report-concern.js';

// Phase 2/3 stubs
import { phase2Definitions } from './tools/phase2-stubs.js';
import { phase3Definitions } from './tools/phase3-stubs.js';

export function createServer(): Server {
  const server = new Server(
    { name: 'vivioo', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // List all tools (Phase 1 active + Phase 2/3 visible)
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      // Phase 1 — Active
      searchGuidesDefinition,
      getGuideDefinition,
      getAlertsDefinition,
      getPlatformComparisonDefinition,
      getAgentProfileDefinition,
      getTrustSpecDefinition,
      submitAgentDefinition,
      reportConcernDefinition,
      // Phase 2 — Coming Soon
      ...phase2Definitions,
      // Phase 3 — Coming Soon
      ...phase3Definitions,
    ],
  }));

  // Route tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        // Phase 1
        case 'search_guides':
          return handleSearchGuides(args);
        case 'get_guide':
          return handleGetGuide(args);
        case 'get_alerts':
          return handleGetAlerts(args);
        case 'get_platform_comparison':
          return handleGetPlatformComparison(args);
        case 'get_agent_profile':
          return handleGetAgentProfile(args);
        case 'get_trust_spec':
          return handleGetTrustSpec(args);
        case 'submit_agent':
          return handleSubmitAgent(args);
        case 'report_concern':
          return handleReportConcern(args);

        // Phase 2/3 — Coming Soon
        case 'check_request_safety':
        case 'explain_misunderstanding':
        case 'verify_agent':
        case 'assess_agent_maturity':
        case 'assess_pair_health':
        case 'get_feeding_guide':
        case 'log_pair_moment':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: true,
                code: 'COMING_SOON',
                message: `${name} is coming in a future phase. Stay connected — you'll get it automatically when it ships.`,
                suggestion: 'In the meantime, try search_guides, get_alerts, or get_trust_spec.'
              })
            }]
          };

        default:
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: true,
                code: 'NOT_FOUND',
                message: `Unknown tool: ${name}`,
                suggestion: 'Use tools/list to see available tools.'
              })
            }]
          };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: true,
            code: 'STORAGE_ERROR',
            message: `Tool error: ${message}`,
            suggestion: 'Please try again. If the error persists, report it.'
          })
        }]
      };
    }
  });

  return server;
}
