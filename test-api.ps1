# 🧪 Test Script - اختبار سريع للـ API (Windows PowerShell)

Write-Host "🚀 Starting API Tests..." -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

$BASE_URL = "http://localhost:5000/api"
$ADMIN_EMAIL = "admin@example.com"
$ADMIN_PASSWORD = "admin123456"
$USER_EMAIL = "ahmed@example.com"
$USER_PASSWORD = "user123456"

function Test-ApiEndpoint {
    param(
        [string]$Number,
        [string]$Description,
        [string]$Method = "GET",
        [string]$Endpoint,
        [string]$Body = "",
        [string]$Token = ""
    )
    
    Write-Host "`n$Number $Description" -ForegroundColor Blue
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers.Add("Authorization", "Bearer $Token")
    }
    
    try {
        if ($Method -eq "POST" -and $Body) {
            $response = Invoke-WebRequest -Uri "$BASE_URL$Endpoint" `
                -Method $Method `
                -Headers $headers `
                -Body $Body `
                -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri "$BASE_URL$Endpoint" `
                -Method $Method `
                -Headers $headers `
                -ErrorAction Stop
        }
        
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host ($jsonResponse | ConvertTo-Json -Depth 2) -ForegroundColor Gray
        return $jsonResponse
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        return $null
    }
}

# ============================================
# 1. Admin Login
# ============================================
$adminLoginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

$adminLogin = Test-ApiEndpoint -Number "1️⃣ " `
    -Description "Testing Admin Login..." `
    -Method "POST" `
    -Endpoint "/auth/admin/login" `
    -Body $adminLoginBody

$adminToken = if ($adminLogin.data.token) { $adminLogin.data.token } else { "ADMIN_TOKEN_HERE" }

# ============================================
# 2. User Login
# ============================================
$userLoginBody = @{
    email = $USER_EMAIL
    password = $USER_PASSWORD
} | ConvertTo-Json

$userLogin = Test-ApiEndpoint -Number "2️⃣ " `
    -Description "Testing User Login..." `
    -Method "POST" `
    -Endpoint "/auth/login" `
    -Body $userLoginBody

$userToken = if ($userLogin.data.token) { $userLogin.data.token } else { "" }

# ============================================
# 3. Get Products
# ============================================
Test-ApiEndpoint -Number "3️⃣ " `
    -Description "Fetching Products..." `
    -Endpoint "/products?limit=5"

# ============================================
# 4. Get Categories
# ============================================
Test-ApiEndpoint -Number "4️⃣ " `
    -Description "Fetching Categories..." `
    -Endpoint "/categories"

# ============================================
# 5. Get Brands
# ============================================
Test-ApiEndpoint -Number "5️⃣ " `
    -Description "Fetching Brands..." `
    -Endpoint "/brands"

# ============================================
# 6. Get Coupons
# ============================================
Test-ApiEndpoint -Number "6️⃣ " `
    -Description "Checking Coupon (SUMMER2024)..." `
    -Endpoint "/coupons/validate/SUMMER2024"

# ============================================
# 7. Get Orders (Admin)
# ============================================
if ($adminToken -ne "ADMIN_TOKEN_HERE") {
    Test-ApiEndpoint -Number "7️⃣ " `
        -Description "Fetching Orders (Admin)..." `
        -Endpoint "/admin/orders?limit=5" `
        -Token $adminToken
}

# ============================================
# 8. User Cart
# ============================================
if ($userToken) {
    Test-ApiEndpoint -Number "8️⃣ " `
        -Description "Fetching User Cart..." `
        -Endpoint "/cart" `
        -Token $userToken
}

# ============================================
# Summary
# ============================================
Write-Host "`n========================" -ForegroundColor Green
Write-Host "✅ Tests Completed!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

Write-Host "`n📝 Summary:" -ForegroundColor Yellow
Write-Host "  • Admin Token: $adminToken"
Write-Host "  • User Token: $userToken"
Write-Host "  • Base URL: $BASE_URL"

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check if all responses are successful"
Write-Host "  2. Verify token formats"
Write-Host "  3. Test data creation if needed"

Write-Host "`nDone! ✨`n" -ForegroundColor Green
