import { NextFunction, Response } from 'express';
import { HTTP_STATUSES, RequestWithAccessTokenJWTBearer, RequestWithHeaders, ResponseWithBodyCode, ResponseWithCode } from '../services/http/types';
import { jwtTokenService } from '../services/token/jwtToken-service';
import { APIErrorResult } from '../validators/types';


export const authHeadersJwtAccessTokenHeaders401 = async (
    req: RequestWithAccessTokenJWTBearer,
    res: ResponseWithCode<401>,
    next: NextFunction
) => {
    //Проверка заголовка авторизации
    if (!req.headers.authorization) {
        return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("No headers.authorization")
    }
    //Проверка на bearer 
    //Authorization Bearer accessToken    
    const [type, accessToken] = req.headers.authorization.split(' ')

    if (type !== "Bearer" || !accessToken) return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("no type bearer or accessToken")
    // const isBasicAuthorization = req.headers.authorization.startsWith('Basic')
    console.log("accessToken:", accessToken);

    // //проверяем в списаных
    // const filter: Omit<RottenToken, "expirationDate" | 'id'> = { refreshToken: accessToken }
    // const rootenRefreshBdTokens = await tokensRepository.readAll(filter)
    // if (rootenRefreshBdTokens.length) return res.sendStatus(401)

    //Достаем userId из токена
    const userId = jwtTokenService.getDataByAccessToken(accessToken)?.userId
    if (!userId) return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("no userId or not valid")

    //Мутируем req
    req.user = { userId } //TODO глаза мне мозолит этот userId в req
    next()
}
