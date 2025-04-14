const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const adminSchema = require('../schemas/admin.schema');

/**
 * @swagger
 * /api/admin/deleted-defects:
 *   get:
 *     summary: Get all deleted defects
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
 * /api/admin/restore-defect/{id}:
 *   post:
 *     summary: Restore a deleted defect
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Defect restored successfully
 *       403:
 *         description: Admin access required
 */
router.post('/restore-defect/:id', 
    isAuthenticated, 
    isAdmin, 
    adminController.restoreDefect
);

/**
 * @swagger
 * /api/admin/export/audit-logs:
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
 *         required: true
 *     responses:
 *       200:
 *         description: Audit logs exported successfully
 *       403:
 *         description: Admin access required
 */
router.get('/export/audit-logs', 
    isAuthenticated, 
    isAdmin,
    validateRequest(adminSchema.exportAuditLogs),
    adminController.exportAuditLogs
);

/**
 * @swagger
 * /api/admin/settings:
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
 * /api/admin/settings:
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
 *               emailNotifications:
 *                 type: boolean
 *               slackIntegration:
 *                 type: boolean
 *               alertOnCritical:
 *                 type: boolean
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



