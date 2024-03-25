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
        isAlreadyExists = await prisma.user.findFirst({ where: { OR: [{ email: email }, { username: username }] } })
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

const SendOtp = async (req: Request, res: Response, _next: NextFunction) => {
    if (!helper.isValidatePaylod(req.body, ['email'])) {
        return res.status(200).send({ status: 400, error: 'Invalid Payload', error_description: 'email requried' })
    }
    const { email } = req.body
    const otp = Math.floor(10000 + Math.random() * 90000)
    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) return res.status(200).send({ status: 404, error: 'Not found', error_description: 'user not found' })
    const previousSendOtp = await prisma.otp.findUnique({ where: { user_id: user.id } })
    const userid = user.id
    if (!previousSendOtp) {
        try {
            const otpData = await prisma.otp.create({ data: { user_id: userid, otp: otp } })
            helper.sendMail(email, 'TravelApp Account Verification', `Your OTP is ${otp}`)
        } catch (err) {
            return _next(err)
        }
        return res.status(200).send({ status: 200, message: 'Ok' })
    } else {
        try {
            const otpData = await prisma.otp.update({ where: { user_id: userid }, data: { otp: otp } })
            helper.sendMail(email, 'TravelApp Account Verification', `Your OTP is ${otp}`)
        } catch (err) {
            return _next(err)
        }
        return res.status(200).send({ status: 200, message: 'Ok' })
    }
}

/**
 * controller to verify otp from Otp using Otp and email table
 * Every otp will exipred after 5 minute
 * @param req
 * @param res
 * @param next
 * @returns responses
 */
const VerifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body
    if (!helper.isValidatePaylod(req.body, ['email', 'otp'])) {
        return res
            .status(200)
            .send({ status: 400, error: 'Invalid payload', error_description: 'email, otp are required.' })
    }
    const user = await prisma.user.findFirst({ where: { email } })
    if (!user)
        return res
            .status(200)
            .send({ status: 400, error: 'user not found.', error_description: `No user with ${email}` })
    const otpData = await prisma.otp.findUnique({ where: { user_id: user.id } })
    if (!otpData) {
        return res.status(200).send({ error: 'Bad Request', error_description: 'OTP is not valid.' })
    }
    if (otpData?.otp === otp) {
        const otpExpirationTime = otpData.updated_at.setMinutes(5)
        if (otpExpirationTime < new Date().getTime()) {
            return res.status(200).send({ status: 400, error: 'Bad Request', error_description: 'OTP is expired.' })
        }
        try {
            const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { is_verified: true } })
            return res.status(200).send({ status: 200, message: 'Ok', user: updatedUser })
        } catch (err) {
            return next(err)
        }
    } else {
        return res.status(200).send({ status: 400, error: 'Bad Request', error_description: 'OTP is not valid.' })
    }
}
const authController = { Login, ForgotPassword, Signup, SendOtp, VerifyOtp }
export default authController
