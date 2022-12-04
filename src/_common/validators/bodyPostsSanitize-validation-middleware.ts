import { body, sanitizeBody } from 'express-validator';

export const bodyPostsSanitizeValidationMiddleware = sanitizeBody(
    [
        'title',
        'shortDescription',
        'content',
        'blogId',
    ]
)
// .withMessage({ message: 'wrong schema body Blog', field: "body", code: 400 })
