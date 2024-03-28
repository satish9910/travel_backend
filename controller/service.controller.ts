import type { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../utils/middleware'
import helper from '../utils/helpers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const CreateService = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body = req.body
    if (!helper.isValidatePaylod(body, ['name', 'description', 'price', 'host_id'])) {
        return res
            .status(200)
            .send({ status: 200, error: 'Invalid payload', error_description: 'name, description, price is required.' })
    }
    const service = await prisma.service.create({
        data: {
            name: body.name,
            description: body.description,
            price: body.price,
            host_id: body.host_id,
            rating: body.rating,
            duration: body.duration,
        },
    })
    return res.status(200).send({ status: 201, message: 'Created', service: service })
}

export const GetServices = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const services = await prisma.service.findMany()
    return res.status(200).send({ status: 200, services: services })
}

const serviceController = { CreateService, GetServices }
export default serviceController