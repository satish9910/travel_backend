import { NextFunction, Request, Response } from 'express'

const ErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) {
        console.log(err.message)
        return res.status(200).send({
            status: 500,
            error: 'Internal Server Error',
            error_description: err.message,
        })
    }
}

const middleware = { ErrorHandler }

export default middleware
