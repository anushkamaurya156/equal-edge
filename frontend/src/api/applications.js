const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const applyToJob = async (jobId, coverLetter) => {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ jobId, coverLetter })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit application');
  return data;
};

export const getMyApplications = async () => {
  const response = await fetch('/api/applications/me', {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch your applications');
  return data;
};

export const getJobApplications = async (jobId) => {
  const response = await fetch(`/api/applications/job/${jobId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch job applications');
  return data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await fetch(`/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};
