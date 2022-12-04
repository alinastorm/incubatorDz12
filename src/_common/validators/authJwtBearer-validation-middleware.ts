import { header } from 'express-validator';


export const jwtHeaderValidationMiddleware = header('authorization')
    .exists()
    .isJWT()
   