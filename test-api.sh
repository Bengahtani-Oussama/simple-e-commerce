#!/bin/bash
# 🧪 Test Script - اختبار سريع للـ API

echo "🚀 Starting API Tests..."
echo "========================"

BASE_URL="http://localhost:5000/api"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
USER_EMAIL="ahmed@example.com"
USER_PASSWORD="user123456"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. Admin Login
# ============================================
echo -e "\n${BLUE}1️⃣  Testing Admin Login...${NC}"

ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "$ADMIN_LOGIN" | jq '.' 2>/dev/null || echo "$ADMIN_LOGIN"

# Extract token for further requests
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.data.token' 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo -e "${YELLOW}⚠️  Could not extract admin token${NC}"
  ADMIN_TOKEN="ADMIN_TOKEN_HERE"
fi

# ============================================
# 2. User Login
# ============================================
echo -e "\n${BLUE}2️⃣  Testing User Login...${NC}"

USER_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\"
  }")

echo "$USER_LOGIN" | jq '.' 2>/dev/null || echo "$USER_LOGIN"

USER_TOKEN=$(echo "$USER_LOGIN" | jq -r '.data.token' 2>/dev/null || echo "")

# ============================================
# 3. Get Products
# ============================================
echo -e "\n${BLUE}3️⃣  Fetching Products...${NC}"

PRODUCTS=$(curl -s -X GET "$BASE_URL/products?limit=5" \
  -H "Content-Type: application/json")

echo "$PRODUCTS" | jq '.' 2>/dev/null || echo "$PRODUCTS"

# ============================================
# 4. Get Categories
# ============================================
echo -e "\n${BLUE}4️⃣  Fetching Categories...${NC}"

CATEGORIES=$(curl -s -X GET $BASE_URL/categories \
  -H "Content-Type: application/json")

echo "$CATEGORIES" | jq '.' 2>/dev/null || echo "$CATEGORIES"

# ============================================
# 5. Get Brands
# ============================================
echo -e "\n${BLUE}5️⃣  Fetching Brands...${NC}"

BRANDS=$(curl -s -X GET $BASE_URL/brands \
  -H "Content-Type: application/json")

echo "$BRANDS" | jq '.' 2>/dev/null || echo "$BRANDS"

# ============================================
# 6. Get Coupons
# ============================================
echo -e "\n${BLUE}6️⃣  Checking Coupon (SUMMER2024)...${NC}"

COUPON=$(curl -s -X GET $BASE_URL/coupons/validate/SUMMER2024 \
  -H "Content-Type: application/json")

echo "$COUPON" | jq '.' 2>/dev/null || echo "$COUPON"

# ============================================
# 7. Get Orders (Admin)
# ============================================
if [ "$ADMIN_TOKEN" != "ADMIN_TOKEN_HERE" ]; then
  echo -e "\n${BLUE}7️⃣  Fetching Orders (Admin)...${NC}"
  
  ORDERS=$(curl -s -X GET "$BASE_URL/admin/orders?limit=5" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  echo "$ORDERS" | jq '.' 2>/dev/null || echo "$ORDERS"
fi

# ============================================
# 8. User Cart
# ============================================
if [ "$USER_TOKEN" != "" ] && [ "$USER_TOKEN" != "null" ]; then
  echo -e "\n${BLUE}8️⃣  Fetching User Cart...${NC}"
  
  CART=$(curl -s -X GET $BASE_URL/cart \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN")
  
  echo "$CART" | jq '.' 2>/dev/null || echo "$CART"
fi

# ============================================
# Summary
# ============================================
echo -e "\n${GREEN}========================${NC}"
echo -e "${GREEN}✅ Tests Completed!${NC}"
echo -e "${GREEN}========================${NC}"

echo -e "\n${YELLOW}📝 Summary:${NC}"
echo "  • Admin Token: $ADMIN_TOKEN"
echo "  • User Token: $USER_TOKEN"
echo "  • Base URL: $BASE_URL"

echo -e "\n${YELLOW}🎯 Next Steps:${NC}"
echo "  1. Check if all responses are successful"
echo "  2. Verify token formats"
echo "  3. Test data creation if needed"

echo -e "\n${GREEN}Done! ✨${NC}\n"
