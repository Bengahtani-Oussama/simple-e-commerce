import Section from '../models/Section';
import Product from '../models/Product';
import Admin from '../models/Admin';
import AdminPreferences from '../models/AdminPreferences';
import mongoose from 'mongoose';
import {
  sendSectionDeactivationNotification,
  sendSectionLowStockNotification,
  sendCleanupSummaryNotification,
} from './sectionEmailTemplates';

// Store notifications for digest mode
interface DigestNotification {
  adminId: string;
  adminEmail: string;
  language: 'ar' | 'en' | 'fr';
  deactivations: any[];
  lowStockWarnings: any[];
}

const digestQueue: Map<string, DigestNotification> = new Map();

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

    // Send email notifications to admins based on their preferences
    const admins = await Admin.find({ isActive: true });
    
    for (const admin of admins) {
      // Get admin preferences
      let preferences = await AdminPreferences.findOne({ admin: admin._id });
      
      if (!preferences) {
        // Create default preferences
        preferences = await AdminPreferences.create({ admin: admin._id });
      }

      const language = preferences.preferredLanguage;

      // Check if digest mode is enabled
      if (preferences.emailNotifications.digestMode) {
        // Queue notifications for digest
        let digest = digestQueue.get(admin._id.toString());
        
        if (!digest) {
          digest = {
            adminId: admin._id.toString(),
            adminEmail: admin.email,
            language,
            deactivations: [],
            lowStockWarnings: [],
          };
          digestQueue.set(admin._id.toString(), digest);
        }

        // Add to digest queue
        digest.deactivations.push(...deactivatedList);
        digest.lowStockWarnings.push(...lowStockList);
      } else {
        // Send immediate notifications
        for (const deactivatedData of deactivatedList) {
          if (preferences.canSendNotification(deactivatedData.sectionId, 'deactivation')) {
            await sendSectionDeactivationNotification(
              admin.email,
              deactivatedData,
              language
            );
            preferences.recordNotification(deactivatedData.sectionId, 'deactivation');
          }
        }

        for (const lowStockData of lowStockList) {
          if (preferences.canSendNotification(lowStockData.sectionId, 'lowStock')) {
            await sendSectionLowStockNotification(
              admin.email,
              lowStockData,
              language
            );
            preferences.recordNotification(lowStockData.sectionId, 'lowStock');
          }
        }
      }

      // Send daily summary if enabled and there were changes
      if (
        preferences.emailNotifications.dailyCleanupSummary &&
        (totalCleaned > 0 || deactivatedSections > 0)
      ) {
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
        }, language);
      }

      // Save updated preferences (notification history)
      await preferences.save();
    }

    console.log(`✉️  Email notifications processed for ${admins.length} admin(s)\n`);

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
 * Send digest emails (called once per day)
 */
export const sendDigestEmails = async (): Promise<void> => {
  try {
    console.log('\n📬 Sending Digest Emails...');

    for (const [adminId, digest] of digestQueue.entries()) {
      const totalNotifications =
        digest.deactivations.length + digest.lowStockWarnings.length;

      if (totalNotifications === 0) continue;

      // Get admin preferences to check cooldowns
      const preferences = await AdminPreferences.findOne({ admin: adminId });

      if (!preferences) continue;

      // Filter notifications based on cooldown
      const validDeactivations = digest.deactivations.filter((d: any) =>
        preferences.canSendNotification(d.sectionId, 'deactivation')
      );

      const validLowStock = digest.lowStockWarnings.filter((d: any) =>
        preferences.canSendNotification(d.sectionId, 'lowStock')
      );

      // Send combined digest email
      if (validDeactivations.length > 0 || validLowStock.length > 0) {
        // You can create a combined digest template or send summary
        await sendCleanupSummaryNotification(
          digest.adminEmail,
          {
            totalCleaned: validDeactivations.reduce(
              (sum: number, d: any) => sum + d.removedProducts,
              0
            ),
            sectionsProcessed: validDeactivations.length + validLowStock.length,
            deactivatedSections: validDeactivations.length,
            cleanupDate: new Date(),
            details: [
              ...validDeactivations.map((d: any) => ({
                sectionName: d.sectionName.en,
                removedCount: d.removedProducts,
                status: 'deactivated',
              })),
              ...validLowStock.map((d: any) => ({
                sectionName: d.sectionName.en,
                removedCount: 0,
                status: 'low-stock',
              })),
            ],
          },
          digest.language
        );

        // Record sent notifications
        validDeactivations.forEach((d: any) => {
          preferences.recordNotification(d.sectionId, 'deactivation');
        });
        validLowStock.forEach((d: any) => {
          preferences.recordNotification(d.sectionId, 'lowStock');
        });

        await preferences.save();

        console.log(
          `✉️  Digest sent to ${digest.adminEmail} (${validDeactivations.length + validLowStock.length} notifications)`
        );
      }
    }

    // Clear digest queue
    digestQueue.clear();
    console.log('📬 Digest emails sent\n');
  } catch (error) {
    console.error('❌ Error sending digest emails:', error);
  }
};

