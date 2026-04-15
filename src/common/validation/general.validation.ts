import { z } from 'zod'
export const generalValidationFields = {
    username: z.string().min(2).max(25),
    email: z.email(),
    phone:z.string() .regex(/^(\+201|00201|01)(0|1|2|5)\d{8}$/),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, { error: "weak password " }),
    confirmPassword: z.string(),
    otp:z.string().regex(/^\d{6}$/), 


}