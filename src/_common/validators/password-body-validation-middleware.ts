import { body, param } from 'express-validator';


export const passwordBodyValidationMiddleware = body('password')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ min: 6, max: 20 })
    // .custom(async (val, { req }) => {
    //     const blog = await blogsReadRepository.readOne(val)
    //     if (!blog.name) throw Error('bloger not found')
    //     req.body.blogName = blog.name
    // })
    // .withMessage({ message: 'wrong content', field: "content", code: 400 })
