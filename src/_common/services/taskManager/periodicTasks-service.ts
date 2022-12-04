//TODO реализовать удаление не активированных пользователей
//TODO реализовать удаление link code активации

import DdosGuard from "../../guards/ddos-middleware";


const restartTimeSeconds = process.env.TIME_RESTART_PERIODICTASKS_SECONDS ?? 10 * 1000
const restartTimeMSeconds = +restartTimeSeconds * 10000


class PeriodicTasks {
    tasks = [
        // deleteAllCanceledTokens,
        DdosGuard.deleteLogs.bind(DdosGuard)
    ]

 
    async then(resolve: any, reject: any) {
        console.log('PeriodicTasks ...');

        try {
            this.run()
            resolve(true)
        } catch (error) {
            console.log('PeriodicTasks error:', error);
            // reject(this)
        }
    }
    run() {
        console.log('PeriodicTasks started');

        setInterval(() => {
            this.tasks.forEach((handler: any) => {
                handler()
            })
        }
            , restartTimeMSeconds)
    }
}

//@ts-ignore
export default new PeriodicTasks()