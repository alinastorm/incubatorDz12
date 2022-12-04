import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUSES, ResponseWithCode } from '../services/http/types';
import add from 'date-fns/add'


export class DdosGuard {

    //TODO REFACTOR на SET
    private requests: { [key: string]: Date[] } = {}

    logRequest(
        req: Request & { ip: string },
        res: Response,
        next: NextFunction
    ) {
        const ip: string = req.ip
        const url: string = req.url
        // console.log('DDOS logRequest requests before:', this.requests[ip + url]);
        //Если нет было
        if (!this.requests[ip + url]) this.requests[ip + url] = []

        const expirationDate = add(new Date(), {
            seconds: 10
        })
        this.requests[ip + url].push(expirationDate)

        // console.log('DDOS logRequest requests after add:', this.requests[ip + url]);
        //Очистка просроченных
        this.deleteLogs()

        // console.log('DDOS logRequest requests after delete:', this.requests[ip + url]);

        next()
    }

    checkRequest(
        req: Request,
        res: ResponseWithCode<429>,
        next: NextFunction
    ) {
        // console.log('DDOS checkRequest requests:', this.requests);
        const ip: string = req.ip
        const url: string = req.url
        const count: number = this.requests[`${ip}${url}`]?.length
        if (count >=6) return res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429)

        next()
    }
    deleteLogs() {
        // console.log("DDOS deleteLogs");
        //очситка просроченных
        Object.values(this.requests).map((exps) => {
            exps.forEach((exp, index) => {
                if (exp < new Date()) {
                    exps.splice(index, 1)
                }
            })

        })
    }
}
export default new DdosGuard()