import {resolve} from 'node:path'
import {config} from 'dotenv'

config ({path:resolve(`./.env.${process.env.NODE_ENV||'develpoment'}`)})

export const PORT =process.env.PORT || 3000;
export const DB_URI =process.env.DB_URI as string



export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? "10")
export const IV_LENGTH = parseInt(process.env.IV_LENGTH as string)
export const ENC_SECRET_KEY = Buffer.from(process.env.ENC_SECRET_KEY as string)
export const USER_ACCESS_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_SECRET_KEY as string
export const USER_REFRESH_TOKEN_SECRET_KEY =process.env.USER_REFRESH_TOKEN_SECRET_KEY as string
export const SYSTEM_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY as string
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY =process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY as string
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN as string)
export const REFRESH_TOKEN_EXPIRES_IN =parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN as string)
export const REDIS_URI = process.env.REDIS_URI as string
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD
export const EMAIL = process.env.EMAIL
export const APPLICATION_NAME = process.env.APPLICATION_NAME