import { body, checkSchema } from 'express-validator';

export const commentsInputModelSchemaValidationMiddleware = checkSchema({
    "content": {
        isString: true,
        isLength: {
            options: { min: 20, max: 300 },
        },
        errorMessage: 'content: string, maxLength: 300, minLength: 20'
    }
})
// .withMessage({ message: 'wrong schema body Post', field: "body", code: 400 })
// const schema = Joi.object().keys({

//     username: Joi.string().required(),
//     email: Joi.string().email().required()
// });