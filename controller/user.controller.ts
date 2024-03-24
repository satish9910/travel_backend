import { NextFunction, Request, Response } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import { PrismaClient } from '@prisma/client'
import helper from '../utils/helpers'
const prisma = new PrismaClient()

const get_user_details = (req: ExtendedRequest, res: Response, _next: NextFunction) => {
    return res.status(200).send({ status: 200, message: 'Ok', user: req.user })
}

const update_user = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    let { username, gender, date_of_birth, bio } = req.body
    if (gender) {
        gender = Number(gender)
        if (Number.isNaN(gender)) {
            return res.status(200).send({
                status: 200,
                error: 'Invalid Payload',
                error_description: "Gender type isn't correct. It should be a number",
            })
        }
    }
    if (!helper.isValidDateFormat(date_of_birth)) {
        return res.status(200).send({ status: 400, error: 'Bad Request', error_description: 'Invalid Date Format' })
    }

    date_of_birth = new Date(date_of_birth)

    let imagePath: string | undefined
    if (req.file) {
        imagePath = req.file.filename
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { username, gender, date_of_birth, bio, image: imagePath },
        })
        delete (updatedUser as any).password
        return res.status(200).send({ status: 200, message: 'Ok', user: updatedUser })
    } catch (err) {
        return next(err)
    }
}

const userController = { get_user_details, update_user }

export default userController
