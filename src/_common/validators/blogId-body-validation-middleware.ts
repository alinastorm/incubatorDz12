import { body, param } from 'express-validator';


export const blogIdBodyValidationMiddleware = body('blogId')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ min: '63415f046cc943bb27921167'.length, max: '63415f046cc943bb27921167'.length })
    // .custom(async (val, { req }) => {
    //     const blog = await blogsReadRepository.readOne(val)
    //     if (!blog.name) throw Error('bloger not found')
    //     req.body.blogName = blog.name
    // })
    // .withMessage({ message: 'wrong content', field: "content", code: 400 })
