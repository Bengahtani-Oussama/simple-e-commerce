# API Documentation Creation TODO

## Tasks to Complete
- [ ] Create Postman collection JSON file with all 86 endpoints
- [ ] Organize endpoints into logical folders (Auth, Products, Orders, etc.)
- [ ] Add request examples with proper JSON bodies based on controllers
- [ ] Add response examples for success and error cases
- [ ] Include authentication headers and environment variables
- [ ] Add descriptions and notes for each endpoint
- [ ] Verify collection structure and importability

## Endpoints to Include
### Authentication (Customer)
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password/:token
- [ ] GET /api/auth/me

### Authentication (Admin)
- [ ] POST /api/admin/auth/login
- [ ] POST /api/admin/auth/refresh
- [ ] POST /api/admin/auth/logout
- [ ] POST /api/admin/auth/forgot-password
- [ ] POST /api/admin/auth/reset-password/:token
- [ ] PUT /api/admin/auth/change-password
- [ ] PUT /api/admin/auth/notification-preferences
- [ ] GET /api/admin/auth/me

### Products
- [ ] GET /api/products
- [ ] GET /api/products/:id
- [ ] GET /api/products/slug/:slug
- [ ] POST /api/products
- [ ] PUT /api/products/:id
- [ ] DELETE /api/products/:id
- [ ] POST /api/products/:id/variants
- [ ] PUT /api/products/:id/variants/:variantId
- [ ] DELETE /api/products/:id/variants/:variantId
- [ ] GET /api/products/:id/variants/:variantId/stock

### Orders
- [ ] POST /api/orders
- [ ] GET /api/orders
- [ ] GET /api/orders/:id
- [ ] PUT /api/orders/:id/cancel
- [ ] PUT /api/orders/:id/apply-coupon

### Cart
- [ ] GET /api/cart
- [ ] POST /api/cart/items
- [ ] PUT /api/cart/items/:itemId
- [ ] DELETE /api/cart/items/:itemId
- [ ] DELETE /api/cart

### Categories
- [ ] GET /api/categories
- [ ] GET /api/categories/tree
- [ ] GET /api/categories/:id
- [ ] POST /api/categories
- [ ] PUT /api/categories/:id
- [ ] DELETE /api/categories/:id

### Brands
- [ ] GET /api/brands
- [ ] GET /api/brands/:id
- [ ] POST /api/brands
- [ ] PUT /api/brands/:id
- [ ] DELETE /api/brands/:id

### Coupons
- [ ] POST /api/coupons/validate
- [ ] GET /api/coupons
- [ ] POST /api/coupons
- [ ] GET /api/coupons/:id
- [ ] PUT /api/coupons/:id
- [ ] DELETE /api/coupons/:id
- [ ] PUT /api/coupons/:id/toggle-status

### Inventory
- [ ] GET /api/admin/inventory/overview
- [ ] GET /api/admin/inventory/low-stock
- [ ] GET /api/admin/inventory/history
- [ ] GET /api/admin/inventory/history/:productId/:variantId
- [ ] POST /api/admin/inventory/adjust
- [ ] POST /api/admin/inventory/bulk-adjust

### Uploads
- [ ] POST /api/upload/product/image
- [ ] POST /api/upload/product/images
- [ ] POST /api/upload/category/image
- [ ] POST /api/upload/brand/logo
- [ ] DELETE /api/upload/image

### Users
- [ ] PUT /api/users/profile
- [ ] GET /api/users/addresses
- [ ] POST /api/users/addresses
- [ ] PUT /api/users/addresses/:addressId
- [ ] DELETE /api/users/addresses/:addressId
- [ ] PUT /api/users/addresses/:addressId/default

### Admin Orders
- [ ] GET /api/admin/orders/stats
- [ ] GET /api/admin/orders
- [ ] GET /api/admin/orders/:id
- [ ] PUT /api/admin/orders/:id/status
- [ ] PUT /api/admin/orders/:id/items/:itemId/return

### Admin Customers
- [ ] GET /api/admin/customers
- [ ] GET /api/admin/customers/:id
- [ ] PUT /api/admin/customers/:id/toggle-status
- [ ] PUT /api/admin/customers/bulk/toggle-status
- [ ] PUT /api/admin/customers/:id

### Admin Staff
- [ ] GET /api/admin/staff
- [ ] GET /api/admin/staff/:id
- [ ] POST /api/admin/staff
- [ ] PUT /api/admin/staff/:id
- [ ] DELETE /api/admin/staff/:id
- [ ] PATCH /api/admin/staff/:id/permissions
