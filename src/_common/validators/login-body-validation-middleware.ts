import { body, param } from 'express-validator';


export const loginBodyValidationMiddleware = body('login')
    .exists()
    .notEmpty({ ignore_whitespace: true })
    .isString()
    .isLength({ min: 3, max: 10 })
    // .custom(async (val, { req }) => {
    //     const blog = await blogsReadRepository.readOne(val)
    //     if (!blog.name) throw Error('bloger not found')
    //     req.body.blogName = blog.name
    // })
    // .withMessage({ message: 'wrong content', field: "content", code: 400 })
