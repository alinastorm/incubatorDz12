import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUSES } from '../services/http/types';
import { ObjectId } from 'mongodb';
import { BlogModel } from '../../Blogs/blog-model';






export const blogIdBodyInBDValidationMiddleware404 = async (req: any, res: Response, next: NextFunction) => {
    const id = req.body.blogId
    if (!ObjectId.isValid(id)) return res.status(HTTP_STATUSES.NOT_FOUND_404).send("blogId not valid")
    const blog = await BlogModel.repositoryReadOne(id)
    if (!blog) {
        return res.status(HTTP_STATUSES.NOT_FOUND_404).send('blog by blogId not found')
    }
    // req.body.blogName = blog.name
    next()
}