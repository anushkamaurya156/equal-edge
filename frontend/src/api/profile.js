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
  const response = await fetch('/api/profile/me', {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data;
};

export const createOrUpdateProfile = async (profileData) => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to save profile');
  return data;
};

export const uploadResume = async (formData) => {
  const response = await fetch('/api/profile/upload', {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload resume');
  return data;
};

export const uploadCertificate = async (formData) => {
  const response = await fetch('/api/profile/upload-certificate', {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload certificate');
  return data;
};
