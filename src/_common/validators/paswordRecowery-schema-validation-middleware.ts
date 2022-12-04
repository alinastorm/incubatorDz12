import { checkSchema } from 'express-validator';

export const passwordRecoveryValidationMiddleware = checkSchema({
    "email": {
        isEmail: true,
        errorMessage: 'email not valid',
    },
})
