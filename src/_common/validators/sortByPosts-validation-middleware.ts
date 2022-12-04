import { param, query } from 'express-validator';

export const sortByPostsQueryValidationMiddleware = query('sortBy')
    .default("createdAt")
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 16 })
    .isIn([
        'id',
        'title',
        'shortDescription',
        'content',
        'blogId',
        'blogName',
        'createdAt'
    ])
    .exists()

// .withMessage({ message: 'wrong id', field: "id", code: 400 })
