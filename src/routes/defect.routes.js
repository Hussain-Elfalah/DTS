const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const defectController = require('../controllers/defect.controller');
const commentController = require('../controllers/comment.controller');
const { validateRequest } = require('../middleware/validation.middleware');
const defectSchema = require('../validations/defect.schema');

/**
 * @swagger
 * /defects:
 *   get:
 *     summary: Get all defects
 *     tags: [Defects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of defects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Defect'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: 
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 */
router.get('/', isAuthenticated, defectController.getDefects);

/**
 * @swagger
 * /defects:
 *   post:
 *     summary: Create a new defect
 *     tags: [Defects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, severity]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               assignedTo:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: url
 *     responses:
 *       201:
 *         description: Defect created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Defect'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', 
  isAuthenticated, 
  validateRequest(defectSchema.create),
  defectController.createDefect
);

/**
 * @swagger
 * /defects/{id}:
 *   get:
 *     summary: Get a defect by ID
 *     tags: [Defects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Defect ID
 *     responses:
 *       200:
 *         description: Defect details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     defect:
 *                       $ref: '#/components/schemas/Defect'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', 
  isAuthenticated,
  validateRequest({ params: defectSchema.id }),
  defectController.getDefectById
);

/**
 * @swagger
 * /defects/{id}/comments:
 *   post:
 *     summary: Add a comment to a defect
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     content:
 *                       type: string
 *                     created_by:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/comments',
  isAuthenticated,
  validateRequest(defectSchema.comment),
  async (req, res) => {
    try {
      const comment = await commentController.createComment(
        req.params.id,
        req.user.id,
        req.body.content
      );
      res.status(201).json({ comment });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /defects/{id}/comments:
 *   get:
 *     summary: Get all comments for a defect
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       created_by:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/comments',
  isAuthenticated,
  async (req, res) => {
    try {
      const comments = await commentController.getComments(req.params.id);
      res.json({ comments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /defects/{defectId}/comments/{commentId}:
 *   put:
 *     summary: Edit a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: defectId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Not authorized to edit this comment
 *       404:
 *         description: Comment not found
 */
router.put('/:defectId/comments/:commentId',
  isAuthenticated,
  validateRequest(defectSchema.comment),
  async (req, res) => {
    try {
      const comment = await commentController.updateComment(
        req.params.commentId,
        req.user.id,
        req.body.content
      );
      res.json({ comment });
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
);

module.exports = router;





