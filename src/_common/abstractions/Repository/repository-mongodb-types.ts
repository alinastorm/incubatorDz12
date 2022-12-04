import { Filter } from "mongodb"
import { IObject } from "../../types/types"

export interface Paginator<T> {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: T[]
}

export enum SortDirectionsType {
    asc = 1,
    desc = -1,
}

export interface SearchPaginationMongoDbModel<T = IObject> {
    /**search Name Term
     * Default value : null
     */
    filter?: Filter<T>
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
export interface InputPaginationModel {
    /**search Name Term
     * Default value : null
     */
    searchNameTerm: string
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