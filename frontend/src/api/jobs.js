import { customFetch } from '../config';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const createJob = async (jobData) => {
  return customFetch('/api/jobs', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(jobData)
  });
};

export const getAllJobs = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      queryParams.append(key, filters[key]);
    }
  });

  return customFetch(`/api/jobs?${queryParams.toString()}`, {
    method: 'GET',
    headers: getHeaders()
  });
};

export const getJobById = async (id) => {
  return customFetch(`/api/jobs/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
};

export const updateJob = async (id, jobData) => {
  return customFetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(jobData)
  });
};

export const deleteJob = async (id) => {
  return customFetch(`/api/jobs/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
};

export const getEmployerJobs = async () => {
  return customFetch('/api/jobs/employer', {
    method: 'GET',
    headers: getHeaders()
  });
};

