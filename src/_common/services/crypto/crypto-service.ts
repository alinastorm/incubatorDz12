import bcrypt from "bcrypt"



const cryptoService = {
    async generatePasswordHash(password: string, salt?: string) {
        const passwordSalt = salt || await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, passwordSalt)
        return passwordSalt + ":" + passwordHash
    },
    async checkPasswordByHash(passwordHash: string, password: string) {
        const [salt] = passwordHash.split(':')
        return passwordHash === await this.generatePasswordHash(password, salt)
    }

}
export default cryptoService