import { Response } from 'express';
import AdminPreferences from '../models/AdminPreferences';
import { AuthRequest } from '../types';

// @desc    Get admin preferences
// @route   GET /api/admin/preferences
export const getAdminPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let preferences = await AdminPreferences.findOne({ admin: req.user?.id });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await AdminPreferences.create({
        admin: req.user?.id,
      });
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get preferences',
    });
  }
};

// @desc    Update admin preferences
// @route   PUT /api/admin/preferences
export const updateAdminPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      preferredLanguage,
      emailNotifications,
      lowStockSettings,
    } = req.body;

    let preferences = await AdminPreferences.findOne({ admin: req.user?.id });

    if (!preferences) {
      preferences = await AdminPreferences.create({
        admin: req.user?.id,
        preferredLanguage,
        emailNotifications,
        lowStockSettings,
      });
    } else {
      // Update fields
      if (preferredLanguage) preferences.preferredLanguage = preferredLanguage;
      if (emailNotifications) {
        preferences.emailNotifications = {
          ...preferences.emailNotifications,
          ...emailNotifications,
        };
      }
      if (lowStockSettings) {
        preferences.lowStockSettings = {
          ...preferences.lowStockSettings,
          ...lowStockSettings,
        };
      }

      await preferences.save();
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update preferences',
    });
  }
};

// @desc    Update language preference
// @route   PUT /api/admin/preferences/language
export const updateLanguagePreference = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { language } = req.body;

    if (!['ar', 'en', 'fr'].includes(language)) {
      res.status(400).json({
        success: false,
        message: 'Invalid language. Must be ar, en, or fr',
      });
      return;
    }

    let preferences = await AdminPreferences.findOne({ admin: req.user?.id });

    if (!preferences) {
      preferences = await AdminPreferences.create({
        admin: req.user?.id,
        preferredLanguage: language,
      });
    } else {
      preferences.preferredLanguage = language;
      await preferences.save();
    }

    res.status(200).json({
      success: true,
      message: 'Language preference updated',
      data: { language: preferences.preferredLanguage },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update language',
    });
  }
};

// @desc    Update email notification settings
// @route   PUT /api/admin/preferences/notifications
export const updateNotificationSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const settings = req.body;

    let preferences = await AdminPreferences.findOne({ admin: req.user?.id });

    if (!preferences) {
      preferences = await AdminPreferences.create({
        admin: req.user?.id,
        emailNotifications: settings,
      });
    } else {
      preferences.emailNotifications = {
        ...preferences.emailNotifications,
        ...settings,
      };
      await preferences.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification settings updated',
      data: preferences.emailNotifications,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update notification settings',
    });
  }
};

// @desc    Update low stock warning settings
// @route   PUT /api/admin/preferences/low-stock
export const updateLowStockSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { enabled, threshold, cooldownHours } = req.body;

    let preferences = await AdminPreferences.findOne({ admin: req.user?.id });

    if (!preferences) {
      preferences = await AdminPreferences.create({
        admin: req.user?.id,
        lowStockSettings: { enabled, threshold, cooldownHours },
      });
    } else {
      if (enabled !== undefined) preferences.lowStockSettings.enabled = enabled;
      if (threshold !== undefined) {
        if (threshold < 1 || threshold > 10) {
          res.status(400).json({
            success: false,
            message: 'Threshold must be between 1 and 10',
          });
          return;
        }
        preferences.lowStockSettings.threshold = threshold;
      }
      if (cooldownHours !== undefined) {
        if (cooldownHours < 1 || cooldownHours > 168) {
          res.status(400).json({
            success: false,
            message: 'Cooldown hours must be between 1 and 168',
          });
          return;
        }
        preferences.lowStockSettings.cooldownHours = cooldownHours;
      }

      await preferences.save();
    }

    res.status(200).json({
      success: true,
      message: 'Low stock settings updated',
      data: preferences.lowStockSettings,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update low stock settings',
    });
  }
};

// @desc    Clear notification history (reset cooldowns)
// @route   DELETE /api/admin/preferences/notifications/history
export const clearNotificationHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const preferences = await AdminPreferences.findOne({ admin: req.user?.id });

    if (!preferences) {
      res.status(404).json({
        success: false,
        message: 'Preferences not found',
      });
      return;
    }

    preferences.lastNotifications = [];
    await preferences.save();

    res.status(200).json({
      success: true,
      message: 'Notification history cleared',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear history',
    });
  }
};

export default {
  getAdminPreferences,
  updateAdminPreferences,
  updateLanguagePreference,
  updateNotificationSettings,
  updateLowStockSettings,
  clearNotificationHistory,
};