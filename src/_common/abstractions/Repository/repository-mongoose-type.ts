import { FilterQuery } from "mongoose"
import { IObject } from "../../types/types"

export interface SearchPaginationMongooseModel<T = IObject> {
    /**search Name Term
     * Default value : null
     */
    filter?: FilterQuery<Partial<T>>
    /**PageNumber is number of portions that should be returned.
     * Default value : 1
     */
    pageNumber: number
    /**PageSize is portions size that should be returned
     * Default value : 10
     */
    pageSize: number
    /** Sorting term
     * Default value : createdAt
     */
    sortBy: string
    /** Sorting direction
     * Default value: desc
     */
    sortDirection: 1 | -1
}