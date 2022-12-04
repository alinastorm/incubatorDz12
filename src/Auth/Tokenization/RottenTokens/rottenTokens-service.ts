import { RottenToken, RottenTokenModel } from "./rottenTokens-model"
import add from 'date-fns/add'


/** Deprecated */
export function createOneCanceledToken(reqRefreshToken: string) {
    //добавляем в списаные
    const seconds = process.env.JWT_REFRESH_LIFE_TIME_SECONDS ?? 20

    const expirationDate = add(new Date(), { seconds: Number(seconds) })
    const element: Omit<RottenToken, 'id'> = { refreshToken: reqRefreshToken, expirationDate }
    RottenTokenModel.repositoryCreateOne(element)
}
/** Deprecated */
export function deleteAllCanceledTokens() {
    RottenTokenModel.repositoryReadAll<RottenToken>().then((tokens) => {
        tokens.forEach(token => {
            if (token.expirationDate < new Date()) {
                RottenTokenModel.repositoryDeleteOne(token.id)
            }
        })
    })
    console.log('deleteAllCanceledTokens complete');
}