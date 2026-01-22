
import dotenv from 'dotenv';
import connectDatabase from '../config/database';
import Admin from '../models/Admin';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Product from '../models/Product';
import User from '../models/User';
import Order from '../models/Order';
import Coupon from '../models/Coupon';
import mongoose from 'mongoose';

dotenv.config();

// ============================================
// DATA GENERATION UTILITIES
// ============================================

const generateUniqueSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .slice(0, 50) + `-${Date.now()}`;
};

const arabicCategories = [
  { ar: 'الملابس والأزياء', en: 'Clothing & Fashion', fr: 'Vêtements & Mode' },
  { ar: 'الإلكترونيات', en: 'Electronics', fr: 'Électronique' },
  { ar: 'الرياضة واللياقة', en: 'Sports & Fitness', fr: 'Sports & Fitness' },
  { ar: 'العناية الشخصية', en: 'Personal Care', fr: 'Soins Personnels' },
  { ar: 'المنزل والديكور', en: 'Home & Decor', fr: 'Maison & Décor' },
];

const arabicBrands = [
  { ar: 'نايك', en: 'Nike', fr: 'Nike' },
  { ar: 'أديداس', en: 'Adidas', fr: 'Adidas' },
  { ar: 'بوما', en: 'Puma', fr: 'Puma' },
  { ar: 'آبل', en: 'Apple', fr: 'Apple' },
  { ar: 'سامسونج', en: 'Samsung', fr: 'Samsung' },
];

const productNames = [
  { ar: 'حذاء رياضي أسود', en: 'Black Sports Shoe', fr: 'Chaussure de Sport Noire' },
  { ar: 'تي شيرت أبيض', en: 'White T-Shirt', fr: 'T-Shirt Blanc' },
  { ar: 'بنطال جينز أزرق', en: 'Blue Jeans', fr: 'Jean Bleu' },
  { ar: 'سماعات لاسلكية', en: 'Wireless Headphones', fr: 'Écouteurs Sans Fil' },
  { ar: 'حقيبة ظهر', en: 'Backpack', fr: 'Sac à Dos' },
  { ar: 'ساعة ذكية', en: 'Smart Watch', fr: 'Montre Intelligente' },
  { ar: 'كاميرا ويب', en: 'Webcam', fr: 'Webcam' },
  { ar: 'ماوس لاسلكي', en: 'Wireless Mouse', fr: 'Souris Sans Fil' },
  { ar: 'لوحة مفاتيح ميكانيكية', en: 'Mechanical Keyboard', fr: 'Clavier Mécanique' },
  { ar: 'حزام جلدي', en: 'Leather Belt', fr: 'Ceinture en Cuir' },
  { ar: 'بوستر لاسلكي', en: 'Wireless Charger', fr: 'Chargeur Sans Fil' },
  { ar: 'تلفزيون', en: 'TV', fr: 'TV' },
  { ar: 'مكيف', en: 'Air Conditioner', fr: 'Conditionneur' },
  { ar: 'كاميرا', en: 'Camera', fr: 'Cameras' },
  { ar: 'تلفزيون', en: 'TV1', fr: 'TV1' },
  { ar: 'مكيف', en: 'Air Conditioner1', fr: 'Conditionneur1' },
  { ar: 'كاميرا', en: 'Camera1', fr: 'Cameras1' },
  { ar: 'تلفزيون', en: 'TV2', fr: 'TV2' },
  { ar: 'مكيف', en: 'Air Conditioner2', fr: 'Conditionneur2' },
  { ar: 'كاميرا', en: 'Camera3', fr: 'Cameras3' },
  { ar: 'تلفزيون', en: 'TV3', fr: 'TV3' },
  { ar: 'مكيف', en: 'Air Conditioner4', fr: 'Conditionneur4' },
  { ar: 'كاميرا', en: 'Camera5', fr: 'Cameras5' },
  { ar: 'تلفزيون', en: 'TV4', fr: 'TV4' },
  { ar: 'مكيف', en: 'Air Conditioner5', fr: 'Conditionneur5' },
  { ar: 'كاميرا', en: 'Camera6', fr: 'Cameras6' },
  { ar: 'تلفزيون', en: 'TV5', fr: 'TV5' },
  { ar: 'مكيف', en: 'Air Conditioner6', fr: 'Conditionneur6' },
  { ar: 'كاميرا', en: 'Camera7', fr: 'Cameras7' },
  { ar: 'تلفزيون', en: 'TV6', fr: 'TV6' },
  { ar: 'مكيف', en: 'Air Conditioner7', fr: 'Conditionneur7' },
  { ar: 'كاميرا', en: 'Camera8', fr: 'Cameras8' },
];

// ============================================
// SEEDING FUNCTIONS
// ============================================

