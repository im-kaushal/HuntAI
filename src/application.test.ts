import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateCoverLetter, generateInterviewPlan, generateOutreach, getDashboardData, updateApplicationState } from './application.js';

test('dashboard includes ranked jobs and analytics', () => {
  const data = getDashboardData();

  assert.equal(data.analytics.jobsDiscovered, 3);
  assert.ok(data.jobs[0].match.overallScore >= data.jobs[1].match.overallScore);
  assert.ok(data.analytics.averageMatchScore > 0);
});

test('application state can be updated', () => {
  const updated = updateApplicationState('job-001', 'preparing');

  assert.equal(updated.state, 'preparing');
  assert.equal(getDashboardData().jobs.find((view) => view.job.id === 'job-001')?.application.state, 'preparing');
});

test('assistant generators produce role-specific output', () => {
  assert.match(generateOutreach('job-001', 'Priya'), /OrbitWorks/);
  assert.match(generateCoverLetter('job-001'), /Senior Full-Stack Engineer/);
  assert.ok(generateInterviewPlan('job-001').length >= 4);
});
