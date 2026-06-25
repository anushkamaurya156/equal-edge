const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const createJob = async (jobData) => {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(jobData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create job');
  return data;
};

export const getAllJobs = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      queryParams.append(key, filters[key]);
    }
  });

  const response = await fetch(`/api/jobs?${queryParams.toString()}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch jobs');
  return data;
};

export const getJobById = async (id) => {
  const response = await fetch(`/api/jobs/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch job details');
  return data;
};

export const updateJob = async (id, jobData) => {
  const response = await fetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(jobData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update job');
  return data;
};

export const deleteJob = async (id) => {
  const response = await fetch(`/api/jobs/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete job');
  return data;
};

export const getEmployerJobs = async () => {
  const response = await fetch('/api/jobs/employer', {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch employer jobs');
  return data;
};
