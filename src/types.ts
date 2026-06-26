export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type ApplicationState =
  | 'saved'
  | 'interested'
  | 'preparing'
  | 'applied'
  | 'oa-scheduled'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface SkillEvidence {
  name: string;
  years?: number;
  aliases?: string[];
}

export interface CandidateProfile {
  id: string;
  headline: string;
  skills: SkillEvidence[];
  industries: string[];
  domains: string[];
  yearsOfExperience: number;
  seniority: string;
  locations: string[];
  workAuthorization?: string[];
  salaryExpectation?: {
    currency: string;
    minimum: number;
  };
}

export interface CompanyProfile {
  id: string;
  name: string;
  size?: string;
  fundingStage?: string;
  headquarters?: string;
  techStack?: string[];
  hiringTrends?: string;
  recentEngineeringNews?: string[];
  interviewDifficulty?: 'low' | 'medium' | 'high';
  estimatedResponseRate?: number;
}

export interface JobPosting {
  id: string;
  title: string;
  company: CompanyProfile;
  department?: string;
  locations: string[];
  workMode?: WorkMode;
  employmentType: EmploymentType;
  minimumYears?: number;
  seniority?: string;
  salary?: {
    currency: string;
    minimum?: number;
    maximum?: number;
  };
  source: string;
  directApplyUrl: string;
  originalPostedAt?: string;
  lastUpdatedAt?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  industries?: string[];
  description: string;
}

export interface MatchResult {
  overallScore: number;
  confidenceScore: number;
  atsCompatibility: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendation: 'strong-match' | 'possible-match' | 'low-match';
}

export interface ReferralCandidate {
  name: string;
  currentRole: string;
  team?: string;
  publicProfileUrl: string;
  suggestedReason: string;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  state: ApplicationState;
  selectedResumeVersion?: string;
  notes?: string;
  updatedAt: string;
}
