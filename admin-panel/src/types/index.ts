// Admin Types
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  category: Category | string;
  subcategory?: Category | string;
  brand?: Brand | string;
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
  totalStock?: number;
  priceRange?: { min: number; max: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id?: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
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
  product: string | Product;
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

export interface ShippingAddress {
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  addressLine: string;
  postalCode?: string;
}

// User Types
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

// Dashboard Stats
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: {
    product: Product;
    totalSold: number;
    revenue: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
  }[];
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
  stats?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

// Form Types
export interface ProductFormData {
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  description: {
    ar: string;
    en: string;
    fr: string;
  };
  category: string;
  subcategory?: string;
  brand?: string;
  basePrice: number;
  compareAtPrice?: number;
  images: string[];
  tags?: string[];
  featured: boolean;
  isActive: boolean;
}

export interface CategoryFormData {
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
  parent?: string | null;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface BrandFormData {
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

// Upload Types
export interface UploadedFile {
  url: string;
  publicId: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  discountPercentage?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isValid?: boolean; // Virtual field
}
export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  usedCoupons: number;
}