import request from "supertest"
import httpService from "../_common/services/http/http-service"
import { Paginator } from "../_common/abstractions/Repository/repository-mongodb-types"
import { CommentBdModel, CommentInputModel, CommentModel, CommentViewModel, LikesInfoViewModel } from "./comment-model"
import { ExtendedLikesInfoViewModel, LikeDetailsViewModel, PostInputModel, PostViewModel } from "../Posts/post-model"
import { UserInputModel } from "../Users/user-model"
import { LoginInputModel } from "../Auth/Authentications/auth-model"
import { BlogInputModel, BlogViewModel } from "../Blogs/blog-model"
import mongooseClinet from "../_common/services/mongoose/mongoose-client"
import { LikeStatus } from "../Likes/like-model"



//Express
const app = httpService.appExpress

//helpers
function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {//подсвечивает req если ошибка что бы consolelog не искать
    if (obj[key] != val) return obj
    return true
}
const mainRout = "Comments"
describe(`${mainRout}`, () => {

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

    const newElement: CommentInputModel = {
        content: "start comment. super comment. lalalalalalalala"
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
        content: "updated content updated content updated content updated content updated content"
    }
    const wrongElementToUpdate: Partial<CommentViewModel> = {
        content: "new content"
    }
    let newPost: PostInputModel = {
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": "string"
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

    let postReceived: PostViewModel
    //auth
    const user: UserInputModel = {
        "login": "sasa",
        "password": "qwerty",
        "email": "7534640@gmail.com"
    }
    const auth: LoginInputModel = {
        loginOrEmail: "sasa",
        password: "qwerty"
    }
    let accessTokenRecived: string
    let refreshTokenRecived: string
    //blogs
    const newBlog: BlogInputModel = {
        "name": "stringasda",
        "description": "stringadas",
        "websiteUrl": "https://someurl.com"
    }
    let blogReceived: BlogViewModel
    const blogSchema: BlogViewModel = {
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
    }
    test(`1 All delete`, async () => {
        const { status } = await request(app).delete("/testing/all-data")
        expect(status).toBe(204)
    })
    test(`2 Comments =[null]`, async () => {
        const comments = await CommentModel.repositoryReadAll<CommentBdModel>()
        expect(comments).toStrictEqual([])

    })
    test(`3 Create User`, async () => {
        const { status } = await request(app).post("/users")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(user)

        expect(status).toBe(201)
    })
    test(`4 Auth login`, async () => {
        const res = await request(app).post("/auth/login")
            .send(auth)

        const body = res.body
        accessTokenRecived = body.accessToken
        expect(body).toStrictEqual({
            "accessToken": expect.any(String)
        })
        expect(accessTokenRecived).toStrictEqual(expect.any(String))
        //check refresh token
        const jwt = res.headers['set-cookie'][0].split(";")[0].split("=")
        const tokenName = jwt[0]
        refreshTokenRecived = jwt[1]
        expect(tokenName).toBe("refreshToken")
        expect(refreshTokenRecived).toStrictEqual(expect.any(String))
    })
    test('5 Create Blog ', async () => {
        const { body, statusCode } = await request(app).post("/blogs")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newBlog)


        expect(statusCode).toBe(201)
        expect(body).toMatchObject(blogSchema)

        blogReceived = body
        newPost.blogId = blogReceived.id
    })
    test('6 Create Post', async () => {
        const { status, body } = await request(app).post("/posts")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newPost)

        expect(status).toBe(201)
        expect(body).toMatchObject(newPostViewSchema)
        postReceived = body
    })
    test(`7 Create Comment unauthorized`, async () => {
        const { status, body } = await request(app).post(`/posts/${postReceived.id}/comments`)
            .send(newElement)

        expect(status).toBe(401)
    })
    test(`8 POST Create Comment authorized`, async () => {
        const req = await request(app).post(`/posts/${postReceived.id}/comments`)
            .auth(accessTokenRecived, { type: 'bearer' })
            .send(newElement)


        expect(checkData(req, "statusCode", 201)).toBe(true)
        expect(req.body).toMatchObject(elementSchema)

        elementReceived = req.body
    })
    test(`9 GET Comments ID extends ${mainRout}Schema`, async () => {
        const { status, body } = await request(app).get(`/${mainRout}/${elementReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(elementSchema)
        expect(body).toStrictEqual(elementReceived)
    })
    test(`10 Update Comment`, async () => {

        const { status } = await request(app).put(`/${mainRout}/${elementReceived?.id}`)
            .auth(accessTokenRecived, { type: 'bearer' })
            .send(elementToUpdate)

        expect(status).toBe(204)

    })
    test(`11 GET Comments after update = new elem `, async () => {

        const { status, body } = await request(app).get(`/${mainRout}/${elementReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toStrictEqual({ ...elementReceived, ...elementToUpdate })

    })
    // test(`12 GET Comments after update`, async () => {

    //     const { status, body } = await request(app).get(`/${mainRout}`)

    //     expect(status).toBe(200)
    //     expect(body).toMatchObject(paginationSchema)//проверка схемы пагинации
    //     expect(body).toStrictEqual(elementPaginationSchema)//проверка схемы пагинации и  элемента
    //     expect(body.items.length).toBe(1)
    //     expect(body.items[0]).toStrictEqual({ ...elementReceived, ...elementToUpdate })
    // })
    test(`12 Delete ${mainRout} by ID`, async () => {

        const res = await request(app)
            .delete(`/${mainRout}/${elementReceived?.id}`)
            .auth(accessTokenRecived, { type: 'bearer' })


        expect(checkData(res, "status", 204)).toBe(true)
    })
    test(`13 GET ${mainRout} after delete `, async () => {
        const { status } = await request(app).get(`/${mainRout}/${elementReceived?.id}`)
        expect(status).toBe(404)

    })
})