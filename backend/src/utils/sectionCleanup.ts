import Section from "../models/Section";
import Product from "../models/Product";
import Admin from "../models/Admin";
import AdminPreferences from "../models/AdminPreferences";
import mongoose from "mongoose";
import {
  sendSectionDeactivationNotification,
  sendSectionLowStockNotification,
  sendCleanupSummaryNotification,
} from "./sectionEmailTemplates";

/* ───────────────────────────────────────────── */
/* Types */
/* ───────────────────────────────────────────── */

interface DigestNotification {
  adminId: string;
  adminEmail: string;
  language: "ar" | "en" | "fr";
  deactivations: any[];
  lowStockWarnings: any[];
}

const digestQueue: Map<string, DigestNotification> = new Map();

/* ───────────────────────────────────────────── */
/* Helpers */
/* ───────────────────────────────────────────── */

const checkProductsStock = async (
  productIds: string[],
): Promise<{
  validProducts: string[];
  outOfStock: string[];
}> => {
  const validProducts: string[] = [];
  const outOfStock: string[] = [];

  for (const productId of productIds) {
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      outOfStock.push(productId);
      continue;
    }

    const hasStock = product.variants.some(
      (variant: any) => variant.stock > 0 && variant.isActive,
    );

    if (hasStock) {
      validProducts.push(productId);
    } else {
      outOfStock.push(productId);
    }
  }

  return { validProducts, outOfStock };
};

/* ───────────────────────────────────────────── */
/* Auto Cleanup */
/* ───────────────────────────────────────────── */

