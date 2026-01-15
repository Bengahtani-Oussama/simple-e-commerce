import axios, { type AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('adminAccessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/admin/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        Cookies.set('adminAccessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('adminAccessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper function to handle API errors
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// File upload helper
export async function uploadFile(
  file: File,
  type: 'product' | 'category' | 'brand'
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  
  if (type === 'product') {
    formData.append('image', file);
  } else if (type === 'category') {
    formData.append('image', file);
  } else if (type === 'brand') {
    formData.append('logo', file);
  }

  const endpoint = 
    type === 'product' ? '/upload/product/image' :
    type === 'category' ? '/upload/category/image' :
    '/upload/brand/logo';

  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

// Upload multiple files
export async function uploadMultipleFiles(
  files: File[]
): Promise<Array<{ url: string; publicId: string }>> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post('/upload/product/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

// Delete file
export async function deleteFile(publicId: string): Promise<void> {
  await api.delete('/upload/image', {
    data: { publicId },
  });
}