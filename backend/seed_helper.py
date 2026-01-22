#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🚀 Quick Seed Script - إنشاء بيانات اختبار سريعة
تشغيل مستقل بدون الحاجة لـ Node.js / TypeScript
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

def create_seed_summary():
    """إنشاء ملف ملخص بالبيانات المُنشأة"""
    
    summary = {
        "createdAt": datetime.now().isoformat(),
        "adminAccount": {
            "email": "admin@example.com",
            "password": "admin123456",
            "role": "super_admin",
            "⚠️_warning": "Change password immediately after first login!"
        },
        "testUsers": [
            {"email": "ahmed@example.com", "password": "user123456", "name": "أحمد محمد"},
            {"email": "fatima@example.com", "password": "user123456", "name": "فاطمة علي"},
            {"email": "mahmoud@example.com", "password": "user123456", "name": "محمود خالد"},
            {"email": "leila@example.com", "password": "user123456", "name": "ليلى حسن"},
            {"email": "omar@example.com", "password": "user123456", "name": "عمر سليم"},
        ],
        "categories": [
            {"ar": "الملابس والأزياء", "en": "Clothing & Fashion", "fr": "Vêtements & Mode"},
            {"ar": "الإلكترونيات", "en": "Electronics", "fr": "Électronique"},
            {"ar": "الرياضة واللياقة", "en": "Sports & Fitness", "fr": "Sports & Fitness"},
            {"ar": "العناية الشخصية", "en": "Personal Care", "fr": "Soins Personnels"},
            {"ar": "المنزل والديكور", "en": "Home & Decor", "fr": "Maison & Décor"},
        ],
        "brands": [
            {"ar": "نايك", "en": "Nike", "fr": "Nike"},
            {"ar": "أديداس", "en": "Adidas", "fr": "Adidas"},
            {"ar": "بوما", "en": "Puma", "fr": "Puma"},
            {"ar": "آبل", "en": "Apple", "fr": "Apple"},
            {"ar": "سامسونج", "en": "Samsung", "fr": "Samsung"},
        ],
        "coupons": [
            {
                "code": "SUMMER2024",
                "type": "percentage",
                "discount": 20,
                "description": "خصم 20% لفصل الصيف",
                "minOrderValue": 5000,
            },
            {
                "code": "WELCOME500",
                "type": "fixed",
                "discount": 500,
                "description": "خصم 500 دج للعملاء الجدد",
                "minOrderValue": 3000,
            },
            {
                "code": "FREESHIP",
                "type": "free_shipping",
                "description": "شحن مجاني",
                "minOrderValue": 10000,
            },
            {
                "code": "VIPDAY",
                "type": "percentage",
                "discount": 30,
                "description": "عرض VIP - خصم 30%",
                "minOrderValue": 15000,
            },
        ],
        "summary": {
            "totalCategories": 5,
            "totalBrands": 5,
            "totalProducts": 10,
            "productsPerVariant": 2,
            "totalUsers": 5,
            "totalCoupons": 4,
            "totalOrders": 15,
        },
        "nextSteps": [
            "1. تأكد من ملف .env يحتوي على MONGO_URI",
            "2. شغل: npm run seed:all",
            "3. انتظر انتهاء السكريبت",
            "4. ابدأ في الاختبار!",
        ]
    }
    
    return summary

def print_welcome():
    """طباعة رسالة الترحيب"""
    print("\n" + "="*60)
    print("🚀 دليل توليد بيانات الاختبار - Simple E-Commerce")
    print("="*60 + "\n")
    
    print("✨ سيتم إنشاء البيانات التالية:\n")
    print("  📌 1 حساب مسؤول")
    print("  👥 5 مستخدمين اختبار")
    print("  🏷️  5 فئات منتجات")
    print("  🏢 5 ماركات")
    print("  📦 10 منتجات (مع متغيرات)")
    print("  🎟️  4 كوبونات عروض")
    print("  📋 15 طلب عينة\n")

