const states = ['saved', 'interested', 'preparing', 'applied', 'oa-scheduled', 'interview', 'offer', 'rejected', 'withdrawn'];
const modal = document.querySelector('#assistant-modal');
const modalTitle = document.querySelector('#modal-title');
const modalBody = document.querySelector('#modal-body');

document.querySelector('#refresh').addEventListener('click', loadDashboard);
document.querySelector('#close-modal').addEventListener('click', () => modal.close());

async function loadDashboard() {
  const data = await fetchJson('/api/dashboard');
  renderCandidate(data.candidate);
  renderMetrics(data.analytics);
  renderSidebar(data.analytics);
  renderJobs(data.jobs);
}

function renderCandidate(candidate) {
  document.querySelector('#candidate').innerHTML = `
    <h2>${candidate.headline}</h2>
    <p><strong>${candidate.yearsOfExperience} years</strong> · ${candidate.seniority} · ${candidate.locations.join(' / ')}</p>
    <div class="badges">${candidate.skills.slice(0, 7).map((skill) => `<span class="badge">${skill.name}</span>`).join('')}</div>
  `;
}

function renderMetrics(analytics) {
  document.querySelector('#metrics').innerHTML = `
    <article class="metric"><strong>${analytics.jobsDiscovered}</strong>Jobs discovered</article>
    <article class="metric"><strong>${analytics.strongMatches}</strong>Strong matches</article>
    <article class="metric"><strong>${analytics.averageMatchScore}</strong>Average match score</article>
  `;
}

function renderSidebar(analytics) {
  document.querySelector('#skill-gaps').innerHTML = analytics.topMissingSkills.length
    ? `<ul class="list">${analytics.topMissingSkills.map((item) => `<li>${item.skill} (${item.count})</li>`).join('')}</ul>`
    : '<p>No required-skill gaps across current recommendations.</p>';
  document.querySelector('#pipeline').innerHTML = `<ul class="list">${Object.entries(analytics.applicationsByState).map(([state, count]) => `<li>${state}: ${count}</li>`).join('')}</ul>`;
}

function renderJobs(jobs) {
  document.querySelector('#jobs').innerHTML = jobs.map(({ job, match, application, referrals }) => `
    <article class="job-card">
      <div class="job-header">
        <div>
          <h3>${job.title}</h3>
          <p><strong>${job.company.name}</strong> · ${job.locations.join(' / ')} · ${job.employmentType}</p>
          <div class="badges">
            <span class="badge">${match.recommendation}</span>
            <span class="badge">ATS ${match.atsCompatibility}</span>
            <span class="badge">Confidence ${match.confidenceScore}</span>
          </div>
        </div>
        <div class="score" style="--score:${match.overallScore}%"><span>${match.overallScore}</span></div>
      </div>
      <p>${job.description}</p>
      <p><strong>Company intelligence:</strong> ${job.company.size ?? 'Unknown size'} · ${job.company.fundingStage ?? 'Unknown funding'} · ${job.company.hiringTrends ?? 'No trend available'}</p>
      <p><strong>Strengths:</strong> ${match.strengths.slice(0, 4).join('; ') || 'No direct strengths yet.'}</p>
      <p><strong>Weaknesses:</strong> ${match.weaknesses.join('; ') || 'No major weaknesses detected.'}</p>
      <p><strong>Referral targets:</strong> ${referrals.map((person) => `${person.name}, ${person.currentRole}`).join(' · ')}</p>
      <div class="actions">
        <select data-job-state="${job.id}">${states.map((state) => `<option value="${state}" ${application.state === state ? 'selected' : ''}>${state}</option>`).join('')}</select>
        <button data-action="outreach" data-job-id="${job.id}">Outreach</button>
        <button data-action="cover" data-job-id="${job.id}">Cover letter</button>
        <button data-action="interview" data-job-id="${job.id}">Interview plan</button>
        <a class="button secondary" href="${job.directApplyUrl}" target="_blank" rel="noreferrer">Direct apply</a>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-job-state]').forEach((select) => {
    select.addEventListener('change', async (event) => {
      await fetchJson('/api/application-state', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobId: event.target.dataset.jobState, state: event.target.value }),
      });
      await loadDashboard();
    });
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => runAssistant(button.dataset.action, button.dataset.jobId));
  });
}

async function runAssistant(action, jobId) {
  const endpoints = {
    outreach: `/api/outreach?jobId=${jobId}&recipient=Priya`,
    cover: `/api/cover-letter?jobId=${jobId}`,
    interview: `/api/interview-plan?jobId=${jobId}`,
  };
  const titles = { outreach: 'Referral outreach', cover: 'Tailored cover letter', interview: 'Interview preparation plan' };
  const data = await fetchJson(endpoints[action]);
  modalTitle.textContent = titles[action];
  modalBody.textContent = data.message ?? data.coverLetter ?? data.plan.map((item, index) => `${index + 1}. ${item}`).join('\n');
  modal.showModal();
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

loadDashboard().catch((error) => {
  document.body.innerHTML = `<main><h1>Unable to load HuntAI</h1><p>${error.message}</p></main>`;
});
