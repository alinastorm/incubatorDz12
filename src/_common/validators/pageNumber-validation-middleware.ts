import { param, query } from 'express-validator';

export const pageNumberQueryValidationMiddleware = query('pageNumber')
    .default(1)
    // .custom((value: string) => {
    //     return +value;
    // })
    .toInt()
    .isNumeric()
    .exists()


    // .withMessage({ message: 'wrong id', field: "id", code: 400 })

