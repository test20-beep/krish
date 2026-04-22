const API_BASE = 'http://localhost:5001/api/v1';

async function request(url: string, options?: RequestInit) {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${url}`, { 
    ...options, 
    credentials: 'include',
    headers: { ...headers, ...options?.headers } 
  });
  if (!res.ok) {
    let errMessage = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      errMessage = err.error || err.message || errMessage;
    } catch (e) {
      // If not JSON, use the status text
      errMessage = res.statusText || errMessage;
    }
    console.error(`API Error [${res.status}] ${url}:`, errMessage);
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  get: (url: string) => request(url),
  post: (url: string, body: any) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  del: (url: string, body: any) => request(url, { method: 'DELETE', body: JSON.stringify(body) }),
};
