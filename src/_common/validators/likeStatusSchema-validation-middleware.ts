import { body, checkSchema } from 'express-validator';

export const likeStatusModelSchemaValidationMiddleware = checkSchema({
    "likeStatus": {
        isString: true,
        isIn: {
            options: [['None','Like','Dislike']],
            errorMessage: 'no enum.'
        },
        isLength: {
            options: { min: 4, max: 7 },
        },
        errorMessage: 'likeStatus: string, maxLength: 7, minLength: 4'
    }
})
// .withMessage({ message: 'wrong schema body Post', field: "body", code: 400 })
// const schema = Joi.object().keys({

//     username: Joi.string().required(),
//     email: Joi.string().email().required()
// });