const seedAdmins = async () => {
  console.log('\n📌 Seeding Admins...');
  
  const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    console.log('⚠️  Admin already exists');
    return existingAdmin._id;
  }

  const admin = await Admin.create({
    name: 'Super Admin',
    email: 'admin@example.com',
    password: '123456789',
    role: 'super_admin',
    permissions: [
      'manage_users',
      'manage_products',
      'manage_orders',
      'manage_coupons',
      'manage_brands',
      'manage_categories',
      'view_reports',
      'manage_settings',
    ],
  });

  console.log('✅ Admin created:');
  console.log(`   📧 Email: admin@example.com`);
  console.log(`   🔑 Password: admin123456`);
  
  return admin._id;
};

const seedCategories = async () => {
  console.log('\n📌 Seeding Categories...');

  const existingCategories = await Category.countDocuments();
  if (existingCategories > 0) {
    console.log('⚠️  Categories already exist');
    const categories = await Category.find();
    return categories;
  }

  const categories = await Promise.all(
    arabicCategories.map((cat, index) =>
      Category.create({
        name: cat,
        slug: generateUniqueSlug(cat.en),
        description: {
          ar: `وصف فئة ${cat.ar}`,
          en: `Description of ${cat.en}`,
          fr: `Description de ${cat.fr}`,
        },
        isActive: true,
        order: index,
      })
    )
  );

  console.log(`✅ Created ${categories.length} categories`);
  return categories;
};

const seedBrands = async () => {
  console.log('\n📌 Seeding Brands...');

  const existingBrands = await Brand.countDocuments();
  if (existingBrands > 0) {
    console.log('⚠️  Brands already exist');
    const brands = await Brand.find();
    return brands;
  }

  const brands = await Promise.all(
    arabicBrands.map((brand) => {
      const en = typeof brand === 'string' ? brand : brand.en;
      const ar = typeof brand === 'string' ? brand : (brand.ar || brand.en);
      const fr = typeof brand === 'string' ? brand : (brand.fr || brand.en);
      
      return Brand.create({
        name: en,
        slug: generateUniqueSlug(en),
        description: {
          ar: `وصف ماركة ${ar}`,
          en: `Description of ${en}`,
          fr: `Description de ${fr}`,
        },
        isActive: true,
      });
    })
  );

  console.log(`✅ Created ${brands.length} brands`);
  return brands;
};

const seedProducts = async (categories: any[], brands: any[]) => {
  console.log('\n📌 Seeding Products...');

  const existingProducts = await Product.countDocuments();
  // if (existingProducts > 0) {
  //   console.log('⚠️  Products already exist');
  //   const products = await Product.find();
  //   return products;
  // }

  const products = await Promise.all(
    productNames.map((product, index) =>
      Product.create({
        name: product,
        slug: generateUniqueSlug(product.en),
        description: {
          ar: `وصف المنتج: ${product.ar} - منتج عالي الجودة`,
          en: `High-quality ${product.en} with excellent features`,
          fr: `Produit de haute qualité ${product.fr}`,
        },
        category: categories[index % categories.length]._id,
        brand: brands[index % brands.length]._id,
        basePrice: 2000 + index * 500,
        compareAtPrice: 2500 + index * 500,
        stock: 50 + index * 10,
        rating: 4 + Math.random(),
        variants: [
          {
            sku: `SKU-${index}-001`,
            color: 'Black',
            size: 'M',
            price: 2000 + index * 500,
            stock: 30 + index * 5,
            images: [
              'https://placehold.co/400x600?text=Product+1',
            ],
            isActive: true,
          },
          {
            sku: `SKU-${index}-002`,
            color: 'White',
            size: 'L',
            price: 2100 + index * 500,
            stock: 20 + index * 5,
            images: [
              'https://placehold.co/400x600?text=Product+2',
            ],
            isActive: true,
          },
        ],
        images: [
          'https://placehold.co/400x600?text=Product+Main',
        ],
        isActive: true,
      })
    )
  );

  console.log(`✅ Created ${products.length} products with variants`);
  return products;
};

const seedUsers = async () => {
  console.log('\n📌 Seeding Users...');

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('⚠️  Users already exist');
    const users = await User.find();
    return users;
  }

  const userData = [
    {
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@example.com',
      phone: '+213661234567',
      password: '123456789',
    },
    {
      firstName: 'فاطمة',
      lastName: 'علي',
      email: 'fatima@example.com',
      phone: '+213661234568',
      password: '123456789',
    },
    {
      firstName: 'محمود',
      lastName: 'خالد',
      email: 'mahmoud@example.com',
      phone: '+213661234569',
      password: '123456789',
    },
    {
      firstName: 'ليلى',
      lastName: 'حسن',
      email: 'leila@example.com',
      phone: '+213661234570',
      password: '123456789',
    },
    {
      firstName: 'عمر',
      lastName: 'سليم',
      email: 'omar@example.com',
      phone: '+213661234571',
      password: '123456789',
    },
  ];

  const users = await Promise.all(
    userData.map((user) =>
      User.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        password: user.password,
        addresses: [
          {
            fullName: `${user.firstName} ${user.lastName}`,
            phone: user.phone,
            wilaya: 'الجزائر',
            commune: 'الجزائر الوسطى',
            addressLine: 'شارع الثورة، رقم 123',
            postalCode: '16000',
            isDefault: true,
          },
        ],
        isVerified: true,
        isActive: true,
      })
    )
  );

  console.log(`✅ Created ${users.length} test users`);
  users.forEach((user) => {
    console.log(`   📧 ${user.email} / 🔑 user123456`);
  });

  return users;
};