export const autoCleanSections = async (): Promise<{
  success: boolean;
  totalCleaned: number;
  sectionsProcessed: number;
  deactivatedSections: number;
  details: any[];
}> => {
  try {
    console.log("\n🧹 Starting Auto Section Cleanup...\n");

    const sections = await Section.find({ isActive: true });

    let totalCleaned = 0;
    let deactivatedSections = 0;

    const details: any[] = [];
    const deactivatedList: any[] = [];
    const lowStockList: any[] = [];

    for (const section of sections) {
      const productIds = section.products.map((product: any) =>
        product._id.toString(),
      );
      

      const { validProducts, outOfStock } =
        await checkProductsStock(productIds);

      const removedCount = outOfStock.length;

      /* ───────────── Maintain Section ───────────── */
      if (validProducts.length >= section.minProducts) {
        const updatedProducts =
          section.products?.map((product: any) => product.id) ?? [];
        section.products = updatedProducts.map(
          (id: any) => new mongoose.Types.ObjectId(id),
        );

        // section.productIds = validProducts;

        await section.save();

        if (removedCount > 0) {
          totalCleaned += removedCount;

          details.push({
            sectionId: section._id,
            sectionName: section.name.en,
            removedCount,
            remainingProducts: validProducts.length,
            status: "cleaned",
          });
        }

        const threshold = section.minProducts + 2;

        if (
          validProducts.length <= threshold &&
          validProducts.length > section.minProducts
        ) {
          lowStockList.push({
            sectionId: section._id.toString(),
            sectionName: section.name,
            currentProducts: validProducts.length,
            minRequired: section.minProducts,
          });
        }
      } else {
        /* ───────────── Deactivate Section ───────────── */
        section.isActive = false;
        await section.save();
        deactivatedSections++;

        details.push({
          sectionId: section._id,
          sectionName: section.name.en,
          removedCount,
          remainingProducts: validProducts.length,
          minRequired: section.minProducts,
          status: "deactivated",
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

    /* ───────────────────────────────────────────── */
    /* Notifications */
    /* ───────────────────────────────────────────── */

    const admins = await Admin.find({ isActive: true });

    for (const admin of admins) {
      let preferences =
        (await AdminPreferences.findOne({ admin: admin._id })) ||
        (await AdminPreferences.create({ admin: admin._id }));

      const language = preferences.preferredLanguage;

      if (preferences.emailNotifications.digestMode) {
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

        digest.deactivations.push(...deactivatedList);
        digest.lowStockWarnings.push(...lowStockList);
      } else {
        for (const d of deactivatedList) {
          if (preferences.canSendNotification(d.sectionId, "deactivation")) {
            await sendSectionDeactivationNotification(admin.email, d, language);
            preferences.recordNotification(d.sectionId, "deactivation");
          }
        }

        for (const l of lowStockList) {
          if (preferences.canSendNotification(l.sectionId, "lowStock")) {
            await sendSectionLowStockNotification(admin.email, l, language);
            preferences.recordNotification(l.sectionId, "lowStock");
          }
        }
      }

      if (
        preferences.emailNotifications.dailyCleanupSummary &&
        (totalCleaned > 0 || deactivatedSections > 0)
      ) {
        await sendCleanupSummaryNotification(
          admin.email,
          {
            totalCleaned,
            sectionsProcessed: sections.length,
            deactivatedSections,
            cleanupDate: new Date(),
            details,
          },
          language,
        );
      }

      await preferences.save();
    }

    return {
      success: true,
      totalCleaned,
      sectionsProcessed: sections.length,
      deactivatedSections,
      details,
    };
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    return {
      success: false,
      totalCleaned: 0,
      sectionsProcessed: 0,
      deactivatedSections: 0,
      details: [],
    };
  }
};

/* ───────────────────────────────────────────── */
/* Single Section Cleanup */
/* ───────────────────────────────────────────── */

export const cleanSectionById = async (
  sectionId: string,
): Promise<{
  success: boolean;
  removedCount: number;
  message: string;
}> => {
  try {
    const section = await Section.findById(sectionId);
    if (!section) {
      return { success: false, removedCount: 0, message: "Section not found" };
    }

    const productIds = section.products.map((product: any) =>
      product?._id.toString(),
    );
    const { validProducts, outOfStock } = await checkProductsStock(productIds);

    const updatedProducts =
      section.products?.map((product: any) => product.id) ?? [];
    section.products = updatedProducts.map(
      (id: any) => new mongoose.Types.ObjectId(id),
    );

    if (validProducts.length < section.minProducts) {
      section.isActive = false;
    }

    await section.save();

    return {
      success: true,
      removedCount: outOfStock.length,
      message:
        validProducts.length < section.minProducts
          ? "Section deactivated due to low products"
          : `Removed ${outOfStock.length} out-of-stock products`,
    };
  } catch (error: any) {
    return {
      success: false,
      removedCount: 0,
      message: error.message || "Cleanup failed",
    };
  }
};

/* ───────────────────────────────────────────── */
/* Digest Emails */
/* ───────────────────────────────────────────── */

export const sendDigestEmails = async (): Promise<void> => {
  for (const [, digest] of digestQueue.entries()) {
    if (
      digest.deactivations.length === 0 &&
      digest.lowStockWarnings.length === 0
    ) {
      continue;
    }

    await sendCleanupSummaryNotification(
      digest.adminEmail,
      {
        totalCleaned: digest.deactivations.reduce(
          (sum: number, d: any) => sum + d.removedProducts,
          0,
        ),
        sectionsProcessed:
          digest.deactivations.length + digest.lowStockWarnings.length,
        deactivatedSections: digest.deactivations.length,
        cleanupDate: new Date(),
        details: [],
      },
      digest.language,
    );
  }

  digestQueue.clear();
};

/* ───────────────────────────────────────────── */
/* Scheduling */
/* ───────────────────────────────────────────── */

export const processScheduledSections = async (): Promise<{
  activated: number;
  deactivated: number;
}> => {
  const now = new Date();
  let activated = 0;
  let deactivated = 0;

  const sections = await Section.find({ "scheduling.enabled": true });

  for (const section of sections) {
    let changed = false;

    if (
      section.scheduling.startDate &&
      now >= section.scheduling.startDate &&
      !section.isActive
    ) {
      section.isActive = true;
      activated++;
      changed = true;
    }

    if (
      section.scheduling.endDate &&
      now >= section.scheduling.endDate &&
      section.isActive
    ) {
      section.isActive = false;
      deactivated++;
      changed = true;
    }

    if (changed) await section.save();
  }

  return { activated, deactivated };
};

/* ───────────────────────────────────────────── */
/* Scheduler */
/* ───────────────────────────────────────────── */

export const scheduleAutoCleanup = (intervalHours = 24): void => {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  (async () => {
    await processScheduledSections();
    await autoCleanSections();
  })();

  setInterval(async () => {
    await processScheduledSections();
    await autoCleanSections();
  }, intervalMs);

  setInterval(sendDigestEmails, 24 * 60 * 60 * 1000);
};

export default {
  autoCleanSections,
  cleanSectionById,
  scheduleAutoCleanup,
  sendDigestEmails,
  processScheduledSections,
};
