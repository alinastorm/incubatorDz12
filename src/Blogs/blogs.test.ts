import request from "supertest"
import httpService from "../_common/services/http/http-service"
import { BlogInputModel, BlogViewModel } from "./blog-model"
import { Paginator } from "../_common/abstractions/Repository/repository-mongodb-types"
import { ExtendedLikesInfoViewModel, LikeDetailsViewModel, PostInputModel, PostViewModel } from "../Posts/post-model"
import mongooseClinet from "../_common/services/mongoose/mongoose-client"
import { LikeStatus } from "../Likes/like-model"


//Express
const app = httpService.appExpress


function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {
    if (obj[key] != val) return obj
    return true
}

describe("Blogs", () => {

    beforeAll(async () => {
        //Конектим mongo клиента
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
    const newBlog: BlogInputModel = {
        "name": "stringasda",
        "description": "stringadas",
        "websiteUrl": "https://someurl.com"
    }
    const blogSchema: BlogViewModel = {
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
    }
    const blogPaginationSchema: Paginator<BlogViewModel> = {
        page: expect.any(Number),
        pagesCount: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: [blogSchema]
    }
    let blogReceived: BlogViewModel
    const blogUpdate: Partial<BlogInputModel> = {
        "name": "string2",
        "description": "",
        "websiteUrl": "https://someurl2.com"
    }
    let newPost: PostInputModel = {
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": "123"
    }
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
    const newExtendedLikesInfoViewSchema: ExtendedLikesInfoViewModel = {
        likesCount: 0,
        dislikesCount: 0, //	integer($int32) 
        myStatus: LikeStatus.None, //string Enum: Array[3]    
        newestLikes: []
    }
    const newPostViewSchema: PostViewModel = {
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: newExtendedLikesInfoViewSchema
    }

    test('1 All delete', async () => {
        const { status } = await request(app).delete("/testing/all-data")
        expect(status).toBe(204)
    })
    test('2 GET Blogs =[]', async () => {
        const { status, body } = await request(app).get("/blogs")

        expect(status).toBe(200)

        expect(body).toStrictEqual({
            "pagesCount": 0,
            "page": 1,
            "pageSize": 10,
            "totalCount": 0,
            "items": []
        })

    })
    test('3 POST Blogs unauthorized', async () => {
        const { status, body } = await request(app)
            .post("/blogs")
            .send({
                "name": "string",
                "youtubeUrl": "https://someurl.com"
            })

        expect(status).toBe(401)
    })
    test('4 POST Create Blog ', async () => {
        const req = await request(app)
            .post("/blogs")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newBlog)


        expect(checkData(req, "statusCode", 201)).toBe(true)
        expect(req.body).toMatchObject(blogSchema)

        blogReceived = req.body
    })
    test('5 GET Blogs []', async () => {
        const { status, body } = await request(app).get("/blogs")

        expect(status).toBe(200)

        expect(body).toStrictEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": 1,
            "items": [blogSchema]
        })

    })
    test('6 GET Blogs ID', async () => {
        const { status, body } = await request(app).get(`/blogs/${blogReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(blogSchema)
        expect(body).toStrictEqual(blogReceived)
    })
    test('7 PUT Blogs ', async () => {

        const { status } = await request(app)
            .put(`/blogs/${blogReceived?.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(blogUpdate)

        expect(status).toBe(204)

    })
    test('8 GET Blog after update ', async () => {

        const { status, body } = await request(app).get(`/blogs/${blogReceived?.id}`)

        expect(status).toBe(200)
        // expect(body).toMatchObject(blogPagination)
        expect(body).toStrictEqual({ ...blogReceived, ...blogUpdate })

    })
    test('9 GET Blogs after update', async () => {

        const { status, body } = await request(app).get("/blogs")

        expect(status).toBe(200)
        expect(body).toMatchObject(blogPaginationSchema)
        expect(body).toStrictEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": 1,
            "items": [blogSchema]
        })
        expect(body.items.length).toBe(1)
        expect(body.items[0]).toStrictEqual({ ...blogReceived, ...blogUpdate })
    })
    test('10 Create Post in Blog by Blog ID', async () => {
        const { status, body } = await request(app).post(`/blogs/${blogReceived?.id}/posts`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newPost)

        expect(status).toBe(201)
        expect(body).toMatchObject(newPostViewSchema)
        // post = body
    })
    test('11 Delete Blog by ID', async () => {
        const { status } = await request(app).delete(`/blogs/${blogReceived?.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')

        expect(status).toBe(204)
    })
    test('12 GET Blog after delete ', async () => {
        const { status } = await request(app).get(`/blogs/${blogReceived?.id}`)

        expect(status).toBe(404)

    })
})