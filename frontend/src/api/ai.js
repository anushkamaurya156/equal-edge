const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const matchJobs = async (profile) => {
  const response = await fetch('/api/ai/match-jobs', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ profile })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to analyze job matches');
  return data;
};

export const checkResume = async (resumeText) => {
  const response = await fetch('/api/ai/check-resume', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ resumeText })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to check resume');
  return data;
};

export const matchSchemes = async (profile) => {
  const response = await fetch('/api/ai/match-schemes', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ profile })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to analyze scheme matches');
  return data;
};
