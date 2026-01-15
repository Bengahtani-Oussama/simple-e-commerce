// Product Types
export interface Product {
  _id: string;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  slug: string;
  description: {
    ar: string;
    en: string;
    fr: string;
  };
  category: Category;
  subcategory?: Category;
  brand?: Brand;
  basePrice: number;
  compareAtPrice?: number;
  variants: ProductVariant[];
  variantOptions: {
    sizes?: string[];
    colors?: string[];
    materials?: string[];
    customFields?: { name: string; values: string[] }[];
  };
  images: string[];
  tags?: string[];
  featured: boolean;
  isActive: boolean;
  soldCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  customOptions?: { [key: string]: string };
  price?: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

export interface Category {
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
  image?: string;
  parent?: string | null;
  isActive: boolean;
  order: number;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: {
    ar?: string;
    en?: string;
    fr?: string;
  };
  isActive: boolean;
}

// Cart Types
export interface CartItem {
  _id?: string;
  product: string;
  variant: string;
  sku: string;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  variantDetails: {
    size?: string;
    color?: string;
    material?: string;
    customOptions?: { [key: string]: string };
  };
  price: number;
  quantity: number;
  image?: string;
  stock: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address;
  shippingMethod: 'home_delivery' | 'office_pickup';
  paymentMethod: 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  customerNote?: string;
  adminNote?: string;
  hasReturn: boolean;
  returnTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: string;
  variant: string;
  sku: string;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  variantDetails: {
    size?: string;
    color?: string;
    material?: string;
    customOptions?: { [key: string]: string };
  };
  price: number;
  quantity: number;
  image?: string;
  returnStatus?: 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
  returnReason?: string;
  returnQuantity?: number;
}

// User & Address Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addresses: Address[];
  role: 'customer';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  addressLine: string;
  postalCode?: string;
  isDefault: boolean;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductFilters extends PaginationParams {
  category?: string;
  subcategory?: string;
  brand?: string;
  featured?: boolean;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
}