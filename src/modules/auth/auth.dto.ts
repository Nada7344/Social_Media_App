import { z }from 'zod'
import { confirmEmail, login, signup } from './auth.validation.js'


// export interface ILoginDto{
//     email :string,
//     password:string
// }

// export interface ISignupDto extends ILoginDto{
//     username:string,
   
// }

export type signupDto = z.infer<typeof signup.body>

export type LoginDto = z.infer<typeof login.body>

export type confirmEmailDto = z.infer<typeof confirmEmail.body>