import { body } from 'express-validator';

export const emailBodyValidationMiddleware = body('email')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 100 })
    .isEmail()
    // .matches("^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $")
    // .matches("^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$")
    // .withMessage({ message: 'wrong youtubeUrl', field: "youtubeUrl", code: 400 })
