import { NextFunction, Response } from 'express';
import { PostModel } from '../../Posts/post-model';
import { HTTP_STATUSES } from '../services/http/types';





export const postParamIdInBDValidationMiddleware = async (req: any, res: Response, next: NextFunction) => {
    const postId = req.params.postId
    const post = await PostModel.repositoryReadOne(postId)
    
    if (!post) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    next()
}