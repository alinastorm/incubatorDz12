import express from 'express';
import { JwtRefreshTokenCookies401 } from '../../_common/guards/JwtRefreshTokenCookies-middleware';
import tokensController from './tokens-controller';




export const tokensRouter = express.Router()

tokensRouter.post(`/auth/refresh-token`,
    JwtRefreshTokenCookies401,
    // authCookiesRefreshTokenIsRottenMiddleware,
    <any> tokensController.refreshTokens
)