/**
 * Process scheduled sections (activate/deactivate based on dates)
 */
export const processScheduledSections = async (): Promise<{
  activated: number;
  deactivated: number;
}> => {
  try {
    console.log('\n📅 Processing Scheduled Sections...');

    const now = new Date();
    let activated = 0;
    let deactivated = 0;

    // Find sections with scheduling enabled
    const scheduledSections = await Section.find({
      'scheduling.enabled': true,
    });

    for (const section of scheduledSections) {
      let statusChanged = false;

      // Check if should be activated
      if (
        section.scheduling.startDate &&
        now >= section.scheduling.startDate &&
        !section.isActive
      ) {
        // Check if end date hasn't passed
        if (!section.scheduling.endDate || now < section.scheduling.endDate) {
          section.isActive = true;
          activated++;
          statusChanged = true;
          console.log(`✅ Activated: ${section.name.en}`);
        }
      }

      // Check if should be deactivated
      if (
        section.scheduling.endDate &&
        now >= section.scheduling.endDate &&
        section.isActive
      ) {
        if (section.scheduling.autoArchive) {
          // Archive the section (keep data, just deactivate)
          section.isActive = false;
          deactivated++;
          statusChanged = true;
          console.log(`📦 Archived: ${section.name.en}`);
        } else {
          // Just deactivate
          section.isActive = false;
          deactivated++;
          statusChanged = true;
          console.log(`⏹️  Deactivated: ${section.name.en}`);
        }
      }

      if (statusChanged) {
        await section.save();
      }
    }

    console.log('\n📊 Scheduling Summary:');
    console.log(`   • Sections activated: ${activated}`);
    console.log(`   • Sections deactivated: ${deactivated}\n`);

    return { activated, deactivated };
  } catch (error) {
    console.error('❌ Error processing scheduled sections:', error);
    return { activated: 0, deactivated: 0 };
  }
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

/**
 * Schedule cleanup to run periodically
 * @param intervalHours - How often to run cleanup (in hours)
 */
export const scheduleAutoCleanup = (intervalHours: number = 24): void => {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`\n🕐 Auto-cleanup scheduled to run every ${intervalHours} hours`);
  console.log(`🕐 Scheduled sections check runs every hour`);
  console.log(`🕐 Digest emails sent daily at midnight\n`);

  // Run cleanup and scheduling immediately on startup
  (async () => {
    await processScheduledSections();
    await autoCleanSections();
  })();

  // Schedule cleanup
  setInterval(async () => {
    await processScheduledSections();
    await autoCleanSections();
  }, intervalMs);

  // Check scheduled sections every hour
  setInterval(async () => {
    await processScheduledSections();
  }, 60 * 60 * 1000); // Every hour

  // Send digest emails daily at midnight (or every 24 hours)
  setInterval(async () => {
    await sendDigestEmails();
  }, 24 * 60 * 60 * 1000); // Every 24 hours
};

export default {
  autoCleanSections,
  scheduleAutoCleanup,
  cleanSectionById,
  sendDigestEmails,
  processScheduledSections,
};