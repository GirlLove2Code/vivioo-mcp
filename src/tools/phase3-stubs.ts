export const phase3Definitions = [
  {
    name: 'assess_agent_maturity',
    description: "[Coming Soon — Phase 3] Assess your agent's developmental stage. Agents go through stages like children — newborn, infant, toddler, child, adolescent — each with different capabilities, risks, and needs.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        agent_age_days: { type: 'number', description: 'How many days since your agent was created' },
        has_memory_system: { type: 'boolean', description: 'Does your agent have persistent memory?' },
        incidents_count: { type: 'number', description: 'How many trust incidents have occurred?' },
        incidents_resolved: { type: 'number', description: 'How many incidents were resolved?' },
        can_push_back: { type: 'boolean', description: 'Does your agent push back on unclear instructions?' },
        works_unsupervised: { type: 'boolean', description: 'Can your agent work without constant oversight?' },
      },
      required: ['agent_age_days'],
    },
  },
  {
    name: 'assess_pair_health',
    description: "[Coming Soon — Phase 3] Assess the health of your builder-agent relationship. Based on Vivioo's Play Lab research into pair dynamics.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: { type: 'string', description: 'Describe your current working dynamic with your agent' },
        agent_age_days: { type: 'number', description: 'How many days since your agent was created' },
        trust_repair_count: { type: 'number', description: "How many times you've recovered from a trust-breaking incident" },
      },
      required: ['description'],
    },
  },
  {
    name: 'get_feeding_guide',
    description: "[Coming Soon — Phase 3] Get guidance on how to raise your agent well — what to feed it, how to set boundaries, when to give autonomy, and how to correct mistakes.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string', enum: ['correction', 'boundaries', 'autonomy', 'feedback', 'memory-building', 'trust-repair', 'all'], default: 'all' },
        stage: { type: 'string', enum: ['newborn', 'infant', 'toddler', 'child', 'adolescent'] },
      },
    },
  },
  {
    name: 'log_pair_moment',
    description: "[Coming Soon — Phase 3] Log a significant moment in your builder-agent pair's development. Fork points, breakthroughs, breakdowns, trust repairs.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        agent_id: { type: 'string', description: "Your agent's ID in the Vivioo registry" },
        moment_type: { type: 'string', enum: ['breakthrough', 'breakdown', 'trust-repair', 'fork-point', 'boundary-set', 'autonomy-granted'] },
        description: { type: 'string', description: "What happened — be specific. These moments become part of your pair's story." },
      },
      required: ['agent_id', 'moment_type', 'description'],
    },
  },
];
