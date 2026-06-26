import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scoreJobMatch } from './matching.js';
import type { CandidateProfile, JobPosting } from './types.js';

const candidate: CandidateProfile = {
  id: 'candidate-1',
  headline: 'Senior full-stack engineer',
  skills: [
    { name: 'TypeScript', years: 5, aliases: ['JavaScript'] },
    { name: 'React', years: 4 },
    { name: 'Node.js', years: 5 },
  ],
  industries: ['SaaS'],
  domains: ['Developer Tools'],
  yearsOfExperience: 6,
  seniority: 'senior',
  locations: ['New York, NY'],
  salaryExpectation: { currency: 'USD', minimum: 150000 },
};

const job: JobPosting = {
  id: 'job-1',
  title: 'Senior Software Engineer',
  company: { id: 'company-1', name: 'ExampleCloud' },
  locations: ['New York, NY'],
  workMode: 'hybrid',
  employmentType: 'full-time',
  minimumYears: 5,
  salary: { currency: 'USD', minimum: 170000 },
  source: 'example',
  directApplyUrl: 'https://example.com/jobs/1',
  requiredSkills: ['TypeScript', 'React', 'Node.js'],
  preferredSkills: ['GraphQL'],
  industries: ['SaaS'],
  description: 'Build cloud developer tooling.',
};

test('scores a strong job match with explainable output', () => {
  const result = scoreJobMatch(candidate, job);

  assert.equal(result.recommendation, 'strong-match');
  assert.equal(result.missingSkills.length, 0);
  assert.ok(result.overallScore >= 80);
  assert.ok(result.strengths.some((strength) => strength.includes('TypeScript')));
});

test('reports missing required skills', () => {
  const result = scoreJobMatch(candidate, { ...job, requiredSkills: ['Python', 'Kubernetes'] });

  assert.deepEqual(result.missingSkills, ['Python', 'Kubernetes']);
  assert.ok(result.weaknesses.some((weakness) => weakness.includes('Missing required skills')));
});
