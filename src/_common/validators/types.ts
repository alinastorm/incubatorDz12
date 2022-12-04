export interface APIErrorResult {
    errorsMessages: FieldError[]
}
export interface FieldError {
    message?: string | null// nullable: true,    Message with error explanation for certain field
    field?: string | null//    nullable: true,    What field / property of input model has error  
}