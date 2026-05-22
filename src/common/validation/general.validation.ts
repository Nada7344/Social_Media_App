import { Types } from 'mongoose'
import { z } from 'zod'

export const generalValidationFields = {
    id:z.string().refine(value =>{return Types.ObjectId.isValid(value)},"Invalid Object"),
    username: z.string().min(2).max(25),
    email: z.email(),
    phone:z.string() .regex(/^(\+201|00201|01)(0|1|2|5)\d{8}$/),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, { error: "weak password " }),
    confirmPassword: z.string(),
    otp:z.string().regex(/^\d{6}$/), 
    file:function(mimetype:string[]){
        return z.strictObject({
              fieldname: z.string(),
     originalname: z.string(),
     encoding:  z.string(),
     mimetype: z.enum(mimetype),
     buffer: z.any().optional(),
     path:z.string().optional(),
     size:z.number()
        }).superRefine((args,ctx)=>{
            if(!args.path && !args.buffer){
                 ctx.addIssue({
                code:"custom",
                path:['buffer'],
                message:"Buffer is required"
            })
            }
        })
  
    }

}

export const paginationValidatin={
    query:z.strictObject({
        page:z.coerce.number().optional(),
        size:z.coerce.number().optional(),
        search:z.string().optional(),
    })
}

export type  PaginateDto = z.infer<typeof paginationValidatin.query>