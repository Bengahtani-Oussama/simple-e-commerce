#!/bin/bash
# 🧪 اختبار سريع للتوافق بين Frontend و Backend

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                  🧪 اختبار توافق Frontend مع Backend                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة للطباعة الملونة
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# الاختبار 1: التحقق من Backend
echo -e "${BLUE}1️⃣  اختبار Backend API${NC}"
curl -s http://localhost:5000/api/auth/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' > /dev/null 2>&1
print_status $? "Backend accessible"
echo ""

# الاختبار 2: اختبار تسجيل الدخول
echo -e "${BLUE}2️⃣  اختبار تسجيل الدخول${NC}"
LOGIN_RESPONSE=$(curl -s http://localhost:5000/api/auth/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"ahmed@example.com","password":"user123456"}')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    print_status 0 "Login successful"
else
    print_status 1 "Login failed"
fi
echo ""

# الاختبار 3: اختبار المنتجات
echo -e "${BLUE}3️⃣  اختبار API المنتجات${NC}"
curl -s http://localhost:5000/api/products > /dev/null 2>&1
print_status $? "Products API accessible"
echo ""

# الاختبار 4: اختبار الفئات
echo -e "${BLUE}4️⃣  اختبار API الفئات${NC}"
curl -s http://localhost:5000/api/categories > /dev/null 2>&1
print_status $? "Categories API accessible"
echo ""

# الاختبار 5: اختبار الكوبونات
echo -e "${BLUE}5️⃣  اختبار التحقق من الكوبون${NC}"
curl -s http://localhost:5000/api/coupons/validate/SUMMER2024 > /dev/null 2>&1
print_status $? "Coupon API accessible"
echo ""

# الاختبار 6: التحقق من Frontend
echo -e "${BLUE}6️⃣  اختبار Frontend Server${NC}"
curl -s http://localhost:3000 > /dev/null 2>&1
print_status $? "Frontend accessible"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                     ✨ الاختبار اكتمل بنجاح ✨                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
