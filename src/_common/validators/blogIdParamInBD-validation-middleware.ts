import { NextFunction, Response } from 'express';
import { BlogModel } from '../../Blogs/blog-model';
import { HTTP_STATUSES } from '../services/http/types';





export const blogIdParamInBDValidationMiddleware = async (req: any, res: Response, next: NextFunction) => {
    const blogId = req.params.blogId
    const blog = await BlogModel.repositoryReadOne(blogId)
    if (!blog) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    // req.params.blogName = blog.name
    next()
}