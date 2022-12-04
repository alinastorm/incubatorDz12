import { body, checkSchema } from 'express-validator';

export const schemaPostsValidationMiddleware = checkSchema({
    "title": {
        isString: true
    },
    "shortDescription": {
        isString: true
    },
    "content": {
        isString: true
    },
    "blogId": {
        isString: true
    }
})
// .withMessage({ message: 'wrong schema body Post', field: "body", code: 400 })
// const schema = Joi.object().keys({

//     username: Joi.string().required(),
//     email: Joi.string().email().required()
// });