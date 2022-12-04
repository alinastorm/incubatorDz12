import express from 'express';
import { code400 } from '../../_common/validators/code400-middleware';
import registrationController from "./registrations-controller"
import { loginBodyValidationMiddleware } from '../../_common/validators/login-body-validation-middleware';
import { passwordBodyValidationMiddleware } from '../../_common/validators/password-body-validation-middleware';
import { emailBodyValidationMiddleware } from '../../_common/validators/email-validation-middleware';
import { codeConfirmBodyValidationMiddleware } from '../../_common/validators/codeConfirm-body-validation-middleware';
import ddosGuard from '../../_common/guards/ddos-middleware';



export const registrationRouter = express.Router()
// registrationRouter.all("/auth/*",
//     ddosGuard.checkRequest,
//     ddosGuard.logRequest,
// )

registrationRouter.post(`/auth/registration`,
    // ddosGuard.logRequest.bind(ddosGuard),
    // ddosGuard.checkRequest.bind(ddosGuard),
    loginBodyValidationMiddleware,
    passwordBodyValidationMiddleware,
    emailBodyValidationMiddleware,
    code400,
    <any> registrationController.registration
)
registrationRouter.post(`/auth/registration-confirmation`,
    codeConfirmBodyValidationMiddleware,
    code400,
    registrationController.confirmRegistration
)
registrationRouter.post(`/auth/registration-email-resending`,
    emailBodyValidationMiddleware,//Email of already registered but not confirmed user
    code400,
    <any> registrationController.resendEmail
)

