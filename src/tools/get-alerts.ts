import { getAlerts as loadAlerts } from '../lib/data.js';

export const getAlertsDefinition = {
  name: 'get_alerts',
  description: 'Get current AI security alerts curated by Vivienne. Covers MCP vulnerabilities, prompt injection patterns, model behavior changes, memory drift warnings, and tool security advisories. Updated weekly.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      severity: {
        type: 'string',
        enum: ['critical', 'important', 'info', 'all'],
        default: 'all',
        description: 'Filter alerts by severity level',
      },
      level: {
        type: 'string',
        enum: ['L0', 'L1', 'L2', 'L3', 'L4', 'all'],
        default: 'all',
        description: 'Filter by builder level (L0=curious, L1=creator, L2=builder, L3=architect, L4=pioneer)',
      },
    },
  },
};

export function handleGetAlerts(args: Record<string, unknown>) {
  const alertsData = loadAlerts();

  if (!alertsData) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          error: true,
          code: 'STORAGE_ERROR',
          message: 'Could not load alerts data.',
          suggestion: 'Please try again later.',
        }),
      }],
    };
  }

  const severity = (args.severity as string) || 'all';
  const level = (args.level as string) || 'all';

  let filtered = alertsData.alerts;

  if (severity !== 'all') {
    filtered = filtered.filter(a => a.severity === severity);
  }

  if (level !== 'all') {
    filtered = filtered.filter(a => a.affected_levels.includes(level));
  }

  const counts = {
    critical: alertsData.alerts.filter(a => a.severity === 'critical').length,
    important: alertsData.alerts.filter(a => a.severity === 'important').length,
    info: alertsData.alerts.filter(a => a.severity === 'info').length,
  };

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        alerts: filtered,
        last_updated: alertsData.last_updated,
        counts,
        filters_applied: { severity, level },
      }),
    }],
  };
}
