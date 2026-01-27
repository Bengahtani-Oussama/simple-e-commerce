// FILE PATH: admin-panel/src/services/sectionApi.ts
// ACTION: Create this NEW file

import api from './api';

// ===================================
// TYPES
// ===================================

export interface Section {
  _id: string;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  slug: string;
  description?: {
    ar?: string;
    en?: string;
    fr?: string;
  };
  productIds: string[];
  pinnedProducts: string[];
  featuredProducts: string[];
  isActive: boolean;
  order: number;
  minProducts: number;
  scheduling: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    autoArchive: boolean;
  };
  createdAt: string;
  updatedAt: string;
  validProductCount?: number;
  activeProductCount?: number;
}

export interface OrderedProduct {
  productId: string;
  position: number;
  isPinned: boolean;
  isFeatured: boolean;
  product?: any; // Populated product data
}

export interface SectionDnDData {
  sectionId: string;
  sectionName: {
    ar: string;
    en: string;
    fr: string;
  };
  products: OrderedProduct[];
  minProducts: number;
}

export interface SectionFormData {
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  description?: {
    ar?: string;
    en?: string;
    fr?: string;
  };
  productIds: string[];
  isActive: boolean;
  order: number;
  minProducts: number;
  scheduling?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    autoArchive: boolean;
  };
}

// ===================================
// SECTION CRUD
// ===================================

export const getAllSections = async (params?: {
  active?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/sections', { params });
  return response.data;
};

export const getPublicSections = async () => {
  const response = await api.get('/sections/public');
  return response.data;
};

export const getSection = async (id: string) => {
  const response = await api.get(`/sections/${id}`);
  return response.data;
};

export const createSection = async (data: SectionFormData) => {
  const response = await api.post('/sections', data);
  return response.data;
};

export const updateSection = async (id: string, data: Partial<SectionFormData>) => {
  const response = await api.put(`/sections/${id}`, data);
  return response.data;
};

export const deleteSection = async (id: string) => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};

// ===================================
// PRODUCT MANAGEMENT
// ===================================

export const addProductsToSection = async (
  sectionId: string,
  productIds: string[]
) => {
  const response = await api.post(`/sections/${sectionId}/products`, {
    productIds,
  });
  return response.data;
};

export const removeProductFromSection = async (
  sectionId: string,
  productId: string
) => {
  const response = await api.delete(
    `/sections/${sectionId}/products/${productId}`
  );
  return response.data;
};

// ===================================
// DRAG & DROP API
// ===================================

export const togglePinProduct = async (
  sectionId: string,
  productId: string
) => {
  const response = await api.put(
    `/sections/${sectionId}/dnd/pin/${productId}`
  );
  return response.data;
};

export const toggleFeatureProduct = async (
  sectionId: string,
  productId: string
) => {
  const response = await api.put(
    `/sections/${sectionId}/dnd/feature/${productId}`
  );
  return response.data;
};
