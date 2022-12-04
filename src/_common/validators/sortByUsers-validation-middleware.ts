import { param, query } from 'express-validator';

export const sortByUsersQueryValidationMiddleware = query('sortBy')
    .default("createdAt")
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 16 })
    .isIn([
        'id',
        'login',
        'email',
        'createdAt'
    ])
    .exists()

// .withMessage({ message: 'wrong id', field: "id", code: 400 })
