import { query } from 'express-validator';

export const searchNameTermQueryValidationMiddleware = query('searchNameTerm')
    .isString()
    .isLength({ max: 30 })
    .notEmpty({ ignore_whitespace: true })
    .default(null)
    .exists()

    // .withMessage({ message: 'wrong title', field: "title", code: 400 })
