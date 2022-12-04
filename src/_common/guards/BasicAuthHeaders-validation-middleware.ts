import { NextFunction} from 'express';
import { HTTP_STATUSES, RequestWithHeaders, ResponseWithCode } from '../services/http/types';


export const BasicAuthorizationMiddleware401 = (
    req: RequestWithHeaders<{ authorization: string }>,
    res: ResponseWithCode<401>,
    next: NextFunction) => {
    const auth = { login: 'admin', password: 'qwerty' }    
    const isBasicAuthorization = req.headers.authorization?.startsWith('Basic')
    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify login and password 
    if (isBasicAuthorization && login && password && login === auth.login && password === auth.password) {

        // Access 
        return next()
    }
    return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("Basic authorization not valid")
}

