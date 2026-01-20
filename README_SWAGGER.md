الـ Swagger API Documentation لمشروع E-Commerce

# 🎉 تم إضافة Swagger API Documentation بنجاح!

## 📌 ملخص التطبيق

تم إضافة توثيق API شامل وتفاعلي باستخدام **Swagger/OpenAPI** لجميع نقاط الوصول (endpoints) في المشروع.

---

## ✨ ما تم تنجيزه

### ✅ تثبيت المكتبات
```bash
npm install --save swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

### ✅ إضافة التوثيق
- **76+ endpoint** موثقة بشكل كامل
- جميع الـ **parameters** و **request bodies** و **responses** موثقة
- دعم **Bearer Token** للمصادقة
- **Tags** لتنظيم الـ endpoints

### ✅ الملفات المضافة/المعدلة
```
src/config/swagger.ts              - ✨ جديد - إعدادات Swagger
src/types/swagger.d.ts             - ✨ جديد - TypeScript types
src/server.ts                       - 📝 معدل - إضافة Swagger middleware
src/routes/*.ts                     - 📝 معدلة - إضافة @swagger comments
SWAGGER_SETUP.md                    - ✨ جديد - دليل شامل
SWAGGER_QUICK_GUIDE.md              - ✨ جديد - دليل سريع
```

---

## 🚀 البدء السريع

### 1. تشغيل السيرفر
```bash
cd backend
npm run dev
```

### 2. الوصول إلى التوثيق
```
http://localhost:5000/api-docs
```

### 3. تسجيل الدخول
```
Email: ahmed@example.com
Password: user123456
```

### 4. اختبار الـ Endpoints
- اضغط على أي endpoint
- اضغط "Try it out"
- اضغط "Execute"

---

## 📚 الـ Endpoints الموثقة

### العلاقات الأساسية
```
🔐 = يتطلب مصادقة
👨‍💼 = للأدمن فقط
🔒 = للـ superadmin فقط
```

### الفئات الرئيسية (Tags)

#### 1. Authentication (7 endpoints)
- `POST /auth/register` - تسجيل جديد
- `POST /auth/login` - دخول
- `POST /auth/refresh` - تحديث التوكن
- `POST /auth/forgot-password` - نسيت كلمة المرور
- `POST /auth/reset-password/:token` - تغيير كلمة المرور
- `🔐 POST /auth/logout` - تسجيل خروج
- `🔐 GET /auth/me` - ملف شخصي

#### 2. Products (13 endpoints)
- `GET /products` - عرض المنتجات
- `GET /products/:id` - تفاصيل المنتج
- `GET /products/slug/:slug` - البحث بـ slug
- `👨‍💼 POST /products` - إضافة منتج
- `👨‍💼 PUT /products/:id` - تعديل منتج
- `👨‍💼 DELETE /products/:id` - حذف منتج
- **+6 variants endpoints**

#### 3. Categories (6 endpoints)
- `GET /categories` - عرض الفئات
- `GET /categories/:id` - تفاصيل الفئة
- `👨‍💼 POST /categories` - إضافة فئة
- `👨‍💼 PUT /categories/:id` - تعديل فئة
- `👨‍💼 DELETE /categories/:id` - حذف فئة

#### 4. Brands (5 endpoints)
- `GET /brands` - عرض العلامات التجارية
- `GET /brands/:id` - تفاصيل العلامة
- `👨‍💼 POST /brands` - إضافة علامة
- `👨‍💼 PUT /brands/:id` - تعديل علامة
- `👨‍💼 DELETE /brands/:id` - حذف علامة

#### 5. Shopping Cart (5 endpoints)
- `🔐 GET /cart` - عرض السلة
- `🔐 POST /cart/items` - إضافة عنصر
- `🔐 PUT /cart/items/:itemId` - تعديل الكمية
- `🔐 DELETE /cart/items/:itemId` - حذف عنصر
- `🔐 DELETE /cart` - تفريغ السلة

#### 6. Orders (5 endpoints)
- `🔐 POST /orders` - إنشاء طلب
- `🔐 GET /orders` - عرض طلباتي
- `🔐 GET /orders/:id` - تفاصيل الطلب
- `🔐 PUT /orders/:id/cancel` - إلغاء الطلب
- `🔐 PUT /orders/:id/apply-coupon` - تطبيق كوبون

#### 7. Coupons (7 endpoints)
- `POST /coupons/validate` - التحقق من الكوبون
- `👨‍💼 GET /coupons` - عرض الكوبونات
- `👨‍💼 POST /coupons` - إضافة كوبون
- `👨‍💼 GET /coupons/:id` - تفاصيل الكوبون
- `👨‍💼 PUT /coupons/:id` - تعديل كوبون
- `👨‍💼 DELETE /coupons/:id` - حذف كوبون
- `👨‍💼 PUT /coupons/:id/toggle-status` - تفعيل/تعطيل

#### 8. User Management (6 endpoints)
- `🔐 PUT /users/profile` - تحديث الملف الشخصي
- `🔐 GET /users/addresses` - عرض العناوين
- `🔐 POST /users/addresses` - إضافة عنوان
- `🔐 PUT /users/addresses/:addressId` - تعديل عنوان
- `🔐 DELETE /users/addresses/:addressId` - حذف عنوان
- `🔐 PUT /users/addresses/:addressId/default` - تعيين كافتراضي

#### 9. Upload (5 endpoints)
- `👨‍💼 POST /upload/product/image` - رفع صورة منتج
- `👨‍💼 POST /upload/product/images` - رفع صور متعددة
- `👨‍💼 POST /upload/category/image` - رفع صورة فئة
- `👨‍💼 POST /upload/brand/logo` - رفع شعار
- `👨‍💼 DELETE /upload/image` - حذف صورة

#### 10. Admin Authentication (8 endpoints)
- `POST /admin/auth/login` - دخول الأدمن
- `POST /admin/auth/refresh` - تحديث التوكن
- `👨‍💼 PUT /admin/auth/change-password` - تغيير كلمة المرور
- `👨‍💼 PUT /admin/auth/notification-preferences` - الإشعارات
- `👨‍💼 POST /admin/auth/logout` - تسجيل خروج
- `👨‍💼 GET /admin/auth/me` - ملف الأدمن

#### 11. Admin Orders (5 endpoints)
- `👨‍💼 GET /admin/orders/stats` - إحصائيات الطلبات
- `👨‍💼 GET /admin/orders` - عرض جميع الطلبات
- `👨‍💼 GET /admin/orders/:id` - تفاصيل الطلب
- `👨‍💼 PUT /admin/orders/:id/status` - تحديث الحالة
- `👨‍💼 PUT /admin/orders/:id/items/:itemId/return` - معالجة الاسترجاع

#### 12. Admin Customers (5 endpoints)
- `👨‍💼 GET /admin/customers` - عرض العملاء
- `👨‍💼 GET /admin/customers/:id` - تفاصيل العميل
- `👨‍💼 PUT /admin/customers/:id/toggle-status` - تفعيل/تعطيل
- `👨‍💼 PUT /admin/customers/bulk/toggle-status` - تفعيل مجموعة
- `👨‍💼 PUT /admin/customers/:id` - تعديل بيانات العميل

#### 13. Admin Staff (7 endpoints)
- `👨‍💼 GET /admin/staff` - عرض الموظفين
- `👨‍💼 GET /admin/staff/:id` - تفاصيل الموظف
- `👨‍💼 POST /admin/staff` - إضافة موظف
- `👨‍💼 PUT /admin/staff/:id` - تعديل الموظف
- `🔒 DELETE /admin/staff/:id` - حذف الموظف
- `🔒 PATCH /admin/staff/:id/permissions` - تحديث الصلاحيات

#### 14. Admin Inventory (6 endpoints)
- `👨‍💼 GET /admin/inventory/overview` - نظرة عامة
- `👨‍💼 GET /admin/inventory/low-stock` - المخزون الناقص
- `👨‍💼 GET /admin/inventory/history` - سجل المخزون
- `👨‍💼 GET /admin/inventory/history/:productId/:variantId` - سجل الخيار
- `👨‍💼 POST /admin/inventory/adjust` - ضبط المخزون
- `👨‍💼 POST /admin/inventory/bulk-adjust` - ضبط مجموعة

**المجموع: 76+ Endpoint موثق بشكل كامل**

---

## 🔐 المصادقة

### الحصول على التوكن
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "ahmed@example.com",
  "password": "user123456"
}
```

### استخدام التوكن في Swagger
1. اضغط زر **"Authorize"** في الأعلى
2. اختر **"Bearer Token"**
3. الصق التوكن
4. اضغط **"Authorize"** ثم **"Close"**

### استخدام التوكن في curl
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

---

## 📖 أمثلة الاستخدام

### مثال 1: الحصول على المنتجات
```bash
GET http://localhost:5000/api/products?page=1&limit=10&category=electronics
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 100,
  "data": [
    {
      "_id": "65abc123def456ghi789",
      "name": "iPhone 15",
      "price": 999,
      "category": "electronics",
      "brand": "Apple",
      "stock": 50,
      "image": "https://..."
    }
  ]
}
```

### مثال 2: إنشاء طلب
```bash
POST http://localhost:5000/api/orders
Authorization: Bearer YOUR_TOKEN

{
  "items": [
    {
      "productId": "65abc123def456ghi789",
      "variantId": "65abc123def456ghi790",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "الشارع الرئيسي 123",
    "city": "الجزائر",
    "state": "بن عكنون",
    "zipCode": "16000",
    "country": "الجزائر"
  },
  "shippingMethod": "home_delivery",
  "paymentMethod": "cash_on_delivery"
}
```

### مثال 3: تطبيق كوبون
```bash
PUT http://localhost:5000/api/orders/65abc123def456ghi789/apply-coupon
Authorization: Bearer YOUR_TOKEN

{
  "couponCode": "SAVE20"
}
```

---

## 🎓 استخدام الـ Swagger UI

### Try It Out Feature
1. اضغط على أي endpoint
2. اضغط **"Try it out"**
3. ملء القيم المطلوبة
4. اضغط **"Execute"**
5. عرض Response في الأسفل

### البحث عن Endpoint
- استخدم شريط البحث في الأعلى
- أو قم بـ scroll عبر القائمة
- الـ endpoints مرتبة حسب Tags

### الحصول على معلومات التطبيق
```bash
GET http://localhost:5000/api
```

---

## 🛠️ التخصيص والإضافات

### إضافة توثيق لـ endpoint جديد

في ملف الـ route (`src/routes/example.ts`):

```typescript
/**
 * @swagger
 * /endpoint-path:
 *   post:
 *     summary: وصف الـ endpoint
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field1]
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       200:
 *         description: نجاح العملية
 *       400:
 *         description: خطأ في البيانات
 */
