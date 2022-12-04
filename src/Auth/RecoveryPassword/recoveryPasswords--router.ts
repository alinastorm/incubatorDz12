import express from 'express';
import { code400 } from '../../_common/validators/code400-middleware';
import { newPasswordValidationMiddleware } from '../../_common/validators/newPassword-schema-validation-middleware';
import { passwordRecoveryValidationMiddleware } from '../../_common/validators/paswordRecowery-schema-validation-middleware';
import recoveryPasswordController from './recoveryPasswords-controller';





export const recoveryPasswordRouter = express.Router()

recoveryPasswordRouter.post(`/auth/password-recovery`,
    passwordRecoveryValidationMiddleware,
    code400,
    recoveryPasswordController.passwordRecowery
)
recoveryPasswordRouter.post(`/auth/new-password`,
    //проверка newPassword maxLength: 20 minLength: 6
    newPasswordValidationMiddleware,
    code400,
    recoveryPasswordController.newPassword
)

