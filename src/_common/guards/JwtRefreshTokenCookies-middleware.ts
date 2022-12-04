import { NextFunction } from 'express';
import { HTTP_STATUSES, RequestWithrefreshTokenJWTBearer, ResponseWithCode } from '../services/http/types';
import { jwtTokenService } from '../services/token/jwtToken-service';

/** Проверка рефереш токена на валидность и тухлость */
export const JwtRefreshTokenCookies401 = async (
    req: RequestWithrefreshTokenJWTBearer,
    res: ResponseWithCode<401>,
    next: NextFunction
) => {

    //Проверка наличия cookies авторизации
    const reqRefreshToken = req.cookies.refreshToken
    console.log(reqRefreshToken);   
    if (!reqRefreshToken) return res.status(401).send("no refreshToken")

    //проверяем валидность, тухлость, состав
    const userId = jwtTokenService.getDataByRefreshToken(reqRefreshToken)?.userId
    const deviceId = jwtTokenService.getDataByRefreshToken(reqRefreshToken)?.deviceId
    if (!userId || !deviceId) return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("no valid refreshToken")

    //Мутируем req
    req.user = { userId, deviceId } //TODO глаза мне мозолит этот userId в req
    next()
}
