import type { Request, Response } from 'express'

const Login = (req: Request, res: Response) => {
    return res.status(200).send({ status: 200, error: 'incomplete route' })
}

const ForgotPassword = (req: Request, res: Response) => {
    return res.status(200).send({ status: 200, error: 'incomplete route' })
}

const Signup = (req: Request, res: Response) => {
    const body = req.body

    return res.status(200).send({ status: 200, error: 'incomplete route' })
}

const authController = { Login, ForgotPassword, Signup }
export default authController
