import { customFetch } from '../config';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getMyProfile = async () => {
  return customFetch('/api/profile/me', {
    method: 'GET',
    headers: getHeaders()
  });
};

export const createOrUpdateProfile = async (profileData) => {
  return customFetch('/api/profile', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData)
  });
};

export const uploadResume = async (formData) => {
  return customFetch('/api/profile/upload', {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
};

export const uploadCertificate = async (formData) => {
  return customFetch('/api/profile/upload-certificate', {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
};

