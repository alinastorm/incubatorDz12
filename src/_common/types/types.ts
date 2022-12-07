export interface IObject { [key: string]: any }

export interface Dictionary {
    [key: string]: string
}

type Impossible<K extends keyof any> = {
    [P in K]: never;
};
//TODO подумать как сделать глубокое сравнение
// Необходимо получить T (показывает лишние поля в U).Не глубока сверка(один уровень). Так как ts допускает лишние поля при проверке типа
export type NoExtraProperties<T, U> = U & Impossible<Exclude<keyof U, keyof T>>;
export type Rename<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] }
// type Rename<T, K extends keyof T, N> = Pick<T, Exclude<keyof T, K>> & { [N]: T[K] }