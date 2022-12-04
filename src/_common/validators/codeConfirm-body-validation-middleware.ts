import { body } from 'express-validator';




/**Code that be sent via Email inside link */
export const codeConfirmBodyValidationMiddleware = body('code')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()


