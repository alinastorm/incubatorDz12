import { body } from 'express-validator';

export const shortdescriptionBodyValidationMiddleware = body('shortDescription')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ max: 100 })
    // .withMessage({ message: 'wrong shortdescription', field: "shortdescription", code: 400 })
