import mongoose from "mongoose"


const options = {
    /** Set to false to [disable buffering](http://mongoosejs.com/docs/faq.html#callback_never_executes) on all models associated with this connection. */
    bufferCommands: true,
    /** The name of the database you want to use. If not provided, Mongoose uses the database name from connection string. */
    dbName: process.env.MONGO_DB_NAME,
    /** username for authentication, equivalent to `options.auth.user`. Maintained for backwards compatibility. */
    user: process.env.MONGO_USER,
    /** password for authentication, equivalent to `options.auth.password`. Maintained for backwards compatibility. */
    pass: process.env.MONGO_PASS,
    /** Set to false to disable automatic index creation for all models associated with this connection. */
    autoIndex: true,
    /** Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection. */
    autoCreate: false,
}
const mongoAtlasUri = process.env.MONGO_URL_ATLAS || "MONGOOSE error: NO URI ATLAS "

 class MongooseClinet {

    dbConnection: mongoose.Connection = mongoose.connection

    async connect() {
        this.dbConnection.on("connecting", () => console.log("MongooseClient..."))
        this.dbConnection.on("open", () => console.log("MongooseClient started"))
        this.dbConnection.on("error", (err) => console.log("MongooseClient error :", err))
        this.dbConnection.on("close", () => console.log("MongooseClient connection close "))

        await mongoose.connect(mongoAtlasUri, options)
    }
    async disconnect() {
        await this.dbConnection.close();
    }
}

export default new MongooseClinet()