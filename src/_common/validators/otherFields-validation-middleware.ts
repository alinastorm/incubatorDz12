import { body } from 'express-validator';

export const otherFieldsValidationMiddleware = body()
    .custom((value) => {
        const { name, youtubeUrl, ...otherKeys } = value
        if (Object.keys(otherKeys).length) {
            throw new Error("otherKeys");
        }
        return true;
    })
