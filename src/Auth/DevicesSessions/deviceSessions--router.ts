import express from 'express';
import { JwtRefreshTokenCookies401 } from '../../_common/guards/JwtRefreshTokenCookies-middleware';
import { code400 } from '../../_common/validators/code400-middleware';
import { deviceIdUriParam } from '../../_common/validators/deviceId-UriParams-validation-middleware copy';
import devicesController from './deviceSessions-controller';


export const devicesRouter = express.Router()

/** GET - список всех активных сессий пользовател */
devicesRouter.get(`/security/devices`,
    JwtRefreshTokenCookies401,
    <any> devicesController.readAll
)
/** DELETE - удаление всех других (кроме текущей) сессий */
devicesRouter.delete(`/security/devices`,
JwtRefreshTokenCookies401,
    <any> devicesController.deleteAllExcludeCurrent
)
/** DELETE - удаление конкретной сессии по deviceId */
devicesRouter.delete(`/security/devices/:deviceId`,
    deviceIdUriParam,
    code400,
    JwtRefreshTokenCookies401,
    <any> devicesController.deleteOne
)
devicesRouter.post(`/auth/login`, (req, res, next) => {
    console.log('2');
    next()
})