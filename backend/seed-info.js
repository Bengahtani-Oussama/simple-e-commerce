#!/usr/bin/env node
/**
 * 📚 Database Seed Documentation & Helper
 * Simple E-Commerce Project
 * 
 * This script displays comprehensive information about the seed data
 * and provides quick references for developers.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'bright cyan');
  log('='.repeat(60), 'cyan');
}

function subsection(title) {
  log(`\n${title}`, 'blue');
  log('-'.repeat(40), 'blue');
}

function displayWelcome() {
  section('🚀 Simple E-Commerce Database Seed Generator');
  log('Version: 1.0.0', 'dim');
  log('Status: Ready for Production Testing ✅', 'green');
}

function displayQuickStart() {
  subsection('⚡ QUICK START (3 Steps)');
  log('\n1️⃣  Navigate to backend:', 'yellow');
  log('   cd backend\n', 'white');
  
  log('2️⃣  Install dependencies:', 'yellow');
  log('   npm install\n', 'white');
  
  log('3️⃣  Generate data:', 'yellow');
  log('   npm run seed:all\n', 'white');
  
  log('✨ Done! Your data is ready.', 'green');
}

function displayCredentials() {
  subsection('🔐 Login Credentials');
  
  log('\n👑 ADMIN ACCOUNT:', 'yellow');
  log('   Email:    admin@example.com', 'white');
  log('   Password: admin123456', 'white');
  log('   Role:     Super Admin', 'white');
  log('   ⚠️  Change password after first login!\n', 'red');
  
  log('👥 TEST USERS (5 accounts):', 'yellow');
  const users = [
    { email: 'ahmed@example.com', name: 'أحمد محمد' },
    { email: 'fatima@example.com', name: 'فاطمة علي' },
    { email: 'mahmoud@example.com', name: 'محمود خالد' },
    { email: 'leila@example.com', name: 'ليلى حسن' },
    { email: 'omar@example.com', name: 'عمر سليم' },
  ];
  
  users.forEach((user, index) => {
    log(`   ${index + 1}. ${user.email} (${user.name})`, 'white');
  });
  log('   Password (all): user123456\n', 'white');
}

function displayCoupons() {
  subsection('🎟️  Promotional Coupons');
  
  const coupons = [
    {
      code: 'SUMMER2024',
      type: 'Percentage',
      value: '20%',
      minOrder: '5000 DA',
      desc: 'Summer discount'
    },
    {
      code: 'WELCOME500',
      type: 'Fixed',
      value: '500 DA',
      minOrder: '3000 DA',
      desc: 'New customer welcome'
    },
    {
      code: 'FREESHIP',
      type: 'Free Shipping',
      value: 'Free',
      minOrder: '10000 DA',
      desc: 'Free shipping'
    },
    {
      code: 'VIPDAY',
      type: 'Percentage',
      value: '30%',
      minOrder: '15000 DA',
      desc: 'VIP special offer'
    },
  ];
  
  log('\n┌─────────────────────────────────────────────────────┐', 'cyan');
  coupons.forEach(coupon => {
    log(`│ 🎁 ${coupon.code.padEnd(12)} │ ${coupon.type.padEnd(10)} │ ${coupon.value.padEnd(6)}│`, 'white');
    log(`│    Min: ${coupon.minOrder.padEnd(40)}│`, 'dim');
  });
  log('└─────────────────────────────────────────────────────┘', 'cyan');
}

function displayDataStructure() {
  subsection('📊 Data Structure');
  
  const structure = [
    { item: 'Admins', count: 1, icon: '👑' },
    { item: 'Categories', count: 5, icon: '🏷️' },
    { item: 'Brands', count: 5, icon: '🏢' },
    { item: 'Products', count: 10, icon: '📦', note: '(2 variants each)' },
    { item: 'Variants', count: 20, icon: '🎨', note: '(Colors & Sizes)' },
    { item: 'Users', count: 5, icon: '👥' },
    { item: 'Coupons', count: 4, icon: '🎟️' },
    { item: 'Orders', count: 15, icon: '📋', note: '(Sample data)' },
  ];
  
  log('\n', 'white');
  structure.forEach(({ item, count, icon, note }) => {
    const noteStr = note ? ` ${note}` : '';
    log(`  ${icon} ${item.padEnd(15)} : ${String(count).padStart(3)}${noteStr}`, 'white');
  });
  
  log('\n  📊 Total Records: ~420', 'yellow');
}

function displayCategories() {
  subsection('🏷️  Product Categories');
  
  const categories = [
    { ar: 'الملابس والأزياء', en: 'Clothing & Fashion' },
    { ar: 'الإلكترونيات', en: 'Electronics' },
    { ar: 'الرياضة واللياقة', en: 'Sports & Fitness' },
    { ar: 'العناية الشخصية', en: 'Personal Care' },
    { ar: 'المنزل والديكور', en: 'Home & Decor' },
  ];
  
  log('\n', 'white');
  categories.forEach(({ ar, en }, index) => {
    log(`  ${index + 1}. ${ar.padEnd(25)} (${en})`, 'white');
  });
}

function displayBrands() {
  subsection('🏢 Brands');
  
  const brands = [
    { ar: 'نايك', en: 'Nike' },
    { ar: 'أديداس', en: 'Adidas' },
    { ar: 'بوما', en: 'Puma' },
    { ar: 'آبل', en: 'Apple' },
    { ar: 'سامسونج', en: 'Samsung' },
  ];
  
  log('\n', 'white');
  brands.forEach(({ ar, en }) => {
    log(`  🏷️  ${ar.padEnd(20)} (${en})`, 'white');
  });
}

function displayFeatures() {
  subsection('✨ Key Features');
  
  const features = [
    '✅ Multilingual support (Arabic, English, French)',
    '✅ Realistic prices in DZD (Algerian Dinar)',
    '✅ Complex product variants (colors, sizes)',
    '✅ Multiple coupon types (percentage, fixed, free shipping)',
    '✅ Order with different statuses',
    '✅ User addresses and shipping details',
    '✅ Safe to run multiple times (idempotent)',
    '✅ Comprehensive error handling',
    '✅ Detailed logging and progress tracking',
  ];
  
  log('\n', 'white');
  features.forEach(feature => {
    log(`  ${feature}`, 'green');
  });
}

function displayTestingGuide() {
  subsection('🧪 Testing Guide');
  
  log('\n1️⃣  API Testing:', 'yellow');
  log('   curl http://localhost:5000/api/products', 'white');
  log('   curl http://localhost:5000/api/categories', 'white');
  log('   curl http://localhost:5000/api/coupons/SUMMER2024', 'white\n');
  
  log('2️⃣  Admin Panel:', 'yellow');
  log('   cd admin-panel', 'white');
  log('   npm run dev', 'white');
  log('   Login: admin@example.com / admin123456\n', 'white');
  
  log('3️⃣  Customer Frontend:', 'yellow');
  log('   cd customer-frontend', 'white');
  log('   npm run dev', 'white');
  log('   Login: ahmed@example.com / user123456\n', 'white');
}

function displayTroubleshooting() {
  subsection('🆘 Troubleshooting');
  
  const issues = [
    {
      problem: 'Cannot find module error',
      solution: 'npm install'
    },
    {
      problem: 'MongoDB connection timeout',
      solution: 'Check MONGO_URI in .env file'
    },
    {
      problem: 'Duplicate key error',
      solution: 'Script skips existing data - this is normal'
    },
    {
      problem: 'EACCES permission denied',
      solution: 'Make sure you have write permissions'
    },
  ];
  
  log('\n', 'white');
  issues.forEach(({ problem, solution }) => {
    log(`❌ ${problem}`, 'red');
    log(`   ✅ ${solution}\n`, 'green');
  });
}

function displayImportantNotes() {
  subsection('⚠️  Important Notes');
  
  const notes = [
    '🔒 This is test data - not for production use',
    '📝 All passwords are default - change them before deployment',
    '🖼️  Images are placeholders - replace with real images',
    '💰 All prices are in DZD (Algerian Dinar)',
    '🌍 Data is fully multilingual (AR, EN, FR)',
    '🔄 Safe to run multiple times',
    '📊 Generated on: ' + new Date().toISOString(),
  ];
  
  log('\n', 'white');
  notes.forEach(note => {
    log(`  ${note}`, 'yellow');
  });
}

function displayNextSteps() {
  subsection('🎯 Next Steps');
  
  log('\n1️⃣  Generate the seed data:', 'yellow');
  log('   npm run seed:all\n', 'white');
  
  log('2️⃣  Start testing the application:', 'yellow');
  log('   npm run dev (backend)', 'white');
  log('   npm run dev (admin-panel)', 'white');
  log('   npm run dev (customer-frontend)\n', 'white');
  
  log('3️⃣  Verify everything works:', 'yellow');
  log('   Test login with provided credentials', 'white');
  log('   Browse products and categories', 'white');
  log('   Test coupons', 'white');
  log('   Create test orders\n', 'white');
  
  log('4️⃣  Make changes as needed:', 'yellow');
  log('   Update prices, descriptions', 'white');
  log('   Add more test data', 'white');
  log('   Customize for your needs\n', 'white');
}

function displayFiles() {
  subsection('📁 Generated Files');
  
  const files = [
    { name: 'seedDatabase.ts', path: 'backend/src/scripts/', desc: 'Main seed script' },
    { name: 'SEED_DATABASE_GUIDE.md', path: 'backend/', desc: 'Comprehensive guide' },
    { name: 'QUICK_START.md', path: 'backend/', desc: 'Quick start guide' },
    { name: 'seed-data-structure.json', path: 'backend/', desc: 'Data structure reference' },
    { name: 'seed_helper.py', path: 'backend/', desc: 'Python helper script' },
    { name: 'test-api.ps1', path: './', desc: 'Windows PowerShell test script' },
    { name: 'test-api.sh', path: './', desc: 'Linux/Mac test script' },
  ];
  
  log('\n', 'white');
  files.forEach(({ name, path: p, desc }) => {
    log(`  📄 ${name}`, 'cyan');
    log(`     Path: ${p}`, 'dim');
    log(`     Desc: ${desc}\n`, 'dim');
  });
}

function displayFooter() {
  section('✨ Ready to Start?');
  log('\nRun: npm run seed:all', 'green');
  log('\nFor detailed information, see:', 'white');
  log('  • backend/SEED_DATABASE_GUIDE.md', 'cyan');
  log('  • backend/QUICK_START.md', 'cyan');
  log('  • backend/seed-data-structure.json', 'cyan');
  log('\nHave fun testing! 🚀\n', 'green');
}

// Main execution
function main() {
  console.clear();
  
  displayWelcome();
  displayQuickStart();
  displayCredentials();
  displayCoupons();
  displayDataStructure();
  displayCategories();
  displayBrands();
  displayFeatures();
  displayTestingGuide();
  displayTroubleshooting();
  displayImportantNotes();
  displayNextSteps();
  displayFiles();
  displayFooter();
}

main();
