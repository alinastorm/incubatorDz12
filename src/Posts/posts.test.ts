import request from "supertest"
import httpService from "../_common/services/http/http-service"
import { BlogInputModel, BlogViewModel } from "../Blogs/blog-model"
import { Paginator } from "../_common/abstractions/Repository/repository-mongodb-types"
import { ExtendedLikesInfoViewModel, LikeDetailsViewModel, PostInputModel, PostViewModel } from "./post-model"
import mongooseClinet from "../_common/services/mongoose/mongoose-client"


//Express
const app = httpService.appExpress


function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {
    if (obj[key] != val) return obj
    return true
}

describe("Posts", () => {

    beforeAll(async () => {
        //Конектим mongo клиента
        // await mongoDbClient.disconnect();
        await mongooseClinet.disconnect();
        await mongooseClinet.connect()
        //Устанавливаем роуты и middlewares
        httpService.setMiddlewares()
        httpService.setRoutes()
    })
    afterAll(async () => {
        // await mongoDbClient.disconnect()
    })

    /** ****************************************************************************************** */
    let blogReceived: BlogViewModel
    let postReceived: PostViewModel
    const LikeDetailsViewSchema: LikeDetailsViewModel = {
        addedAt: expect.any(String), //	string($date - time)
        userId: expect.any(String), //	string    nullable: true,
        login: expect.any(String), //	string    nullable: true}
    }
    const ExtendedLikesInfoViewSchema: ExtendedLikesInfoViewModel = {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number), //	integer($int32) 
        myStatus: expect.any(String), //string Enum: Array[3]    
        newestLikes: [LikeDetailsViewSchema]
    }
    const postViewSchema: PostViewModel = {
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: ExtendedLikesInfoViewSchema
    }
    const postPaginationSchema: Paginator<PostViewModel> = {
        page: expect.any(Number),
        pagesCount: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: [postViewSchema]
    }
    let newPost: PostInputModel = {
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": "string"
    }
    const newBlog: BlogInputModel = {
        "name": "stringasda",
        "description": "stringadas",
        "websiteUrl": "https://someurl.com"
    }
    const updatePost: Partial<PostViewModel> = {
        "title": "string2",
        "shortDescription": "string2",
        "content": "string2",
    }

    test('All delete', async () => {
        const { status } = await request(app).delete("/testing/all-data")
        expect(status).toBe(204)
    })
    test('Получаем посты =[]', async () => {

        const res = await request(app).get("/posts")

        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual({
            "pagesCount": 0,
            "page": 1,
            "pageSize": 10,
            "totalCount": 0,
            "items": []
        })

    })
    test('Создаем пост unauthorized', async () => {
        const req = await request(app)
            .post("/posts")
            .send(newPost)

        expect(checkData(req, "statusCode", 401)).toBe(true)
    })
    test('Создаем блог для публикации поста ', async () => {
        const { status, body } = await request(app)
            .post("/blogs")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newBlog)

        expect(status).toBe(201)

    })
    test('Получаем блоги для публикации поста', async () => {
        const { status, body } = await request(app).get("/blogs")
        expect(status).toBe(200)
        newPost.blogId = body.items[0].id
    })
    test('Публикуем пост', async () => {
        const { status, body } = await request(app)

            .post("/posts")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newPost)


        expect(status).toBe(201)
        expect(body).toMatchObject(postViewSchema)
        postReceived = body
    })
    test('Получаем посты []', async () => {

        const { status, body } = await request(app).get("/posts")

        expect(status).toBe(200)
        expect(body).toStrictEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": 1,
            "items": [postViewSchema]
        })

    })


    test('Получаем пост по id', async () => {

        const { status, body } = await request(app).get(`/posts/${postReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(postViewSchema)
        expect(body).toStrictEqual(postReceived)
    })
    test('Обновляем пост', async () => {
        const { status, body } = await request(app)
            .put(`/posts/${postReceived?.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({ ...postReceived, ...updatePost })

        expect(status).toBe(204)

    })
    test('Получаем пост по id после обновления ', async () => {


        const { status, body } = await request(app).get(`/posts/${postReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(postViewSchema)
        expect(body).toStrictEqual({ ...postReceived, ...updatePost })

    })
    test('Удаляем пост по id', async () => {

        const { status } = await request(app)
            .delete(`/posts/${postReceived?.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')

        expect(status).toBe(204)
    })
    test('Получаем пост после удаления ', async () => {
        const { status } = await request(app).get(`/posts/${postReceived?.id}`)

        expect(status).toBe(404)

    })
})