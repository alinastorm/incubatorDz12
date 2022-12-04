import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { APIErrorResult, FieldError } from './types';

export const code400 = (req: Request, res: Response, next: NextFunction) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log('code400:', errors);

        const error: Array<FieldError> = errors.array({ onlyFirstError: true }).map(e => {
            return {
                message: e.msg,
                field: e.param
            }
        })
        const result: APIErrorResult = { errorsMessages: error }
        // if (req.method === "GET") {
        //     console.log('req.method:', req.method);
        //     console.log('req.url:', req.url);
        //     console.log('req.params:', req.params);
        //     console.log('req.query:', req.query);
        //     console.log('req.body:', req.body);
        //     console.log('result:', result);
        // }

        return res.status(400).json(result);
    }
    next()
}
