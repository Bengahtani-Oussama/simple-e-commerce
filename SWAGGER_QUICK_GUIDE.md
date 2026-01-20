# 🚀 Swagger API Documentation - Quick Start

## الوصول السريع / Quick Access

### 🌐 الرابط الرئيسي / Main URL
```
http://localhost:5000/api-docs
```

---

## 🎯 أهم الخطوات / Main Steps

### 1️⃣ تشغيل السيرفر / Start Server
```bash
cd backend
npm run dev
```

✅ انتظر حتى يظهر: `🚀 Server running in development mode on port 5000`

### 2️⃣ فتح الـ Swagger / Open Swagger
اذهب لـ: **http://localhost:5000/api-docs**

### 3️⃣ تسجيل الدخول / Login
```
اختر POST /auth/login
أدخل البيانات:
  email: ahmed@example.com
  password: user123456
اضغط Execute
انسخ ال accessToken
```

### 4️⃣ إضافة التوكن / Add Token
```
اضغط زر "Authorize" في الأعلى
اختر "Bearer Token"
الصق التوكن
اضغط Authorize ثم Close
```

### 5️⃣ اختبر أي endpoint / Test Any Endpoint
```
اختر endpoint (مثلا GET /products)
اضغط "Try it out"
اضغط "Execute"
شوف النتائج
```

---

## 📦 الـ Endpoints الرئيسية / Main Endpoints

### العملاء / Customers
- 🔐 `POST /auth/login` - تسجيل دخول
- 🔐 `POST /auth/register` - تسجيل حساب جديد
- 📦 `GET /products` - عرض المنتجات
- 🛒 `POST /cart/items` - إضافة للسلة
- 📋 `POST /orders` - إنشاء طلب

### الأدمن / Admin
- 🔐 `POST /admin/auth/login` - دخول الأدمن
  - email: admin@example.com
  - password: admin123456
- 📊 `GET /admin/customers` - عرض العملاء
- 📦 `GET /admin/orders/stats` - إحصائيات الطلبات
- 📦 `POST /admin/products` - إضافة منتج

---

## 🔑 بيانات الاختبار / Test Credentials

### عميل عادي / Regular Customer
```
Email: ahmed@example.com
Password: user123456
```

### أدمن / Admin
```
Email: admin@example.com
Password: admin123456
```

---

## 🎓 أمثلة الاستخدام / Usage Examples

### مثال 1: الحصول على المنتجات / Get Products
```bash
GET http://localhost:5000/api/products?page=1&limit=10
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "المنتج",
      "price": 5000,
      "category": "إلكترونيات"
    }
  ]
}
```

### مثال 2: إنشاء طلب / Create Order
```bash
POST http://localhost:5000/api/orders
Headers: Authorization: Bearer <token>
Body: {
  "items": [
    {
      "productId": "...",
      "variantId": "...",
      "quantity": 2
    }
  ],
  "shippingAddress": {...},
  "shippingMethod": "home_delivery"
}
```

### مثال 3: الحصول على الطلبات / Get Orders
```bash
GET http://localhost:5000/api/orders
Headers: Authorization: Bearer <token>
```

---

## 🆘 حل المشاكل / Troubleshooting

| المشكلة | الحل |
|--------|-----|
| خطأ في الاتصال | تأكد من تشغيل `npm run dev` |
| 401 Unauthorized | تأكد من إضافة التوكن بشكل صحيح |
| 404 Not Found | تحقق من صحة ال endpoint URL |
| CORS Error | تأكد أن البيكند مُشغل على 5000 |

---

## 📊 معلومات مهمة / Important Info

- **الـ Endpoints**: 76+ موثقة
- **اللغات المدعومة**: العربية، الإنجليزية، الفرنسية
- **المصادقة**: JWT Bearer Token
- **قاعدة البيانات**: MongoDB
- **البيكند**: Express.js + TypeScript

---

## 🔗 الروابط المهمة / Important Links

| الرابط | الوصف |
|--------|--------|
| http://localhost:5000/api-docs | الـ Swagger UI الرئيسي |
| http://localhost:5000/api | API الأساسي |
| http://localhost:5000/api-docs/swagger.json | OpenAPI JSON Spec |

---

## 💡 نصائح / Tips

1. **جرب الأمثلة** - كل endpoint له أمثلة في الـ Swagger
2. **اقرأ الأخطاء** - الـ API يعطيك أخطاء واضحة
3. **استخدم المرشحات** - اغلب endpoints تدعم filters و pagination
4. **احفظ التوكن** - لا تحتاج تسجيل دخول مرتين

---

## ✅ Checklist

- [ ] السيرفر مُشغل ✓
- [ ] الـ Swagger يفتح بدون مشاكل ✓
- [ ] يمكنك تسجيل الدخول ✓
- [ ] يمكنك اختبار endpoint ✓
- [ ] تفهم كيفية الاستخدام ✓

---

**الآن انت جاهز! استمتع بـ API Documentation 🎉**

For more details, see [SWAGGER_SETUP.md](./SWAGGER_SETUP.md)
