import type { Request, Response, NextFunction } from 'express'

interface IError extends Error{
    statusCode :number 
}
export const globalErrorHandler = (error: IError, req: Request, res: Response, next: NextFunction) => {
    if(error.name =="MulterError")  {
        error.statusCode= 400 
    }  
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message 
        || 'internal server error', 
        error, 
        cause: error.cause, 
        stack: error.stack 
    })
}