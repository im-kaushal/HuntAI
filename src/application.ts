import type { ApplicationRecord, ApplicationState, CandidateProfile, JobPosting, MatchResult, ReferralCandidate } from './types.js';
import { demoApplications, demoCandidate, demoJobs } from './demo-data.js';
import { scoreJobMatch } from './matching.js';

export interface JobView {
  job: JobPosting;
  match: MatchResult;
  application: ApplicationRecord;
  referrals: ReferralCandidate[];
}

export interface DashboardData {
  candidate: CandidateProfile;
  jobs: JobView[];
  analytics: {
    jobsDiscovered: number;
    strongMatches: number;
    averageMatchScore: number;
    applicationsByState: Record<ApplicationState, number>;
    topMissingSkills: Array<{ skill: string; count: number }>;
  };
}

const applicationStates: ApplicationState[] = [
  'saved', 'interested', 'preparing', 'applied', 'oa-scheduled', 'interview', 'offer', 'rejected', 'withdrawn',
];

const applications = new Map<string, ApplicationRecord>(demoApplications.map((application) => [application.jobId, application]));

export function getDashboardData(): DashboardData {
  const jobs = demoJobs
    .map((job) => ({
      job,
      match: scoreJobMatch(demoCandidate, job),
      application: applications.get(job.id) ?? createApplication(job.id, 'saved'),
      referrals: buildReferrals(job),
    }))
    .sort((left, right) => right.match.overallScore - left.match.overallScore);

  return {
    candidate: demoCandidate,
    jobs,
    analytics: buildAnalytics(jobs),
  };
}

export function updateApplicationState(jobId: string, state: ApplicationState): ApplicationRecord {
  if (!applicationStates.includes(state)) {
    throw new Error(`Unsupported application state: ${state}`);
  }

  const application = createApplication(jobId, state);
  applications.set(jobId, application);
  return application;
}

export function generateOutreach(jobId: string, recipientName = 'there'): string {
  const view = findJobView(jobId);
  const sharedSkills = view.job.requiredSkills.filter((skill) =>
    demoCandidate.skills.some((candidateSkill) => candidateSkill.name.toLowerCase() === skill.toLowerCase()),
  );

  return `Hi ${recipientName}, I noticed ${view.job.company.name} is hiring for ${view.job.title}. My background in ${sharedSkills.join(', ') || 'software engineering'} maps closely to the role, especially the work around ${view.job.description.toLowerCase()} Would you be open to sharing what the team values most and whether a referral conversation makes sense?`;
}

export function generateCoverLetter(jobId: string): string {
  const view = findJobView(jobId);
  const strengths = view.match.strengths.slice(0, 3).map((strength) => strength.replace('Required skill match: ', '').replace('Preferred skill match: ', ''));

  return `Dear ${view.job.company.name} team,\n\nI am excited to apply for the ${view.job.title} role. I bring ${demoCandidate.yearsOfExperience} years of experience building ${demoCandidate.domains.join(', ').toLowerCase()} products and have hands-on depth in ${strengths.join(', ')}.\n\nWhat stands out about this opportunity is the chance to contribute to ${view.job.description.toLowerCase()} My experience aligns with the role's technical needs, and I would be excited to help the team ship reliable, user-centered software.\n\nThank you for your consideration,\n${demoCandidate.headline}`;
}

export function generateInterviewPlan(jobId: string): string[] {
  const view = findJobView(jobId);
  return [
    `Review core requirements: ${view.job.requiredSkills.join(', ')}.`,
    `Prepare stories that connect ${demoCandidate.domains.join(', ')} experience to ${view.job.company.name}'s product context.`,
    `Practice system design for ${view.job.description.toLowerCase()}`,
    view.match.missingSkills.length
      ? `Close gaps or prepare honest framing for: ${view.match.missingSkills.join(', ')}.`
      : 'Prepare deeper examples for matched skills because there are no missing required skills.',
    `Ask about team priorities, engineering process, and success metrics for the ${view.job.department ?? 'engineering'} team.`,
  ];
}

function createApplication(jobId: string, state: ApplicationState): ApplicationRecord {
  return {
    id: `application-${jobId}`,
    jobId,
    state,
    updatedAt: new Date().toISOString(),
  };
}

function findJobView(jobId: string): JobView {
  const view = getDashboardData().jobs.find((item) => item.job.id === jobId);
  if (!view) {
    throw new Error(`Unknown job: ${jobId}`);
  }
  return view;
}

function buildReferrals(job: JobPosting): ReferralCandidate[] {
  return [
    {
      name: 'Priya Shah',
      currentRole: 'Engineering Manager',
      team: job.department,
      publicProfileUrl: `https://example.com/${job.company.id}/priya-shah`,
      suggestedReason: `Leads work related to ${job.title} and can explain team priorities.`,
    },
    {
      name: 'Alex Rivera',
      currentRole: 'Senior Software Engineer',
      team: job.department,
      publicProfileUrl: `https://example.com/${job.company.id}/alex-rivera`,
      suggestedReason: `Shares overlap with ${job.requiredSkills.slice(0, 2).join(' and ')} requirements.`,
    },
  ];
}

function buildAnalytics(jobs: JobView[]): DashboardData['analytics'] {
  const applicationsByState = Object.fromEntries(applicationStates.map((state) => [state, 0])) as Record<ApplicationState, number>;
  const missing = new Map<string, number>();

  for (const view of jobs) {
    applicationsByState[view.application.state] += 1;
    for (const skill of view.match.missingSkills) {
      missing.set(skill, (missing.get(skill) ?? 0) + 1);
    }
  }

  return {
    jobsDiscovered: jobs.length,
    strongMatches: jobs.filter((view) => view.match.recommendation === 'strong-match').length,
    averageMatchScore: Math.round(jobs.reduce((sum, view) => sum + view.match.overallScore, 0) / jobs.length),
    applicationsByState,
    topMissingSkills: [...missing.entries()]
      .map(([skill, count]) => ({ skill, count }))
      .sort((left, right) => right.count - left.count),
  };
}
