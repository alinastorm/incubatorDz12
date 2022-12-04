import { param, query } from 'express-validator';

export const sortByCommentsQueryValidationMiddleware = query('sortBy')
    .default("createdAt")
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 16 })
    .isIn([
        'id',
        'content',
        'userId',
        'userLogin',
        'postId',
        'createdAt',
    ])
    .exists()

// .withMessage({ message: 'wrong id', field: "id", code: 400 })
