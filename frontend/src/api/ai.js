import { customFetch } from '../config';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const matchJobs = async (profile) => {
  return customFetch('/api/ai/match-jobs', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ profile })
  });
};

export const checkResume = async (resumeText) => {
  return customFetch('/api/ai/check-resume', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ resumeText })
  });
};

export const matchSchemes = async (profile) => {
  return customFetch('/api/ai/match-schemes', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ profile })
  });
};

