const { z } = require('zod');

const commentSchema = {
  createComment: {
    params: z.object({
      defectId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Defect ID must be a number'
      })
    }),
    body: z.object({
      content: z.string().min(1).max(1000)
    })
  },
  
  updateComment: {
    params: z.object({
      defectId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Defect ID must be a number'
      }),
      commentId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Comment ID must be a number'
      })
    }),
    body: z.object({
      content: z.string().min(1).max(1000)
    })
  },
  
  deleteComment: {
    params: z.object({
      defectId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Defect ID must be a number'
      }),
      commentId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Comment ID must be a number'
      })
    })
  }
};

module.exports = commentSchema; 