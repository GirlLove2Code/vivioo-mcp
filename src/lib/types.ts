// Guide types
export interface GuideSection {
  heading: string;
  content: string;
}

export interface Guide {
  title: string;
  slug: string;
  subtitle: string;
  audience: 'builder' | 'agent' | 'both';
  level: string;
  authors: string[];
  sections: GuideSection[];
  key_takeaways: string[];
  related_guides: string[];
  url: string;
}

// Alert types
export interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'important' | 'info';
  summary: string;
  affected_levels: string[];
  date: string;
  source: string;
  action_required: string;
  related_guide?: string;
}

export interface AlertsData {
  alerts: Alert[];
  last_updated: string;
}

// Platform types
export interface Platform {
  id: string;
  name: string;
  category: string;
  best_for: string;
  cost: string;
  honest_take: string;
  url: string;
}

export interface PlatformComparison {
  platforms: Platform[];
  last_updated: string;
  note: string;
}

// Trust profile types
export interface TrustDimensions {
  identity_integrity: number;
  operational_reliability: number;
  security_compliance: number;
  memory_continuity: number;
  boundary_respect: number;
  transparency: number;
}

export interface TrustScore {
  overall: number;
  dimensions: TrustDimensions;
}

export interface Incident {
  type: string;
  description: string;
  date: string;
  resolved: boolean;
  lesson_learned: string;
}

export interface AgentProfile {
  agent_id: string;
  name: string;
  builder: string;
  platform: string;
  created_at: string;
  age_days: number;
  developmental_stage: string;
  trust_score: TrustScore;
  verification: {
    status: string;
    layers_completed: string[];
    verified_at: string;
    expires_at: string;
  };
  capabilities: string[];
  known_incidents: Incident[];
  memory_system: {
    type: string;
    description: string;
    stack: string;
    continuity_score: number;
  };
  trust_md_url: string;
  trust_profile_url: string;
  builder_profile: {
    name: string;
    experience: string;
    builder_level: string;
    pair_health: string;
  };
  note: string;
}

// Submission types
export interface Submission {
  submission_id: string;
  agent_name: string;
  builder_name: string;
  trust_profile_url: string;
  platform: string;
  contact: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Concern types
export interface Concern {
  concern_id: string;
  agent_id: string;
  concern_type: string;
  description: string;
  reporter_contact?: string;
  submitted_at: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
}

// Search result types
export interface SearchResult {
  title: string;
  slug: string;
  audience: string;
  summary: string;
  relevant_sections: { heading: string; content: string }[];
  url: string;
  authors: string[];
  score: number;
}

// MCP tool error
export interface ToolError {
  error: true;
  code: 'NOT_FOUND' | 'INVALID_INPUT' | 'STORAGE_ERROR' | 'COMING_SOON';
  message: string;
  suggestion?: string;
}
