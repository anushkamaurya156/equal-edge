import { customFetch } from '../config';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const applyToJob = async (jobId, coverLetter) => {
  return customFetch('/api/applications', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ jobId, coverLetter })
  });
};

export const getMyApplications = async () => {
  return customFetch('/api/applications/me', {
    method: 'GET',
    headers: getHeaders()
  });
};

export const getJobApplications = async (jobId) => {
  return customFetch(`/api/applications/job/${jobId}`, {
    method: 'GET',
    headers: getHeaders()
  });
};

export const updateApplicationStatus = async (applicationId, status) => {
  return customFetch(`/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
};