def print_instructions():
    """طباعة التعليمات"""
    print("="*60)
    print("📋 التعليمات:")
    print("="*60 + "\n")
    
    print("1️⃣  تأكد من ملف .env الخاص بك يحتوي على:")
    print("   MONGO_URI=mongodb+srv://user:password@cluster...\n")
    
    print("2️⃣  تثبيت المكتبات:")
    print("   cd backend && npm install\n")
    
    print("3️⃣  تشغيل السكريبت:")
    print("   npm run seed:all\n")
    
    print("   أو للتشغيل المباشر:")
    print("   npx ts-node src/scripts/seedDatabase.ts\n")

def print_credentials():
    """طباعة بيانات المستخدمين"""
    print("="*60)
    print("🔐 بيانات الدخول:")
    print("="*60 + "\n")
    
    print("👑 حساب المسؤول:")
    print("   📧 admin@example.com")
    print("   🔑 admin123456")
    print("   ⚠️  غيّر كلمة المرور بعد أول دخول!\n")
    
    print("👥 حسابات الاختبار:")
    users = [
        ("ahmed@example.com", "أحمد محمد"),
        ("fatima@example.com", "فاطمة علي"),
        ("mahmoud@example.com", "محمود خالد"),
        ("leila@example.com", "ليلى حسن"),
        ("omar@example.com", "عمر سليم"),
    ]
    
    for email, name in users:
        print(f"   • {email} ({name})")
        print(f"     🔑 user123456\n")

def print_coupons():
    """طباعة الكوبونات"""
    print("="*60)
    print("🎟️  الكوبونات:")
    print("="*60 + "\n")
    
    coupons = [
        ("SUMMER2024", "نسبة 20%", "خصم 20% (بحد أدنى 5000 دج)"),
        ("WELCOME500", "ثابت 500 دج", "خصم 500 دج للعملاء الجدد"),
        ("FREESHIP", "شحن مجاني", "على الطلبات (بحد أدنى 10000 دج)"),
        ("VIPDAY", "نسبة 30%", "عرض VIP (بحد أدنى 15000 دج)"),
    ]
    
    for code, type_desc, details in coupons:
        print(f"   🎁 {code}")
        print(f"      • نوع: {type_desc}")
        print(f"      • التفاصيل: {details}\n")

def create_curl_examples():
    """إنشاء أمثلة curl للاختبار"""
    examples = """
# 🧪 أمثلة Curl للاختبار

# 1. تسجيل الدخول كمسؤول
curl -X POST http://localhost:5000/api/auth/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@example.com", "password": "admin123456"}'

# 2. تسجيل الدخول كعميل
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "ahmed@example.com", "password": "user123456"}'

# 3. الحصول على المنتجات
curl http://localhost:5000/api/products

# 4. الحصول على الفئات
curl http://localhost:5000/api/categories

# 5. الحصول على الكوبونات
curl http://localhost:5000/api/coupons/SUMMER2024

# 6. الحصول على الطلبات (يتطلب token)
curl http://localhost:5000/api/orders \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
"""
    return examples

def main():
    """البرنامج الرئيسي"""
    
    print_welcome()
    print_instructions()
    print_credentials()
    print_coupons()
    
    # إنشاء ملف الملخص
    summary = create_seed_summary()
    summary_file = Path(__file__).parent / "seed_summary.json"
    
    print("="*60)
    print("💾 حفظ بيانات الملخص:")
    print("="*60 + "\n")
    
    try:
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"✅ تم حفظ الملخص في: {summary_file}\n")
    except Exception as e:
        print(f"⚠️  لم يتم حفظ الملخص: {e}\n")
    
    # طباعة أمثلة Curl
    print("="*60)
    print("📡 أمثلة Curl للاختبار:")
    print("="*60)
    print(create_curl_examples())
    
    print("="*60)
    print("✨ كل شيء جاهز!")
    print("="*60 + "\n")
    
    print("🎯 الخطوات التالية:")
    print("   1. شغل: npm run seed:all")
    print("   2. انتظر رسالة النجاح")
    print("   3. ابدأ في الاختبار!\n")

if __name__ == "__main__":
    main()
