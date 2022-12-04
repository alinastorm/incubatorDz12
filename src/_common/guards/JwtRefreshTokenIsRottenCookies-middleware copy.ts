import { NextFunction, Response } from 'express';
import { RottenToken, RottenTokenModel } from '../../Auth/Tokenization/RottenTokens/rottenTokens-model';
import { HTTP_STATUSES, RequestWithCookies, ResponseWithBodyCode } from '../services/http/types';
import { APIErrorResult } from '../validators/types';

/** Проверка рефереш токена на списанность */

export const authCookiesRefreshTokenIsRottenMiddleware = async (
    req: RequestWithCookies<{ refreshToken: string }> & { user?: { userId?: string } },
    res: ResponseWithBodyCode<APIErrorResult, 401>,
    next: NextFunction
) => {
    //достаем refreshToken
    const reqRefreshToken = req.cookies.refreshToken

    //проверяем в списаных
    const query: Omit<RottenToken, "expirationDate" | 'id'> = { refreshToken: reqRefreshToken }
    const refreshBdTokens = await RottenTokenModel.repositoryReadAll(query)
    if (refreshBdTokens.length) {
        // console.log('списанные');

        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
    next()
}
