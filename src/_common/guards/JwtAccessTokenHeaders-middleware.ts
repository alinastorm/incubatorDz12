import { NextFunction, Response } from 'express';
import { HTTP_STATUSES, RequestWithAccessTokenJWTBearer, RequestWithHeaders, ResponseWithBodyCode } from '../services/http/types';
import { jwtTokenService } from '../services/token/jwtToken-service';
import { APIErrorResult } from '../validators/types';


export const authHeadersJwtAccessTokenHeaders = async (
    req: RequestWithAccessTokenJWTBearer,
    res: ResponseWithBodyCode<APIErrorResult, 401>,
    next: NextFunction
) => {
    //Проверка заголовка авторизации
    if (req.headers.authorization) {
        //Проверка на bearer
        const [type, accessToken] = req.headers.authorization.split(' ')
        if (type !== "Bearer" || !accessToken) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        // const isBasicAuthorization = req.headers.authorization.startsWith('Basic')

        // //проверяем в списаных
        // const filter: Omit<RottenToken, "expirationDate" | 'id'> = { refreshToken: accessToken }
        // const rootenRefreshBdTokens = await tokensRepository.readAll(filter)
        // if (rootenRefreshBdTokens.length) return res.sendStatus(401)

        //Достаем userId из токена
        const userId = jwtTokenService.getDataByAccessToken(accessToken)?.userId
        if (!userId) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)

        //Мутируем req
        req.user = { userId } //TODO глаза мне мозолит этот userId в req
    }
    next()
}
