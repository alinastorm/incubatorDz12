import { body } from 'express-validator';

export const contentBodyValidationMiddleware = body('content')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 1000 })
    // .withMessage({ message: 'wrong content', field: "content", code: 400 })
