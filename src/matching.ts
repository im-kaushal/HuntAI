import type { CandidateProfile, JobPosting, MatchResult, SkillEvidence } from './types.js';

const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const normalize = (value: string): string => value.trim().toLowerCase();

const skillNames = (skills: SkillEvidence[]): Set<string> => {
  const names = new Set<string>();
  for (const skill of skills) {
    names.add(normalize(skill.name));
    for (const alias of skill.aliases ?? []) {
      names.add(normalize(alias));
    }
  }
  return names;
};

const overlap = (required: string[], available: Set<string>): string[] =>
  required.filter((skill) => available.has(normalize(skill)));

export function scoreJobMatch(candidate: CandidateProfile, job: JobPosting): MatchResult {
  const candidateSkills = skillNames(candidate.skills);
  const requiredMatches = overlap(job.requiredSkills, candidateSkills);
  const preferredMatches = overlap(job.preferredSkills, candidateSkills);
  const missingSkills = job.requiredSkills.filter((skill) => !candidateSkills.has(normalize(skill)));

  const requiredScore = job.requiredSkills.length === 0 ? 100 : (requiredMatches.length / job.requiredSkills.length) * 100;
  const preferredScore = job.preferredSkills.length === 0 ? 75 : (preferredMatches.length / job.preferredSkills.length) * 100;

  const experienceScore = job.minimumYears === undefined
    ? 80
    : clamp((candidate.yearsOfExperience / Math.max(job.minimumYears, 1)) * 100);

  const locationScore = job.workMode === 'remote' || job.locations.some((location) =>
    candidate.locations.map(normalize).includes(normalize(location)),
  ) ? 100 : 45;

  const industryScore = !job.industries?.length
    ? 70
    : job.industries.some((industry) => candidate.industries.map(normalize).includes(normalize(industry))) ? 100 : 55;

  const salaryScore = !job.salary?.minimum || !candidate.salaryExpectation
    ? 70
    : job.salary.minimum >= candidate.salaryExpectation.minimum ? 100 : 40;

  const overallScore = clamp(
    requiredScore * 0.4
    + preferredScore * 0.15
    + experienceScore * 0.2
    + locationScore * 0.1
    + industryScore * 0.1
    + salaryScore * 0.05,
  );

  const confidenceScore = clamp(60 + Math.min(job.requiredSkills.length + job.preferredSkills.length, 10) * 3);
  const atsCompatibility = clamp(requiredScore * 0.7 + preferredScore * 0.3);

  const strengths = [
    ...requiredMatches.map((skill) => `Required skill match: ${skill}`),
    ...preferredMatches.map((skill) => `Preferred skill match: ${skill}`),
  ];

  const weaknesses = [
    ...(missingSkills.length ? [`Missing required skills: ${missingSkills.join(', ')}`] : []),
    ...(experienceScore < 80 ? [`Experience below target: ${candidate.yearsOfExperience} years vs ${job.minimumYears ?? 'unspecified'} required`] : []),
    ...(locationScore < 80 ? ['Location or work-mode fit may need review'] : []),
  ];

  return {
    overallScore,
    confidenceScore,
    atsCompatibility,
    strengths,
    weaknesses,
    missingSkills,
    recommendation: overallScore >= 80 ? 'strong-match' : overallScore >= 60 ? 'possible-match' : 'low-match',
  };
}
