import { z }from 'zod'
import { generalValidationFields } from '../../common/validation/general.validation.js'

export const login = {
    body:z.strictObject({
        email:generalValidationFields.email,
        password:generalValidationFields.password
    })
}

export const signup = {
    body:login.body.safeExtend({
        username:generalValidationFields.username,
        phone:generalValidationFields.phone,
        confirmPassword:generalValidationFields.confirmPassword
        
    }).refine((data)=>{
        return data.password === data.confirmPassword

    },{
        error:"password mismatch with confirm password"
    })
}


export const confirmEmail = {
   body:z.strictObject({
    email :generalValidationFields.email,
    otp:generalValidationFields.otp
   })
}

export const resendConfirmEmail = {
   body:z.strictObject({
    email :generalValidationFields.email,
    
   })
}