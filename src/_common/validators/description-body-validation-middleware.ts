import { body } from 'express-validator';

export const descriptionBodyValidationMiddleware = body('description')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 500 })
