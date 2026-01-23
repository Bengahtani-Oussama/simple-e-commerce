import { useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthState, useAuthStore } from "./store/authStore";
// import { Toaster } from './components/ui/toaster';
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const ProductList = lazy(() => import("./pages/products/ProductList"));
const ProductCreate = lazy(() => import("./pages/products/ProductCreate"));
const ProductEdit = lazy(() => import("./pages/products/ProductEdit"));
const SectionList = lazy(() => import("./pages/sections/SectionList"));
const SectionCreate = lazy(() => import("./pages/sections/SectionCreate"));
const SectionEdit = lazy(() => import("./pages/sections/SectionEdit"));
const SectionDetail = lazy(() => import("./pages/sections/SectionDetail"));
const InventoryList = lazy(() => import("./pages/inventory/InventoryOverview"));
const InventoryAdjustment = lazy(
  () => import("./pages/inventory/StockAdjustment"),
);
const InventoryHistory = lazy(() => import("./pages/inventory/StockHistory"));
const CategoryList = lazy(() => import("./pages/categories/CategoryList"));
const BrandList = lazy(() => import("./pages/brands/BrandList"));
const OrderList = lazy(() => import("./pages/orders/OrderList"));
const CouponList = lazy(() => import("./pages/coupons/CouponList"));
const CouponCreate = lazy(() => import("./pages/coupons/CouponCreate"));
const CouponEdit = lazy(() => import("./pages/coupons/CouponEdit"));
const OrderDetail = lazy(() => import("./pages/orders/OrderDetail"));
const CustomerList = lazy(() => import("./pages/customers/CustomerList"));
const CustomerDetail = lazy(() => import("./pages/customers/CustomerDetail"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const DashboardLayout = lazy(
  () => import("./components/layout/DashboardLayout"),
);

// Loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore() as AuthState;
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore() as AuthState;
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect to the page they tried to visit, or dashboard
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// App component
function App() {
  const { checkAuth } = useAuthStore() as AuthState;

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes - All wrapped in Dashboard Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Products */}
            <Route path="products">
              <Route index element={<ProductList />} />
              <Route path="create" element={<ProductCreate />} />
              <Route path="edit/:id" element={<ProductEdit />} />
            </Route>

            <Route path="sections">
              <Route index element={<SectionList />} />
              <Route path="create" element={<SectionCreate />} />
    <Route path="edit/:id" element={<SectionEdit />} />
    <Route path=":id" element={<SectionDetail />} />
            </Route>

            {/* Inventory */}
            <Route path="inventory">
              <Route index element={<InventoryList />} />
              <Route
                path="adjust/:productId/:variantId"
                element={<InventoryAdjustment />}
              />
              <Route
                path="history/:productId/:variantId"
                element={<InventoryHistory />}
              />
            </Route>

            {/* Categories */}
            <Route path="categories">
              <Route index element={<CategoryList />} />
            </Route>

            {/* Brands */}
            <Route path="brands">
              <Route index element={<BrandList />} />
            </Route>

            {/* Orders */}
            <Route path="orders">
              <Route index element={<OrderList />} />
              <Route path=":id" element={<OrderDetail />} />
            </Route>

            {/* Coupons */}
            <Route path="coupons">
              <Route index element={<CouponList />} />
              <Route path="create" element={<CouponCreate />} />
              <Route path="edit/:id" element={<CouponEdit />} />
            </Route>

            {/* Customers */}
            <Route path="customers">
              <Route index element={<CustomerList />} />
              <Route path=":id" element={<CustomerDetail />} />
            </Route>

            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        {/* <Toaster /> */}
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
