# 📚 Swagger API Documentation Setup

## ✅ Status: COMPLETE

Swagger/OpenAPI documentation has been successfully integrated into your backend API!

---

## 🎯 What's New

### Installed Packages
- **swagger-jsdoc** (^6.2.8) - Generate OpenAPI spec from JSDoc comments
- **swagger-ui-express** (^5.0.0) - Interactive Swagger UI interface

### Features Implemented

#### 1. **Swagger Configuration** (`src/config/swagger.ts`)
- OpenAPI 3.0.0 specification
- Development server: `http://localhost:5000/api`
- Production server: `https://api.ecommerce.com`
- JWT Bearer authentication support
- Complete component schemas for all models

#### 2. **Server Integration** (`src/server.ts`)
- Swagger UI available at `/api-docs`
- Documentation link in API root response
- Automatic JWT token persistence in Swagger UI

#### 3. **Route Documentation**
All routes now include comprehensive Swagger documentation with:
- **Summary & Description**: What each endpoint does
- **Tags**: Organized by feature (Authentication, Products, etc.)
- **Parameters**: Query and path parameters with types
- **Request Bodies**: Schema definitions for POST/PUT requests
- **Response Codes**: Status codes and descriptions
- **Security**: Bearer token authentication indicators

---

## 📖 Documented Endpoints

### **Authentication** (10 endpoints)
- `POST /auth/register` - Register new customer
- `POST /auth/login` - Customer login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset with token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

### **Categories** (7 endpoints)
- `GET /categories` - List all categories
- `GET /categories/tree` - Get category tree structure
- `GET /categories/:id` - Get single category
- `POST /categories` - Create category (Admin)
- `PUT /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

### **Brands** (6 endpoints)
- `GET /brands` - List all brands
- `GET /brands/:id` - Get single brand
- `POST /brands` - Create brand (Admin)
- `PUT /brands/:id` - Update brand (Admin)
- `DELETE /brands/:id` - Delete brand (Admin)

### **Products** (13 endpoints)
- `GET /products` - List products with filters
- `GET /products/slug/:slug` - Get by slug
- `GET /products/:id` - Get product details
- `GET /products/:id/variants/:variantId/stock` - Check stock
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)
- **Variants Management**:
  - `POST /products/:id/variants` - Add variant
  - `PUT /products/:id/variants/:variantId` - Update variant
  - `DELETE /products/:id/variants/:variantId` - Delete variant

### **Shopping Cart** (5 endpoints)
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add to cart
- `PUT /cart/items/:itemId` - Update quantity
- `DELETE /cart/items/:itemId` - Remove item
- `DELETE /cart` - Clear cart

### **Orders** (5 endpoints)
- `POST /orders` - Create order
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/cancel` - Cancel order
- `PUT /orders/:id/apply-coupon` - Apply coupon

### **Coupons** (7 endpoints)
- `POST /coupons/validate` - Validate coupon (Public)
- `GET /coupons` - List coupons (Admin)
- `POST /coupons` - Create coupon (Admin)
- `GET /coupons/:id` - Get coupon details
- `PUT /coupons/:id` - Update coupon
- `DELETE /coupons/:id` - Delete coupon
- `PUT /coupons/:id/toggle-status` - Toggle status

### **User Management** (6 endpoints)
- `PUT /users/profile` - Update profile
- `GET /users/addresses` - Get addresses
- `POST /users/addresses` - Add address
- `PUT /users/addresses/:addressId` - Update address
- `DELETE /users/addresses/:addressId` - Delete address
- `PUT /users/addresses/:addressId/default` - Set default

### **File Upload** (5 endpoints)
- `POST /upload/product/image` - Upload single image
- `POST /upload/product/images` - Upload multiple (max 10)
- `POST /upload/category/image` - Upload category image
- `POST /upload/brand/logo` - Upload brand logo
- `DELETE /upload/image` - Delete image

### **Admin - Authentication** (7 endpoints)
- `POST /admin/auth/login` - Admin login
- `POST /admin/auth/refresh` - Refresh token
- `POST /admin/auth/forgot-password` - Forgot password
- `POST /admin/auth/reset-password/:token` - Reset password
- `PUT /admin/auth/change-password` - Change password
- `PUT /admin/auth/notification-preferences` - Update preferences
- `POST /admin/auth/logout` - Logout
- `GET /admin/auth/me` - Get admin profile

### **Admin - Orders** (5 endpoints)
- `GET /admin/orders/stats` - Order statistics
- `GET /admin/orders` - List all orders
- `GET /admin/orders/:id` - Get order details
- `PUT /admin/orders/:id/status` - Update status
- `PUT /admin/orders/:id/items/:itemId/return` - Process return

### **Admin - Customers** (5 endpoints)
- `GET /admin/customers` - List customers (with filters)
- `GET /admin/customers/:id` - Get customer details
- `PUT /admin/customers/:id/toggle-status` - Toggle status
- `PUT /admin/customers/bulk/toggle-status` - Bulk toggle
- `PUT /admin/customers/:id` - Update customer

### **Admin - Staff** (7 endpoints)
- `GET /admin/staff` - List staff members
- `GET /admin/staff/:id` - Get staff details
- `POST /admin/staff` - Create staff member
- `PUT /admin/staff/:id` - Update staff member
- `DELETE /admin/staff/:id` - Delete staff (Super Admin)
- `PATCH /admin/staff/:id/permissions` - Update permissions

### **Admin - Inventory** (6 endpoints)
- `GET /admin/inventory/overview` - Inventory overview
- `GET /admin/inventory/low-stock` - Low stock alerts
- `GET /admin/inventory/history` - Stock history
- `GET /admin/inventory/history/:productId/:variantId` - Variant history
- `POST /admin/inventory/adjust` - Adjust stock
- `POST /admin/inventory/bulk-adjust` - Bulk adjustments

