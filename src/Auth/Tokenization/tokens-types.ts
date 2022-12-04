export interface AccessTokenPayloadModel {
    userId: string
}
export interface RefreshTokenPayloadModel {
    /** UserId */
    userId: string
    /** Id of connected device session */
    deviceId: string
}
