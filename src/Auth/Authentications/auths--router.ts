import express from 'express';
import { JwtRefreshTokenCookies401 } from '../../_common/guards/JwtRefreshTokenCookies-middleware';
import { code400 } from '../../_common/validators/code400-middleware';
import { schemaLoginInputValidationMiddleware } from '../../_common/validators/schemaLoginInput-validation-middleware';
import authController from './auths-controller';
import ddosGuard from '../../_common/guards/ddos-middleware';
import { authHeadersJwtAccessTokenHeaders401 } from '../../_common/guards/JwtAccessTokenHeaders401-middleware';




export const authRouter = express.Router()

authRouter.all("/auth/*",
    ddosGuard.logRequest.bind(ddosGuard),
    ddosGuard.checkRequest.bind(ddosGuard),
)
authRouter.post(`/auth/login`,
    schemaLoginInputValidationMiddleware,
    code400,
    <any> authController.Login
)
authRouter.post(`/auth/logout`,
    <any> JwtRefreshTokenCookies401,
    <any> authController.logout
)
authRouter.get(`/auth/me`,
    <any> authHeadersJwtAccessTokenHeaders401,//TODO тут по хорошему нужно получить в cookies как в JwtRefreshTokenCookies401
    <any> authController.getUser
)
