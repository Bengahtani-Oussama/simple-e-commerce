import dotenv from 'dotenv';
import connectDatabase from '../config/database';
import Section from '../models/section';
import Product from '../models/Product';
import mongoose from 'mongoose';

dotenv.config();

// Helper function to generate slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .slice(0, 50) + `-${Date.now()}`;
};

// Helper to get random products with stock
const getRandomProductsWithStock = async (count: number): Promise<string[]> => {
  const products = await Product.find({ isActive: true }).lean();
  
  // Filter products that have stock
  const productsWithStock = products.filter((product) =>
    product.variants.some((variant) => variant.stock > 0 && variant.isActive)
  );

  // Shuffle and take 'count' products
  const shuffled = productsWithStock.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((p) => p._id.toString());
};

const seedSections = async () => {
  try {
    console.log('\n🎨 Starting Section Seeding...\n');
    console.log('═══════════════════════════════════════════\n');

    await connectDatabase();
    console.log('✅ Database connected\n');

    // Check if sections already exist
    const existingSections = await Section.countDocuments();
    if (existingSections > 0) {
      console.log('⚠️  Sections already exist');
      console.log(`   Found ${existingSections} existing sections\n`);
      
      const sections = await Section.find();
      console.log('📋 Existing Sections:');
      sections.forEach((section, index) => {
        console.log(`   ${index + 1}. ${section.name.en} (${section.products.length} products)`);
      });
      
      process.exit(0);
    }

    // Check if we have enough products
    const totalProducts = await Product.countDocuments({ isActive: true });
    if (totalProducts < 30) {
      console.log('❌ Not enough products in database');
      console.log(`   Found ${totalProducts} products, need at least 30 for sections`);
      console.log('   Run: npm run seed:all first\n');
      process.exit(1);
    }

    console.log(`📦 Found ${totalProducts} products in database\n`);

    // Section data with multilingual names
    const sectionData = [
      {
        name: {
          ar: 'عروض الصيف',
          en: 'Summer Offers',
          fr: "Offres d'été",
        },
        description: {
          ar: 'أفضل العروض والخصومات لفصل الصيف',
          en: 'Best deals and discounts for summer season',
          fr: "Meilleures offres et réductions pour l'été",
        },
        order: 1,
      },
      {
        name: {
          ar: 'الوافدون الجدد',
          en: 'New Arrivals',
          fr: 'Nouveautés',
        },
        description: {
          ar: 'أحدث المنتجات التي وصلت إلى متجرنا',
          en: 'Latest products that arrived in our store',
          fr: 'Derniers produits arrivés dans notre magasin',
        },
        order: 2,
      },
      {
        name: {
          ar: 'الأكثر مبيعاً',
          en: 'Best Sellers',
          fr: 'Meilleures Ventes',
        },
        description: {
          ar: 'المنتجات الأكثر شعبية وطلباً',
          en: 'Most popular and demanded products',
          fr: 'Produits les plus populaires et demandés',
        },
        order: 3,
      },
      {
        name: {
          ar: 'عروض خاصة',
          en: 'Special Deals',
          fr: 'Offres Spéciales',
        },
        description: {
          ar: 'عروض حصرية لفترة محدودة',
          en: 'Exclusive offers for a limited time',
          fr: 'Offres exclusives pour une durée limitée',
        },
        order: 4,
      },
      {
        name: {
          ar: 'الإلكترونيات المميزة',
          en: 'Featured Electronics',
          fr: 'Électronique en Vedette',
        },
        description: {
          ar: 'أفضل الأجهزة الإلكترونية والتقنية',
          en: 'Best electronic and tech devices',
          fr: 'Meilleurs appareils électroniques et technologiques',
        },
        order: 5,
      },
      {
        name: {
          ar: 'أزياء العصر',
          en: 'Trendy Fashion',
          fr: 'Mode Tendance',
        },
        description: {
          ar: 'أحدث صيحات الموضة والأزياء',
          en: 'Latest fashion trends and styles',
          fr: 'Dernières tendances et styles de mode',
        },
        order: 6,
      },
    ];

    console.log('🔄 Creating sections...\n');

    const createdSections = [];

    for (const data of sectionData) {
      // Get 7-10 random products with stock for each section
      const productCount = 7 + Math.floor(Math.random() * 4);
      const productIds = await getRandomProductsWithStock(productCount);

      if (productIds.length < 5) {
        console.log(`⚠️  Skipping "${data.name.en}" - not enough products with stock`);
        continue;
      }

      const section = await Section.create({
        name: data.name,
        slug: generateSlug(data.name.en),
        description: data.description,
        products: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        isActive: true,
        order: data.order,
        minProducts: 5,
      });

      createdSections.push(section);

      console.log(`✅ Created: ${section.name.en}`);
      console.log(`   📦 Products: ${section.products.length}`);
      console.log(`   🔢 Order: ${section.order}`);
      console.log(`   🌐 Slug: ${section.slug}\n`);
    }

    console.log('═══════════════════════════════════════════\n');
    console.log('✨ Section Seeding Completed Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${createdSections.length} Sections Created`);
    console.log(`   • Total Products Assigned: ${createdSections.reduce((sum, s) => sum + s.products.length, 0)}\n`);

    console.log('📋 Created Sections:');
    createdSections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.name.en} (${section.name.ar})`);
      console.log(`      - ${section.products.length} products`);
      console.log(`      - Order: ${section.order}`);
    });

    console.log('\n🎯 Sections Ready for Use!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding sections:', error);
    process.exit(1);
  }
};

seedSections();