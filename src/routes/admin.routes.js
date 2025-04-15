const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const adminSchema = require('../schemas/admin.schema');

/**
 * @swagger
 * /admin/deleted-defects:
 *   get:
 *     summary: Get all deleted defects (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deleted defects
 *       403:
 *         description: Admin access required
 */
router.get('/deleted-defects',
  isAuthenticated,
  isAdmin,
  adminController.getDeletedDefects
);

/**
 * @swagger
 * /admin/restore-defect/{id}:
 *   post:
 *     summary: Restore a deleted defect (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Defect restored successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Defect not found
 */
router.post('/restore-defect/:id',
  isAuthenticated,
  isAdmin,
  adminController.restoreDefect
);

/**
 * @swagger
 * /admin/export/audit-logs:
 *   get:
 *     summary: Export audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *         required: false
 *         description: Export format (defaults to csv)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Start date for filtering logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: End date for filtering logs
 *       - in: query
 *         name: actionTypes
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: false
 *         description: Types of actions to include
 *     responses:
 *       200:
 *         description: Audit logs exported successfully
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get('/export/audit-logs', 
    isAuthenticated, 
    isAdmin,
    validateRequest(adminSchema.exportAuditLogs),
    adminController.exportAuditLogs
);

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get admin settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin settings retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/settings', 
    isAuthenticated, 
    isAdmin, 
    adminController.getSettings
);

/**
 * @swagger
 * /admin/settings:
 *   put:
 *     summary: Update admin settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultDefectAssignment:
 *                 type: string
 *                 enum: [round_robin, load_balanced, manual]
 *               maxDefectsPerUser:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *               autoCloseAfterDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   emailNotifications:
 *                     type: boolean
 *                   slackIntegration:
 *                     type: boolean
 *                   alertOnCritical:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       403:
 *         description: Admin access required
 */
router.put('/settings', 
    isAuthenticated, 
    isAdmin, 
    validateRequest(adminSchema.updateSettings),
    adminController.updateSettings
);

module.exports = router;







