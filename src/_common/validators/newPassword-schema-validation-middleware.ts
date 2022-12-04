import { checkSchema } from 'express-validator';

export const newPasswordValidationMiddleware = checkSchema({
    "newPassword": {
        isLength: {
            errorMessage: "password has invalid length. Send between 6 and 20 characters",
            options: { min: 6, max: 20 },
        }
    },
    "recoveryCode": {
        isUUID: true,
        errorMessage: 'recoveryCode must be a UUID',
    }

})