const seedCoupons = async (admin: any) => {
  console.log('\n📌 Seeding Coupons...');

  const existingCoupons = await Coupon.countDocuments();
  if (existingCoupons > 0) {
    console.log('⚠️  Coupons already exist');
    const coupons = await Coupon.find();
    return coupons;
  }

  const coupons = await Promise.all([
    Coupon.create({
      code: 'SUMMER2024',
      type: 'percentage',
      discountPercentage: 20,
      minOrderValue: 5000,
      usageLimit: 100,
      usagePerCustomer: 2,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      description: 'خصم 20% لفصل الصيف',
      createdBy: admin,
    }),
    Coupon.create({
      code: 'WELCOME500',
      type: 'fixed',
      discountAmount: 500,
      minOrderValue: 3000,
      usageLimit: 500,
      usagePerCustomer: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      description: 'خصم ثابت 500 دج للعملاء الجدد',
      createdBy: admin,
    }),
    Coupon.create({
      code: 'FREESHIP',
      type: 'free_shipping',
      minOrderValue: 10000,
      usageLimit: 200,
      usagePerCustomer: 3,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isActive: true,
      description: 'شحن مجاني على جميع الطلبات',
      createdBy: admin,
    }),
    Coupon.create({
      code: 'VIPDAY',
      type: 'percentage',
      discountPercentage: 30,
      minOrderValue: 15000,
      maxDiscount: 5000,
      usageLimit: 50,
      usagePerCustomer: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
      description: 'عرض VIP خاص - خصم 30%',
      createdBy: admin,
    }),
  ]);

  console.log(`✅ Created ${coupons.length} coupons`);
  coupons.forEach((coupon) => {
    console.log(`   🎟️  ${coupon.code} - ${coupon.description}`);
  });

  return coupons;
};

const seedOrders = async (users: any[], products: any[]) => {
  console.log('\n📌 Seeding Orders...');

  const existingOrders = await Order.countDocuments();
  if (existingOrders > 0) {
    console.log('⚠️  Orders already exist');
    const orders = await Order.find();
    return orders;
  }

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const orders = [];

  for (let i = 0; i < 15; i++) {
    const user = users[i % users.length];
    const selectedProducts = products.slice(0, 2 + Math.floor(Math.random() * 3));

    let subtotal = 0;
    const items = selectedProducts.map((product: any) => {
      const variant = product.variants[0];
      const quantity = 1 + Math.floor(Math.random() * 3);
      const itemTotal = (variant.price || product.basePrice) * quantity;
      subtotal += itemTotal;

      return {
        product: product._id,
        variant: new mongoose.Types.ObjectId(variant._id),
        sku: variant.sku,
        name: product.name,
        variantDetails: {
          size: variant.size,
          color: variant.color,
        },
        price: variant.price || product.basePrice,
        quantity,
        image: product.images[0],
      };
    });

    const shippingCost = ['الجزائر', 'قسنطينة'].includes(user.addresses[0]?.wilaya)
      ? 500
      : 1000;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${i}`;

    const order = await Order.create({
      orderNumber,
      user: user._id,
      items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      shippingAddress: {
        fullName: user.addresses[0]?.fullName || `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        wilaya: user.addresses[0]?.wilaya || 'الجزائر',
        commune: user.addresses[0]?.commune || 'الجزائر الوسطى',
        addressLine: user.addresses[0]?.addressLine || 'شارع الثورة',
      },
      shippingMethod: Math.random() > 0.5 ? 'home_delivery' : 'office_pickup',
      paymentStatus: Math.random() > 0.3 ? 'paid' : 'pending',
      paymentMethod: 'cash_on_delivery',
      orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
      customerNote: 'Please deliver carefully',
    });

    orders.push(order);
  }

  console.log(`✅ Created ${orders.length} test orders`);
  return orders;
};

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

const seedDatabase = async () => {
  try {
    console.log('\n🚀 Starting Database Seeding...\n');
    console.log('═══════════════════════════════════════════\n');

    await connectDatabase();
    console.log('✅ Database connected\n');

    // Seed data
    const adminId = await seedAdmins();
    const categories = await seedCategories();
    const brands = await seedBrands();
    const products = await seedProducts(categories, brands);
    const users = await seedUsers();
    const coupons = await seedCoupons(adminId);
    const orders = await seedOrders(users, products);

    console.log('\n═══════════════════════════════════════════');
    console.log('\n✨ Database Seeding Completed Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${1} Admin Account`);
    console.log(`   • ${categories.length} Categories`);
    console.log(`   • ${brands.length} Brands`);
    console.log(`   • ${products.length} Products (with variants)`);
    console.log(`   • ${users.length} Test Users`);
    console.log(`   • ${coupons.length} Coupons`);
    console.log(`   • ${orders.length} Sample Orders\n`);

    console.log('🎯 Ready for Testing!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
