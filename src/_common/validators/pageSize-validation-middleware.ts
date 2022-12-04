import { param, query } from 'express-validator';

export const pageSizeQueryValidationMiddleware = query('pageSize')
    .default(10)
    .toInt()
    // .custom((value: string) => {
    //     return +value;
    // })
    .isNumeric()
    .exists()

    // .withMessage({ message: 'wrong id', field: "id", code: 400 })

