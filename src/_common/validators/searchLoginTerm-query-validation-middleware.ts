import { query } from 'express-validator';

export const searchLoginTermQueryValidationMiddleware = query('searchLoginTerm')
    .default(null)
    // .isString()
    // .isLength({ max: 30 })
    // .notEmpty({ ignore_whitespace: true })
    .exists()

    // .withMessage({ message: 'wrong title', field: "title", code: 400 })
