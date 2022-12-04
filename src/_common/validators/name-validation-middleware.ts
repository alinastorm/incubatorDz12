import { body, query } from 'express-validator';

export const nameBodyValidationMiddleware = body('name')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 15 })
    // .withMessage({ message: 'wrong name', field: "name", code: 400 })
