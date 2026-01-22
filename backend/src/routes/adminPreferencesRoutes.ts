import express from "express";
import {
  getAdminPreferences,
  updateAdminPreferences,
  updateLanguagePreference,
  updateNotificationSettings,
  updateLowStockSettings,
  clearNotificationHistory,
} from "../controllers/adminPreferencesController";
import { protect, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// All routes require admin authentication
router.use(protect, isAdmin);

/**
 * @swagger
 * /admin/preferences:
 *   get:
 *     summary: Get admin preferences
 *     tags: [Admin - Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 */
router.get("/", getAdminPreferences);

/**
 * @swagger
 * /admin/preferences:
 *   put:
 *     summary: Update admin preferences
 *     tags: [Admin - Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredLanguage:
 *                 type: string
 *                 enum: [ar, en, fr]
 *               emailNotifications:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   sectionDeactivation:
 *                     type: boolean
 *                   sectionLowStock:
 *                     type: boolean
 *                   dailyCleanupSummary:
 *                     type: boolean
 *                   digestMode:
 *                     type: boolean
 *               lowStockSettings:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   threshold:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 10
 *                   cooldownHours:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 168
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put("/", updateAdminPreferences);

/**
 * @swagger
 * /admin/preferences/language:
 *   put:
 *     summary: Update language preference
 *     tags: [Admin - Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [ar, en, fr]
 *                 example: en
 *     responses:
 *       200:
 *         description: Language updated successfully
 *       400:
 *         description: Invalid language
 */
router.put("/language", updateLanguagePreference);

/**
 * @swagger
 * /admin/preferences/notifications:
 *   put:
 *     summary: Update email notification settings
 *     tags: [Admin - Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Master switch for all email notifications
 *               sectionDeactivation:
 *                 type: boolean
 *                 description: Receive alerts when sections are deactivated
 *               sectionLowStock:
 *                 type: boolean
 *                 description: Receive warnings when sections are low on stock
 *               dailyCleanupSummary:
 *                 type: boolean
 *                 description: Receive daily cleanup summary reports
 *               digestMode:
 *                 type: boolean
 *                 description: Combine all notifications into daily digest
 *     responses:
 *       200:
 *         description: Notification settings updated
 */
router.put("/notifications", updateNotificationSettings);

/**
 * @swagger
 * /admin/preferences/low-stock:
 *   put:
 *     summary: Update low stock warning settings
 *     tags: [Admin - Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Enable low stock warnings
 *               threshold:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Products away from minimum to trigger warning
 *                 example: 2
 *               cooldownHours:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 168
 *                 description: Hours between warnings for same section
 *                 example: 24
 *     responses:
 *       200:
 *         description: Low stock settings updated
 *       400:
 *         description: Invalid threshold or cooldown value
 */
router.put("/low-stock", updateLowStockSettings);

/**
 * @swagger
 * /admin/preferences/notifications/history:
 *   delete:
 *     summary: Clear notification history (reset cooldowns)
 *     tags: [Admin - Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification history cleared
 */
router.delete("/notifications/history", clearNotificationHistory);

export default router;