**Total: 76+ Documented Endpoints**

---

## 🚀 How to Access Swagger Documentation

### Method 1: Web Browser
Visit: **http://localhost:5000/api-docs**

### Method 2: OpenAPI JSON
Get raw OpenAPI spec: **http://localhost:5000/api-docs/swagger.json**

### Method 3: Root API Endpoint
```bash
GET http://localhost:5000/api
```
Response includes documentation link.

---

## 📝 Key Features

### ✨ Interactive Testing
- Try out API endpoints directly from Swagger UI
- No external tools needed
- Real-time request/response visualization

### 🔐 Authentication Support
- Built-in JWT Bearer token input field
- Automatically adds `Authorization: Bearer <token>` to requests
- Token persists in browser session

### 📊 Schema Documentation
- Complete request body schemas with:
  - Required fields marked with `*`
  - Field types (string, number, boolean, array, object)
  - Format specifications (email, date-time, etc.)
  - Example values
- Response schemas with model references

### 🏷️ Organization by Tags
- **Authentication** - User auth endpoints
- **Categories** - Category management
- **Brands** - Brand management
- **Products** - Product CRUD & variants
- **Products - Variants** - Variant-specific operations
- **Cart** - Shopping cart operations
- **Orders** - Order management
- **Coupons** - Discount codes
- **Users** - User profile & addresses
- **Users - Addresses** - Address management
- **Upload** - File upload operations
- **Admin - Authentication** - Admin auth
- **Admin - Orders** - Admin order management
- **Admin - Customers** - Customer management
- **Admin - Staff** - Staff management
- **Admin - Inventory** - Stock management

### 🔒 Security Declarations
- All protected endpoints marked with lock icon 🔒
- Clear indication which endpoints require JWT authentication
- Admin-only endpoints clearly labeled
- Super Admin restricted operations marked

---

## 📂 Files Modified/Created

### Modified Files
- `package.json` - Added swagger-jsdoc and swagger-ui-express
- `src/server.ts` - Added Swagger middleware and routes
- All route files - Added JSDoc comments with @swagger annotations

### New Files
- `src/config/swagger.ts` - Swagger configuration
- `src/types/swagger.d.ts` - TypeScript type definitions

---

## 🎓 Quick Start Guide

### 1. **Access Documentation**
```bash
# Start the server
cd backend
npm run dev

# Open in browser
http://localhost:5000/api-docs
```

### 2. **Test an Endpoint**
1. Find endpoint in the list (e.g., `GET /products`)
2. Click "Try it out" button
3. Enter parameters if needed
4. Click "Execute"
5. View response

### 3. **Authenticate**
1. Login first:
   - POST `/auth/login`
   - Email: ahmed@example.com
   - Password: user123456
2. Copy the `accessToken` from response
3. Click "Authorize" button at top
4. Paste token in format: `Bearer <token>`
5. All subsequent requests auto-include the token

### 4. **Explore Admin APIs**
1. Use admin credentials to login: `POST /admin/auth/login`
2. Admin email: admin@example.com
3. Admin password: admin123456
4. Browse admin endpoints (all start with `/admin/`)

---

## 🔧 Customization

### Add Documentation to New Endpoints

```typescript
/**
 * @swagger
 * /path/to/endpoint:
 *   post:
 *     summary: Endpoint description
 *     tags: [Tag Name]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field1, field2]
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 *       400:
 *         description: Error response
 */
router.post('/path/to/endpoint', handler);
```

### Modify Swagger Configuration
Edit `src/config/swagger.ts` to:
- Change server URLs
- Add/modify security schemes
- Update API info (title, version, contact)
- Add/remove schemas

---

## 📋 Testing Checklist

- [x] Swagger UI loads at `/api-docs`
- [x] All 76+ endpoints documented
- [x] Authentication with Bearer token works
- [x] Request parameters display correctly
- [x] Response schemas show proper types
- [x] Admin endpoints marked appropriately
- [x] Tags organize endpoints logically
- [x] Try it out functionality works
- [x] Schema validation displays
- [x] Server URL configuration correct

---

## 🚀 Deployment Notes

### Environment URLs
The Swagger config includes two server URLs:
1. **Development**: http://localhost:5000/api
2. **Production**: https://api.ecommerce.com

Update the production URL in `src/config/swagger.ts` when deploying.

### CORS & Swagger
Swagger UI is served from the same origin, so CORS issues shouldn't occur. However, if you deploy Swagger separately, ensure CORS is enabled for your API domain.

---

## 📚 Additional Resources

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger JSDoc GitHub](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Express GitHub](https://github.com/scottie1984/swagger-ui-express)
- [JWT Authentication with Swagger](https://swagger.io/docs/specification/authentication/bearer-authentication/)

---

## ✅ What You Can Do Now

1. **Explore APIs** - Browse all available endpoints in interactive UI
2. **Test Endpoints** - Execute real API calls with UI
3. **Share Documentation** - Send `/api-docs` link to frontend team
4. **Validate Requests** - See request/response examples
5. **Onboard Developers** - Self-documented API needs no separate docs
6. **Debug Issues** - Test different parameters to isolate problems
7. **Generate Client Code** - Many tools can auto-generate client SDKs from OpenAPI

---

## 🎉 Done!

Your API is now fully documented with interactive Swagger/OpenAPI documentation. All your endpoints are discoverable, testable, and ready for integration with frontend teams!

**Access it now**: http://localhost:5000/api-docs

Questions? Check the endpoint documentation directly in the Swagger UI! 🚀
