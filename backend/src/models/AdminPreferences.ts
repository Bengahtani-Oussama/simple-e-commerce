import mongoose, { Schema, Document } from "mongoose";

export interface IAdminPreferences extends Document {
  admin: mongoose.Types.ObjectId;

  // Language Preference
  preferredLanguage: "ar" | "en" | "fr";

  // Email Notification Settings
  emailNotifications: {
    enabled: boolean;
    sectionDeactivation: boolean;
    sectionLowStock: boolean;
    dailyCleanupSummary: boolean;
    digestMode: boolean; // Combine notifications into daily digest
  };

  // Low Stock Warning Settings
  lowStockSettings: {
    enabled: boolean;
    threshold: number; // Products away from minimum (default: 2)
    cooldownHours: number; // Hours between notifications for same section (default: 24)
  };

  // Last notification timestamps (for cooldown)
  lastNotifications: {
    sectionId: mongoose.Types.ObjectId;
    type: "deactivation" | "lowStock";
    sentAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;

  canSendNotification(
    sectionId: string,
    type: "deactivation" | "lowStock",
  ): boolean;
  recordNotification(
    sectionId: string,
    type: "deactivation" | "lowStock",
  ): void;
}

const adminPreferencesSchema = new Schema<IAdminPreferences>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["ar", "en", "fr"],
      default: "en",
    },
    emailNotifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      sectionDeactivation: {
        type: Boolean,
        default: true,
      },
      sectionLowStock: {
        type: Boolean,
        default: true,
      },
      dailyCleanupSummary: {
        type: Boolean,
        default: true,
      },
      digestMode: {
        type: Boolean,
        default: false,
      },
    },
    lowStockSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      threshold: {
        type: Number,
        default: 2,
        min: 1,
        max: 10,
      },
      cooldownHours: {
        type: Number,
        default: 24,
        min: 1,
        max: 168, // Max 1 week
      },
    },
    lastNotifications: [
      {
        sectionId: {
          type: Schema.Types.ObjectId,
          ref: "Section",
        },
        type: {
          type: String,
          enum: ["deactivation", "lowStock"],
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
adminPreferencesSchema.index({ admin: 1 });

// Method to check if notification can be sent (cooldown check)
adminPreferencesSchema.methods.canSendNotification = function (
  sectionId: string,
  type: "deactivation" | "lowStock",
): boolean {
  if (!this.emailNotifications.enabled) return false;

  // Check if specific notification type is enabled
  if (type === "deactivation" && !this.emailNotifications.sectionDeactivation) {
    return false;
  }
  if (type === "lowStock" && !this.emailNotifications.sectionLowStock) {
    return false;
  }

  // Check cooldown for low stock notifications
  if (type === "lowStock" && this.lowStockSettings.enabled) {
    const lastNotification = this.lastNotifications.find(
      (n: any) => n.sectionId.toString() === sectionId && n.type === type,
    );

    if (lastNotification) {
      const hoursSinceLastNotification =
        (Date.now() - lastNotification.sentAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastNotification < this.lowStockSettings.cooldownHours) {
        return false; // Still in cooldown period
      }
    }
  }

  return true;
};

// Method to record notification sent
adminPreferencesSchema.methods.recordNotification = function (
  sectionId: string,
  type: "deactivation" | "lowStock",
): void {
  // Remove old notification for same section/type
  this.lastNotifications = this.lastNotifications.filter(
    (n: any) => !(n.sectionId.toString() === sectionId && n.type === type),
  );

  // Add new notification record
  this.lastNotifications.push({
    sectionId: new mongoose.Types.ObjectId(sectionId),
    type,
    sentAt: new Date(),
  });

  // Keep only last 100 notifications to prevent bloat
  if (this.lastNotifications.length > 100) {
    this.lastNotifications = this.lastNotifications.slice(-100);
  }
};

export default mongoose.model<IAdminPreferences>(
  "AdminPreferences",
  adminPreferencesSchema,
);
