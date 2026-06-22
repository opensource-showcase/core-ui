export interface Contributor {
  username: string;
  profile_url: string;
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
}

export interface EnrichedContribution {
  repo: string;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  pr_body?: string;
  merged_at: string;
  language: string | null;
  repo_stars: number;
  repo_description: string | null;
  labels: string[];
  additions: number;
  deletions: number;
  files_changed: number;
  showcase: boolean;
  note?: string;
  impact?: 'low' | 'medium' | 'high';
  reviewers?: Array<{ login: string; avatar_url: string }>;
  merged_by?: string;
}

export interface ContributionsData {
  version: string;
  updated_at: string;
  contributor: Contributor;
  contributions: EnrichedContribution[];
}
