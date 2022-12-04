import { param, query } from 'express-validator';
import { SortDirectionsType } from '../abstractions/Repository/repository-mongodb-types';


export const sortDirectionQueryValidationMiddleware = query('sortDirection')
    .default("desc")
    .isString()
    .isLength({ max: 4 })
    // .isIn([
    //     SortDirectionType.asc,
    //     SortDirectionType.desc,
    // ])
    .custom((direction: string) => {
        if (direction === "asc") return SortDirectionsType.asc
        if (direction === "desc") return SortDirectionsType.desc
        return SortDirectionsType.desc
    })
    .exists()
// .withMessage({ message: 'wrong id', field: "id", code: 400 })
