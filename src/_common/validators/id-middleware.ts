import { param } from 'express-validator';
import { ObjectId } from 'mongodb';

export const idMiddleware = param('id')
    .exists()
    // .isNumeric()
    // .withMessage({ message: 'wrong id', field: "id", code: 400 })
    // .customSanitizer((value:string) => {
    //     return new ObjectId(value);
    //   })


    // import { param } from 'express-validator';
    // // This allows you to reuse the validator
    // const toObjectId: CustomSanitizer = value => {
    //   return ObjectId(value);
    // };
    
    // app.post('/object/:id', param('id').customSanitizer(toObjectId), (req, res) => {
    //   // Handle the request
    // });