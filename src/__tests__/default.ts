import request from "supertest"
import mongoDbClient from "../_common/services/mongoDb/mongoDbClient"
import httpService from "../_common/services/http/http-service"
import { Paginator } from "../_common/abstractions/Repository/repository-mongodb-types"
import { CommentInputModel, CommentViewModel, LikesInfoViewModel } from "../Comments/comment-model"


//Express
const app = httpService.appExpress

//helpers
function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {//подсвечивает req если ошибка что бы consolelog не искать
    if (obj[key] != val) return obj
    return true
}
const mainRout = "comments"
describe.skip(`${mainRout}`, () => {

    beforeAll(async () => {
        //Конектим mongo клиента
        await mongoDbClient.disconnect();
        await mongoDbClient.connect()
        //Устанавливаем роуты и middlewares
        httpService.setMiddlewares()
        httpService.setRoutes()
    })
    afterAll(async () => {
        // await mongoDbClient.disconnect()
    })

    /** ****************************************************************************************** */

    const newElement: CommentInputModel = {
        content: "start comment"
    }
    const likesInfo: LikesInfoViewModel = {
        dislikesCount: expect.any(Number),
        likesCount: expect.any(Number),
        myStatus: expect.any(String),
    }
    const elementSchema: CommentViewModel = {
        id: expect.any(String),
        content: expect.any(String),
        userId: expect.any(String),
        userLogin: expect.any(String),
        likesInfo: likesInfo,
    }
    const paginationSchema: Paginator<any> = {
        page: expect.any(Number),
        pagesCount: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: expect.any(Array),
    }
    const elementPaginationSchema: Paginator<CommentViewModel> = {
        page: expect.any(Number),
        pagesCount: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: [elementSchema]
    }
    let elementReceived: CommentViewModel
    const elementToUpdate: Partial<CommentViewModel> = {
        content: "new content"
    }
    const wrongElementToUpdate: Partial<CommentViewModel> = {
        content: "new content"
    }


    xtest(`All delete`, async () => {
        const { status } = await request(app).delete("/testing/all-data")
        expect(status).toBe(204)
    })
    xtest(`GET ${mainRout} =[null]`, async () => {
        const { status, body } = await request(app).get(`/${mainRout}`)

        expect(status).toBe(200)

        expect(body).toStrictEqual({
            "pagesCount": 0,
            "page": 1,
            "pageSize": 10,
            "totalCount": 0,
            "items": []
        })

    })
    xtest(`POST ${mainRout} unauthorized`, async () => {
        const { status, body } = await request(app).post(`/${mainRout}`)
            .send(newElement)

        expect(status).toBe(401)
    })
    xtest(`POST ${mainRout} `, async () => {
        const req = await request(app).post(`/${mainRout}`)
            .set(`Authorization`, `Basic YWRtaW46cXdlcnR5`)
            .send(newElement)


        expect(checkData(req, "statusCode", 201)).toBe(true)
        expect(req.body).toMatchObject(elementSchema)

        elementReceived = req.body
    })
    xtest(`GET ${mainRout} pagination`, async () => {
        const { status, body } = await request(app).get(`/${mainRout}`)

        expect(status).toBe(200)

        expect(body).toStrictEqual(paginationSchema)

    })
    xtest(`GET ${mainRout} extends ${mainRout}Schema`, async () => {
        const { status, body } = await request(app).get("${mainRout}")

        expect(status).toBe(200)

        expect(body.items).toStrictEqual(elementPaginationSchema)

    })
    xtest(`GET ${mainRout} ID extends ${mainRout}Schema`, async () => {
        const { status, body } = await request(app).get(`/${mainRout}/${elementReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(elementSchema)
        expect(body).toStrictEqual(elementReceived)
    })
    xtest(`PUT ${mainRout} `, async () => {

        const { status } = await request(app).put(`/${mainRout}/${elementReceived?.id}`)
            .set(`Authorization`, `Basic YWRtaW46cXdlcnR5`)
            .send(elementToUpdate)

        expect(status).toBe(204)

    })
    xtest(`GET ${mainRout} after update = new elem `, async () => {

        const { status, body } = await request(app).get(`/${mainRout}/${elementReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toStrictEqual({ ...elementReceived, ...elementToUpdate })

    })
    xtest(`GET ${mainRout}S after update`, async () => {

        const { status, body } = await request(app).get(`/${mainRout}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(paginationSchema)//проверка схемы пагинации
        expect(body).toStrictEqual(elementPaginationSchema)//проверка схемы пагинации и  элемента
        expect(body.items.length).toBe(1)
        expect(body.items[0]).toStrictEqual({ ...elementReceived, ...elementToUpdate })
    })
    xtest(`Delete ${mainRout} by ID`, async () => {

        const { status } = await request(app)
            .delete(`/${mainRout}/${elementReceived?.id}`)
            .set(`Authorization`, `Basic YWRtaW46cXdlcnR5`)

        expect(status).toBe(204)
    })
    xtest(`GET ${mainRout} after delete `, async () => {
        const { status } = await request(app).get(`/${mainRout}/${elementReceived?.id}`)

        expect(status).toBe(404)

    })
})