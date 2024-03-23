import type { NextFunction, Request, Response } from 'express'
import helper from '../utils/helpers'
import crypto from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient()

const SALT_ROUND = process.env.SALT_ROUND!
const ITERATION = 100
const KEYLENGTH = 10
const DIGEST_ALGO = 'sha512'

const Login = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['username', 'password'])) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'username, pasword are requried.' })
    }
    let hash_password: string | Buffer = crypto.pbkdf2Sync(
        body?.password,
        SALT_ROUND,
        ITERATION,
        KEYLENGTH,
        DIGEST_ALGO
    )
    hash_password = hash_password.toString('hex')
    const userDetails = await prisma.user.findUnique({
        where: { username: body.username, password: hash_password },
    })
    if (!userDetails) {
        return res.status(200).send({
            status: 200,
            error: 'Invalid credentials.',
            error_description: 'username or password is not valid',
        })
    }
    const token = jwt.sign({ email: userDetails.email }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    })

    return res.status(200).send({
        status: 200,
        message: 'Ok',
        user: { ...userDetails, token },
    })
}

const ForgotPassword = async (req: Request, res: Response) => {
    return res.status(200).send({ status: 200, error: 'incomplete route' })
}

const Signup = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['username', 'email', 'password'])) {
        return res.status(200).send({
            status: 400,
            error: 'Invalid Payload',
            error_description: 'username, email, password are requried.',
        })
    }
    const { email, password, username } = req.body
    let isAlreadyExists: any = false
    try {
        isAlreadyExists = await prisma.user.findUnique({ where: { email, username } })
    } catch (err) {
        return next(err)
    }
    if (isAlreadyExists) {
        return res
            .status(200)
            .send({ status: 400, error: 'BAD REQUEST', error_description: 'username already exists.' })
    }
    crypto.pbkdf2(password, SALT_ROUND, ITERATION, KEYLENGTH, DIGEST_ALGO, (err, hash_password: Buffer | string) => {
        hash_password = hash_password.toString('hex')
        console.log(hash_password)
        if (err) return next(err)
        else
            prisma.user
                .create({ data: { email, password: hash_password, username } })
                .then((r) => {
                    delete (r as any).password
                    return res.status(200).send({ status: 201, message: 'Created', user: r })
                })
                .catch((err) => {
                    return next(err)
                })
    })
}

const authController = { Login, ForgotPassword, Signup }
export default authController
