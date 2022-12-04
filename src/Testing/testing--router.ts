import express, { Request, Response } from 'express';
import testingController from './testing-controller';
import nodemailer from "nodemailer";
import { JwtRefreshTokenCookies401 } from '../_common/guards/JwtRefreshTokenCookies-middleware';



export const testingRouter = express.Router()


testingRouter.get('/',
    (req: Request, res: Response) => {
        res.send(`Hallo Samurai: ${process.env.APP_VERSION}`)
    }
)
testingRouter.delete('/testing/all-data',
    testingController.deleteAll,
)
testingRouter.all("*", (req: Request, res, next) => {
    // if (req.url === "/auth/refresh-token") {
    // console.log("*****************************************");
    // console.log('\x1b[36m%s\x1b[0m', 'req.method:', req.method, req.url);
    // console.log('\x1b[32m%s\x1b[0m', 'req.body:', req.body);
    // console.log('\x1b[31m%s\x1b[0m', 'req.cookies:', req.cookies);
    // console.log('\x1b[33m%s\x1b[0m', 'req.headers:', JSON.stringify(req.headers));
    // console.log("*****************************************");
    // }

    //req.time = new Date().getTime();
    // const start = req.time
    // const end = new Date().getTime();
    // console.log(`SecondsWay: ${end - start}ms`);
    next();
},
    // JwtRefreshTokenCookies401,

)
testingRouter.get('/testing/mail', async (req: Request, res: Response) => {
    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: "ubt.mailer@gmail.com",
            pass: "ptzbiemtjjmbkbbs",
        },
        secure: true,
    });

    const mailOptions = {
        from: 'ubt.mailer@gmail.com',
        to: '7534640@gmail.com',
        subject: '9',
        text: 'Email content'
    };

    await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
                resolve(success);
            }
        });
    });
    let result
    await new Promise((resolve, reject) => {
        // send mail
        try {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    result = err
                    console.error(err);
                    res.json(result)
                    reject(false);
                } else {
                    result = info
                    res.json(result)
                    console.log(info);
                    resolve(true);
                }
            });

        } catch (error) {
            result = error
            res.json(result)
        }
    });

})
