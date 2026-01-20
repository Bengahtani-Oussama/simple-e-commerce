# 🚀 خطوات تشغيل سريعة جداً

## ⚡ البدء الفوري (3 خطوات فقط)

### الخطوة 1️⃣: الانتقال للمشروع
```bash
cd backend
```

### الخطوة 2️⃣: تثبيت المكتبات (إذا لم تكن مثبتة)
```bash
npm install
```

### الخطوة 3️⃣: تشغيل السكريبت
```bash
npm run seed:all
```

---

## ✨ هذا كل شيء!

سيتم إنشاء:
- ✅ 1 حساب مسؤول
- ✅ 5 مستخدمين اختبار
- ✅ 5 فئات منتجات
- ✅ 5 ماركات
- ✅ 10 منتجات مع متغيرات
- ✅ 4 كوبونات عروض
- ✅ 15 طلب عينة

---

## 📝 بيانات المستخدمين الأساسية

**المسؤول:**
- البريد: `admin@example.com`
- كلمة المرور: `admin123456`

**العملاء (5 حسابات):**
- `ahmed@example.com` / `user123456`
- `fatima@example.com` / `user123456`
- `mahmoud@example.com` / `user123456`
- `leila@example.com` / `user123456`
- `omar@example.com` / `user123456`

**الكوبونات:**
- `SUMMER2024` - خصم 20%
- `WELCOME500` - خصم 500 دج
- `FREESHIP` - شحن مجاني
- `VIPDAY` - خصم VIP 30%

---

## 🧪 الاختبار الفوري

```bash
# 1. شغل الخادم
npm run dev

# 2. في نافذة جديدة، اختبر API
curl http://localhost:5000/api/products

# 3. أو فتح admin panel
cd ../admin-panel
npm run dev
# سجل الدخول بـ admin@example.com / admin123456
```

---

## ❓ في حالة المشاكل

1. **تأكد من ملف `.env` يحتوي على MONGO_URI**
2. **تأكد من اتصالك بالإنترنت**
3. **حاول: `npm install -f` ثم `npm run seed:all`**

---

**جاهز للاختبار! ✨**
