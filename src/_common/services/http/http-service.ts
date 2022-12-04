import express from 'express';
import cookieParser from 'cookie-parser';
import fs from "node:fs"
import https from "node:https"

import * as core from 'express-serve-static-core';
import * as http from 'http';
import { authRouter } from '../../../Auth/Authentications/auths--router';
import { blogsRouter } from '../../../Blogs/blogs--router';
import { commentsRouter } from '../../../Comments/comments--router';
import { postsRouter } from '../../../Posts/posts--router';
import { testingRouter } from '../../../Testing/testing--router';
import { usersRouter } from '../../../Users/users--router';
import { registrationRouter } from '../../../Auth/Registrations/registrations--router';
import { devicesRouter } from '../../../Auth/DevicesSessions/deviceSessions--router';
import { tokensRouter } from '../../../Auth/Tokenization/tokens--router';
import { recoveryPasswordRouter } from '../../../Auth/RecoveryPassword/recoveryPasswords--router';


export class HttpService {

    appExpress: core.Express = express()
    httpServer!: http.Server
    httpsServer!: https.Server
    httpPort: number | string = process.env.PORT || process.env.HTTP_PORT || 80
    httpsPort: number | string = process.env.HTTPS_PORT || 443

    //async constructor
    async then(resolve: any, reject: any) {
        console.log('HttpService ... ');
        try {
            this.setMiddlewares()
            this.setRoutes()
            this.runHttpServer()
            this.runHttpsServer()
            resolve()
        } catch (error) {
            this.stopServer()
            console.log('HttpService error:', error);
        }

    }
    runHttpServer() {
        console.log('HttpServer ... ');

        const httpServer = http.createServer(this.appExpress);

        this.httpServer = httpServer.listen(this.httpPort, () => {
            console.log(`HTTP Server running on port ${this.httpPort}`);
        });

    }
    runHttpsServer() {
        console.log('HTTPS Server ... ');

        // SSL Certificate
        const privateKey = fs.readFileSync('./ssl/ubt.by-key.pem', 'utf-8')
        const certificate = fs.readFileSync('./ssl/ubt.by-crt.pem', 'utf-8')
        const ca = fs.readFileSync('./ssl/ubt.by-chain-only.pem', 'utf8');

        const credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        }

        const httpsServer = https.createServer(credentials, this.appExpress);

        this.httpsServer = httpsServer.listen(this.httpsPort, () => {
            console.log(`HTTPS Server running on port ${this.httpsPort}`);
        });

    }
    setMiddlewares() {
        this.appExpress.use(express.json())//Body
        this.appExpress.use(cookieParser())//Cookies
        this.appExpress.set('trust proxy', true) // Для получения корректного ip-адреса из req.ip
    }
    setRoutes() {
        this.appExpress.use([
            testingRouter,
            blogsRouter,
            postsRouter,
            usersRouter,
            authRouter,
            commentsRouter,
            registrationRouter,
            devicesRouter,
            tokensRouter,
            recoveryPasswordRouter,

        ])
    }
    stopServer() {
        this.httpServer?.close()
        this.httpsServer?.close()
    }


}
//@ts-ignore
export default new HttpService()