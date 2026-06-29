const rawApiUrl = import.meta.env.VITE_API_URL || 'https://sakshamhire-backend.onrender.com';
export const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export const customFetch = async (url, options = {}) => {
  // Prepend API_URL to relative paths
  const targetUrl = url.startsWith('/') ? `${API_URL}${url}` : url;
  
  const response = await fetch(targetUrl, options);
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("Non-JSON response from server at", targetUrl, text);
    throw new Error("Server returned an unexpected response. The service might be sleeping or down. Please try again in a few moments.");
  }
  
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  
  return data;
};
