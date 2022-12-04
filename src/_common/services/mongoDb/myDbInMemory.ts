import { Filter } from "mongodb";
import { IObject } from "../../types/types";

// пишу свою базу данных in memory для тренировки js. Пока наброски
class DbInMemory {
    data: IObject = {}

    connect() { }

    readAll(collectionName: string, filter?: Filter<IObject>, sortBy?: string, sortDirection?: number) {
        const collection: IObject[] = this.data[collectionName]
        let result: IObject = []
        const filterMethods: IObject = {
            "$regex": (collection: any[]) => {

            },
            '$or': (valueFilter: IObject[]) => {//[{ blog: 'id' }, { Id: 'id' }] 
                collection.filter((elCollection) => { //{blog:'id',name:''}
                    return valueFilter.some((elFilter) => {//{ blog: 'id' }                    
                        return Object.entries(elCollection).some(([key, value]) => {//[ key:blog value: id]
                            return elFilter[key] === value
                        })
                    })
                })
            },

        }

        if (filter) {
            Object.entries(filter).forEach(([key, value]: [key: string, value: any]) => {
                const method = filterMethods[key]

                if (!method) { //если метод не найден значит простой фильтр по объекту
                    if (value['i'])//если после значения стоит i значит любой регистр
                        result = collection.filter((el) => {
                            return el[key].toLowerCase().indexOf(value.toLowerCase()) > -1
                        })
                    result = collection.filter((el) => {
                        return el[key].indexOf(value) > -1
                    })
                }
                method(value)
            })
        }
        result = collection
        
        return result
        // варианты
        // { name: { $regex: searchNameTerm, $options: 'i' } }
        // { blogId: 'id' }
        // { email: { $regex: searchEmailTerm, $options: 'i' } }
        // { $or: [{ blogId: 'id' }, { blogId: 'id' }] }

    }

    readOne(collectionName: string, id: string) {
        return this.data[collectionName].find((elem: any) => id === elem.id)
    }
    // readCount(collectionName: string, filter?: Filter<IObject>){
    //     return this.data[collectionName].length
    // }
    createOne(collectionName: string, element: IObject) {
        return this.data[collectionName].push(element)
    }

    updateOne(collectionName: string, id: string, data: IObject) {
        return this.data[collectionName].find((elem: any, index: number) => {
            if (id === elem.id) {
                this.data[collectionName][index] = { ...this.data[collectionName][index], ...data }
            }
        })
    }
    replaceOne(collectionName: string, id: string, data: IObject) {
        return this.data[collectionName].find((elem: any, index: number) => {
            if (id === elem.id) {
                this.data[collectionName][index] = data
            }
        })
    }
    deleteOne(collectionName: string, id: string) {
        return this.data[collectionName].find((elem: any, index: number) => {
            if (id === elem.id) {
                this.data[collectionName].splice(index, 1)
                return true
            }
        })
    }

    deleteAll(collectionName: string) { return this.data[collectionName] = [] }

    // readAll(collectionName: string, filter?: Filter<IObject>, sortBy?: string, sortDirection?: number): any
    // readAllOrByPropPaginationSort(collectionName: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 1 | -1, filter?: Filter<IObject>): any
    // readCount(collectionName: string, filter?: Filter<IObject>): any

}

export default new DbInMemory()