import type { Request, Response, NextFunction } from 'express'
import { BadRequestException } from '../common/exceptions/domain.exception.js';
import { ZodError, ZodType } from 'zod';

type keyRequestType = keyof Request
type ValidatinSchemaType = Partial<Record<keyRequestType, ZodType>>
type ValidationError=Array<{
            key:keyRequestType,
            issues:Array<{
                message:string,
                path:Array <string|number|undefined|symbol>
            }>
        }>

export const validation = (schema: ValidatinSchemaType) => {

    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: ValidationError = [];
        for (const key of Object.keys(schema) as keyRequestType[]) {
            if (!schema[key]) continue;

            const validationResult = schema[key].safeParse(req[key])
            if (!validationResult.success) {
                const error = validationResult.error as ZodError
                validationErrors.push({
                    key, issues: error.issues.map(issue => {
                        return { message: issue.message, path: issue.path }
                    })
                })
            }

            if (validationErrors.length > 0) {

                throw new BadRequestException("validation error", validationErrors)
            }
        }
        next();
    }
}