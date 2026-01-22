import Section from '../models/section';
import Product from '../models/Product';
import Admin from '../models/Admin';
import mongoose from 'mongoose';
import {
  sendSectionDeactivationNotification,
  sendSectionLowStockNotification,
  sendCleanupSummaryNotification,
} from './sectionEmailTemplates';

// Helper function to check if products have stock
const checkProductsStock = async (productIds: string[]): Promise<{
  validProducts: string[];
  outOfStock: string[];
}> => {
  const outOfStock: string[] = [];
  const validProducts: string[] = [];

  for (const productId of productIds) {
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      outOfStock.push(productId);
      continue;
    }

    // Check if product has any variant with stock > 0
    const hasStock = product.variants.some(
      (variant) => variant.stock > 0 && variant.isActive
    );

    if (hasStock) {
      validProducts.push(productId);
    } else {
      outOfStock.push(productId);
    }
  }

  return { validProducts, outOfStock };
};

/**
 * Clean out-of-stock products from all sections
 * @returns Summary of cleanup operation
 */
export const autoCleanSections = async (): Promise<{
  success: boolean;
  totalCleaned: number;
  sectionsProcessed: number;
  deactivatedSections: number;
  details: any[];
}> => {
  try {
    console.log('\n🧹 Starting Auto Section Cleanup...');
    console.log(`⏰ Time: ${new Date().toLocaleString()}\n`);

    const sections = await Section.find({ isActive: true });
    
    let totalCleaned = 0;
    let deactivatedSections = 0;
    const details = [];
    const deactivatedList = [];
    const lowStockList = [];

    for (const section of sections) {
      const productIds = section.products.map((id) => id.toString());
      const { validProducts, outOfStock } = await checkProductsStock(productIds);

      const removedCount = outOfStock.length;

      // If we can maintain minimum products, update the section
      if (validProducts.length >= section.minProducts) {
        section.products = validProducts.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        await section.save();

        if (removedCount > 0) {
          totalCleaned += removedCount;
          console.log(`✅ ${section.name.en}:`);
          console.log(`   - Removed ${removedCount} out-of-stock products`);
          console.log(`   - Remaining: ${validProducts.length} products`);

          details.push({
            sectionId: section._id,
            sectionName: section.name.en,
            removedCount,
            remainingProducts: validProducts.length,
            status: 'cleaned',
          });
        }

        // Check if section is close to minimum (1-2 products away)
        const threshold = section.minProducts + 2;
        if (validProducts.length <= threshold && validProducts.length > section.minProducts) {
          lowStockList.push({
            sectionId: section._id.toString(),
            sectionName: section.name,
            currentProducts: validProducts.length,
            minRequired: section.minProducts,
            threshold: validProducts.length - section.minProducts,
          });
        }
      } else {
        // Deactivate section if it falls below minimum
        section.isActive = false;
        await section.save();
        deactivatedSections++;

        console.log(`⚠️  ${section.name.en}:`);
        console.log(`   - Deactivated (insufficient products)`);
        console.log(`   - Had ${validProducts.length}, needs ${section.minProducts}`);

        details.push({
          sectionId: section._id,
          sectionName: section.name.en,
          removedCount,
          remainingProducts: validProducts.length,
          minRequired: section.minProducts,
          status: 'deactivated',
        });

        deactivatedList.push({
          sectionId: section._id.toString(),
          sectionName: section.name,
          remainingProducts: validProducts.length,
          minRequired: section.minProducts,
          removedProducts: removedCount,
          deactivatedAt: new Date(),
        });
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 Cleanup Summary:');
    console.log(`   • Total products removed: ${totalCleaned}`);
    console.log(`   • Sections processed: ${sections.length}`);
    console.log(`   • Sections deactivated: ${deactivatedSections}`);
    console.log('═══════════════════════════════════════════\n');

    // Send email notifications to all admins
    const admins = await Admin.find({ isActive: true });
    
    for (const admin of admins) {
      // Send deactivation notifications
      for (const deactivatedData of deactivatedList) {
        await sendSectionDeactivationNotification(admin.email, deactivatedData, 'en');
      }

      // Send low stock warnings
      for (const lowStockData of lowStockList) {
        await sendSectionLowStockNotification(admin.email, lowStockData, 'en');
      }

      // Send daily summary if there were any changes
      if (totalCleaned > 0 || deactivatedSections > 0) {
        await sendCleanupSummaryNotification(admin.email, {
          totalCleaned,
          sectionsProcessed: sections.length,
          deactivatedSections,
          cleanupDate: new Date(),
          details: details.map(d => ({
            sectionName: d.sectionName,
            removedCount: d.removedCount,
            status: d.status,
          })),
        }, 'en');
      }
    }

    console.log(`✉️  Email notifications sent to ${admins.length} admin(s)\n`);

    return {
      success: true,
      totalCleaned,
      sectionsProcessed: sections.length,
      deactivatedSections,
      details,
    };
  } catch (error) {
    console.error('❌ Error during auto cleanup:', error);
    return {
      success: false,
      totalCleaned: 0,
      sectionsProcessed: 0,
      deactivatedSections: 0,
      details: [],
    };
  }
};

/**
 * Schedule cleanup to run periodically
 * @param intervalHours - How often to run cleanup (in hours)
 */
export const scheduleAutoCleanup = (intervalHours: number = 24): void => {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`\n🕐 Auto-cleanup scheduled to run every ${intervalHours} hours`);

  // Run immediately on startup
  autoCleanSections();

  // Then run on schedule
  setInterval(() => {
    autoCleanSections();
  }, intervalMs);
};

/**
 * Clean a specific section by ID
 */
export const cleanSectionById = async (sectionId: string): Promise<{
  success: boolean;
  removedCount: number;
  message: string;
}> => {
  try {
    const section = await Section.findById(sectionId);

    if (!section) {
      return {
        success: false,
        removedCount: 0,
        message: 'Section not found',
      };
    }

    const productIds = section.products.map((id) => id.toString());
    const { validProducts, outOfStock } = await checkProductsStock(productIds);

    const removedCount = outOfStock.length;

    if (validProducts.length >= section.minProducts) {
      section.products = validProducts.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      await section.save();

      return {
        success: true,
        removedCount,
        message: `Removed ${removedCount} out-of-stock products`,
      };
    } else {
      section.isActive = false;
      await section.save();

      return {
        success: true,
        removedCount,
        message: `Section deactivated (${validProducts.length} products remaining, needs ${section.minProducts})`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      removedCount: 0,
      message: error.message || 'Cleanup failed',
    };
  }
};

export default {
  autoCleanSections,
  scheduleAutoCleanup,
  cleanSectionById,
};