router.post('/endpoint-path', handler);
```

---

## 📊 معلومات المشروع

- **الإصدار**: 1.0.0
- **الوصف**: Algeria E-Commerce API
- **الدعم**: support@ecommerce.com
- **الـ Servers**:
  - Development: http://localhost:5000/api
  - Production: https://api.ecommerce.com

---

## 🔗 الروابط المهمة

| الرابط | الوصف |
|--------|--------|
| http://localhost:5000/api-docs | Swagger UI |
| http://localhost:5000/api-docs/swagger.json | OpenAPI JSON |
| http://localhost:5000/api | API Root |

---

## 📂 هيكل المشروع

```
backend/
├── src/
│   ├── config/
│   │   ├── swagger.ts          ✨ جديد
│   │   └── database.ts
│   ├── routes/
│   │   ├── authRoutes.ts       📝 معدل
│   │   ├── productRoutes.ts    📝 معدل
│   │   └── ... (جميع routes معدلة)
│   ├── types/
│   │   └── swagger.d.ts        ✨ جديد
│   └── server.ts               📝 معدل
├── package.json                📝 معدل
└── ...

root/
├── SWAGGER_SETUP.md            ✨ جديد - دليل شامل
├── SWAGGER_QUICK_GUIDE.md      ✨ جديد - دليل سريع
└── README_SWAGGER.md           ✨ هذا الملف
```

---

## ✅ Checklist للتحقق

- [x] تم تثبيت swagger-jsdoc و swagger-ui-express
- [x] تم إضافة إعدادات Swagger في server.ts
- [x] تم توثيق جميع الـ endpoints
- [x] تم إضافة دعم Bearer Token
- [x] تم تنظيم الـ endpoints بـ Tags
- [x] تم تثبيت TypeScript types
- [x] Swagger UI يعمل على /api-docs
- [x] جميع الأمثلة والشرح موفرة

---

## 🚀 الخطوات التالية

1. **استكشاف الـ API**: افتح http://localhost:5000/api-docs
2. **اختبر الـ Endpoints**: استخدم Try it Out
3. **شارك الرابط**: شارك `/api-docs` مع الفريق
4. **حدّث التوثيق**: أضف documentation عند إضافة endpoints جديدة
5. **استخدم في الـ Frontend**: استخدم الـ endpoint information في التطوير

---

## 💡 نصائح مهمة

1. **التوكن ينتهي الصلاحية**: استخدم /auth/refresh لتحديثه
2. **جرب Filters**: معظم GET endpoints تدعم pagination و filters
3. **اقرأ Response Schemas**: تخبرك بالبيانات الدقيقة المتوقعة
4. **تحقق من Status Codes**: 200 = نجاح، 400 = خطأ في البيانات، 401 = لا توجد مصادقة
5. **احفظ الـ Endpoints**: لا تحتاج تسجيل دخول مرتين

---

## 🆘 حل المشاكل

| المشكلة | السبب | الحل |
|--------|------|-----|
| Cannot GET /api-docs | Swagger middleware غير مثبت | تأكد من إضافة middleware في server.ts |
| 401 Unauthorized | التوكن غير صالح | سجل الدخول مرة أخرى |
| 404 Not Found | Endpoint غير موجود | تحقق من الـ URL والـ method |
| CORS Error | مشكلة في الـ origin | تأكد من CORS config |

---

## 📞 الدعم

للمزيد من المعلومات:
- اقرأ [SWAGGER_SETUP.md](./SWAGGER_SETUP.md) للشرح المفصل
- اقرأ [SWAGGER_QUICK_GUIDE.md](./SWAGGER_QUICK_GUIDE.md) للبدء السريع
- افتح http://localhost:5000/api-docs للتفاعل المباشر

---

**🎉 تم بنجاح! استمتع بـ API Documentation الشاملة!**

Last Updated: 2024
